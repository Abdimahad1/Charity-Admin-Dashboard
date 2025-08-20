// src/admin/pages/Donations.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../styles/Donations.css";

/* ---------- API Configuration ---------- */
const LOCAL_BASE =
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const DEPLOY_BASE =
  (import.meta.env.VITE_API_DEPLOY_URL || "https://charity-backend-30xl.onrender.com/api").replace(/\/$/, "");

// If the app runs on localhost, use local API; otherwise use deployed API.
const isLocalHost = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
const BASE = isLocalHost ? LOCAL_BASE : DEPLOY_BASE;

// Create axios instance with base URL
const API = axios.create({ baseURL: BASE });

// Attach token from sessionStorage
API.interceptors.request.use((cfg) => {
  const t = sessionStorage.getItem("token") || localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

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

export default function Donations() {
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [status, setStatus] = useState("all");
  const [detail, setDetail] = useState(null);
  const [payments, setPayments] = useState({
    items: [],
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 50
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await API.get("/payments/admin", {
          params: { 
            q, 
            status: status !== 'all' ? status : undefined,
            method: method !== 'all' ? method : undefined,
            currency: currency !== 'all' ? currency : undefined,
            page: payments.page,
            limit: payments.limit
          }
        });
        
        console.log("API Response:", response.data);
        
        // Ensure the response data has the expected structure
        if (response.data && Array.isArray(response.data.items)) {
          setPayments(response.data);
        } else {
          // Handle case where response might be different structure
          setPayments({ 
            items: Array.isArray(response.data) ? response.data : [],
            total: response.data?.total || response.data?.length || 0,
            totalPages: response.data?.totalPages || 1,
            page: response.data?.page || 1,
            limit: response.data?.limit || 50
          });
        }
      } catch (err) {
        console.error("API Error:", err);
        setError(err.response?.data?.message || "Failed to fetch payments. Check console for details.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [q, method, currency, status, payments.page, payments.limit]);

  /* KPIs */
  const now = new Date();
  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && 
                            a.getMonth() === b.getMonth() && 
                            a.getDate() === b.getDate();
  const isSameMonth = (a, b) => a.getFullYear() === b.getFullYear() && 
                              a.getMonth() === b.getMonth();

  // Safely calculate KPIs
  const todaysTotal = (payments.items || [])
    .filter(p => p.createdAt && isSameDay(new Date(p.createdAt), now) && p.status === "success")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const mtdTotal = (payments.items || [])
    .filter(p => p.createdAt && isSameMonth(new Date(p.createdAt), now) && p.status === "success")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const count = (payments.items || []).length;
  const successRate = (() => {
    const ok = (payments.items || []).filter(p => p.status === "success").length || 0;
    return count ? Math.round((ok / count) * 100) : 0;
  })();

  /* Helpers */
  const money = (v, c = "USD") => {
    try { 
      return new Intl.NumberFormat(undefined, { 
        style: "currency", 
        currency: c, 
        minimumFractionDigits: 0 
      }).format(v); 
    } catch { 
      return `${v} ${c}`; 
    }
  };

  const exportCSV = () => {
    const cols = ["reference","name","phone","email","method","currency","amount","status","createdAt","note"];
    const rows = payments.items.map(p => [
      p.reference, 
      p.name || "Anonymous", 
      p.phone, 
      p.email || "", 
      p.method, 
      p.currency, 
      p.amount, 
      p.status, 
      p.createdAt, 
      (p.note || "").replace(/\n/g," ")
    ]);
    const csv = [cols.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0,10);
    a.download = `payments-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) return (
    <div className="content-pad">
      <div className="loading-spinner">Loading payments...</div>
    </div>
  );
  
  if (error) return (
    <div className="content-pad error">
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="content-pad donations">
      {/* Head */}
      <div className="don-head">
        <div>
          <h2 className="don-title">Payments</h2>
          <p className="don-sub">Track payment methods and statuses.</p>
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
            <div className="kpi-label">Today's Payments</div>
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
          <input 
            placeholder="Search by name or reference..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="all">All methods</option>
          <option value="EVC">EVC Plus</option>
          <option value="EDAHAB">E-Dahab</option>
        </select>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="all">All currencies</option>
          <option value="USD">USD</option>
          <option value="SOS">SOS</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
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
            {payments.items.map(p => (
              <tr key={p._id} onClick={() => setDetail(p)} className="row-link">
                <td>
                  <div className="donor">
                    <div className="avatar">{(p.name || "?").charAt(0).toUpperCase()}</div>
                    <div className="info">
                      <strong>{p.name || "Anonymous"}</strong>
                      <small className="muted">{p.email || p.phone || "No contact"}</small>
                    </div>
                  </div>
                </td>
                <td><strong>{money(p.amount, p.currency)}</strong></td>
                <td>
                  <span className={`method m-${p.method?.toLowerCase()}`}>
                    <I>{p.method === "EVC" ? <IconEVC/> : <IconEDahab/>}</I>
                    {p.method}
                  </span>
                </td>
                <td><span className={`status st-${p.status}`}>{p.status}</span></td>
                <td className="muted">{p.reference}</td>
                <td className="muted">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
            {payments.items.length === 0 && (
              <tr><td colSpan="6" className="empty">No payments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {payments.totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={payments.page <= 1}
            onClick={() => setPayments({...payments, page: payments.page - 1})}
          >
            Previous
          </button>
          <span>Page {payments.page} of {payments.totalPages}</span>
          <button 
            disabled={payments.page >= payments.totalPages}
            onClick={() => setPayments({...payments, page: payments.page + 1})}
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {detail && (
        <div className="modal show" onClick={() => setDetail(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetail(null)} aria-label="Close">
              <IconClose />
            </button>

            <header className="modal-head">
              <h3>Payment Details</h3>
              <span className={`status st-${detail.status}`}>{detail.status}</span>
            </header>

            <div className="modal-body">
              <div className="pair"><span>Donor</span><strong>{detail.name || "Anonymous"}</strong></div>
              <div className="pair"><span>Contact</span><strong>{detail.email || detail.phone || "—"}</strong></div>
              <div className="pair"><span>Amount</span><strong>{money(detail.amount, detail.currency)}</strong></div>
              <div className="pair"><span>Method</span><strong>{detail.method}</strong></div>
              <div className="pair"><span>Reference</span><strong>{detail.reference}</strong></div>
              <div className="pair"><span>Date</span><strong>{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "N/A"}</strong></div>
              <div className="pair"><span>Note</span><strong className="note">{detail.note || "—"}</strong></div>
              {detail.providerReference && (
                <div className="pair"><span>Provider Ref</span><strong>{detail.providerReference}</strong></div>
              )}
            </div>

            <footer className="modal-actions">
              <button className="btn" onClick={() => setDetail(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}