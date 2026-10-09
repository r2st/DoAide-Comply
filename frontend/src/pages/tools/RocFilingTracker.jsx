import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setMeta } from '../Home.jsx';
import ShareButtons from '../../components/ShareButtons.jsx';

const FILINGS = [
  {
    id: 'aoc4',
    form: 'AOC-4',
    title: 'Financial Statements',
    rule: '30 days from AGM date',
    daysFromAGM: 30,
    basis: 'agm',
    penalty: 'Additional fee of ₹100/day of delay. Maximum penalty can reach ₹5 lakh for the company and ₹1 lakh for every officer in default.',
  },
  {
    id: 'mgt7',
    form: 'MGT-7',
    title: 'Annual Return',
    rule: '60 days from AGM date',
    daysFromAGM: 60,
    basis: 'agm',
    penalty: 'Additional fee of ₹100/day of delay. Company and every defaulting officer liable to fine up to ₹5 lakh and ₹50,000 respectively.',
  },
  {
    id: 'adt1',
    form: 'ADT-1',
    title: 'Auditor Appointment',
    rule: '15 days from AGM date',
    daysFromAGM: 15,
    basis: 'agm',
    penalty: 'Additional fee of ₹100/day. If auditor is not appointed within 30 days, the Board must appoint within 30 days of AGM failure.',
  },
  {
    id: 'dir3kyc',
    form: 'DIR-3 KYC',
    title: 'Director KYC',
    rule: '30 September every year',
    basis: 'fixed',
    fixedDate: { month: 9, day: 30 },
    penalty: 'DIN is deactivated after the deadline. Late fee of ₹5,000 to reactivate. Director cannot sign or file any form until KYC is done.',
  },
  {
    id: 'inc20a',
    form: 'INC-20A',
    title: 'Commencement of Business Declaration',
    rule: '180 days from incorporation',
    daysFromIncorporation: 180,
    basis: 'incorporation',
    penalty: 'Company may be struck off under Section 248. Penalty of ₹50,000 on the company and ₹1,000/day on every officer in default (max ₹1 lakh).',
  },
  {
    id: 'msme1-apr',
    form: 'MSME-1 (H1)',
    title: 'Half-yearly MSME Outstanding Return (Oct–Mar)',
    rule: '30 April every year',
    basis: 'fixed',
    fixedDate: { month: 4, day: 30 },
    penalty: 'Fine of up to ₹25,000 on company and every officer in default. Continued non-compliance: additional ₹5,000/day.',
  },
  {
    id: 'msme1-oct',
    form: 'MSME-1 (H2)',
    title: 'Half-yearly MSME Outstanding Return (Apr–Sep)',
    rule: '31 October every year',
    basis: 'fixed',
    fixedDate: { month: 10, day: 31 },
    penalty: 'Fine of up to ₹25,000 on company and every officer in default. Continued non-compliance: additional ₹5,000/day.',
  },
  {
    id: 'dpt3',
    form: 'DPT-3',
    title: 'Return of Deposits / Outstanding Loans',
    rule: '30 June every year',
    basis: 'fixed',
    fixedDate: { month: 6, day: 30 },
    penalty: 'Company: fine ₹1 crore or twice the deposit amount (whichever is lower), minimum ₹5 lakh. Officers: imprisonment up to 7 years and fine ₹25 lakh.',
  },
  {
    id: 'ben2',
    form: 'BEN-2',
    title: 'Return of Significant Beneficial Owners',
    rule: '30 days from change in beneficial ownership',
    daysFromChange: 30,
    basis: 'event',
    penalty: 'Company: fine ₹1 lakh, continuing default ₹500/day (max ₹25 lakh). Officer in default: fine ₹25,000, continuing default ₹200/day (max ₹5 lakh).',
  },
];

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(from, to) {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getNextFixedDate(month, day, referenceDate) {
  const year = referenceDate.getFullYear();
  let target = new Date(year, month - 1, day);
  if (target < referenceDate) {
    target = new Date(year + 1, month - 1, day);
  }
  return target;
}

export function computeDeadlines(incorporationDate, agmDate, fyEnd, today) {
  const incDate = parseDate(incorporationDate);
  const agm = parseDate(agmDate);
  const ref = today || new Date();
  ref.setHours(0, 0, 0, 0);

  return FILINGS.map((f) => {
    let dueDate = null;
    let calculable = true;

    if (f.basis === 'agm') {
      if (agm) {
        dueDate = addDays(agm, f.daysFromAGM);
      } else {
        calculable = false;
      }
    } else if (f.basis === 'incorporation') {
      if (incDate) {
        dueDate = addDays(incDate, f.daysFromIncorporation);
      } else {
        calculable = false;
      }
    } else if (f.basis === 'fixed') {
      dueDate = getNextFixedDate(f.fixedDate.month, f.fixedDate.day, ref);
    } else if (f.basis === 'event') {
      calculable = false;
    }

    let daysRemaining = null;
    let status = 'unknown';

    if (dueDate) {
      daysRemaining = diffDays(ref, dueDate);
      if (daysRemaining < 0) status = 'overdue';
      else if (daysRemaining <= 30) status = 'upcoming';
      else status = 'safe';
    }

    return {
      ...f,
      dueDate,
      daysRemaining,
      status,
      calculable,
    };
  });
}

function StatusBadge({ status, days }) {
  if (status === 'overdue') {
    return <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400" data-testid="badge-overdue">{Math.abs(days)} days overdue</span>;
  }
  if (status === 'upcoming') {
    return <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400" data-testid="badge-upcoming">{days} days left</span>;
  }
  if (status === 'safe') {
    return <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400" data-testid="badge-safe">{days} days left</span>;
  }
  return <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-400" data-testid="badge-unknown">Enter dates to calculate</span>;
}

const FAQ_ITEMS = [
  {
    q: 'What is ROC filing and who needs to do it?',
    a: 'ROC (Registrar of Companies) filing is mandatory for all companies registered under the Companies Act 2013 — Private Limited, Public Limited, One Person Company, and Section 8 companies. LLPs file with ROC under the LLP Act 2008. Key forms include AOC-4 (financial statements), MGT-7 (annual return), and ADT-1 (auditor appointment). Non-filing can lead to penalties, disqualification of directors, and even company strike-off.',
  },
  {
    q: 'What is the deadline for filing AOC-4 and MGT-7?',
    a: 'AOC-4 (financial statements) must be filed within 30 days of the Annual General Meeting (AGM). MGT-7 (annual return) must be filed within 60 days of the AGM. For FY 2025-26, if your AGM is held on 30 September 2026, AOC-4 is due by 30 October 2026 and MGT-7 by 29 November 2026. Late filing attracts additional fees of ₹100 per day of delay.',
  },
  {
    q: 'What happens if I miss the DIR-3 KYC deadline?',
    a: 'DIR-3 KYC must be filed by 30 September every year for all directors holding a DIN. If you miss the deadline, your DIN is deactivated — you cannot sign or file any MCA form. Reactivation requires filing DIR-3 KYC with a late fee of ₹5,000. During deactivation, all company filings requiring that director\'s digital signature are blocked.',
  },
  {
    q: 'What is INC-20A and when is it required?',
    a: 'INC-20A is a declaration of commencement of business, mandatory for companies incorporated after November 2019 with share capital. It must be filed within 180 days of incorporation, along with a bank account verification. Failure to file can result in ROC initiating strike-off proceedings under Section 248 and penalties of ₹50,000 on the company.',
  },
  {
    q: 'Is MSME-1 filing mandatory for all companies?',
    a: 'MSME-1 is mandatory for companies and LLPs that have outstanding payments to Micro or Small Enterprises beyond 45 days. The return must be filed half-yearly — by 30 April (for Oct–Mar period) and 31 October (for Apr–Sep period). Even if you have nil outstanding, if you deal with MSMEs, it\'s advisable to maintain records. Penalties include fines up to ₹25,000.',
  },
  {
    q: 'What penalties apply for late ROC filings?',
    a: 'Penalties vary by form: AOC-4 and MGT-7 attract ₹100/day additional fee with no cap on days. DIR-3 KYC late fee is a flat ₹5,000 with DIN deactivation. DPT-3 violations can result in fines up to ₹1 crore or twice the deposit amount. Continued non-compliance can lead to director disqualification under Section 164(2) — a director who defaults for 3 consecutive years is disqualified for 5 years.',
  },
  {
    q: 'How do I calculate my ROC filing deadlines?',
    a: 'Most ROC deadlines depend on your AGM date. Enter your company incorporation date, last AGM date, and financial year end in the tracker above. The tool calculates the exact due date and days remaining for each filing — AOC-4 (AGM + 30 days), MGT-7 (AGM + 60 days), ADT-1 (AGM + 15 days), and fixed-date filings like DIR-3 KYC (30 Sep) and DPT-3 (30 Jun).',
  },
];

function buildFaqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export default function RocFilingTracker() {
  const [incorporationDate, setIncorporationDate] = useState('');
  const [agmDate, setAgmDate] = useState('');
  const [fyEnd, setFyEnd] = useState('2026-03-31');
  const [deadlines, setDeadlines] = useState(null);

  useEffect(() => {
    setMeta(
      'ROC Filing Deadline Tracker — Free Tool for Indian Companies | DoAide Comply',
      'Track all ROC filing deadlines for Indian companies — AOC-4, MGT-7, ADT-1, DIR-3 KYC, INC-20A, MSME-1, DPT-3, BEN-2. Free, no login required.'
    );
  }, []);

  function handleCalculate(e) {
    e.preventDefault();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setDeadlines(computeDeadlines(incorporationDate, agmDate, fyEnd, today));
  }

  const whatsappText = deadlines
    ? `ROC Filing Deadlines:\n${deadlines
        .filter((d) => d.dueDate)
        .map((d) => `${d.form}: ${formatDate(d.dueDate)} (${d.status === 'overdue' ? 'OVERDUE' : d.daysRemaining + ' days left'})`)
        .join('\n')}\n\nCheck yours free:`
    : 'Track all ROC filing deadlines for your Indian company — free tool by DoAide Comply';

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-white">ROC Filing Deadline Tracker</h1>
      <p className="mb-6 text-zinc-400">
        Track all major ROC filing deadlines for your Indian company. Enter your dates below to see exactly when each form is due, days remaining, and penalties for late filing. No login required.
      </p>

      <form onSubmit={handleCalculate} className="card space-y-4" aria-label="ROC deadline calculator">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="incDate" className="label">Incorporation date</label>
            <input
              id="incDate"
              type="date"
              className="input"
              value={incorporationDate}
              onChange={(e) => setIncorporationDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="agmDate" className="label">Last AGM date</label>
            <input
              id="agmDate"
              type="date"
              className="input"
              value={agmDate}
              onChange={(e) => setAgmDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="fyEnd" className="label">Financial year end</label>
            <input
              id="fyEnd"
              type="date"
              className="input"
              value={fyEnd}
              onChange={(e) => setFyEnd(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn w-full">Calculate deadlines</button>
      </form>

      {deadlines && (
        <section className="mt-8" aria-live="polite">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Overdue" value={deadlines.filter((d) => d.status === 'overdue').length} color="text-red-400" />
            <SummaryCard label="Due within 30 days" value={deadlines.filter((d) => d.status === 'upcoming').length} color="text-amber-400" />
            <SummaryCard label="Safe (>30 days)" value={deadlines.filter((d) => d.status === 'safe').length} color="text-green-400" />
          </div>

          <div className="space-y-3">
            {deadlines.map((d) => (
              <div key={d.id} className="card" data-testid="filing-item">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{d.form}</h3>
                      <StatusBadge status={d.status} days={d.daysRemaining} />
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{d.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">Rule: {d.rule}</p>
                  </div>
                  {d.dueDate && (
                    <div className="shrink-0 rounded-lg bg-ink-3 px-3 py-1 text-sm font-medium text-gold">
                      {formatDate(d.dueDate)}
                    </div>
                  )}
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-gold">Penalty for late filing</summary>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400" data-testid="penalty-info">{d.penalty}</p>
                </details>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <ShareButtons text={whatsappText} />
          </div>
        </section>
      )}

      <div className="card mt-10 text-center">
        <p className="mb-3 text-white">Want automated reminders for all compliance deadlines?</p>
        <Link to="/" className="btn">Run the free health check</Link>
      </div>

      <section className="mt-16 mb-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">ROC Filing FAQ</h2>
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(FAQ_ITEMS)) }}
        />
      </section>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="card text-center" data-testid="summary-card">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-zinc-400">{label}</div>
    </div>
  );
}
