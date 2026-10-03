"""Builds the compliance calendar for a business profile."""
import calendar as _cal
from datetime import date, timedelta

from . import compliance_data as d

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _month_iter():
    y, m = d.FY_START.year, d.FY_START.month
    for _ in range(12):
        yield y, m
        m += 1
        if m == 13:
            y, m = y + 1, 1


def _prev(y, m):
    return (y, m - 1) if m > 1 else (y - 1, 12)


def _period(y, m):
    return f"{MONTH_NAMES[m - 1]} {y}"


def _item(category, form, title, due, period, description, penalty_key, **extra):
    p = d.PENALTIES.get(penalty_key, {"text": "", "per_day": 0, "cap": None})
    return {
        "id": f"{form}|{due.isoformat()}|{period}".replace(" ", "_"),
        "category": category,
        "form": form,
        "title": title,
        "due_date": due.isoformat(),
        "period": period,
        "description": description,
        "penalty": p["text"],
        "penalty_per_day": p["per_day"],
        "penalty_cap": p["cap"],
        **extra,
    }


def _last_day(y, m):
    return date(y, m, _cal.monthrange(y, m)[1])


def generate_calendar(business_type, state, has_gst=True, has_employees=True, has_tds=True):
    if business_type not in d.BUSINESS_TYPES:
        raise ValueError(f"Unknown business type: {business_type}")
    if state not in d.STATES:
        raise ValueError(f"Unknown state: {state}")

    items = []
    for y, m in _month_iter():
        py, pm = _prev(y, m)
        period = _period(py, pm)

        if has_gst:
            items.append(_item("GST", "GSTR-1", f"GSTR-1 for {period}", date(y, m, 11), period,
                               "Outward supplies return (monthly filers).", "GSTR-1"))
            items.append(_item("GST", "GSTR-3B", f"GSTR-3B for {period}", date(y, m, 20), period,
                               "Summary return with tax payment.", "GSTR-3B"))
        if has_tds:
            due = date(y, 4, 30) if m == 4 else date(y, m, 7)
            items.append(_item("TDS/TCS", "TDS-DEPOSIT", f"TDS/TCS deposit for {period}", due, period,
                               "Deposit tax deducted/collected at source (Challan 281).", "TDS-DEPOSIT"))
        if has_employees:
            items.append(_item("PF/ESI", "PF", f"PF contribution and ECR for {period}", date(y, m, 15), period,
                               "EPF contribution and ECR filing.", "PF"))
            items.append(_item("PF/ESI", "ESI", f"ESI contribution for {period}", date(y, m, 15), period,
                               "ESI contribution payment.", "ESI"))

    # Professional tax (needs employees).
    if has_employees:
        pt = d.PROFESSIONAL_TAX.get(state)
        if pt:
            note = pt["note"]
            if pt["frequency"] == "monthly":
                for y, m in _month_iter():
                    py, pm = _prev(y, m)
                    due = _last_day(y, m) if pt["due_day"] == 0 else date(y, m, pt["due_day"])
                    items.append(_item("Professional Tax", "PT", f"Professional tax ({state}) for {_period(py, pm)}",
                                       due, _period(py, pm), note, "PT"))
            elif pt["frequency"] == "half_yearly":
                for due, per in ((date(2026, 9, 30), "Apr-Sep 2026"), (date(2027, 3, 31), "Oct 2026-Mar 2027")):
                    items.append(_item("Professional Tax", "PT", f"Professional tax ({state}) {per}", due, per, note, "PT"))
            else:
                items.append(_item("Professional Tax", "PT", f"Professional tax ({state}) annual", date(2026, 6, 30),
                                   "FY 2026-27", note, "PT"))

    # Annual GST return for FY 2025-26.
    if has_gst:
        items.append(_item("GST", "GSTR-9", "GSTR-9 annual return FY 2025-26", date(2026, 12, 31), "FY 2025-26",
                           "Annual return for regular taxpayers.", "GSTR-9"))
        items.append(_item("GST", "GSTR-9C", "GSTR-9C reconciliation FY 2025-26", date(2026, 12, 31), "FY 2025-26",
                           "Only if aggregate turnover exceeds Rs 5 crore.", "GSTR-9C", conditional=True))

    # TDS returns and certificates.
    if has_tds:
        for due, per in ((date(2026, 5, 31), "Q4 FY 2025-26"), (date(2026, 7, 31), "Q1 FY 2026-27"),
                         (date(2026, 10, 31), "Q2 FY 2026-27"), (date(2027, 1, 31), "Q3 FY 2026-27")):
            items.append(_item("TDS/TCS", "24Q/26Q", f"TDS return 24Q/26Q - {per}", due, per,
                               "Quarterly TDS statement (24Q salary, 26Q non-salary).", "24Q/26Q"))
        if has_employees:
            items.append(_item("TDS/TCS", "Form 16", "Form 16 issue to employees", date(2026, 6, 15), "FY 2025-26",
                               "Issue salary TDS certificates.", "Form 16"))

    # Income tax.
    for due, pct, label in ((date(2026, 6, 15), 15, "15%"), (date(2026, 9, 15), 45, "45%"),
                            (date(2026, 12, 15), 75, "75%"), (date(2027, 3, 15), 100, "100%")):
        items.append(_item("Income Tax", "ADVANCE-TAX", f"Advance tax instalment ({label} cumulative)", due,
                           "FY 2026-27", "Pay advance tax if liability exceeds Rs 10,000.", "ADVANCE-TAX"))

    if business_type == "pvt_ltd":
        items.append(_item("Income Tax", "3CD", "Tax audit report (Form 3CA/3CD)", date(2026, 9, 30), "FY 2025-26",
                           "Companies requiring audit.", "3CD"))
        items.append(_item("Income Tax", "ITR", "Income tax return (ITR-6)", date(2026, 10, 31), "AY 2026-27",
                           "Company return, audit case.", "ITR"))
        items.append(_item("Income Tax", "TP", "Transfer pricing report (Form 3CEB)", date(2026, 11, 30), "FY 2025-26",
                           "Only with international / specified domestic transactions.", "TP", conditional=True))
    elif business_type == "llp":
        items.append(_item("Income Tax", "ITR", "Income tax return (ITR-5)", date(2026, 7, 31), "AY 2026-27",
                           "LLP return (31 Oct if audit applies).", "ITR"))
        items.append(_item("Income Tax", "3CD", "Tax audit report if applicable", date(2026, 9, 30), "FY 2025-26",
                           "Turnover above Rs 1 crore (Rs 10 crore if 95% digital).", "3CD", conditional=True))
    else:
        items.append(_item("Income Tax", "ITR", "Income tax return (ITR-3/ITR-4)", date(2026, 7, 31), "AY 2026-27",
                           "Proprietor's return, non-audit.", "ITR"))
        items.append(_item("Income Tax", "3CD", "Tax audit report if applicable", date(2026, 9, 30), "FY 2025-26",
                           "Turnover above Rs 1 crore (Rs 10 crore if 95% digital).", "3CD", conditional=True))

    # ROC.
    if business_type == "pvt_ltd":
        agm = d.AGM_DATE
        items += [
            _item("ROC", "MSME-1", "MSME-1 half-yearly return (Oct-Mar)", date(2026, 4, 30), "H2 FY 2025-26",
                  "Outstanding payments to MSME vendors over 45 days.", "MSME-1", conditional=True),
            _item("ROC", "DPT-3", "DPT-3 return of deposits", date(2026, 6, 30), "FY 2025-26",
                  "Includes outstanding loans received.", "DPT-3"),
            _item("ROC", "DIR-3 KYC", "DIR-3 KYC for directors", date(2026, 9, 30), "FY 2025-26",
                  "Every director holding a DIN.", "DIR-3 KYC"),
            _item("ROC", "AGM", "Annual General Meeting", agm, "FY 2025-26",
                  "Hold AGM within 6 months of year end.", "AOC-4"),
            _item("ROC", "ADT-1", "ADT-1 auditor appointment", agm + timedelta(days=15), "FY 2025-26",
                  "Within 15 days of AGM.", "ADT-1"),
            _item("ROC", "AOC-4", "AOC-4 financial statements", agm + timedelta(days=30), "FY 2025-26",
                  "Within 30 days of AGM.", "AOC-4"),
            _item("ROC", "MGT-7", "MGT-7 annual return", agm + timedelta(days=60), "FY 2025-26",
                  "Within 60 days of AGM.", "MGT-7"),
            _item("ROC", "MSME-1", "MSME-1 half-yearly return (Apr-Sep)", date(2026, 10, 31), "H1 FY 2026-27",
                  "Outstanding payments to MSME vendors over 45 days.", "MSME-1", conditional=True),
        ]
    elif business_type == "llp":
        items += [
            _item("ROC", "LLP Form 11", "LLP Form 11 annual return", date(2026, 5, 30), "FY 2025-26",
                  "Annual return of LLP.", "LLP Form 11"),
            _item("ROC", "DIR-3 KYC", "DIR-3 KYC for designated partners", date(2026, 9, 30), "FY 2025-26",
                  "Every partner holding a DIN.", "DIR-3 KYC"),
            _item("ROC", "LLP Form 8", "LLP Form 8 statement of accounts", date(2026, 10, 30), "FY 2025-26",
                  "Statement of account and solvency.", "LLP Form 8"),
        ]

    items.sort(key=lambda i: (i["due_date"], i["category"], i["form"]))
    return items


def estimate_penalty(item, days_late):
    """Estimated late fee in INR for a calendar item; None if not calculable from per-day rules."""
    per_day = item.get("penalty_per_day") or 0
    if per_day <= 0:
        cap = item.get("penalty_cap")
        return cap if (cap and days_late > 0) else None
    amount = per_day * max(days_late, 0)
    cap = item.get("penalty_cap")
    return min(amount, cap) if cap else amount


def summarize(items, today=None):
    today = today or date.today()
    by_cat = {}
    for i in items:
        by_cat[i["category"]] = by_cat.get(i["category"], 0) + 1
    upcoming = [i for i in items if date.fromisoformat(i["due_date"]) >= today]
    next_30 = [i for i in upcoming if (date.fromisoformat(i["due_date"]) - today).days <= 30]
    # Exposure if every capped/fixed filing is 30 days late.
    exposure = sum(estimate_penalty(i, 30) or 0 for i in items if not i.get("conditional"))
    return {
        "total_obligations": len(items),
        "by_category": by_cat,
        "due_next_30_days": len(next_30),
        "next_due": upcoming[:5],
        "penalty_exposure_30_days_late": exposure,
        "fy": d.FY_LABEL,
    }
