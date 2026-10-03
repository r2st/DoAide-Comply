from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import app_routes, public

app = FastAPI(title="DoAide Comply", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins.split(","), allow_methods=["*"],
                   allow_headers=["*"])
app.include_router(public.router)
app.include_router(app_routes.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
