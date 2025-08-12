// src/admin/pages/Reports.jsx
import React, { useMemo, useState } from "react";
import "../../styles/Reports.css";

/* ===== Inline icons (large & simple) ===== */
const I = ({ children }) => <span className="rpt-icon">{children}</span>;

const IconMoney = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5zm2 2v10h14V7H5zm2 3a2 2 0 102 2 2 2 0 00-2-2zm8 6H7v-2h8v2z"/></svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 12a4 4 0 114-4 4 4 0 01-4 4zm10-2a3 3 0 11-3-3 3 3 0 013 3zM2 21v-1c0-3.3 4.7-5 8-5s8 1.7 8 5v1H2zM16 21v-1c0-1.6-.6-2.7-1.6-3.5 3.1.2 6.6 1.4 6.6 4.5v0H16z"/></svg>
);
const IconRibbon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a6 6 0 016 6c0 4.5-6 12-6 12S6 12.5 6 8a6 6 0 016-6zm0 3a3 3 0 103 3 3 3 0 00-3-3z"/></svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4-9-4zm0 4l9 4 9-4v6l-9 4-9-4v-6z"/></svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16v-2H4v2zM6 16h3V8H6v8zm5 0h3V4h-3v12zm5 0h3v-6h-3v6z"/></svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v8h3l-4 4-4-4h3V3zM5 19h14v2H5z"/></svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.5 0 9.9 3.6 11 7-1.1 3.4-5.5 7-11 7S2.1 15.4 1 12c1.1-3.4 5.5-7 11-7zm0 3a4 4 0 104 4 4 4 0 00-4-4z"/></svg>
);

/* ===== Sample datasets (replace with API data) ===== */
const sampleDonations = [
  { date: "2025-08-10", donor: "Ayaan Ali", method: "EVC", currency: "USD", amount: 50, project: "Clean Water" },
  { date: "2025-08-10", donor: "Mohamed Noor", method: "E-Dahab", currency: "USD", amount: 25, project: "School Kits" },
  { date: "2025-08-09", donor: "Anonymous", method: "EVC", currency: "USD", amount: 100, project: "Mobile Clinic" },
  { date: "2025-08-08", donor: "Ifrah Ahmed", method: "EVC", currency: "USD", amount: 15, project: "Food Relief" },
  { date: "2025-08-08", donor: "Yahye Farah", method: "EVC", currency: "USD", amount: 75, project: "Women Grants" },
];

const sampleVolunteers = [
  { date: "2025-08-09", name: "Hodan Isse", email: "hodan@example.com", phone: "61xxxxxxx", city: "Mogadishu", status: "Approved" },
  { date: "2025-08-08", name: "Sagal Hassan", email: "sagal@example.com", phone: "65xxxxxxx", city: "Hargeisa", status: "Pending" },
  { date: "2025-08-07", name: "Bile Ali",   email: "bile@example.com",  phone: "66xxxxxxx", city: "Garowe",    status: "Approved" },
];

const sampleCharities = [
  { date: "2025-08-07", title: "Village Borehole", status: "Published", category: "Water", country: "Somalia" },
  { date: "2025-08-04", title: "Back-to-School Kits", status: "Draft", category: "Education", country: "Somalia" },
];

const sampleCollections = [
  { date: "2025-08-05", name: "Ramadan Drive", status: "Open", goalUSD: 10000, raisedUSD: 7200 },
  { date: "2025-07-10", name: "Health Week", status: "Closed", goalUSD: 5000, raisedUSD: 5200 },
];

const sampleFinance = [
  { month: "2025-07", donationsUSD: 15480, refundsUSD: 120, netUSD: 15360 },
  { month: "2025-08", donationsUSD: 8900, refundsUSD: 0, netUSD: 8900 },
];

/* ===== Report catalog ===== */
const REPORTS = [
  { key: "donations",   title: "Donations",        blurb: "Transactions, totals, and methods.", icon: <IconMoney />,  color: "rpt-don" },
  { key: "volunteers",  title: "Volunteers",       blurb: "Registrations & approval status.",   icon: <IconUsers />,  color: "rpt-vol" },
  { key: "charities",   title: "Charities",        blurb: "Published & draft projects.",        icon: <IconRibbon />, color: "rpt-cha" },
  { key: "collections", title: "Collections",      blurb: "Fund collections & progress.",       icon: <IconBox />,    color: "rpt-col" },
  { key: "finance",     title: "Finance Summary",  blurb: "Monthly net & trend overview.",      icon: <IconChart />,  color: "rpt-fin" },
];

