import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { setMeta } from '../Home.jsx';
import ShareButtons from '../../components/ShareButtons.jsx';

const DEADLINES = [
  { category: 'GST', form: 'GSTR-3B', title: 'GSTR-3B (Monthly filers)', day: 20, frequency: 'monthly', lateFee: '₹50/day (₹20 nil), max ₹10,000' },
  { category: 'GST', form: 'GSTR-1', title: 'GSTR-1 (Monthly filers)', day: 11, frequency: 'monthly', lateFee: '₹50/day (₹20 nil), max ₹10,000' },
  { category: 'TDS/TCS', form: 'TDS Challan', title: 'TDS/TCS deposit for previous month', day: 7, frequency: 'monthly', lateFee: '1.5% per month interest' },
  { category: 'PF/ESI', form: 'PF Challan', title: 'PF contribution deposit', day: 15, frequency: 'monthly', lateFee: '12% p.a. interest + damages up to 25%' },
  { category: 'PF/ESI', form: 'ESI Challan', title: 'ESI contribution deposit', day: 15, frequency: 'monthly', lateFee: '12% p.a. interest + damages' },

  { category: 'GST', form: 'GSTR-1 (Q)', title: 'GSTR-1 Quarterly (QRMP)', fixedDates: ['2026-07-13', '2026-10-13', '2027-01-13', '2027-04-13'], lateFee: '₹50/day (₹20 nil), max ₹10,000' },
  { category: 'GST', form: 'GSTR-3B (Q)', title: 'GSTR-3B Quarterly (QRMP)', fixedDates: ['2026-07-22', '2026-10-22', '2027-01-22', '2027-04-22'], lateFee: '₹50/day (₹20 nil), max ₹10,000' },
  { category: 'GST', form: 'CMP-08', title: 'CMP-08 Challan (Composition)', fixedDates: ['2026-07-18', '2026-10-18', '2027-01-18', '2027-04-18'], lateFee: '18% p.a. interest on late payment' },

  { category: 'TDS/TCS', form: 'TDS Return Q1', title: 'TDS/TCS quarterly return (Q1: Apr–Jun)', fixedDates: ['2026-07-31'], lateFee: '₹200/day under Sec 234E, max = TDS amount' },
  { category: 'TDS/TCS', form: 'TDS Return Q2', title: 'TDS/TCS quarterly return (Q2: Jul–Sep)', fixedDates: ['2026-10-31'], lateFee: '₹200/day under Sec 234E, max = TDS amount' },
  { category: 'TDS/TCS', form: 'TDS Return Q3', title: 'TDS/TCS quarterly return (Q3: Oct–Dec)', fixedDates: ['2027-01-31'], lateFee: '₹200/day under Sec 234E, max = TDS amount' },
  { category: 'TDS/TCS', form: 'TDS Return Q4', title: 'TDS/TCS quarterly return (Q4: Jan–Mar)', fixedDates: ['2027-05-31'], lateFee: '₹200/day under Sec 234E, max = TDS amount' },

  { category: 'Income Tax', form: 'Advance Tax Q1', title: 'Advance tax instalment — 15% of estimated liability', fixedDates: ['2026-06-15'], lateFee: '1% per month interest u/s 234C' },
  { category: 'Income Tax', form: 'Advance Tax Q2', title: 'Advance tax instalment — 45% cumulative', fixedDates: ['2026-09-15'], lateFee: '1% per month interest u/s 234C' },
  { category: 'Income Tax', form: 'Advance Tax Q3', title: 'Advance tax instalment — 75% cumulative', fixedDates: ['2026-12-15'], lateFee: '1% per month interest u/s 234C' },
  { category: 'Income Tax', form: 'Advance Tax Q4', title: 'Advance tax instalment — 100%', fixedDates: ['2027-03-15'], lateFee: '1% per month interest u/s 234C' },
  { category: 'Income Tax', form: 'ITR', title: 'Income Tax Return (non-audit)', fixedDates: ['2026-07-31'], lateFee: '₹5,000 late fee u/s 234F (₹1,000 if income ≤ ₹5L)' },
  { category: 'Income Tax', form: 'ITR (Audit)', title: 'Income Tax Return (audit cases)', fixedDates: ['2026-10-31'], lateFee: '₹5,000 late fee u/s 234F' },

  { category: 'ROC', form: 'DIR-3 KYC', title: 'Director KYC for all DIN holders', fixedDates: ['2026-09-30'], lateFee: '₹5,000 late fee + DIN deactivation' },
  { category: 'ROC', form: 'AOC-4', title: 'Financial statements (30 days from AGM)', fixedDates: ['2026-10-30'], lateFee: '₹100/day additional fee, no cap' },
  { category: 'ROC', form: 'MGT-7', title: 'Annual return (60 days from AGM)', fixedDates: ['2026-11-29'], lateFee: '₹100/day additional fee, no cap' },
  { category: 'ROC', form: 'ADT-1', title: 'Auditor appointment (15 days from AGM)', fixedDates: ['2026-10-15'], lateFee: '₹100/day additional fee' },
  { category: 'ROC', form: 'LLP Form 11', title: 'LLP Annual Return', fixedDates: ['2027-05-30'], lateFee: '₹100/day additional fee' },
  { category: 'ROC', form: 'LLP Form 8', title: 'LLP Statement of Accounts', fixedDates: ['2026-10-30'], lateFee: '₹100/day additional fee' },
  { category: 'ROC', form: 'DPT-3', title: 'Return of Deposits', fixedDates: ['2026-06-30'], lateFee: 'Fine up to ₹1 crore or 2x deposit amount' },
  { category: 'ROC', form: 'MSME-1 (H1)', title: 'MSME outstanding return (Oct–Mar)', fixedDates: ['2026-04-30'], lateFee: '₹25,000 fine + ₹5,000/day continuing' },
  { category: 'ROC', form: 'MSME-1 (H2)', title: 'MSME outstanding return (Apr–Sep)', fixedDates: ['2026-10-31'], lateFee: '₹25,000 fine + ₹5,000/day continuing' },

  { category: 'PF/ESI', form: 'PF ECR', title: 'Monthly PF ECR filing', day: 15, frequency: 'monthly', lateFee: 'Damages 5%–25% of arrears' },
  { category: 'Professional Tax', form: 'PT Return', title: 'Professional Tax return (varies by state)', fixedDates: ['2026-06-30', '2026-12-31'], lateFee: 'Varies by state, typically 1.25% per month' },

  { category: 'GST', form: 'GSTR-9', title: 'GST Annual Return', fixedDates: ['2027-12-31'], lateFee: '₹200/day (max 0.5% of turnover)' },
  { category: 'GST', form: 'GSTR-9C', title: 'GST Reconciliation Statement (>₹5Cr)', fixedDates: ['2027-12-31'], lateFee: 'As per GSTR-9' },
];

