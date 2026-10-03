def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_meta(client):
    m = client.get("/api/public/meta").json()
    assert "pvt_ltd" in m["business_types"] and "Karnataka" in m["states"] and m["plans"]["pro"]["price_inr"] == 499
    assert m["plans"]["enterprise"]["price_inr"] == 1499


def test_free_health_check_no_login(client):
    r = client.post("/api/public/health-check", json={"business_type": "pvt_ltd", "state": "Maharashtra"})
    assert r.status_code == 200
    body = r.json()
    assert body["summary"]["total_obligations"] == len(body["calendar"]) > 50
    assert body["share"]["whatsapp_url"].startswith("https://wa.me/?text=")


def test_health_check_validation(client):
    assert client.post("/api/public/health-check", json={"business_type": "pvt_ltd", "state": "Nowhere"}).status_code == 422
    assert client.post("/api/public/health-check", json={"business_type": "bad", "state": "Delhi"}).status_code == 422


def test_health_check_email_lead(client):
    r = client.post("/api/public/health-check",
                    json={"business_type": "llp", "state": "Delhi", "email": "lead@example.com"})
    assert r.status_code == 200


def test_penalty_endpoint(client):
    r = client.get("/api/public/penalty", params={"form": "GSTR-3B", "days_late": 200}).json()
    assert r["estimated_late_fee_inr"] == 5000
    assert client.get("/api/public/penalty", params={"form": "nope", "days_late": 1}).status_code == 404


def test_ask_without_key_falls_back(client):
    r = client.post("/api/public/ask", json={"question": "What if I miss GSTR-3B?", "form": "GSTR-3B"})
    assert r.status_code == 200 and "not configured" in r.json()["answer"]


def test_blog(client):
    posts = client.get("/api/public/blog").json()
    assert len(posts) >= 5
    assert client.get(f"/api/public/blog/{posts[0]['slug']}").json()["body"]
    assert client.get("/api/public/blog/missing").status_code == 404


def test_widget_data(client):
    r = client.get("/api/public/widget-data", params={"business_type": "llp", "state": "Delhi", "limit": 3})
    assert r.status_code == 200 and len(r.json()["items"]) <= 3
    assert client.get("/api/public/widget-data", params={"business_type": "x", "state": "Delhi"}).status_code == 422