/* Helpers */
const formatMoney = (n, c = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

/* Build preview (columns + rows) by report type */
function buildPreview(type) {
  switch (type) {
    case "donations":
      return {
        title: "Donations Report",
        subtitle: "Latest donations (sample data)",
        headers: ["Date", "Donor", "Method", "Currency", "Amount", "Project"],
        rows: sampleDonations.map(d => [d.date, d.donor, d.method, d.currency, formatMoney(d.amount, d.currency), d.project]),
      };
    case "volunteers":
      return {
        title: "Volunteers Report",
        subtitle: "Recent volunteers & status",
        headers: ["Date", "Name", "Email", "Phone", "City", "Status"],
        rows: sampleVolunteers.map(v => [v.date, v.name, v.email, v.phone, v.city, v.status]),
      };
    case "charities":
      return {
        title: "Charities Report",
        subtitle: "Projects & publication state",
        headers: ["Date", "Title", "Status", "Category", "Country"],
        rows: sampleCharities.map(c => [c.date, c.title, c.status, c.category, c.country]),
      };
    case "collections":
      return {
        title: "Collections Report",
        subtitle: "Open/closed collections and progress",
        headers: ["Date", "Name", "Status", "Goal (USD)", "Raised (USD)"],
        rows: sampleCollections.map(c => [c.date, c.name, c.status, formatMoney(c.goalUSD), formatMoney(c.raisedUSD)]),
      };
    case "finance":
      return {
        title: "Finance Summary",
        subtitle: "Monthly totals (USD)",
        headers: ["Month", "Donations", "Refunds", "Net"],
        rows: sampleFinance.map(f => [f.month, formatMoney(f.donationsUSD), formatMoney(f.refundsUSD), formatMoney(f.netUSD)]),
      };
    default:
      return { title: "Report", subtitle: "", headers: [], rows: [] };
  }
}

/* CSV export (client-side) */
function downloadCSV(filename, headers, rows) {
  const esc = (v) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.map(esc).join(","), ...rows.map(r => r.map(esc).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* Print / Save as PDF (opens a print view) */
function printPreview(title, headers, rows) {
  const w = window.open("", "_blank");
  if (!w) return;
  const styles = `
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; color: #0b1220; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    p { margin: 0 0 16px; color: #4b5563; }
    table { width: 100%; border-collapse: collapse; border-spacing: 0; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    th { background: #f8fafc; position: sticky; top: 0; }
  `;
  const html = `
    <html>
      <head><title>${title}</title><meta charset="utf-8"/><style>${styles}</style></head>
      <body>
        <h1>${title}</h1>
        <p>Generated ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr>${r.map(c => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export default function Reports() {
  const [active, setActive] = useState(null); // 'donations' | 'volunteers' | ...
  const preview = useMemo(() => (active ? buildPreview(active) : null), [active]);

  return (
    <div className="rp-page">
      <header className="rp-head">
        <div>
          <h2 className="rp-title">Reports</h2>
          <p className="rp-sub">Download operational and finance reports with one click.</p>
        </div>
      </header>

      {/* Cards */}
      <section className="rp-grid">
        {REPORTS.map(card => (
          <article key={card.key} className={`rpt-card ${card.color}`}>
            <I>{card.icon}</I>
            <div className="rpt-meta">
              <h3 className="rpt-title">{card.title}</h3>
              <p className="rpt-blurb">{card.blurb}</p>
              <button className="rpt-btn" onClick={() => setActive(card.key)}>
                <span className="rpt-btn-i"><IconEye /></span> View
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Modal */}
      <div className={`rpt-modal ${active ? "rpt-show" : ""}`} aria-hidden={!active}>
        {preview && (
          <div className="rpt-modal__card" role="dialog" aria-modal="true" aria-labelledby="rpt-head-title">
            <button className="rpt-modal__close" onClick={() => setActive(null)} aria-label="Close report">
              <IconClose />
            </button>

            <div className="rpt-modal__head">
              <div>
                <h3 id="rpt-head-title">{preview.title}</h3>
                <p className="rpt-modal__sub">{preview.subtitle}</p>
              </div>
              <div className="rpt-modal__actions">
                <button
                  className="rpt-btn ghost"
                  onClick={() =>
                    downloadCSV(`${active}-report-${new Date().toISOString().slice(0,10)}.csv`, preview.headers, preview.rows)
                  }
                >
                  <span className="rpt-btn-i"><IconDownload /></span> CSV
                </button>
                <button
                  className="rpt-btn"
                  onClick={() => printPreview(preview.title, preview.headers, preview.rows)}
                >
                  <span className="rpt-btn-i"><IconDownload /></span> PDF
                </button>
              </div>
            </div>

            <div className="rpt-modal__body">
              <div className="rpt-tablewrap">
                <table className="rpt-table">
                  <thead>
                    <tr>
                      {preview.headers.map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r, idx) => (
                      <tr key={idx}>
                        {r.map((c, i) => <td key={i}>{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="rpt-hint">Tip: Use the CSV for spreadsheets or choose PDF to print or save.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
