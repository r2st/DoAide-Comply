from datetime import date

import pytest

from app.calendar_engine import estimate_penalty, generate_calendar, summarize


def forms(items):
    return {i["form"] for i in items}


def test_pvt_ltd_has_roc_and_gst():
    items = generate_calendar("pvt_ltd", "Karnataka")
    assert {"GSTR-1", "GSTR-3B", "GSTR-9", "AOC-4", "MGT-7", "DIR-3 KYC", "PF", "ESI", "PT"} <= forms(items)


def test_proprietorship_has_no_roc():
    items = generate_calendar("proprietorship", "Delhi")
    assert not any(i["category"] == "ROC" for i in items)


def test_llp_forms():
    f = forms(generate_calendar("llp", "Gujarat"))
    assert {"LLP Form 11", "LLP Form 8"} <= f and "AOC-4" not in f


def test_gst_monthly_dates():
    items = generate_calendar("pvt_ltd", "Delhi")
    g1 = [i for i in items if i["form"] == "GSTR-1"]
    g3 = [i for i in items if i["form"] == "GSTR-3B"]
    assert len(g1) == len(g3) == 12
    assert all(i["due_date"][8:] == "11" for i in g1)
    assert all(i["due_date"][8:] == "20" for i in g3)


def test_all_dates_in_expected_window():
    for i in generate_calendar("pvt_ltd", "Maharashtra"):
        assert date(2026, 4, 1) <= date.fromisoformat(i["due_date"]) <= date(2027, 3, 31), i


def test_tds_march_deposit_is_30_april():
    items = generate_calendar("pvt_ltd", "Delhi")
    assert any(i["form"] == "TDS-DEPOSIT" and i["due_date"] == "2026-04-30" for i in items)


def test_tds_quarterly_returns():
    dates = {i["due_date"] for i in generate_calendar("pvt_ltd", "Delhi") if i["form"] == "24Q/26Q"}
    assert dates == {"2026-05-31", "2026-07-31", "2026-10-31", "2027-01-31"}


def test_advance_tax_four_instalments():
    dates = [i["due_date"] for i in generate_calendar("llp", "Delhi") if i["form"] == "ADVANCE-TAX"]
    assert dates == ["2026-06-15", "2026-09-15", "2026-12-15", "2027-03-15"]


def test_roc_dates_follow_agm():
    items = {i["form"]: i["due_date"] for i in generate_calendar("pvt_ltd", "Delhi") if i["category"] == "ROC"}
    assert items["AOC-4"] == "2026-10-30" and items["MGT-7"] == "2026-11-29" and items["ADT-1"] == "2026-10-15"


def test_professional_tax_by_state():
    assert not any(i["form"] == "PT" for i in generate_calendar("pvt_ltd", "Delhi"))
    assert sum(i["form"] == "PT" for i in generate_calendar("pvt_ltd", "Karnataka")) == 12
    tn = [i["due_date"] for i in generate_calendar("pvt_ltd", "Tamil Nadu") if i["form"] == "PT"]
    assert tn == ["2026-09-30", "2027-03-31"]


def test_toggles_remove_categories():
    items = generate_calendar("pvt_ltd", "Karnataka", has_gst=False, has_employees=False, has_tds=False)
    cats = {i["category"] for i in items}
    assert not cats & {"GST", "PF/ESI", "Professional Tax", "TDS/TCS"}


def test_sorted_and_unique_ids():
    items = generate_calendar("pvt_ltd", "Maharashtra")
    assert [i["due_date"] for i in items] == sorted(i["due_date"] for i in items)
    ids = [i["id"] for i in items]
    assert len(ids) == len(set(ids))


def test_every_item_has_penalty_text():
    assert all(i["penalty"] for i in generate_calendar("pvt_ltd", "Maharashtra"))


@pytest.mark.parametrize("bt,state", [("x", "Delhi"), ("llp", "Atlantis")])
def test_invalid_input(bt, state):
    with pytest.raises(ValueError):
        generate_calendar(bt, state)


def test_estimate_penalty_cap_and_uncapped():
    g = {"penalty_per_day": 50, "penalty_cap": 5000}
    assert estimate_penalty(g, 10) == 500 and estimate_penalty(g, 1000) == 5000
    assert estimate_penalty({"penalty_per_day": 100, "penalty_cap": None}, 40) == 4000
    assert estimate_penalty({"penalty_per_day": 0, "penalty_cap": 5000}, 0) is None


def test_summary():
    s = summarize(generate_calendar("pvt_ltd", "Delhi"), today=date(2026, 10, 3))
    assert s["fy"] == "2026-27" and s["due_next_30_days"] > 0 and s["next_due"][0]["due_date"] >= "2026-10-03"
