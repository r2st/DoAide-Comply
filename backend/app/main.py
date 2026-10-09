import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import settings
from .routers import app_routes, public

app = FastAPI(title="DoAide Comply", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins.split(","), allow_methods=["*"],
                   allow_headers=["*"])
app.include_router(public.router)
app.include_router(app_routes.router)

FEEDBACK_FILE = Path(__file__).resolve().parent.parent / "feedback.json"


class FeedbackIn(BaseModel):
    type: str = Field(pattern=r"^(suggestion|bug|praise)$")
    message: str = Field(min_length=1, max_length=2000)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/feedback", status_code=201)
def submit_feedback(payload: FeedbackIn):
    entry = {"type": payload.type, "message": payload.message,
             "timestamp": datetime.now(timezone.utc).isoformat()}
    if FEEDBACK_FILE.exists():
        data = json.loads(FEEDBACK_FILE.read_text())
    else:
        data = []
    data.append(entry)
    FEEDBACK_FILE.write_text(json.dumps(data, indent=2))
    return {"status": "received"}
