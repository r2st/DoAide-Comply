import { useEffect, useState } from 'react';
import { setMeta } from './Home.jsx';

export default function Widget() {
  const [type, setType] = useState('pvt_ltd');
  const [state, setState] = useState('Maharashtra');
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://comply.doaide.com';
  const code = `<div data-doaide-comply data-type="${type}" data-state="${state}"></div>\n<script src="${origin}/embed.js" async></script>`;
  useEffect(() => setMeta('Embeddable Compliance Widget | DoAide Comply', 'Add an upcoming compliance deadlines widget to your website or blog.'), []);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold text-white">Embed the compliance widget</h1>
      <p className="mb-6 text-zinc-400">CAs, accountants and business blogs: paste two lines to show upcoming deadlines on your site.</p>
      <div className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="wt" className="label">Business type</label>
            <select id="wt" className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="pvt_ltd">Private Limited</option><option value="llp">LLP</option><option value="proprietorship">Proprietorship</option>
            </select></div>
          <div><label htmlFor="ws" className="label">State</label>
            <input id="ws" className="input" value={state} onChange={(e) => setState(e.target.value)} /></div>
        </div>
        <label htmlFor="code" className="label">Embed code</label>
        <textarea id="code" readOnly rows={3} className="input font-mono text-xs" value={code} onFocus={(e) => e.target.select()} />
      </div>
    </div>
  );
}
