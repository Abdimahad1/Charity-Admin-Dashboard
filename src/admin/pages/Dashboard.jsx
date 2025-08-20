// src/admin/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../styles/dashboard.css";

/* ---------- API instance (auto local vs deployed) ---------- */
const LOCAL_BASE =
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const DEPLOY_BASE =
  (import.meta.env.VITE_API_DEPLOY_URL || "https://charity-backend-30xl.onrender.com/api").replace(/\/$/, "");

const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const BASE = isLocalHost ? LOCAL_BASE : DEPLOY_BASE;

const API = axios.create({ baseURL: BASE });

API.interceptors.request.use((cfg) => {
  const t = sessionStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/* ---- Helper function to normalize API responses ---- */
const normalizeMany = (data) => {
  const arr = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return arr.map(item => ({ id: item.id || item._id, ...item }));
};

/* ---- Inline Icons ---- */
const I = ({ children }) => <span className="dash-i">{children}</span>;

const IconMoney = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3zM6 9h12M6 15h12M9 12h2"/></svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16v2H4zM6 10h3v7H6zM11 5h3v12h-3zM16 12h3v5h-3z"/></svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11a4 4 0 110-8 4 4 0 010 8zm10-1a3 3 0 110-6 3 3 0 010 6zM2 20v-1c0-3 4-5 8-5s8 2 8 5v1H2zm13 0v-1c0-1 .5-2 1.4-2.6.9-.6 2.2-.9 3.6-.9 2.3 0 5 1.1 5 3.5V20h-10z"/></svg>
);
const IconTarget = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 109 9h-2a7 7 0 11-7-7V3zM12 8v4l3 2"/></svg>
);
const IconCampaign = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5l12 4-12 4V5zm12 11l4 3V7l-4 3v6z"/></svg>
);
const IconPending = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 5v6h5v2h-7V7z"/></svg>
);
const IconSpark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z"/></svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 10-5-5 5 5 0 005 5zm-7 8a7 7 0 0114 0v2H5v-2z"/></svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-4.5-8-10a5 5 0 019-3 5 5 0 019 3c0 5.5-8 10-8 10z"/></svg>
);
const IconUpload = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14v2H5v-2zm7-12l5 5h-3v4h-4v-4H7l5-5z"/></svg>
);
const IconAdd = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>
);
const IconReport = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6zM14 2v6h6"/></svg>
);
const IconLoader = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="spin">
    <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z" opacity="0.4"/>
    <path d="M12 2a10 10 0 0110 10h-2a8 8 0 00-8-8z"/>
  </svg>
);

