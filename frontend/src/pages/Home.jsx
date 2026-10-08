import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import CalendarList from '../components/CalendarList.jsx';
import RobotFace from '../components/RobotFace.jsx';

const TYPES = { pvt_ltd: 'Private Limited', llp: 'LLP', proprietorship: 'Proprietorship' };
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export function setMeta(title, description) {
  document.title = title;
  const m = document.querySelector('meta[name="description"]');
  if (m && description) m.setAttribute('content', description);
}

export default function Home() {
  const [params] = useSearchParams();
  const [states, setStates] = useState([]);
  const [form, setForm] = useState({
    business_type: TYPES[params.get('type')] ? params.get('type') : 'pvt_ltd',
    state: params.get('state') || 'Maharashtra',
    has_gst: true, has_employees: true, has_tds: true, email: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMeta('Free Compliance Calendar for Indian Businesses FY 2026-27 | DoAide Comply');
    api('/public/meta').then((m) => setStates(m.states)).catch(() => setStates(['Maharashtra', 'Karnataka', 'Delhi']));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const body = { ...form, email: form.email || undefined };
      setResult(await api('/public/health-check', { method: 'POST', body }));
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div>
      <section className="mb-8 text-center">
        <div className="mb-3 flex justify-center"><RobotFace size={64} /></div>
        <h1 className="text-3xl font-bold text-white md:text-4xl">Free Compliance Health Check for Indian Businesses</h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
          Pick your business type and state. Get every GST, TDS, ROC, PF/ESI, income tax and professional tax deadline for FY 2026-27, with late-fee penalties. No login.
        </p>
      </section>

      <form onSubmit={submit} className="card mx-auto max-w-2xl space-y-4" aria-label="Compliance health check">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bt" className="label">Business type</label>
            <select id="bt" className="input" value={form.business_type} onChange={set('business_type')}>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="st" className="label">State</label>
            <select id="st" className="input" value={form.state} onChange={set('state')}>
              {(states.length ? states : [form.state]).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {[['has_gst', 'GST registered'], ['has_employees', 'Has employees'], ['has_tds', 'Deducts TDS']].map(([k, l]) => (
            <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={form[k]} onChange={set(k)} /> {l}</label>
          ))}
        </div>
        <div>
          <label htmlFor="em" className="label">Email (optional, to get reminders about your calendar)</label>
          <input id="em" type="email" className="input" value={form.email} onChange={set('email')} placeholder="you@company.com" />
        </div>
        <button className="btn w-full" disabled={loading}>{loading ? 'Building your calendar…' : 'Get my compliance calendar'}</button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      </form>

      {result && (
        <section className="mt-10" aria-live="polite">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Filings in FY 2026-27" value={result.summary.total_obligations} />
            <Stat label="Due in next 30 days" value={result.summary.due_next_30_days} />
            <Stat label="Exposure if 30 days late*" value={inr(result.summary.penalty_exposure_30_days_late)} />
          </div>
          <div className="mb-6 flex flex-wrap gap-3">
            <a className="btn" href={result.share.whatsapp_url} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
            <a className="btn-ghost" href="/pricing">Get automatic reminders</a>
          </div>
          <CalendarList items={result.calendar} />
          <p className="mt-4 text-xs text-zinc-500">*Estimate of fixed/per-day late fees across non-conditional filings. {result.disclaimer}</p>
        </section>
      )}

      <Testimonials />
      <FAQ />
    </div>
  );
}

function Testimonials() {
  const reviews = [
    { name: 'Sneha Patel', role: 'CA & Founder, Patel Tax Advisors', location: 'Ahmedabad', text: 'I manage compliance for 80+ clients. DoAide Comply replaced the Excel sheet I was using to track deadlines. The WhatsApp reminders mean I never chase clients for missed dates anymore. It has genuinely reduced my stress.' },
    { name: 'Arjun Nair', role: 'CFO, Freshbasket Pvt Ltd', location: 'Bengaluru', text: 'We were paying ₹15,000+ in GST late fees every quarter before we started using Comply. The personalised calendar caught obligations we didn\'t even know applied to us. Zero penalties in the last two quarters.' },
    { name: 'Deepa Iyer', role: 'Founder, PixelCraft Studios LLP', location: 'Chennai', text: 'As a creative agency, compliance was the last thing on our mind — until we got a ROC strike-off notice. DoAide Comply now sends us reminders for Form 11, Form 8, and TDS challans. We haven\'t missed a deadline since.' },
    { name: 'Manish Gupta', role: 'Co-founder, QuickShip Logistics', location: 'Delhi', text: 'The free health check blew my mind — it showed us 47 filings for the year with penalty estimates. We upgraded to Pro for the automated reminders and it paid for itself in the first month by avoiding one late GST return.' },
  ];
  return (
    <section className="mt-16">
      <h2 className="mb-6 text-center text-2xl font-bold text-white">
        Trusted by <span className="text-gold">Indian Businesses</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((t) => (
          <div key={t.name} className="card">
            <p className="mb-4 text-sm leading-relaxed text-zinc-400">"{t.text}"</p>
            <div>
              <p className="text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-zinc-500">{t.role} &middot; {t.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: 'Is DoAide Comply free to use?', a: 'Yes! The compliance health check is completely free with no login required. It generates a personalised calendar for your business type and state with all GST, TDS, ROC, PF/ESI, and income tax deadlines. The free tier includes the full calendar view. Upgrade to Pro (₹499/month) for automated WhatsApp and email reminders.' },
    { q: 'Which compliance obligations does it cover?', a: 'DoAide Comply covers GST (GSTR-1, GSTR-3B, GSTR-9, GSTR-9C, CMP-08), TDS/TCS returns and challans, ROC filings (AOC-4, MGT-7, Form 8, Form 11), PF and ESI deposits, professional tax, advance tax instalments, and income tax return deadlines. The calendar adapts based on your entity type (Pvt Ltd, LLP, or Proprietorship) and state.' },
    { q: 'How are late-fee penalties calculated?', a: 'Penalty estimates are based on statutory rates: GST late fees of ₹50/day (₹20 for nil returns), TDS interest at 1-1.5% per month, ROC additional fees of ₹100/day, PF interest at 12% per annum, and applicable Section 234B/234C interest for advance tax. Estimates assume a 30-day delay and are indicative — actual penalties may vary based on your specific liability.' },
    { q: 'Can I get reminders on WhatsApp?', a: 'Yes. Pro and Enterprise users receive automated reminders via WhatsApp and email 7 days and 2 days before each deadline. Reminders are personalised to your business — you only get alerts for filings that apply to you. You can also share your compliance calendar via WhatsApp with your CA or team.' },
    { q: 'Does it work for all Indian states?', a: 'Yes. DoAide Comply covers all 28 states and 8 union territories. Professional tax slabs, GST filing dates for QRMP scheme (which vary by state), and state-specific compliance obligations are all factored in when you select your state during the health check.' },
    { q: 'Is my data secure?', a: 'Your data is encrypted in transit and at rest. The free health check does not require any financial data — just your business type, state, and registration checkboxes. Email is optional and used only for sending your compliance calendar. We never share your information with third parties.' },
  ];
  return (
    <section className="mt-16 mb-8">
      <h2 className="mb-6 text-center text-2xl font-bold text-white">Frequently Asked Questions</h2>
      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((item, i) => (
          <details key={i} className="group card !p-0 overflow-hidden">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-white list-none">
              {item.q}
              <span className="ml-2 text-gold transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold text-gold">{value}</div>
      <div className="mt-1 text-xs text-zinc-400">{label}</div>
    </div>
  );
}
