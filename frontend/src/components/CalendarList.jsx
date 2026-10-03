import { useMemo, useState } from 'react';

export const CATEGORIES = ['GST', 'TDS/TCS', 'Income Tax', 'ROC', 'PF/ESI', 'Professional Tax'];

export function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CalendarList({ items, renderExtra }) {
  const [cat, setCat] = useState('All');
  const shown = useMemo(() => (cat === 'All' ? items : items.filter((i) => i.category === cat)), [items, cat]);
  const present = CATEGORIES.filter((c) => items.some((i) => i.category === c));
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
        {['All', ...present].map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1 text-sm ${cat === c ? 'border-gold bg-gold text-ink' : 'border-zinc-700 text-zinc-300 hover:border-gold'}`}>
            {c}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {shown.map((i) => (
          <li key={i.id} className="card !p-4" data-testid="calendar-item">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold text-white">{i.title}</span>
              <span className="font-mono text-gold">{formatDate(i.due_date)}</span>
            </div>
            <div className="mt-1 text-xs text-zinc-500">{i.category} &middot; {i.form}{i.conditional ? ' · if applicable' : ''}</div>
            <p className="mt-2 text-sm text-zinc-400">{i.description}</p>
            <p className="mt-1 text-sm text-red-300/90">Penalty: {i.penalty}</p>
            {renderExtra && renderExtra(i)}
          </li>
        ))}
      </ul>
    </div>
  );
}