const currency = (n, c = "USD") => {
  try { 
    return new Intl.NumberFormat(undefined, { 
      style: "currency", 
      currency: c, 
      minimumFractionDigits: 0 
    }).format(n); 
  } catch { 
    return `${n} ${c}`; 
  }
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState({
    items: [],
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 50
  });
  const [charities, setCharities] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [paymentsResponse, charitiesResponse, volunteersResponse] = await Promise.all([
          API.get('/payments/admin', { params: { limit: 50 } }),
          API.get('/charities/admin/list'),
          API.get('/volunteers')
        ]);
        
        setPayments(paymentsResponse.data);
        
        // Use normalizeMany to handle different response formats
        const charitiesArray = normalizeMany(charitiesResponse.data);
        setCharities(charitiesArray);
        
        setVolunteers(volunteersResponse.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate KPIs from payments data
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

  // Calculate yesterday's total for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTotal = (payments.items || [])
    .filter(p => p.createdAt && isSameDay(new Date(p.createdAt), yesterday) && p.status === "success")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const donationGrowth = yesterdayTotal > 0 
    ? Math.round(((todaysTotal - yesterdayTotal) / yesterdayTotal) * 100)
    : todaysTotal > 0 ? 100 : 0;

  // MTD Target (you might want to fetch this from your API)
  const mtdTarget = 100000; // Example target
  const mtdPct = mtdTarget > 0 
    ? Math.min(100, Math.round((mtdTotal / mtdTarget) * 100))
    : 0;

  if (loading) {
    return (
      <div className="dash">
        <div className="dash-head">
          <h2 className="dash-title">
            <I><IconSpark /></I>
            Admin Dashboard
          </h2>
        </div>
        <div className="loading-state">
          <I><IconLoader /></I>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash">
        <div className="dash-head">
          <h2 className="dash-title">
            <I><IconSpark /></I>
            Admin Dashboard
          </h2>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="dash-head">
        <h2 className="dash-title">
          <I><IconSpark /></I>
          Admin Dashboard
        </h2>
        <p className="dash-sub">Quick pulse of the organisation.</p>
      </div>

      {/* Donation KPIs - Replaced with cards from Donations page */}
      <section className="dash-kpis">
        <article className="kpi-card pop-in">
          <I><IconMoney /></I>
          <div className="kpi-meta">
            <div className="kpi-label">Today's Payments</div>
            <div className="kpi-value">{currency(todaysTotal, "USD")}</div>
            <div className={`kpi-note ${donationGrowth >= 0 ? 'up' : 'down'}`}>
              {donationGrowth >= 0 ? '+' : ''}{donationGrowth}% vs yesterday
            </div>
          </div>
        </article>

        <article className="kpi-card pop-in delay-1">
          <I><IconChart /></I>
          <div className="kpi-meta">
            <div className="kpi-label">MTD Total</div>
            <div className="kpi-value">{currency(mtdTotal, "USD")}</div>
            <div className="kpi-progress">
              <div className="bar"><span style={{ width: `${mtdPct}%` }} /></div>
              <span className="kpi-note">{mtdPct}% of {currency(mtdTarget, "USD")}</span>
            </div>
          </div>
        </article>

        <article className="kpi-card pop-in delay-2">
          <I><IconUsers /></I>
          <div className="kpi-meta">
            <div className="kpi-label">Records</div>
            <div className="kpi-value">{count}</div>
            <div className="kpi-note">Total transactions</div>
          </div>
        </article>

        <article className="kpi-card pop-in delay-3 bounce">
          <I><IconChart /></I>
          <div className="kpi-meta">
            <div className="kpi-label">Success Rate</div>
            <div className="kpi-value">{successRate}%</div>
            <div className="kpi-note">Successful transactions</div>
          </div>
        </article>
      </section>

      <section className="dash-rows">
        <div className="dash-left">
          <div className="dash-card">
            <div className="card-head">
              <h3>Top-Performing Charity Posts</h3>
              <span className="hint">Based on engagement & donations</span>
            </div>
            <div className="top-posts">
              {charities.slice(0, 3).map(p => (
                <div key={p.id || p._id} className="post">
                  <div className="post-icon"><IconHeart /></div>
                  <div className="post-info">
                    <div className="post-title">{p.title || p.name}</div>
                    <div className="post-meta">
                      <span className="badge">Performance {p.performance || p.engagement || 0}%</span>
                      <span className="badge ghost">{currency(p.donations || p.totalDonations || 0, "USD")}</span>
                    </div>
                    <div className="mini-bar"><span style={{ width: `${p.performance || p.engagement || 0}%` }} /></div>
                  </div>
                </div>
              ))}
              {charities.length === 0 && (
                <div className="empty-state">
                  <p>No charity data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="dash-right">
          <div className="dash-card">
            <div className="card-head">
              <h3>Recent Volunteers</h3>
              <span className="hint">New registrations</span>
            </div>
            <ul className="vols">
              {volunteers.slice(0, 4).map(v => (
                <li key={v.id || v._id} className="vol">
                  <I><IconUser /></I>
                  <div className="vol-meta">
                    <div className="vol-name">{v.fullName || "Anonymous Volunteer"}</div>
                    <div className="vol-role">{v.role || 'Volunteer'}</div>
                  </div>
                </li>
              ))}
              {volunteers.length === 0 && (
                <li className="empty-state">
                  <p>No volunteer data available</p>
                </li>
              )}
            </ul>
          </div>

          <div className="dash-card">
            <div className="card-head">
              <h3>Shortcuts</h3>
              <span className="hint">Do things quickly</span>
            </div>
            <div className="shortcuts">
              <Link to="/admin/charities" className="shortcut lift">
                <I><IconAdd /></I>
                <div>
                  <strong>Create Charity</strong>
                  <small>Add a new charity profile</small>
                </div>
              </Link>

              <Link to="/admin/homepage" className="shortcut lift">
                <I><IconUpload /></I>
                <div>
                  <strong>Upload Media</strong>
                  <small>Images & documents</small>
                </div>
              </Link>

              <Link to="/admin/reports" className="shortcut lift">
                <I><IconReport /></I>
                <div>
                  <strong>Export Report</strong>
                  <small>CSV / PDF</small>
                </div>
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}