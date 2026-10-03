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
    </div>
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
