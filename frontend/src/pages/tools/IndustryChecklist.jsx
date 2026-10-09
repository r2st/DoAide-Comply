import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { setMeta } from '../Home.jsx';
import ShareButtons from '../../components/ShareButtons.jsx';

const INDUSTRIES = {
  manufacturing: {
    name: 'Manufacturing',
    description: 'Compliance checklist for manufacturing businesses — factories, production units, and assembly plants operating in India.',
    items: [
      { area: 'GST', task: 'File GSTR-1 (outward supplies) by 11th of following month', frequency: 'Monthly', penalty: '₹50/day late fee' },
      { area: 'GST', task: 'File GSTR-3B (summary return) by 20th of following month', frequency: 'Monthly', penalty: '₹50/day late fee' },
      { area: 'GST', task: 'Maintain HSN-wise summary in GSTR-1 for all manufactured goods', frequency: 'Monthly', penalty: 'ITC rejection for buyers' },
      { area: 'GST', task: 'File GSTR-9 annual return', frequency: 'Annual', penalty: '₹200/day, max 0.5% of turnover' },
      { area: 'TDS', task: 'Deduct TDS on contractor payments (Sec 194C) and deposit by 7th', frequency: 'Monthly', penalty: '1.5%/month interest' },
      { area: 'TDS', task: 'File quarterly TDS returns (Form 26Q)', frequency: 'Quarterly', penalty: '₹200/day late fee' },
      { area: 'Factory Act', task: 'Renew factory licence before expiry', frequency: 'Annual', penalty: 'Closure order + fine up to ₹2 lakh' },
      { area: 'Factory Act', task: 'Submit annual return (Form 21) to Chief Inspector of Factories', frequency: 'Annual', penalty: 'Fine up to ₹1 lakh' },
      { area: 'Factory Act', task: 'Maintain accident register and report serious accidents within 4 hours', frequency: 'Ongoing', penalty: 'Prosecution of occupier' },
      { area: 'Environment', task: 'Renew Consent to Operate (CTO) from State Pollution Control Board', frequency: 'Annual', penalty: 'Closure direction + criminal prosecution' },
      { area: 'Environment', task: 'File hazardous waste returns (Form 4) to SPCB', frequency: 'Annual', penalty: 'Fine + imprisonment up to 7 years' },
      { area: 'Environment', task: 'Submit Environmental Statement (Form V) by September 30', frequency: 'Annual', penalty: 'CTO revocation' },
      { area: 'Labour', task: 'Deposit PF contributions by 15th of following month', frequency: 'Monthly', penalty: 'Damages up to 25% of arrears' },
      { area: 'Labour', task: 'Deposit ESI contributions by 15th of following month', frequency: 'Monthly', penalty: '12% p.a. interest + damages' },
      { area: 'Labour', task: 'File annual return under Contract Labour Act (if using contract workers)', frequency: 'Annual', penalty: 'Fine up to ₹1 lakh' },
      { area: 'Labour', task: 'Maintain register of wages, overtime, and leave under Factories Act', frequency: 'Ongoing', penalty: 'Fine up to ₹2 lakh' },
      { area: 'ROC', task: 'File AOC-4 and MGT-7 annual returns with MCA', frequency: 'Annual', penalty: '₹100/day additional fee' },
      { area: 'Income Tax', task: 'Pay advance tax quarterly (Jun 15, Sep 15, Dec 15, Mar 15)', frequency: 'Quarterly', penalty: '1% per month interest u/s 234C' },
      { area: 'BIS', task: 'Renew BIS certification for products under mandatory certification', frequency: 'Annual/Biennial', penalty: 'Product seizure + fine up to ₹10 lakh' },
      { area: 'Customs', task: 'File import/export declarations and maintain DGFT records', frequency: 'Per shipment', penalty: 'Penalty up to 5x duty amount' },
    ],
  },
  it_services: {
    name: 'IT Services',
    description: 'Compliance checklist for IT and software services companies — SaaS, consulting, outsourcing, and digital agencies.',
    items: [
      { area: 'GST', task: 'File GSTR-1 by 11th of following month', frequency: 'Monthly', penalty: '₹50/day late fee' },
      { area: 'GST', task: 'File GSTR-3B by 20th of following month', frequency: 'Monthly', penalty: '₹50/day late fee' },
      { area: 'GST', task: 'Apply correct SAC codes for software services (998314, 998315)', frequency: 'Ongoing', penalty: 'ITC issues + audit scrutiny' },
      { area: 'GST', task: 'File LUT for zero-rated export services (Letter of Undertaking)', frequency: 'Annual', penalty: 'Must pay IGST upfront and claim refund' },
      { area: 'TDS', task: 'Deduct TDS on professional/technical fees (Sec 194J) at 10% and deposit by 7th', frequency: 'Monthly', penalty: '1.5%/month interest' },
      { area: 'TDS', task: 'Deduct TDS on contractor payments (Sec 194C) at 1%/2%', frequency: 'Monthly', penalty: '1.5%/month interest' },
      { area: 'TDS', task: 'File quarterly TDS returns and issue Form 16A within 15 days', frequency: 'Quarterly', penalty: '₹200/day + ₹100/day per certificate' },
      { area: 'Labour', task: 'Deposit PF contributions by 15th (mandatory for 20+ employees)', frequency: 'Monthly', penalty: 'Damages up to 25%' },
      { area: 'Labour', task: 'Deposit ESI contributions by 15th (employees earning ≤ ₹21,000/month)', frequency: 'Monthly', penalty: '12% p.a. interest' },
      { area: 'Labour', task: 'File professional tax returns (varies by state)', frequency: 'Monthly/Annual', penalty: '1.25% per month (varies by state)' },
      { area: 'Labour', task: 'Issue appointment letters and maintain employment records per Shops & Establishments Act', frequency: 'Ongoing', penalty: 'Fine up to ₹50,000' },
      { area: 'ROC', task: 'File AOC-4, MGT-7, and ADT-1 with MCA annually', frequency: 'Annual', penalty: '₹100/day additional fee' },
      { area: 'ROC', task: 'File DIR-3 KYC for all directors by September 30', frequency: 'Annual', penalty: '₹5,000 + DIN deactivation' },
      { area: 'Income Tax', task: 'Pay advance tax quarterly', frequency: 'Quarterly', penalty: '1% per month interest u/s 234C' },
      { area: 'Income Tax', task: 'File ITR by October 31 (audit cases) or July 31 (non-audit)', frequency: 'Annual', penalty: '₹5,000 late fee u/s 234F' },
      { area: 'Data Protection', task: 'Comply with DPDP Act 2023 — consent, data processing, grievance officer', frequency: 'Ongoing', penalty: 'Up to ₹250 crore per violation' },
      { area: 'Data Protection', task: 'Maintain records of data processing activities and cross-border transfers', frequency: 'Ongoing', penalty: 'Up to ₹250 crore' },
      { area: 'STPI/SEZ', task: 'File quarterly softex returns with STPI/RBI (for software exporters)', frequency: 'Quarterly', penalty: 'Show-cause notice + benefit withdrawal' },
      { area: 'Equalisation Levy', task: 'Check applicability of equalisation levy on digital services received from non-residents', frequency: 'Ongoing', penalty: 'Interest + penalty' },
    ],
  },
  retail: {
    name: 'Retail',
    description: 'Compliance checklist for retail businesses — shops, e-commerce sellers, distributors, and FMCG outlets.',
    items: [
      { area: 'GST', task: 'File GSTR-1 by 11th (monthly) or 13th (quarterly QRMP) of following period', frequency: 'Monthly/Quarterly', penalty: '₹50/day late fee' },
      { area: 'GST', task: 'File GSTR-3B by 20th (monthly) or 22nd/24th (quarterly)', frequency: 'Monthly/Quarterly', penalty: '₹50/day late fee' },
      { area: 'GST', task: 'Generate e-invoices for B2B sales (mandatory for turnover > ₹5 crore)', frequency: 'Per invoice', penalty: '100% tax penalty on non-compliant invoices' },
      { area: 'GST', task: 'Generate e-way bills for goods movement > ₹50,000', frequency: 'Per consignment', penalty: '₹10,000 or tax evaded, whichever is higher' },
      { area: 'GST', task: 'Reconcile ITC claims with GSTR-2B before filing GSTR-3B', frequency: 'Monthly', penalty: 'ITC reversal + interest' },
      { area: 'TDS', task: 'Deduct TDS on rent (Sec 194I) at 10% if monthly rent > ₹2,40,000 p.a.', frequency: 'Monthly', penalty: '1.5%/month interest' },
      { area: 'TDS', task: 'Deduct TDS on contractor/transporter payments (Sec 194C)', frequency: 'Monthly', penalty: '1.5%/month interest' },
      { area: 'Legal Metrology', task: 'Renew Legal Metrology licence for pre-packaged goods', frequency: 'Annual', penalty: 'Fine up to ₹1 lakh + product seizure' },
      { area: 'Legal Metrology', task: 'Ensure MRP, net weight, manufacturer details on all packaged goods', frequency: 'Ongoing', penalty: 'Fine up to ₹25,000 per offence' },
      { area: 'FSSAI', task: 'Renew FSSAI licence/registration (for food retailers)', frequency: 'Annual', penalty: 'Fine up to ₹5 lakh + closure' },
      { area: 'FSSAI', task: 'Display FSSAI licence number on all food products and premises', frequency: 'Ongoing', penalty: 'Fine up to ₹2 lakh' },
      { area: 'Labour', task: 'Register under Shops & Establishments Act of your state', frequency: 'Once + renewal', penalty: 'Fine up to ₹50,000' },
      { area: 'Labour', task: 'Deposit PF/ESI contributions by 15th of following month', frequency: 'Monthly', penalty: 'Damages up to 25% / 12% interest' },
      { area: 'Consumer Protection', task: 'Display consumer complaint mechanism and return/refund policy', frequency: 'Ongoing', penalty: 'Consumer court orders + compensation' },
      { area: 'Consumer Protection', task: 'Comply with e-commerce rules (for online sellers) — grievance officer, product origin disclosure', frequency: 'Ongoing', penalty: 'Platform de-listing + legal action' },
      { area: 'Income Tax', task: 'Pay advance tax quarterly', frequency: 'Quarterly', penalty: '1% per month interest u/s 234C' },
      { area: 'ROC', task: 'File AOC-4 and MGT-7 (if Pvt Ltd)', frequency: 'Annual', penalty: '₹100/day additional fee' },
      { area: 'Signage', task: 'Renew shop signage/trade licence from municipal corporation', frequency: 'Annual', penalty: 'Fine + removal of signage' },
    ],
  },
  healthcare: {
    name: 'Healthcare',
    description: 'Compliance checklist for healthcare businesses — hospitals, clinics, diagnostic labs, pharmacies, and medical device companies.',
    items: [
      { area: 'GST', task: 'File GSTR-1 and GSTR-3B (healthcare services are exempt but pharma/devices are taxable)', frequency: 'Monthly', penalty: '₹50/day late fee' },
      { area: 'GST', task: 'Maintain separate records for exempt (healthcare) and taxable (pharma) supplies', frequency: 'Ongoing', penalty: 'ITC reversal + interest' },
      { area: 'TDS', task: 'Deduct TDS on professional fees paid to doctors/consultants (Sec 194J)', frequency: 'Monthly', penalty: '1.5%/month interest' },
      { area: 'TDS', task: 'Deduct TDS on rent, contractor payments, and equipment purchases', frequency: 'Monthly', penalty: '1.5%/month interest' },
      { area: 'Clinical Establishment', task: 'Renew Clinical Establishment Registration under CEA 2010 or state rules', frequency: 'Annual/5 years', penalty: 'Closure order + fine up to ₹5 lakh' },
      { area: 'Clinical Establishment', task: 'Display registration certificate, doctors\' qualifications, and charges publicly', frequency: 'Ongoing', penalty: 'Show-cause notice + registration cancellation' },
      { area: 'Drug Licence', task: 'Renew drug licence (Form 20/21) from State Drug Controller', frequency: 'Every 5 years', penalty: 'Prosecution + imprisonment up to 5 years' },
      { area: 'Drug Licence', task: 'Maintain purchase/sale registers for Schedule H and H1 drugs', frequency: 'Ongoing', penalty: 'Licence suspension + criminal liability' },
      { area: 'Biomedical Waste', task: 'File annual report on biomedical waste management to SPCB', frequency: 'Annual', penalty: 'Fine up to ₹1 lakh/day + imprisonment' },
      { area: 'Biomedical Waste', task: 'Renew authorisation from SPCB for biomedical waste handling', frequency: 'Annual', penalty: 'Closure direction' },
      { area: 'PCPNDT', task: 'File Form F for all ultrasound scans and maintain records (PCPNDT Act)', frequency: 'Per procedure', penalty: 'Imprisonment up to 5 years + fine ₹1 lakh' },
      { area: 'Labour', task: 'Deposit PF and ESI contributions for all staff by 15th', frequency: 'Monthly', penalty: 'Damages up to 25% / 12% interest' },
      { area: 'Labour', task: 'Ensure professional tax compliance for all medical and admin staff', frequency: 'Monthly', penalty: 'Varies by state' },
      { area: 'Fire Safety', task: 'Renew fire NOC from local fire department', frequency: 'Annual', penalty: 'Closure order + criminal liability' },
      { area: 'NABH/NABL', task: 'Maintain NABH (hospitals) / NABL (labs) accreditation standards', frequency: 'Ongoing', penalty: 'Accreditation withdrawal + empanelment loss' },
      { area: 'ROC', task: 'File AOC-4, MGT-7, and DIR-3 KYC with MCA', frequency: 'Annual', penalty: '₹100/day additional fee' },
      { area: 'Income Tax', task: 'Pay advance tax quarterly and file ITR', frequency: 'Quarterly/Annual', penalty: '1% per month interest + ₹5,000 late fee' },
      { area: 'Insurance', task: 'Renew professional indemnity insurance for all practising doctors', frequency: 'Annual', penalty: 'Personal liability in malpractice suits' },
      { area: 'Data Protection', task: 'Comply with DPDP Act 2023 for patient health data — consent, purpose limitation', frequency: 'Ongoing', penalty: 'Up to ₹250 crore per violation' },
    ],
  },
};