def test_auth_flow(client):
    body = {"email": "u@example.com", "password": "password123"}
    assert client.post("/api/auth/register", json=body).status_code == 201
    assert client.post("/api/auth/register", json=body).status_code == 409
    assert client.post("/api/auth/login", json={**body, "password": "wrongpass1"}).status_code == 401
    tok = client.post("/api/auth/login", json=body).json()["token"]
    me = client.get("/api/me", headers={"Authorization": f"Bearer {tok}"}).json()
    assert me["plan"] == "free"
    assert client.get("/api/me").status_code == 401
    assert client.get("/api/me", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_short_password_rejected(client):
    assert client.post("/api/auth/register", json={"email": "s@example.com", "password": "short"}).status_code == 422


BIZ = {"name": "Acme", "business_type": "pvt_ltd", "state": "Karnataka"}


def test_free_plan_limits(client, auth):
    assert client.post("/api/businesses", json=BIZ, headers=auth).status_code == 201
    assert client.post("/api/businesses", json=BIZ, headers=auth).status_code == 402
    bid = client.get("/api/businesses", headers=auth).json()[0]["id"]
    assert client.post(f"/api/businesses/{bid}/reminders", headers=auth,
                       json={"channel": "email", "destination": "a@example.com"}).status_code == 402
    assert client.post(f"/api/businesses/{bid}/members", headers=auth,
                       json={"email": "t@example.com"}).status_code == 402


def test_calendar_and_task_status(client, auth):
    bid = client.post("/api/businesses", json=BIZ, headers=auth).json()["id"]
    cal = client.get(f"/api/businesses/{bid}/calendar", headers=auth).json()["calendar"]
    oid = cal[0]["id"]
    assert cal[0]["status"] == "pending"
    r = client.patch(f"/api/businesses/{bid}/tasks/{oid}", json={"status": "done", "note": "filed"}, headers=auth)
    assert r.status_code == 200
    cal = client.get(f"/api/businesses/{bid}/calendar", headers=auth).json()["calendar"]
    assert next(i for i in cal if i["id"] == oid)["status"] == "done"


def test_pro_features(client, auth):
    client.post("/api/billing/plan", json={"plan": "pro"}, headers=auth)
    bid = client.post("/api/businesses", json=BIZ, headers=auth).json()["id"]
    m = client.post(f"/api/businesses/{bid}/members", json={"email": "t@example.com", "name": "T"}, headers=auth)
    assert m.status_code == 201
    assert client.post(f"/api/businesses/{bid}/members", json={"email": "t@example.com"}, headers=auth).status_code == 409
    oid = client.get(f"/api/businesses/{bid}/calendar", headers=auth).json()["calendar"][0]["id"]
    r = client.patch(f"/api/businesses/{bid}/tasks/{oid}", json={"assignee_id": m.json()["id"]}, headers=auth)
    assert r.json()["assignee_id"] == m.json()["id"]
    rem = client.post(f"/api/businesses/{bid}/reminders", headers=auth,
                      json={"channel": "whatsapp", "destination": "+919999999999", "days_before": 2})
    assert rem.status_code == 201
    assert len(client.get(f"/api/businesses/{bid}/reminders", headers=auth).json()) == 1
    # CA collaboration is Enterprise-only
    assert client.post(f"/api/businesses/{bid}/members", json={"email": "ca@example.com", "role": "ca"},
                       headers=auth).status_code == 402


def test_enterprise_ca(client, auth):
    client.post("/api/billing/plan", json={"plan": "enterprise"}, headers=auth)
    bid = client.post("/api/businesses", json=BIZ, headers=auth).json()["id"]
    r = client.post(f"/api/businesses/{bid}/members", json={"email": "ca@example.com", "role": "ca"}, headers=auth)
    assert r.status_code == 201 and r.json()["role"] == "ca"


def test_downgrade_blocked_over_limit(client, auth):
    client.post("/api/billing/plan", json={"plan": "pro"}, headers=auth)
    for n in range(2):
        client.post("/api/businesses", json={**BIZ, "name": f"B{n}"}, headers=auth)
    assert client.post("/api/billing/plan", json={"plan": "free"}, headers=auth).status_code == 409


def test_tenant_isolation(client, auth):
    bid = client.post("/api/businesses", json=BIZ, headers=auth).json()["id"]
    other = client.post("/api/auth/register", json={"email": "o@example.com", "password": "password123"}).json()["token"]
    h = {"Authorization": f"Bearer {other}"}
    assert client.get(f"/api/businesses/{bid}/calendar", headers=h).status_code == 404
    assert client.delete(f"/api/businesses/{bid}", headers=h).status_code == 404


def test_reminder_dispatch(client, auth, monkeypatch):
    from datetime import date
    from app import notify
    client.post("/api/billing/plan", json={"plan": "pro"}, headers=auth)
    bid = client.post("/api/businesses", json=BIZ, headers=auth).json()["id"]
    client.post(f"/api/businesses/{bid}/reminders", headers=auth,
                json={"channel": "email", "destination": "a@example.com", "days_before": 3})
    sent = []
    monkeypatch.setattr(notify, "send", lambda c, dest, m: sent.append((c, dest, m)))
    monkeypatch.setattr(notify, "date", type("D", (date,), {"today": staticmethod(lambda: date(2026, 10, 17))}))
    r = client.post("/api/reminders/run", headers=auth).json()
    assert r and sent and "GSTR-3B" in sent[0][2]  # 20 Oct is 3 days after 17 Oct
