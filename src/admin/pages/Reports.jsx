// src/admin/pages/Reports.jsx
import React, { useMemo, useState, useEffect } from "react";
import "../../styles/Reports.css";
import axios from "axios";

/* ---------- API Configuration ---------- */
const LOCAL_BASE =
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const DEPLOY_BASE =
  (import.meta.env.VITE_API_DEPLOY_URL || "https://charity-backend-c05j.onrender.com/api").replace(/\/$/, "");

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
const IconLoading = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="spinner">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="15.7 15.7" />
  </svg>
);

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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

/* Build preview (columns + rows) by report type */
function buildPreview(type, data) {
  switch (type) {
    case "donations":
      return {
        title: "Donations Report",
        subtitle: `Donations from ${formatDate(data.periodStart)} to ${formatDate(data.periodEnd)}`,
        headers: ["Date", "Donor", "Method", "Currency", "Amount", "Phone"],
        rows: (data.donations || []).map(d => [ // Added fallback for undefined
          formatDate(d.createdAt),
          d.name || "Anonymous",
          d.method,
          d.currency,
          formatMoney(d.amount, d.currency),
          d.phone || "N/A"
        ]),
        summary: {
          total: formatMoney(data.summary.totalAmount || 0),
          count: data.summary.count || 0,
          average: formatMoney(data.summary.avgAmount || 0)
        }
      };
    case "volunteers":
      return {
        title: "Volunteers Report",
        subtitle: `Volunteers from ${formatDate(data.periodStart)} to ${formatDate(data.periodEnd)}`,
        headers: ["Date", "Name", "Email", "Phone", "City", "Status", "Role"],
        rows: (data.volunteers || []).map(v => [ // Added fallback for undefined
          formatDate(v.createdAt),
          v.fullName,
          v.email,
          v.phone,
          v.city,
          v.status,
          v.role
        ]),
        summary: {
          count: data.summary.count || 0
        }
      };
    case "charities":
      return {
        title: "Charities Report",
        subtitle: "All charity projects",
        headers: ["Title", "Category", "Location", "Goal", "Raised", "Status", "Created"],
        rows: (data.charities || []).map(c => [ // Added fallback for undefined
          c.title,
          c.category,
          c.location,
          formatMoney(c.goal),
          formatMoney(c.raised),
          c.status,
          formatDate(c.createdAt)
        ]),
        summary: {
          count: data.summary.count || 0,
          totalGoal: formatMoney(data.summary.totalGoal || 0),
          totalRaised: formatMoney(data.summary.totalRaised || 0)
        }
      };
    case "collections":
      return {
        title: "Collections Report",
        subtitle: "Fundraising collections progress",
        headers: ["Title", "Category", "Goal", "Raised", "Progress", "Status", "Created"],
        rows: (data.collections || []).map(c => { // Added fallback for undefined
          const progress = c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0;
          return [
            c.title,
            c.category,
            formatMoney(c.goal),
            formatMoney(c.raised),
            `${progress}%`,
            c.status,
            formatDate(c.createdAt)
          ];
        }),
        summary: {
          count: data.summary.count || 0,
          totalGoal: formatMoney(data.summary.totalGoal || 0),
          totalRaised: formatMoney(data.summary.totalRaised || 0),
          completion: data.summary.completionRate ? `${Math.round(data.summary.completionRate * 100)}%` : "0%"
        }
      };
    case "finance":
      return {
        title: "Finance Summary",
        subtitle: `Monthly financial overview from ${formatDate(data.periodStart)} to ${formatDate(data.periodEnd)}`,
        headers: ["Month", "Donations", "Transactions"],
        rows: (data.monthlyData || []).map(f => [ // Added fallback for undefined
          f.month,
          formatMoney(f.donationsUSD),
          f.count
        ]),
        summary: {
          total: formatMoney(data.summary.totalAmount || 0),
          count: data.summary.count || 0,
          average: formatMoney(data.summary.avgAmount || 0)
        }
      };
    default:
      return { title: "Report", subtitle: "", headers: [], rows: [], summary: {} };
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
  const [active, setActive] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");
  const [filters, setFilters] = useState({});

  const preview = useMemo(() => {
    if (!active || !reportData) return null;
    return buildPreview(active, reportData);
  }, [active, reportData]);

  // Fetch report data when active report changes
  useEffect(() => {
    if (!active) return;
    
    const fetchReportData = async () => {
      setLoading(true);
      setError("");
      try {
        let response;
        
        switch (active) {
          case "donations":
            response = await API.get("/payments/admin", {
              params: { status: "success", limit: 100, page: 1 }
            });
            setReportData({
              donations: response.data.items || [],
              summary: {
                totalAmount: response.data.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0,
                count: response.data.items?.length || 0,
                avgAmount: response.data.items?.length ? 
                  response.data.items.reduce((sum, item) => sum + (item.amount || 0), 0) / response.data.items.length : 0
              },
              periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              periodEnd: new Date().toISOString()
            });
            break;
            
          case "volunteers":
            response = await API.get("/volunteers");
            setReportData({
              volunteers: response.data || [],
              summary: { count: response.data?.length || 0 },
              periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              periodEnd: new Date().toISOString()
            });
            break;
            
          case "charities":
            response = await API.get("/charities/admin/list", {
              params: { status: "all", limit: 100, page: 1 }
            });
            setReportData({
              charities: response.data.items || response.data || [],
              summary: {
                count: response.data.items?.length || response.data?.length || 0,
                totalGoal: response.data.items?.reduce((sum, item) => sum + (item.goal || 0), 0) || 
                          response.data?.reduce((sum, item) => sum + (item.goal || 0), 0) || 0,
                totalRaised: response.data.items?.reduce((sum, item) => sum + (item.raised || 0), 0) || 
                            response.data?.reduce((sum, item) => sum + (item.raised || 0), 0) || 0
              }
            });
            break;
            
          case "collections":
            response = await API.get("/charities/admin/list", {
              params: { status: "all", limit: 100, page: 1 }
            });
            const collections = response.data.items || response.data || [];
            setReportData({
              collections,
              summary: {
                count: collections.length,
                totalGoal: collections.reduce((sum, item) => sum + (item.goal || 0), 0),
                totalRaised: collections.reduce((sum, item) => sum + (item.raised || 0), 0),
                completionRate: collections.length ? 
                  collections.reduce((sum, item) => sum + (item.raised || 0), 0) / 
                  collections.reduce((sum, item) => sum + (item.goal || 1), 0) : 0
              }
            });
            break;
            
          case "finance":
            response = await API.get("/payments/stats", {
              params: { period }
            });
            setReportData({
              monthlyData: [
                {
                  month: new Date().toISOString().slice(0, 7),
                  donationsUSD: response.data.totalAmount || 0,
                  count: response.data.count || 0
                }
              ],
              summary: {
                totalAmount: response.data.totalAmount || 0,
                count: response.data.count || 0,
                avgAmount: response.data.avgAmount || 0
              },
              periodStart: response.data.startDate,
              periodEnd: response.data.endDate
            });
            break;
            
          default:
            setReportData(null);
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError("Failed to load report data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [active, period]);

  const handleGenerateReport = async () => {
    if (!active) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await API.post("/reports/generate", {
        type: active,
        period,
        filters
      });
      
      setReportData(response.data.data);
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      <header className="rp-head">
        <div>
          <h2 className="rp-title">Reports</h2>
          <p className="rp-sub">Download operational and finance reports with one click.</p>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      {/* Cards */}
      <section className="rp-grid">
        {REPORTS.map(card => (
          <article key={card.key} className={`rpt-card ${card.color}`}>
            <I>{card.icon}</I>
            <div className="rpt-meta">
              <h3 className="rpt-title">{card.title}</h3>
              <p className="rpt-blurb">{card.blurb}</p>
              <button 
                className="rpt-btn" 
                onClick={() => setActive(card.key)}
                disabled={loading}
              >
                {loading && active === card.key ? (
                  <span className="rpt-btn-i"><IconLoading /></span>
                ) : (
                  <span className="rpt-btn-i"><IconEye /></span>
                )}
                {loading && active === card.key ? "Loading..." : "View"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Period Selector (shown when a report is active) */}
      {active && (
        <div className="rp-controls">
          <label>
            Period:
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </label>
          <button 
            className="rpt-btn primary" 
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      )}

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
                
                {/* Summary Stats */}
                {Object.keys(preview.summary).length > 0 && (
                  <div className="rpt-summary">
                    {Object.entries(preview.summary).map(([key, value]) => (
                      <div key={key} className="rpt-summary-item">
                        <span className="rpt-summary-label">{key}:</span>
                        <span className="rpt-summary-value">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
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