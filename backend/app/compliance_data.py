"""Indian compliance rules for FY 2026-27 (1 Apr 2026 - 31 Mar 2027).

Annual filings that fall due inside this window relate to FY 2025-26 (AY 2026-27).
Dates follow the statutory defaults; CBDT/CBIC/MCA extensions are NOT modelled, so
users should confirm against current notifications. AGM is assumed on 30 Sep 2026.
"""
from datetime import date

FY_LABEL = "2026-27"
FY_START = date(2026, 4, 1)
FY_END = date(2027, 3, 31)
AGM_DATE = date(2026, 9, 30)

BUSINESS_TYPES = {
    "pvt_ltd": "Private Limited Company",
    "llp": "Limited Liability Partnership",
    "proprietorship": "Proprietorship",
}

STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

# Professional tax: frequency "monthly" | "half_yearly" | "annual" | None (not levied).
# due_day is the day of the month the payment is due (0 = last day of month).
PROFESSIONAL_TAX = {
    "Maharashtra": {"frequency": "monthly", "due_day": 0, "max_annual": 2500, "note": "PTEC annual return by 30 Jun; Rs 200/month (Rs 300 in Feb) per employee above Rs 10,000 salary."},
    "Karnataka": {"frequency": "monthly", "due_day": 20, "max_annual": 2400, "note": "Rs 200/month per employee above Rs 25,000 salary."},
    "West Bengal": {"frequency": "monthly", "due_day": 21, "max_annual": 2500, "note": "Slab based, max Rs 200/month."},
    "Telangana": {"frequency": "monthly", "due_day": 10, "max_annual": 2400, "note": "Max Rs 200/month."},
    "Andhra Pradesh": {"frequency": "monthly", "due_day": 10, "max_annual": 2400, "note": "Max Rs 200/month."},
    "Gujarat": {"frequency": "monthly", "due_day": 0, "max_annual": 2400, "note": "Max Rs 200/month above Rs 12,000 salary."},
    "Madhya Pradesh": {"frequency": "monthly", "due_day": 10, "max_annual": 2500, "note": "Slab based."},
    "Odisha": {"frequency": "monthly", "due_day": 0, "max_annual": 2500, "note": "Slab based."},
    "Assam": {"frequency": "monthly", "due_day": 0, "max_annual": 2500, "note": "Slab based."},
    "Bihar": {"frequency": "annual", "due_day": 0, "max_annual": 2500, "note": "Annual payment by 30 Jun."},
    "Jharkhand": {"frequency": "annual", "due_day": 0, "max_annual": 2500, "note": "Annual payment by 30 Jun."},
    "Chhattisgarh": {"frequency": "monthly", "due_day": 0, "max_annual": 2500, "note": "Slab based."},
    "Kerala": {"frequency": "half_yearly", "due_day": 0, "max_annual": 2500, "note": "Half-yearly, by 30 Sep and 31 Mar."},
    "Tamil Nadu": {"frequency": "half_yearly", "due_day": 0, "max_annual": 2500, "note": "Half-yearly, by 30 Sep and 31 Mar."},
    "Goa": {"frequency": "monthly", "due_day": 0, "max_annual": 2500, "note": "Slab based."},
    "Delhi": None, "Haryana": None, "Punjab": None, "Rajasthan": None,
    "Uttar Pradesh": None, "Uttarakhand": None, "Himachal Pradesh": None,
}

# Penalties. per_day / flat in INR; cap is the max in INR (None = uncapped / see note).
PENALTIES = {
    "GSTR-1": {"text": "Late fee Rs 50/day (Rs 20/day for nil return), max Rs 5,000 per return, plus 18% p.a. interest on tax due.", "per_day": 50, "cap": 5000},
    "GSTR-3B": {"text": "Late fee Rs 50/day (Rs 20/day for nil), max Rs 5,000, plus 18% p.a. interest on unpaid tax.", "per_day": 50, "cap": 5000},
    "GSTR-9": {"text": "Late fee Rs 200/day (Rs 100 CGST + Rs 100 SGST), capped at 0.25% of turnover in the state.", "per_day": 200, "cap": None},
    "GSTR-9C": {"text": "Same late fee as GSTR-9 (Rs 200/day); mandatory above Rs 5 crore turnover.", "per_day": 200, "cap": None},
    "TDS-DEPOSIT": {"text": "Interest 1% per month on late deduction and 1.5% per month on late deposit, plus possible disallowance of 30% of the expense.", "per_day": 0, "cap": None},
    "24Q/26Q": {"text": "Section 234E fee Rs 200/day until filing, capped at the TDS amount; section 271H penalty Rs 10,000 to Rs 1,00,000.", "per_day": 200, "cap": None},
    "Form 16": {"text": "Rs 100/day for each day of delay under section 234E-linked default (Sec 272A(2)(g)).", "per_day": 100, "cap": None},
    "PF": {"text": "Interest 12% p.a. plus damages of 5%-25% p.a. (EPF Act s.14B) depending on delay.", "per_day": 0, "cap": None},
    "ESI": {"text": "Interest 12% p.a. on delayed contribution; damages up to 100% of arrears.", "per_day": 0, "cap": None},
    "ADVANCE-TAX": {"text": "Interest u/s 234B and 234C at 1% per month on the shortfall.", "per_day": 0, "cap": None},
    "ITR": {"text": "Late fee Rs 5,000 u/s 234F (Rs 1,000 if total income up to Rs 5 lakh), plus 1% per month interest u/s 234A.", "per_day": 0, "cap": 5000},
    "3CD": {"text": "Penalty u/s 271B: 0.5% of turnover, max Rs 1,50,000.", "per_day": 0, "cap": 150000},
    "TP": {"text": "Form 3CEB: penalty Rs 1,00,000 u/s 271BA.", "per_day": 0, "cap": 100000},
    "AOC-4": {"text": "Additional fee Rs 100/day with no upper cap; company and officers also liable to Rs 10,000 + Rs 100/day (s.92/137).", "per_day": 100, "cap": None},
    "MGT-7": {"text": "Additional fee Rs 100/day with no upper cap.", "per_day": 100, "cap": None},
    "ADT-1": {"text": "Additional fee Rs 100/day; also risk of invalid auditor appointment.", "per_day": 100, "cap": None},
    "DIR-3 KYC": {"text": "Rs 5,000 flat penalty per director; DIN is deactivated until paid.", "per_day": 0, "cap": 5000},
    "MSME-1": {"text": "Additional fee Rs 100/day; penalty Rs 25,000 up to Rs 3,00,000 for company and officers.", "per_day": 100, "cap": None},
    "DPT-3": {"text": "Additional fee Rs 100/day; penalty at least Rs 5,000 u/s 450.", "per_day": 100, "cap": None},
    "LLP Form 11": {"text": "Additional fee Rs 100/day with no cap.", "per_day": 100, "cap": None},
    "LLP Form 8": {"text": "Additional fee Rs 100/day with no cap.", "per_day": 100, "cap": None},
    "PT": {"text": "Interest and penalty vary by state (typically 1.25%-2% per month plus Rs 5-10/day).", "per_day": 0, "cap": None},
}