export { INDUSTRIES };

export default function IndustryChecklist() {
  const [params] = useSearchParams();
  const initialIndustry = INDUSTRIES[params.get('industry')] ? params.get('industry') : 'manufacturing';
  const [selected, setSelected] = useState(initialIndustry);
  const [areaFilter, setAreaFilter] = useState('All');

  const industry = INDUSTRIES[selected];

  useEffect(() => {
    setMeta(
      `${industry.name} Compliance Checklist India | DoAide Comply`,
      industry.description
    );
  }, [industry]);

  const areas = useMemo(() => {
    const set = new Set(industry.items.map((i) => i.area));
    return ['All', ...Array.from(set)];
  }, [industry]);

  const filtered = useMemo(() => {
    if (areaFilter === 'All') return industry.items;
    return industry.items.filter((i) => i.area === areaFilter);
  }, [industry, areaFilter]);

  const areaStats = useMemo(() => {
    const map = {};
    for (const item of industry.items) {
      map[item.area] = (map[item.area] || 0) + 1;
    }
    return map;
  }, [industry]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-white">Industry Compliance Checklist</h1>
      <p className="mb-6 text-zinc-400">
        Complete compliance checklist by industry. Select your industry to see all applicable regulations, filing requirements, and penalties.
      </p>

      <div className="card mb-6">
        <label htmlFor="industry" className="label">Select your industry</label>
        <select id="industry" className="input" value={selected} onChange={(e) => { setSelected(e.target.value); setAreaFilter('All'); }}>
          {Object.entries(INDUSTRIES).map(([key, ind]) => (
            <option key={key} value={key}>{ind.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(areaStats).slice(0, 4).map(([area, count]) => (
          <div key={area} className="card !p-3 text-center" data-testid="area-stat">
            <div className="text-lg font-bold text-gold">{count}</div>
            <div className="text-xs text-zinc-400">{area}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter by compliance area">
        {areas.map((a) => (
          <button key={a} role="tab" aria-selected={areaFilter === a} onClick={() => setAreaFilter(a)}
            className={`rounded-full border px-3 py-1 text-xs ${areaFilter === a ? 'border-gold bg-gold text-ink' : 'border-zinc-700 text-zinc-300 hover:border-gold'}`}>
            {a}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item, i) => (
          <div key={i} className="card !p-4" data-testid="checklist-item">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded border border-zinc-600" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gold">{item.area}</span>
                  <span className="rounded-full bg-ink-3 px-2 py-0.5 text-xs text-zinc-400">{item.frequency}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-200">{item.task}</p>
                <p className="mt-1 text-xs text-red-300/80">Penalty: {item.penalty}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-10 text-center">
        <p className="mb-3 text-white">Get automated deadline reminders for your {industry.name.toLowerCase()} business.</p>
        <Link to="/" className="btn">Run the free health check</Link>
      </div>

      <div className="mt-6">
        <ShareButtons text={`${industry.name} compliance checklist for Indian businesses — free tool by DoAide Comply`} />
      </div>
    </div>
  );
}
