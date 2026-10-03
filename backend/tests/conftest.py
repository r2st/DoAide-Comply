import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["OPENROUTER_API_KEY"] = ""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool

from app import db as dbmod
from app.main import app


@pytest.fixture()
def client():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from app import models  # noqa: F401

    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    dbmod.Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override():
        s = Session()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[dbmod.get_db] = override
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture()
def auth(client):
    r = client.post("/api/auth/register", json={"email": "a@example.com", "password": "password123", "name": "A"})
    assert r.status_code == 201
    return {"Authorization": f"Bearer {r.json()['token']}"}
