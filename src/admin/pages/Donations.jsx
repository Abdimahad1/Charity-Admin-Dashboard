// src/admin/pages/Donations.jsx
import React, { useMemo, useState } from "react";
import "../../styles/Donations.css";

/* ---------- Inline icons (theme-friendly) ---------- */
const I = ({ children }) => <span className="i-bubble">{children}</span>;
const IconMoney = () => (
  <svg viewBox="0 0 24 24"><path d="M3 6h18v12H3zM5 8v8h14V8H5zm7 2a3 3 0 110 6 3 3 0 010-6z"/></svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24"><path d="M4 19h16v2H4zM6 10h3v7H6zM11 5h3v12h-3zM16 12h3v5h-3z"/></svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24"><path d="M7 11a4 4 0 110-8 4 4 0 010 8zm10-1a3 3 0 110-6 3 3 0 010 6zM2 20v-1c0-3 4-5 8-5s8 2 8 5v1H2zm13 0v-1c0-1 .5-2 1.4-2.6.9-.6 2.2-.9 3.6-.9 2.3 0 5 1.1 5 3.5V20h-10z"/></svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 105.3 14.1L22 22l-1.9 2-6.7-6A8 8 0 0010 2zm0 4a4 4 0 110 8 4 4 0 010-8z"/></svg>
);
const IconExport = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2l4 4h-3v8h-2V6H8l4-4zM4 14h16v6H4z"/></svg>
);
const IconEVC = () => (
  <svg viewBox="0 0 24 24"><path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm0 4v12h10V6H7z"/></svg>
);
const IconEDahab = () => (
  <svg viewBox="0 0 24 24"><path d="M12 1l3 4h6l-3 4 3 4h-6l-3 4-3-4H3l3-4-3-4h6l3-4z"/></svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
);

/* ---------- Mock data (replace with API) ---------- */
const SEED = [
  { id: "d1", name: "Amina Noor",   email: "amina@example.com", phone: "61xxxxxxx", amount: 25,  currency: "USD", method: "EVC",    status: "success", reference: "EV-90123", date: "2025-08-10T10:12:00Z", note: "For clean water" },
  { id: "d2", name: "Yusuf Khalid", email: "yusuf@example.com", phone: "65xxxxxxx", amount: 500, currency: "SOS", method: "EDAHAB", status: "pending", reference: "ED-45211", date: "2025-08-11T08:02:00Z", note: "" },
  { id: "d3", name: "Hodan Ali",    email: "hodan@example.com", phone: "66xxxxxxx", amount: 10,  currency: "USD", method: "EVC",    status: "success", reference: "EV-44920", date: "2025-08-11T12:44:00Z", note: "General fund" },
  { id: "d4", name: "Omar Faruk",   email: "omar@example.com",  phone: "61xxxxxxx", amount: 100, currency: "USD", method: "EDAHAB", status: "failed",  reference: "ED-22118", date: "2025-08-09T14:22:00Z", note: "" },
  { id: "d5", name: "Leila Ahmed",  email: "leila@example.com", phone: "65xxxxxxx", amount: 60,  currency: "USD", method: "EVC",    status: "success", reference: "EV-55531", date: "2025-08-11T15:11:00Z", note: "Back-to-School" },
];

