// src/admin/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Dashboard.css"; // <-- import the dashboard styles

/* ---- Inline Icons ---- */
const I = ({ children }) => <span className="dash-i">{children}</span>;

const IconMoney = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3zM6 9h12M6 15h12M9 12h2"/></svg>
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

/* ---- Mock data ---- */
const kpis = {
  todayDonations: 1260.5,
  mtdDonations: 23450,
  mtdTarget: 40000,
  activeCollections: 7,
  totalCollections: 12,
  pendingApprovals: 4
};

const activity = [
  { id: 1, name: "Amina N.", action: "approved a new charity", at: "2m ago" },
  { id: 2, name: "System", action: "received donation £250 to ‘Clean Water’", at: "15m ago" },
  { id: 3, name: "Yusuf K.", action: "uploaded 3 media files", at: "22m ago" },
  { id: 4, name: "Admin", action: "updated homepage hero images", at: "1h ago" },
];

const topPosts = [
  { id: 1, title: "Back-to-School Kits", perf: 92, donations: 8450 },
  { id: 2, title: "Maternal Health Camp", perf: 87, donations: 6120 },
  { id: 3, title: "Village Well Build", perf: 81, donations: 9700 },
];

const recentVolunteers = [
  { id: 1, name: "Hodan Ali", role: "Field Support" },
  { id: 2, name: "Ibrahim Noor", role: "Logistics" },
  { id: 3, name: "Leila Ahmed", role: "Clinic Assistant" },
  { id: 4, name: "Omar Faruk", role: "Fundraising" },
];

const currency = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const mtdPct = Math.min(100, Math.round((kpis.mtdDonations / kpis.mtdTarget) * 100));

  return (
    <div className="dash">
      <div className="dash-head">
        <h2 className="dash-title">
          <I><IconSpark /></I>
          Admin Dashboard
        </h2>
        <p className="dash-sub">Quick pulse of the organisation.</p>
      </div>

      <section className="dash-kpis">
        <article className="kpi-card pop-in">
          <I><IconMoney /></I>
          <div className="kpi-meta">
            <div className="kpi-label">Today’s Donations</div>
            <div className="kpi-value">{currency(kpis.todayDonations)}</div>
            <div className="kpi-note up">+12% vs yesterday</div>
          </div>
        </article>

        <article className="kpi-card pop-in delay-1">
          <I><IconTarget /></I>
          <div className="kpi-meta">
            <div className="kpi-label">MTD Donations</div>
            <div className="kpi-value">{currency(kpis.mtdDonations)}</div>
            <div className="kpi-progress">
              <div className="bar"><span style={{ width: `${mtdPct}%` }} /></div>
              <span className="kpi-note">{mtdPct}% of {currency(kpis.mtdTarget)}</span>
            </div>
          </div>
        </article>

        <article className="kpi-card pop-in delay-2">
          <I><IconCampaign /></I>
          <div className="kpi-meta">
            <div className="kpi-label">Active Collections</div>
            <div className="kpi-value">{kpis.activeCollections}/{kpis.totalCollections}</div>
            <div className="kpi-note">Running campaigns</div>
          </div>
        </article>

        <article className="kpi-card pop-in delay-3 bounce">
          <I><IconPending /></I>
          <div className="kpi-meta">
            <div className="kpi-label">Pending Approvals</div>
            <div className="kpi-value">{kpis.pendingApprovals}</div>
            <div className="kpi-note warn">Requires review</div>
          </div>
        </article>
      </section>

      <section className="dash-rows">
        <div className="dash-left">
          <div className="dash-card">
            <div className="card-head">
              <h3>Activity Feed</h3>
              <span className="hint">Latest admin actions & submissions</span>
            </div>
            <ul className="activity">
              {activity.map(a => (
                <li key={a.id} className="activity-item">
                  <div className="avatar" aria-hidden="true">{a.name.charAt(0)}</div>
                  <div className="act-text">
                    <strong>{a.name}</strong> {a.action}
                    <span className="time"> · {a.at}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="dash-card">
            <div className="card-head">
              <h3>Top-Performing Charity Posts</h3>
              <span className="hint">Based on engagement & donations</span>
            </div>
            <div className="top-posts">
              {topPosts.map(p => (
                <div key={p.id} className="post">
                  <div className="post-icon"><IconHeart /></div>
                  <div className="post-info">
                    <div className="post-title">{p.title}</div>
                    <div className="post-meta">
                      <span className="badge">Performance {p.perf}%</span>
                      <span className="badge ghost">{currency(p.donations)}</span>
                    </div>
                    <div className="mini-bar"><span style={{ width: `${p.perf}%` }} /></div>
                  </div>
                </div>
              ))}
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
              {recentVolunteers.map(v => (
                <li key={v.id} className="vol">
                  <I><IconUser /></I>
                  <div className="vol-meta">
                    <div className="vol-name">{v.name}</div>
                    <div className="vol-role">{v.role}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="dash-card">
            <div className="card-head">
              <h3>Shortcuts</h3>
              <span className="hint">Do things quickly</span>
            </div>
            <div className="shortcuts">
              <Link to="/admin/charities/new" className="shortcut lift">
                <I><IconAdd /></I>
                <div>
                  <strong>Create Charity</strong>
                  <small>Add a new charity profile</small>
                </div>
              </Link>

              <Link to="/admin/media" className="shortcut lift">
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