const FY_START = new Date(2026, 3, 1);
const FY_END = new Date(2027, 2, 31);
const MONTHS_IN_FY = [
  { label: 'Apr 2026', year: 2026, month: 4 },
  { label: 'May 2026', year: 2026, month: 5 },
  { label: 'Jun 2026', year: 2026, month: 6 },
  { label: 'Jul 2026', year: 2026, month: 7 },
  { label: 'Aug 2026', year: 2026, month: 8 },
  { label: 'Sep 2026', year: 2026, month: 9 },
  { label: 'Oct 2026', year: 2026, month: 10 },
  { label: 'Nov 2026', year: 2026, month: 11 },
  { label: 'Dec 2026', year: 2026, month: 12 },
  { label: 'Jan 2027', year: 2027, month: 1 },
  { label: 'Feb 2027', year: 2027, month: 2 },
  { label: 'Mar 2027', year: 2027, month: 3 },
];

const CATEGORIES = ['All', 'GST', 'TDS/TCS', 'Income Tax', 'ROC', 'PF/ESI', 'Professional Tax'];

function toDate(str) {
  return new Date(str + 'T00:00:00');
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function buildCalendarEntries() {
  const entries = [];

  for (const d of DEADLINES) {
    if (d.frequency === 'monthly') {
      for (const m of MONTHS_IN_FY) {
        const nextMonth = m.month === 12 ? 1 : m.month + 1;
        const nextYear = m.month === 12 ? m.year + 1 : m.year;
        const dueDate = new Date(nextYear, nextMonth - 1, d.day);
        entries.push({
          category: d.category,
          form: d.form,
          title: `${d.title} — ${m.label}`,
          dueDate,
          lateFee: d.lateFee,
        });
      }
    } else if (d.fixedDates) {
      for (const fd of d.fixedDates) {
        entries.push({
          category: d.category,
          form: d.form,
          title: d.title,
          dueDate: toDate(fd),
          lateFee: d.lateFee,
        });
      }
    }
  }

  entries.sort((a, b) => a.dueDate - b.dueDate);
  return entries;
}

function getStatus(dueDate, today) {
  const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: 'Overdue', class: 'bg-red-500/20 text-red-400', diff };
  if (diff <= 7) return { label: 'This week', class: 'bg-red-500/20 text-red-400', diff };
  if (diff <= 30) return { label: 'This month', class: 'bg-amber-500/20 text-amber-400', diff };
  return { label: `${diff} days`, class: 'bg-green-500/20 text-green-400', diff };
}

