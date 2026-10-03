import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setMeta } from '../Home.jsx';
import ShareButtons from '../../components/ShareButtons.jsx';

const TDS_RATES = [
  { section: '192', payment: 'Salary', rateIndividual: 'Slab rates', rateOthers: 'N/A', threshold: 'Basic exemption' },
  { section: '194A', payment: 'Interest (other than on securities)', rateIndividual: '10%', rateOthers: '10%', threshold: '₹40,000 (₹50,000 for senior citizens)' },
  { section: '194B', payment: 'Winnings from lotteries/puzzles', rateIndividual: '30%', rateOthers: '30%', threshold: '₹10,000' },
  { section: '194C', payment: 'Contractor payments', rateIndividual: '1%', rateOthers: '2%', threshold: '₹30,000 single / ₹1,00,000 aggregate' },
  { section: '194D', payment: 'Insurance commission', rateIndividual: '5%', rateOthers: '10%', threshold: '₹15,000' },
  { section: '194DA', payment: 'Life insurance policy maturity', rateIndividual: '5%', rateOthers: '5%', threshold: '₹1,00,000' },
  { section: '194E', payment: 'Non-resident sportsperson/association', rateIndividual: '20%', rateOthers: '20%', threshold: 'Nil' },
  { section: '194H', payment: 'Commission or brokerage', rateIndividual: '5%', rateOthers: '5%', threshold: '₹15,000' },
  { section: '194I(a)', payment: 'Rent — plant/machinery/equipment', rateIndividual: '2%', rateOthers: '2%', threshold: '₹2,40,000' },
  { section: '194I(b)', payment: 'Rent — land/building/furniture', rateIndividual: '10%', rateOthers: '10%', threshold: '₹2,40,000' },
  { section: '194IA', payment: 'Transfer of immovable property', rateIndividual: '1%', rateOthers: '1%', threshold: '₹50,00,000' },
  { section: '194J(a)', payment: 'Technical services / call centre', rateIndividual: '2%', rateOthers: '2%', threshold: '₹30,000' },
  { section: '194J(b)', payment: 'Professional / royalty fees', rateIndividual: '10%', rateOthers: '10%', threshold: '₹30,000' },
  { section: '194K', payment: 'Mutual fund income', rateIndividual: '10%', rateOthers: '10%', threshold: '₹5,000' },
  { section: '194N', payment: 'Cash withdrawal from bank', rateIndividual: '2%', rateOthers: '2%', threshold: '₹1,00,00,000' },
  { section: '194O', payment: 'E-commerce operator payment', rateIndividual: '1%', rateOthers: '1%', threshold: '₹5,00,000' },
  { section: '194Q', payment: 'Purchase of goods', rateIndividual: '0.1%', rateOthers: '0.1%', threshold: '₹50,00,000' },
  { section: '194R', payment: 'Perquisites/benefits (non-salary)', rateIndividual: '10%', rateOthers: '10%', threshold: '₹20,000' },
  { section: '194S', payment: 'Virtual digital asset (crypto)', rateIndividual: '1%', rateOthers: '1%', threshold: '₹10,000 (₹50,000 specified)' },
  { section: '195', payment: 'Non-resident payments (general)', rateIndividual: '10–40%', rateOthers: '10–40%', threshold: 'Nil' },
];

export default function TdsRateFinder() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMeta('TDS Rate Finder — Indian TDS Rates 2026-27 | DoAide Comply', 'Look up TDS rates by payment type or section number for FY 2026-27.');
  }, []);

  const filtered = TDS_RATES.filter((r) => {
    const q = search.toLowerCase();
    return r.section.toLowerCase().includes(q) || r.payment.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl font-bold text-white">TDS Rate Finder</h1>
      <p className="mb-6 text-zinc-400">Look up TDS rates by payment type or section number. Rates for FY 2026-27 (AY 2027-28).</p>

      <div className="mb-6">
        <label htmlFor="search" className="label">Search by section or payment type</label>
        <input id="search" className="input" placeholder="e.g. 194C or contractor" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
              <th className="px-3 py-2">Section</th>
              <th className="px-3 py-2">Payment type</th>
              <th className="px-3 py-2">Individual/HUF</th>
              <th className="px-3 py-2">Company/Others</th>
              <th className="px-3 py-2">Threshold</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.section} className="border-b border-zinc-800/50 hover:bg-ink-2" data-testid="tds-row">
                <td className="px-3 py-2 font-medium text-gold">{r.section}</td>
                <td className="px-3 py-2 text-zinc-200">{r.payment}</td>
                <td className="px-3 py-2 text-zinc-300">{r.rateIndividual}</td>
                <td className="px-3 py-2 text-zinc-300">{r.rateOthers}</td>
                <td className="px-3 py-2 text-zinc-400">{r.threshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <p className="mt-4 text-center text-zinc-500">No matching sections found.</p>}

      <p className="mt-4 text-xs text-zinc-500">Rates are without surcharge/cess. If deductee does not provide PAN, TDS is deducted at 20% or the applicable rate, whichever is higher.</p>

      <div className="card mt-10 text-center">
        <p className="mb-3 text-white">Track all your TDS deadlines automatically.</p>
        <Link to="/" className="btn">Run the free health check</Link>
      </div>

      <div className="mt-6">
        <ShareButtons text="Look up Indian TDS rates for FY 2026-27 — free tool by DoAide Comply" />
      </div>
    </div>
  );
}
