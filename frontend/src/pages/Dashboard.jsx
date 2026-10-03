import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, getToken, setToken } from '../api.js';
import CalendarList from '../components/CalendarList.jsx';

export default function Dashboard() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [biz, setBiz] = useState([]);
  const [active, setActive] = useState(null);
  const [cal, setCal] = useState(null);
  const [members, setMembers] = useState([]);
  const [msg, setMsg] = useState('');
  const [newBiz, setNewBiz] = useState({ name: '', business_type: 'pvt_ltd', state: 'Maharashtra' });
  const [member, setMember] = useState({ email: '', role: 'member' });
  const [rem, setRem] = useState({ channel: 'email', destination: '', days_before: 3 });

  const fail = (e) => setMsg(e.message);

  const loadBiz = useCallback(async () => {
    const list = await api('/businesses', { auth: true });
    setBiz(list);
    setActive((a) => a ?? list[0]?.id ?? null);
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    api('/me', { auth: true }).then(setMe).then(loadBiz).catch(() => { setToken(null); nav('/login'); });
  }, [loadBiz, nav]);

  const loadCal = useCallback(async () => {
    if (!active) return;
    setCal((await api(`/businesses/${active}/calendar`, { auth: true })).calendar);
    setMembers(await api(`/businesses/${active}/members`, { auth: true }));
  }, [active]);
  useEffect(() => { loadCal().catch(fail); }, [loadCal]);

  if (!getToken()) return <Navigate to="/login" replace />;
  if (!me) return <p>Loading…</p>;

  const run = (fn) => async (e) => { e?.preventDefault(); setMsg(''); try { await fn(); } catch (err) { fail(err); } };
  const patch = (id, body) => run(async () => { await api(`/businesses/${active}/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body, auth: true }); await loadCal(); });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Dashboard <span className="ml-2 rounded bg-gold px-2 py-0.5 text-xs text-ink">{me.plan}</span></h1>
        <button className="btn-ghost" onClick={() => { setToken(null); nav('/'); }}>Log out</button>
      </div>
      {msg && <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{msg}</p>}

      <section className="card">
        <h2 className="mb-3 font-semibold text-white">Businesses</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {biz.map((b) => <button key={b.id} onClick={() => setActive(b.id)} className={active === b.id ? 'btn !py-1' : 'btn-ghost !py-1'}>{b.name}</button>)}
        </div>
        <form onSubmit={run(async () => { const r = await api('/businesses', { method: 'POST', body: newBiz, auth: true }); await loadBiz(); setActive(r.id); setNewBiz({ ...newBiz, name: '' }); })} className="grid gap-2 sm:grid-cols-4">
          <input className="input" placeholder="Business name" required value={newBiz.name} onChange={(e) => setNewBiz({ ...newBiz, name: e.target.value })} aria-label="Business name" />
          <select className="input" value={newBiz.business_type} onChange={(e) => setNewBiz({ ...newBiz, business_type: e.target.value })} aria-label="Business type">
            <option value="pvt_ltd">Pvt Ltd</option><option value="llp">LLP</option><option value="proprietorship">Proprietorship</option>
          </select>
          <input className="input" value={newBiz.state} onChange={(e) => setNewBiz({ ...newBiz, state: e.target.value })} aria-label="State" />
          <button className="btn">Add business</button>
        </form>
      </section>

      {active && (
        <>
          <section className="grid gap-5 md:grid-cols-2">
            <form className="card space-y-2" onSubmit={run(async () => { await api(`/businesses/${active}/members`, { method: 'POST', body: member, auth: true }); setMember({ ...member, email: '' }); await loadCal(); })}>
              <h2 className="font-semibold text-white">Team and CA</h2>
              <ul className="text-sm text-zinc-400">{members.map((m) => <li key={m.id}>{m.email} ({m.role})</li>)}</ul>
              <input className="input" type="email" required placeholder="email" value={member.email} onChange={(e) => setMember({ ...member, email: e.target.value })} aria-label="Member email" />
              <select className="input" value={member.role} onChange={(e) => setMember({ ...member, role: e.target.value })} aria-label="Member role"><option value="member">Team member (Pro)</option><option value="ca">CA (Enterprise)</option></select>
              <button className="btn">Invite</button>
            </form>
            <form className="card space-y-2" onSubmit={run(async () => { await api(`/businesses/${active}/reminders`, { method: 'POST', body: { ...rem, days_before: Number(rem.days_before) }, auth: true }); setMsg('Reminder saved'); })}>
              <h2 className="font-semibold text-white">Reminders (Pro)</h2>
              <select className="input" value={rem.channel} onChange={(e) => setRem({ ...rem, channel: e.target.value })} aria-label="Reminder channel"><option value="email">Email</option><option value="whatsapp">WhatsApp</option></select>
              <input className="input" required placeholder="Email or WhatsApp number" value={rem.destination} onChange={(e) => setRem({ ...rem, destination: e.target.value })} aria-label="Reminder destination" />
              <input className="input" type="number" min="0" max="30" value={rem.days_before} onChange={(e) => setRem({ ...rem, days_before: e.target.value })} aria-label="Days before" />
              <button className="btn">Save reminder</button>
            </form>
          </section>
          {cal && (
            <CalendarList items={cal} renderExtra={(i) => (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <select className="input !w-auto !py-1" value={i.status} onChange={(e) => patch(i.id, { status: e.target.value })()} aria-label={`Status for ${i.title}`}>
                  <option value="pending">Pending</option><option value="in_progress">In progress</option><option value="done">Done</option>
                </select>
                <select className="input !w-auto !py-1" value={i.assignee_id ?? ''} onChange={(e) => e.target.value && patch(i.id, { assignee_id: Number(e.target.value) })()} aria-label={`Assignee for ${i.title}`}>
                  <option value="">Unassigned</option>{members.map((m) => <option key={m.id} value={m.id}>{m.email}</option>)}
                </select>
              </div>
            )} />
          )}
        </>
      )}
    </div>
  );
}
