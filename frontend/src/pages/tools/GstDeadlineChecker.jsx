import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setMeta } from '../Home.jsx';
import ShareButtons from '../../components/ShareButtons.jsx';

const MONTHLY_DEADLINES = [
  { form: 'GSTR-1', desc: 'Outward supplies', day: 11 },
  { form: 'GSTR-3B', desc: 'Summary return & tax payment', day: 20 },
];

const QUARTERLY_DEADLINES = [
  { form: 'GSTR-1 (Quarterly)', desc: 'Outward supplies (QRMP)', months: [7, 10, 1, 4], day: 13 },
  { form: 'IFF', desc: 'Invoice Furnishing Facility', months: [5, 6, 8, 9, 11, 12, 2, 3], day: 13 },
  { form: 'GSTR-3B (Quarterly)', desc: 'Summary return (QRMP)', months: [7, 10, 1, 4], day: 22 },
];

const ANNUAL_DEADLINES = [
  { form: 'GSTR-9', desc: 'Annual return', due: '2027-12-31', lateFee: '₹200/day (max ₹0.5% of turnover)' },
  { form: 'GSTR-9C', desc: 'Reconciliation statement (>₹5Cr turnover)', due: '2027-12-31', lateFee: 'As per GSTR-9' },
  { form: 'GSTR-4', desc: 'Composition scheme annual', due: '2027-04-30', lateFee: '₹200/day (max ₹5,000)' },
];

const MONTHS = ['Apr 2026','May 2026','Jun 2026','Jul 2026','Aug 2026','Sep 2026','Oct 2026','Nov 2026','Dec 2026','Jan 2027','Feb 2027','Mar 2027'];
const MONTH_NUMS = [4,5,6,7,8,9,10,11,12,1,2,3];

function getMonthlyDeadlines(monthIdx) {
  const m = MONTH_NUMS[monthIdx];
  const y = m >= 4 ? 2026 : 2027;
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : (nextM >= 4 ? 2026 : 2027);
  return MONTHLY_DEADLINES.map((d) => ({
    form: d.form,
    desc: `${d.desc} for ${MONTHS[monthIdx]}`,
    due: `${nextY}-${String(nextM).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`,
    lateFee: d.form === 'GSTR-3B' ? '₹50/day (₹20 for nil), max ₹10,000' : '₹50/day (₹20 for nil), max ₹10,000',
  }));
}

function getQuarterlyDeadlines(monthIdx) {
  const m = MONTH_NUMS[monthIdx];
  const results = [];
  for (const d of QUARTERLY_DEADLINES) {
    if (d.months.includes(m)) {
      const nextM = m === 12 ? 1 : m + 1;
      const nextY = nextM >= 4 && nextM <= 12 ? 2026 : 2027;
      results.push({
        form: d.form,
        desc: `${d.desc} for ${MONTHS[monthIdx]}`,
        due: `${nextY}-${String(nextM).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`,
        lateFee: '₹50/day (₹20 for nil), max ₹10,000',
      });
    }
  }
  return results;
}

export default function GstDeadlineChecker() {
  const [frequency, setFrequency] = useState('monthly');
  const [monthIdx, setMonthIdx] = useState(0);

  useEffect(() => {
    setMeta('GST Deadline Checker FY 2026-27 | DoAide Comply', 'Check upcoming GST filing deadlines for GSTR-1, GSTR-3B, GSTR-9 and more.');
  }, []);

  const deadlines = frequency === 'monthly' ? getMonthlyDeadlines(monthIdx) : getQuarterlyDeadlines(monthIdx);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold text-white">GST Deadline Checker</h1>
      <p className="mb-6 text-zinc-400">Check your upcoming GST filing deadlines for FY 2026-27. All dates are statutory defaults.</p>

      <div className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="freq" className="label">Filing frequency</label>
            <select id="freq" className="input" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly (QRMP)</option>
            </select>
          </div>
          <div>
            <label htmlFor="month" className="label">Month</label>
            <select id="month" className="input" value={monthIdx} onChange={(e) => setMonthIdx(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {deadlines.length > 0 ? (
        <div className="mt-6 space-y-3">
          {deadlines.map((d) => (
            <div key={d.form + d.due} className="card" data-testid="deadline-item">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">{d.form}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{d.desc}</p>
                  <p className="mt-1 text-xs text-zinc-500" data-testid="late-fee">Late fee: {d.lateFee}</p>
                </div>
                <div className="shrink-0 rounded-lg bg-ink-3 px-3 py-1 text-sm font-medium text-gold">{d.due}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-zinc-500">No deadlines for this month under the selected frequency.</p>
      )}

      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">Annual Deadlines</h2>
        {ANNUAL_DEADLINES.map((d) => (
          <div key={d.form} className="card" data-testid="annual-item">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{d.form}</h3>
                <p className="mt-1 text-sm text-zinc-400">{d.desc}</p>
                <p className="mt-1 text-xs text-zinc-500">Late fee: {d.lateFee}</p>
              </div>
              <div className="shrink-0 rounded-lg bg-ink-3 px-3 py-1 text-sm font-medium text-gold">{d.due}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-10 text-center">
        <p className="mb-3 text-white">Want automated reminders for all your deadlines?</p>
        <Link to="/" className="btn">Run the free health check</Link>
      </div>

      <div className="mt-6">
        <ShareButtons text="Check your GST filing deadlines for FY 2026-27 — free tool by DoAide Comply" />
      </div>
    </div>
  );
}
