import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setMeta } from './Home.jsx';

export const PLANS = [
  { id: 'free', name: 'Free', price: '₹0', features: ['Compliance health check', '1 business calendar', 'Penalty estimates', 'WhatsApp sharing'] },
  { id: 'pro', name: 'Pro', price: '₹499', featured: true, features: ['Everything in Free', 'Up to 3 businesses', 'Email and WhatsApp reminders', 'Team assignment and status tracking'] },
  { id: 'enterprise', name: 'Enterprise', price: '₹1,499', features: ['Everything in Pro', 'Up to 25 businesses', 'CA collaboration', 'Priority support'] },
];

export default function Pricing() {
  useEffect(() => setMeta('Pricing | DoAide Comply', 'Free, Pro ₹499/mo and Enterprise ₹1,499/mo compliance calendar plans for Indian businesses.'), []);
  return (
    <div>
      <h1 className="mb-8 text-center text-3xl font-bold text-white">Simple pricing</h1>
      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.id} className={`card flex flex-col ${p.featured ? '!border-gold' : ''}`} data-testid={`plan-${p.id}`}>
            <h2 className="text-xl font-semibold text-white">{p.name}</h2>
            <div className="my-3 text-3xl font-bold text-gold">{p.price}<span className="text-sm font-normal text-zinc-500">{p.id === 'free' ? '' : '/mo'}</span></div>
            <ul className="mb-6 flex-1 space-y-2 text-sm text-zinc-300">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <Link to={`/register?plan=${p.id}`} className={p.featured ? 'btn' : 'btn-ghost'}>{p.id === 'free' ? 'Start free' : `Choose ${p.name}`}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
