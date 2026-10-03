from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import compliance_data as d
from ..calendar_engine import generate_calendar, summarize
from ..db import get_db
from ..models import Business, Reminder, TaskState, TeamMember, User
from ..notify import due_reminders
from ..plans import PLANS
from ..schemas import BusinessIn, LoginIn, MemberIn, PlanIn, ReminderIn, RegisterIn, TaskUpdate
from ..security import create_token, current_user, hash_password, verify_password

router = APIRouter(prefix="/api", tags=["app"])


def _user_out(u: User):
    return {"id": u.id, "email": u.email, "name": u.name, "plan": u.plan, "limits": PLANS[u.plan]}


@router.post("/auth/register", status_code=201)
def register(p: RegisterIn, db: Session = Depends(get_db)):
    email = p.email.lower()
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(409, "Email already registered")
    u = User(email=email, password_hash=hash_password(p.password), name=p.name)
    db.add(u)
    db.commit()
    return {"token": create_token(u.id), "user": _user_out(u)}


@router.post("/auth/login")
def login(p: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(email=p.email.lower()).first()
    if not u or not verify_password(p.password, u.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return {"token": create_token(u.id), "user": _user_out(u)}


@router.get("/me")
def me(u: User = Depends(current_user)):
    return _user_out(u)


@router.post("/billing/plan")
def set_plan(p: PlanIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    """Plan switch. Payment gateway (Razorpay) hooks in here; downgrade is blocked if over limits."""
    if len(u.businesses) > PLANS[p.plan]["businesses"]:
        raise HTTPException(409, "Remove businesses before downgrading to this plan")
    u.plan = p.plan
    db.commit()
    return _user_out(u)


def _own_business(db: Session, u: User, bid: int) -> Business:
    b = db.get(Business, bid)
    if not b or b.owner_id != u.id:
        raise HTTPException(404, "Business not found")
    return b


def _require(u: User, feature: str, msg: str):
    if not PLANS[u.plan][feature]:
        raise HTTPException(402, msg)


@router.get("/businesses")
def list_businesses(u: User = Depends(current_user)):
    return [{"id": b.id, "name": b.name, "business_type": b.business_type, "state": b.state} for b in u.businesses]


@router.post("/businesses", status_code=201)
def create_business(p: BusinessIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if p.state not in d.STATES:
        raise HTTPException(422, "Unknown state")
    if len(u.businesses) >= PLANS[u.plan]["businesses"]:
        raise HTTPException(402, f"Your {u.plan} plan allows {PLANS[u.plan]['businesses']} business(es). Upgrade to add more.")
    b = Business(owner_id=u.id, **p.model_dump())
    db.add(b)
    db.commit()
    return {"id": b.id, "name": b.name}


@router.delete("/businesses/{bid}", status_code=204)
def delete_business(bid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    db.delete(_own_business(db, u, bid))
    db.commit()


@router.get("/businesses/{bid}/calendar")
def business_calendar(bid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    b = _own_business(db, u, bid)
    items = generate_calendar(b.business_type, b.state, b.has_gst, b.has_employees, b.has_tds)
    tasks = {t.obligation_id: t for t in b.tasks}
    for i in items:
        t = tasks.get(i["id"])
        i["status"] = t.status if t else "pending"
        i["assignee_id"] = t.assignee_id if t else None
        i["note"] = t.note if t else ""
    return {"calendar": items, "summary": summarize(items)}


@router.patch("/businesses/{bid}/tasks/{obligation_id}")
def update_task(bid: int, obligation_id: str, p: TaskUpdate, u: User = Depends(current_user),
                db: Session = Depends(get_db)):
    b = _own_business(db, u, bid)
    if p.assignee_id is not None:
        _require(u, "team", "Team assignment needs the Pro plan.")
        m = db.get(TeamMember, p.assignee_id)
        if not m or m.business_id != b.id:
            raise HTTPException(404, "Team member not found")
    t = db.query(TaskState).filter_by(business_id=b.id, obligation_id=obligation_id).first()
    if not t:
        t = TaskState(business_id=b.id, obligation_id=obligation_id)
        db.add(t)
    for k, v in p.model_dump(exclude_none=True).items():
        setattr(t, k, v)
    db.commit()
    return {"obligation_id": t.obligation_id, "status": t.status, "assignee_id": t.assignee_id, "note": t.note}


@router.get("/businesses/{bid}/members")
def list_members(bid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    return [{"id": m.id, "email": m.email, "name": m.name, "role": m.role} for m in _own_business(db, u, bid).members]


@router.post("/businesses/{bid}/members", status_code=201)
def add_member(bid: int, p: MemberIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    b = _own_business(db, u, bid)
    _require(u, "ca" if p.role == "ca" else "team",
             "CA collaboration needs the Enterprise plan." if p.role == "ca" else "Team members need the Pro plan.")
    email = p.email.lower()
    if any(m.email == email for m in b.members):
        raise HTTPException(409, "Already added")
    m = TeamMember(business_id=b.id, email=email, name=p.name, role=p.role)
    db.add(m)
    db.commit()
    return {"id": m.id, "email": m.email, "role": m.role}


@router.delete("/businesses/{bid}/members/{mid}", status_code=204)
def remove_member(bid: int, mid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    b = _own_business(db, u, bid)
    m = db.get(TeamMember, mid)
    if not m or m.business_id != b.id:
        raise HTTPException(404, "Member not found")
    db.query(TaskState).filter_by(assignee_id=m.id).update({"assignee_id": None})
    db.delete(m)
    db.commit()


@router.get("/businesses/{bid}/reminders")
def list_reminders(bid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    return [{"id": r.id, "channel": r.channel, "destination": r.destination, "days_before": r.days_before,
             "active": r.active} for r in _own_business(db, u, bid).reminders]


@router.post("/businesses/{bid}/reminders", status_code=201)
def add_reminder(bid: int, p: ReminderIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    b = _own_business(db, u, bid)
    _require(u, "reminders", "Email/WhatsApp reminders need the Pro plan.")
    r = Reminder(business_id=b.id, **p.model_dump())
    db.add(r)
    db.commit()
    return {"id": r.id}


@router.delete("/businesses/{bid}/reminders/{rid}", status_code=204)
def delete_reminder(bid: int, rid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    b = _own_business(db, u, bid)
    r = db.get(Reminder, rid)
    if not r or r.business_id != b.id:
        raise HTTPException(404, "Reminder not found")
    db.delete(r)
    db.commit()


@router.post("/reminders/run")
def run_reminders(u: User = Depends(current_user), db: Session = Depends(get_db)):
    """Dispatch due reminders for the caller's businesses (a cron hits this per user/scheduler job in production)."""
    mine = {b.id for b in u.businesses}
    return [s for s in due_reminders(db) if db.get(Reminder, s["reminder_id"]).business_id in mine]
