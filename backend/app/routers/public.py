import urllib.parse
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import ai, compliance_data as d
from ..calendar_engine import estimate_penalty, generate_calendar, summarize
from ..config import settings
from ..db import get_db
from ..models import Lead
from ..plans import PLANS
from ..schemas import AskIn, HealthCheckIn

router = APIRouter(prefix="/api/public", tags=["public"])


def _build(payload: HealthCheckIn):
    try:
        return generate_calendar(payload.business_type, payload.state, payload.has_gst,
                                 payload.has_employees, payload.has_tds)
    except ValueError as e:
        raise HTTPException(422, str(e))


@router.get("/meta")
def meta():
    return {"business_types": d.BUSINESS_TYPES, "states": d.STATES, "categories": d.CATEGORIES,
            "fy": d.FY_LABEL, "plans": PLANS}


@router.post("/health-check")
def health_check(payload: HealthCheckIn, db: Session = Depends(get_db)):
    """Free tool: no login. Optionally stores an email lead."""
    items = _build(payload)
    if payload.email:
        db.add(Lead(email=payload.email, business_type=payload.business_type, state=payload.state))
        db.commit()
    summary = summarize(items)
    label = d.BUSINESS_TYPES[payload.business_type]
    text = (f"My {label} in {payload.state} has {summary['total_obligations']} compliance deadlines in FY "
            f"{d.FY_LABEL}. Check yours free: {settings.site_url}/?type={payload.business_type}&state="
            f"{urllib.parse.quote(payload.state)}")
    return {
        "calendar": items,
        "summary": summary,
        "share": {"text": text, "whatsapp_url": "https://wa.me/?text=" + urllib.parse.quote(text)},
        "disclaimer": "Statutory default dates. Government extensions are not included; verify before filing.",
    }


@router.get("/penalty")
def penalty(form: str, days_late: int = Query(ge=0, le=3650)):
    p = d.PENALTIES.get(form)
    if not p:
        raise HTTPException(404, "Unknown form")
    item = {"penalty_per_day": p["per_day"], "penalty_cap": p["cap"]}
    return {"form": form, "days_late": days_late, "rule": p["text"], "estimated_late_fee_inr": estimate_penalty(item, days_late)}


@router.post("/ask")
def ask(payload: AskIn):
    ctx = ""
    if payload.form and payload.form in d.PENALTIES:
        ctx = f"Form {payload.form}. Known penalty rule: {d.PENALTIES[payload.form]['text']}"
    return {"answer": ai.explain(payload.question, ctx)}


@router.get("/blog")
def blog_index():
    return [{k: p[k] for k in ("slug", "title", "description", "published")} for p in d.BLOG_POSTS]


@router.get("/blog/{slug}")
def blog_post(slug: str):
    for p in d.BLOG_POSTS:
        if p["slug"] == slug:
            return p
    raise HTTPException(404, "Post not found")


@router.get("/widget-data")
def widget_data(business_type: str, state: str, limit: int = Query(default=5, ge=1, le=20)):
    """Next upcoming deadlines for the embeddable widget."""
    try:
        items = generate_calendar(business_type, state)
    except ValueError as e:
        raise HTTPException(422, str(e))
    today = date.today().isoformat()
    upcoming = [i for i in items if i["due_date"] >= today][:limit]
    return {"business_type": business_type, "state": state, "items": upcoming, "site_url": settings.site_url}