CATEGORIES = ["GST", "TDS/TCS", "Income Tax", "ROC", "PF/ESI", "Professional Tax"]

BLOG_POSTS = [
    {
        "slug": "gst-due-dates-fy-2026-27",
        "title": "GST Due Dates for FY 2026-27: GSTR-1, GSTR-3B and GSTR-9",
        "description": "Every GST filing deadline for FY 2026-27 with late fee and interest rules, in one place.",
        "published": "2026-04-01",
        "body": [
            "GSTR-1 is due on the 11th of every month for monthly filers. QRMP taxpayers file quarterly on the 13th of the month after the quarter.",
            "GSTR-3B is due on the 20th for monthly filers. The late fee is Rs 50 per day (Rs 20 for nil returns), capped at Rs 5,000, plus 18% annual interest on unpaid tax.",
            "The annual return GSTR-9 for FY 2025-26 is due on 31 December 2026. Businesses above Rs 5 crore turnover must also file the GSTR-9C reconciliation.",
            "Tip: set reminders 5 days before each date so your accountant has time to reconcile GSTR-2B.",
        ],
    },
    {
        "slug": "tds-due-dates-fy-2026-27",
        "title": "TDS Due Dates FY 2026-27: Deposit, Returns and Certificates",
        "description": "TDS deposit and quarterly return dates (24Q, 26Q) for FY 2026-27, with section 234E late fees.",
        "published": "2026-04-05",
        "body": [
            "TDS deducted in a month must be deposited by the 7th of the next month. For March the due date is 30 April.",
            "Quarterly returns: Q1 by 31 July, Q2 by 31 October, Q3 by 31 January and Q4 by 31 May.",
            "Late filing attracts Rs 200 per day under section 234E until filed, capped at the TDS amount, and Form 16 is due by 15 June.",
        ],
    },
    {
        "slug": "roc-annual-filing-private-limited-company",
        "title": "ROC Annual Filing for Private Limited Companies: AOC-4, MGT-7 and DIR-3 KYC",
        "description": "Annual ROC compliance checklist for a Private Limited Company, with due dates and penalties.",
        "published": "2026-04-10",
        "body": [
            "Hold your AGM by 30 September. AOC-4 (financial statements) is due within 30 days of the AGM and MGT-7 (annual return) within 60 days.",
            "Every director with a DIN must complete DIR-3 KYC by 30 September; the penalty is Rs 5,000 and the DIN is deactivated.",
            "Additional fees are Rs 100 per day with no upper limit, so even short delays are expensive.",
        ],
    },
    {
        "slug": "professional-tax-by-state",
        "title": "Professional Tax by State: Who Pays, How Much and When",
        "description": "State-wise professional tax applicability and due dates for employers in India.",
        "published": "2026-04-15",
        "body": [
            "Professional tax is a state levy, capped at Rs 2,500 per employee per year.",
            "Maharashtra, Karnataka, West Bengal, Telangana and Andhra Pradesh collect it monthly. Tamil Nadu and Kerala collect half-yearly.",
            "Delhi, Haryana, Punjab, Rajasthan and Uttar Pradesh do not levy professional tax.",
        ],
    },
    {
        "slug": "advance-tax-and-itr-dates-fy-2026-27",
        "title": "Advance Tax and ITR Due Dates for FY 2026-27",
        "description": "Advance tax instalments and income tax return deadlines for companies, LLPs and proprietors.",
        "published": "2026-04-20",
        "body": [
            "Advance tax instalments fall on 15 June (15%), 15 September (45%), 15 December (75%) and 15 March (100%).",
            "ITR for non-audit cases is due 31 July. Cases requiring audit, including companies, file by 31 October with the tax audit report by 30 September.",
            "Late filing costs Rs 5,000 under section 234F plus interest under 234A.",
        ],
    },
]
