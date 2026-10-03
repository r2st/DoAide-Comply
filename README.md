# DoAide Comply

AI compliance calendar for Indian businesses (FY 2026-27): GST, TDS/TCS, ROC, PF/ESI, income tax and professional tax, with late-fee penalties.

- **Free tool (no login):** Compliance Health Check for Pvt Ltd / LLP / Proprietorship by state.
- **Paid:** email/WhatsApp reminders, team assignment, CA collaboration.
- **Plans:** Free / Pro ₹499/mo / Enterprise ₹1,499/mo.
- **Viral:** WhatsApp share, embeddable widget (`/embed.js`), SEO blog posts, sitemap and robots.

## Stack
FastAPI + SQLAlchemy + Alembic + PostgreSQL; React + Vite + Tailwind; OpenRouter (`OPENROUTER_API_KEY`, model `meta-llama/llama-4-maverick:free`) for the "ask" endpoint.

## Run
```bash
docker compose up db -d
cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt
DATABASE_URL=postgresql+psycopg://comply:comply@localhost:5432/comply .venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
cd ../frontend && npm install && npm run dev
```

## Test
```bash
cd backend && .venv/bin/python -m pytest
cd frontend && npm test
```

## Notes
- Rules live in `backend/app/compliance_data.py`. Dates are statutory defaults; government extensions are not modelled and AGM is assumed on 30 Sep 2026.
- `POST /api/billing/plan` switches plans without taking payment; wire a payment gateway (e.g. Razorpay) before charging.
- Reminders are logged by `app/notify.py`; plug in an email/WhatsApp provider in `send()` and call `POST /api/reminders/run` from a scheduler.