export default function Donations() {
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("all");     // all | EVC | EDAHAB
  const [currency, setCurrency] = useState("all"); // all | USD | SOS
  const [status, setStatus] = useState("all");     // all | success | pending | failed | refunded
  const [detail, setDetail] = useState(null);      // donation row for modal

  const filtered = useMemo(() => {
    return SEED.filter(d => {
      if (q && !(d.name.toLowerCase().includes(q.toLowerCase()) || d.reference.toLowerCase().includes(q.toLowerCase()))) return false;
      if (method !== "all" && d.method !== method) return false;
      if (currency !== "all" && d.currency !== currency) return false;
      if (status !== "all" && d.status !== status) return false;
      return true;
    });
  }, [q, method, currency, status]);

  /* KPIs */
  const now = new Date();
  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isSameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

  const todaysTotal = filtered
    .filter(d => isSameDay(new Date(d.date), now) && d.status === "success")
    .reduce((s, d) => s + d.amount, 0);

  const mtdTotal = filtered
    .filter(d => isSameMonth(new Date(d.date), now) && d.status === "success")
    .reduce((s, d) => s + d.amount, 0);

  const count = filtered.length;
  const successRate = (() => {
    const ok = filtered.filter(d => d.status === "success").length || 0;
    return count ? Math.round((ok / count) * 100) : 0;
  })();

  /* Helpers */
  const money = (v, c = "USD") => {
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, minimumFractionDigits: 0 }).format(v); }
    catch { return `${v} ${c}`; }
  };

  const exportCSV = () => {
    const cols = ["reference","name","phone","email","method","currency","amount","status","date","note"];
    const rows = filtered.map(d => [
      d.reference, d.name, d.phone, d.email, d.method, d.currency, d.amount, d.status, d.date, (d.note || "").replace(/\n/g," ")
    ]);
    const csv = [cols.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0,10);
    a.download = `donations-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="content-pad donations">
      {/* Head */}
      <div className="don-head">
        <div>
          <h2 className="don-title">Donations</h2>
          <p className="don-sub">Track supporters, payment methods, and statuses.</p>
        </div>
        <div className="head-actions">
          <button className="btn ghost" onClick={exportCSV}><I><IconExport /></I> Export CSV</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="don-kpis">
        <div className="kpi kpi-1">
          <I><IconMoney /></I>
          <div className="kpi-meta">
            <div className="kpi-label">Today’s Donations</div>
            <div className="kpi-value">{money(todaysTotal, "USD")}</div>
          </div>
        </div>
        <div className="kpi">
          <I><IconChart /></I>
          <div className="kpi-meta">
            <div className="kpi-label">MTD Total</div>
            <div className="kpi-value">{money(mtdTotal, "USD")}</div>
          </div>
        </div>
        <div className="kpi">
          <I><IconUsers /></I>
          <div className="kpi-meta">
            <div className="kpi-label">Records</div>
            <div className="kpi-value">{count}</div>
          </div>
        </div>
        <div className="kpi">
          <I><IconChart /></I>
          <div className="kpi-meta">
            <div className="kpi-label">Success Rate</div>
            <div className="kpi-value">{successRate}%</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card don-filters">
        <div className="field search">
          <I><IconSearch /></I>
          <input placeholder="Search by name or reference…" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
        <select value={method} onChange={e=>setMethod(e.target.value)}>
          <option value="all">All methods</option>
          <option value="EVC">EVC Plus</option>
          <option value="EDAHAB">E-Dahab</option>
        </select>
        <select value={currency} onChange={e=>setCurrency(e.target.value)}>
          <option value="all">All currencies</option>
          <option value="USD">USD</option>
          <option value="SOS">SOS</option>
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">All status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="card table-wrap">
        <table className="tbl donations-tbl">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} onClick={()=>setDetail(d)} className="row-link">
                <td>
                  <div className="donor">
                    <div className="avatar">{(d.name || "?").charAt(0).toUpperCase()}</div>
                    <div className="info">
                      <strong>{d.name}</strong>
                      <small className="muted">{d.email || d.phone}</small>
                    </div>
                  </div>
                </td>
                <td><strong>{money(d.amount, d.currency)}</strong></td>
                <td>
                  <span className={`method m-${d.method.toLowerCase()}`}>
                    <I>{d.method === "EVC" ? <IconEVC/> : <IconEDahab/>}</I>
                    {d.method}
                  </span>
                </td>
                <td><span className={`status st-${d.status}`}>{d.status}</span></td>
                <td className="muted">{d.reference}</td>
                <td className="muted">{new Date(d.date).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="empty">No donations match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal (white card) */}
      {detail && (
        <div className="modal show" onClick={()=>setDetail(null)}>
          <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
            <button className="modal-close" onClick={()=>setDetail(null)} aria-label="Close">
              <IconClose />
            </button>

            <header className="modal-head">
              <h3>Donation Details</h3>
              <span className={`status st-${detail.status}`}>{detail.status}</span>
            </header>

            <div className="modal-body">
              <div className="pair"><span>Donor</span><strong>{detail.name}</strong></div>
              <div className="pair"><span>Contact</span><strong>{detail.email || detail.phone || "—"}</strong></div>
              <div className="pair"><span>Amount</span><strong>{money(detail.amount, detail.currency)}</strong></div>
              <div className="pair"><span>Method</span><strong>{detail.method}</strong></div>
              <div className="pair"><span>Reference</span><strong>{detail.reference}</strong></div>
              <div className="pair"><span>Date</span><strong>{new Date(detail.date).toLocaleString()}</strong></div>
              <div className="pair"><span>Note</span><strong className="note">{detail.note || "—"}</strong></div>
            </div>

            <footer className="modal-actions">
              <button className="btn" onClick={()=>setDetail(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