export default function ComplianceCalendar() {
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('upcoming');
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    setMeta(
      'Free Compliance Calendar FY 2026-27 — GST, TDS, ROC, PF/ESI Due Dates | DoAide Comply',
      'Complete compliance calendar for Indian businesses: every GST, TDS, ROC, PF/ESI, Income Tax and Professional Tax deadline for FY 2026-27. No login required.'
    );
  }, []);

  const allEntries = useMemo(() => buildCalendarEntries(), []);

  const filtered = useMemo(() => {
    let items = category === 'All' ? allEntries : allEntries.filter((e) => e.category === category);
    if (view === 'upcoming') {
      items = items.filter((e) => e.dueDate >= today);
    }
    return items;
  }, [allEntries, category, view, today]);

  const stats = useMemo(() => {
    const upcoming = allEntries.filter((e) => {
      const diff = Math.ceil((e.dueDate - today) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 30;
    });
    const overdue = allEntries.filter((e) => e.dueDate < today);
    return { total: allEntries.length, upcoming: upcoming.length, overdue: overdue.length };
  }, [allEntries, today]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const e of filtered) {
      const key = e.dueDate.toISOString().slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-white">Compliance Calendar FY 2026-27</h1>
      <p className="mb-6 text-zinc-400">
        Every GST, TDS, ROC, PF/ESI, Income Tax and Professional Tax deadline for Indian businesses. No login required.
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total filings" value={stats.total} color="text-gold" />
        <StatCard label="Due in 30 days" value={stats.upcoming} color="text-amber-400" />
        <StatCard label="Overdue" value={stats.overdue} color="text-red-400" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button key={c} role="tab" aria-selected={category === c} onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1 text-sm ${category === c ? 'border-gold bg-gold text-ink' : 'border-zinc-700 text-zinc-300 hover:border-gold'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="mb-6 flex gap-3">
        <button onClick={() => setView('upcoming')} className={`text-sm ${view === 'upcoming' ? 'text-gold font-semibold' : 'text-zinc-400 hover:text-gold'}`}>Upcoming</button>
        <button onClick={() => setView('all')} className={`text-sm ${view === 'all' ? 'text-gold font-semibold' : 'text-zinc-400 hover:text-gold'}`}>All FY</button>
      </div>

      {grouped.length === 0 ? (
        <p className="text-zinc-500" data-testid="no-results">No deadlines found for the selected filter.</p>
      ) : (
        grouped.map(([monthKey, items]) => (
          <div key={monthKey} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-zinc-300" data-testid="month-group">
              {new Date(monthKey + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="space-y-2">
              {items.map((item, i) => {
                const status = getStatus(item.dueDate, today);
                return (
                  <div key={`${item.form}-${item.dueDate.toISOString()}-${i}`} className="card !p-4" data-testid="calendar-entry">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-gold">{item.category}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.class}`} data-testid="status-badge">{status.label}</span>
                        </div>
                        <h3 className="mt-1 font-semibold text-white">{item.form}</h3>
                        <p className="mt-0.5 text-sm text-zinc-400">{item.title}</p>
                        <p className="mt-1 text-xs text-red-300/80">Late fee: {item.lateFee}</p>
                      </div>
                      <div className="shrink-0 rounded-lg bg-ink-3 px-3 py-1 text-sm font-medium text-gold">
                        {formatDate(item.dueDate)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div className="card mt-10 text-center">
        <p className="mb-3 text-white">Want personalised reminders for your specific business?</p>
        <Link to="/" className="btn">Run the free health check</Link>
      </div>

      <div className="mt-6">
        <ShareButtons text="Free Compliance Calendar for Indian Businesses FY 2026-27 — every GST, TDS, ROC, PF/ESI deadline" />
      </div>

      <CalendarFAQ />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="card text-center" data-testid="stat-card">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-zinc-400">{label}</div>
    </div>
  );
}

const FAQ_ITEMS = [
  { q: 'What is a compliance calendar?', a: 'A compliance calendar lists all statutory filing deadlines that apply to your business — GST returns, TDS deposits, ROC annual filings, PF/ESI challans, advance tax instalments, and professional tax returns. Tracking these deadlines helps avoid late fees, interest charges, and regulatory penalties.' },
  { q: 'Which deadlines does this calendar cover?', a: 'This calendar covers all major compliance deadlines for FY 2026-27: GSTR-1, GSTR-3B, GSTR-9 (GST), TDS/TCS challans and quarterly returns, advance tax instalments, ITR due dates, ROC filings (AOC-4, MGT-7, DIR-3 KYC, DPT-3, MSME-1), PF and ESI monthly deposits, and professional tax returns.' },
  { q: 'Do I need to file all of these?', a: 'No. The deadlines that apply depend on your business type (Pvt Ltd, LLP, Proprietorship), whether you are GST registered, whether you have employees, and whether you deduct TDS. Run the free health check on our home page to get a personalised calendar with only your applicable deadlines.' },
  { q: 'What happens if I miss a deadline?', a: 'Penalties vary: GST late fees are ₹50/day (₹20 for nil returns). TDS late deposit attracts 1.5% monthly interest. ROC filings attract ₹100/day additional fees with no cap. PF late deposit triggers damages up to 25% of arrears. Advance tax shortfalls attract 1% monthly interest under Section 234B/234C.' },
  { q: 'Can I get reminders before each deadline?', a: 'Yes. Sign up for DoAide Comply Pro (₹499/month) to receive automated WhatsApp and email reminders 7 days and 2 days before each deadline. Reminders are personalised to your business type and registrations.' },
];

function CalendarFAQ() {
  return (
    <section className="mt-16 mb-8">
      <h2 className="mb-6 text-center text-2xl font-bold text-white">Compliance Calendar FAQ</h2>
      <div className="mx-auto max-w-3xl space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <details key={i} className="group card !p-0 overflow-hidden">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-white list-none">
              {item.q}
              <span className="ml-2 text-gold transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">{item.a}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />
    </section>
  );
}
