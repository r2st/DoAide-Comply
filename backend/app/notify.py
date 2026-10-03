"""Reminder dispatch. Real email/WhatsApp providers plug in here; default logs only."""
import logging
from datetime import date, timedelta

from sqlalchemy.orm import Session

from .calendar_engine import generate_calendar
from .models import Reminder, TaskState

log = logging.getLogger("comply.notify")


def send(channel: str, destination: str, message: str) -> None:
    log.info("REMINDER via %s to %s: %s", channel, destination, message)


def due_reminders(db: Session, today: date | None = None) -> list[dict]:
    """Return (and dispatch) reminders whose obligations are due in `days_before` days."""
    today = today or date.today()
    sent = []
    for r in db.query(Reminder).filter(Reminder.active.is_(True)).all():
        b = r.business
        target = (today + timedelta(days=r.days_before)).isoformat()
        done = {t.obligation_id for t in db.query(TaskState).filter_by(business_id=b.id, status="done")}
        for item in generate_calendar(b.business_type, b.state, b.has_gst, b.has_employees, b.has_tds):
            if item["due_date"] == target and item["id"] not in done:
                msg = f"{b.name}: {item['title']} is due on {item['due_date']}. Late penalty: {item['penalty']}"
                send(r.channel, r.destination, msg)
                sent.append({"reminder_id": r.id, "obligation_id": item["id"], "message": msg})
    return sent
