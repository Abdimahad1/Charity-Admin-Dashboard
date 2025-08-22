// src/admin/pages/Volunteers.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import "../../styles/VolunteersAdmin.css";

/* ---------- API instance (auto local vs deployed) ---------- */
const LOCAL_BASE =
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const DEPLOY_BASE =
  (import.meta.env.VITE_API_DEPLOY_URL || "https://charity-backend-c05j.onrender.com/api").replace(/\/$/, "");

// If the app runs on localhost, use local API; otherwise use deployed API.
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const BASE = isLocalHost ? LOCAL_BASE : DEPLOY_BASE;

const API = axios.create({ baseURL: BASE });

// attach token from sessionStorage (matches your AdminLogin)
API.interceptors.request.use((cfg) => {
  const t = sessionStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/* ---------- Tiny inline icons ---------- */
const VaIcon = ({ children }) => <span className="va-ib">{children}</span>;
const IcUsers = () => (<svg viewBox="0 0 24 24"><path d="M7 11a4 4 0 110-8 4 4 0 010 8zm10-1a3 3 0 110-6 3 3 0 010 6zM2 20v-1c0-3 4-5 8-5s8 2 8 5v1H2zm13 0v-1c0-1 .5-2 1.4-2.6.9-.6 2.2-.9 3.6-.9 2.3 0 5 1.1 5 3.5V20h-10z"/></svg>);
const IcSearch = () => (<svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 105.3 14.1L22 22l-1.9 2-6.7-6A8 8 0 0010 2zm0 4a4 4 0 110 8 4 4 0 010-8z"/></svg>);
const IcExport = () => (<svg viewBox="0 0 24 24"><path d="M12 2l4 4h-3v8h-2V6H8l4-4zM4 14h16v6H4z"/></svg>);
const IcTrash = () => (<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2z"/></svg>);
const IcClose = () => (<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
const IcCheck = () => (<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcX = () => (<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
const IcEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

/* ---------- Helpers ---------- */
const ellips = (s, n = 28) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");

export default function Volunteers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [detail, setDetail] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  /* Show notification */
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  /* Fetch volunteers */
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await API.get("/volunteers");
        setRows(res.data);
      } catch (err) {
        console.error("Error fetching volunteers:", err);
        showNotification("Failed to load volunteers", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  /* Filtered rows */
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (q && !(`${r.fullName} ${r.email} ${r.phone}`.toLowerCase().includes(q.toLowerCase())))
          return false;
        if (status !== "all" && r.status !== status) return false;
        return true;
      }),
    [rows, q, status]
  );

  /* Totals */
  const totals = useMemo(() => {
    const t = { total: rows.length, pending: 0, approved: 0, rejected: 0 };
    rows.forEach((r) => {
      if (r.status === "approved") t.approved++;
      else if (r.status === "rejected") t.rejected++;
      else t.pending++;
    });
    return t;
  }, [rows]);

  /* Delete volunteer */
  const deleteVolunteer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await API.delete(`/volunteers/${id}`);
      setRows((rs) => rs.filter((r) => r._id !== id));
      showNotification("Volunteer application deleted successfully");
    } catch (err) {
      console.error("Error deleting volunteer:", err);
      showNotification("Failed to delete volunteer application", "error");
    }
  };

  /* Update status */
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await API.patch(`/volunteers/${id}/status`, { status: newStatus });
      
      setRows((rs) => rs.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
      
      const message = newStatus === "approved" 
        ? "Volunteer approved and email sent" 
        : "Volunteer rejected and email sent";
      
      showNotification(message);
      
    } catch (err) {
      console.error(`Error updating status to ${newStatus}:`, err);
      const errorMessage = err.response?.data?.message || "Failed to update status";
      showNotification(errorMessage, "error");
    }
  };

  /* Send custom email */
  const sendCustomEmail = async (volunteer, subject, message) => {
    try {
      await API.post("/volunteers/send-email", {
        email: volunteer.email,
        subject,
        message,
        volunteerId: volunteer._id
      });
      showNotification("Email sent successfully");
    } catch (err) {
      console.error("Error sending email:", err);
      showNotification("Failed to send email", "error");
    }
  };

  /* Export CSV */
  const exportCSV = () => {
    const cols = [
      "fullName",
      "email",
      "phone",
      "city",
      "district",
      "availability",
      "role",
      "interests",
      "status",
      "createdAt",
    ];
    const rws = filtered.map((r) => [
      r.fullName,
      r.email,
      r.phone,
      r.city,
      r.district,
      r.availability,
      r.role,
      Array.isArray(r.interests) ? r.interests.join("|") : r.interests,
      r.status,
      new Date(r.createdAt).toLocaleString(),
    ]);
    const csv = [
      cols.join(","),
      ...rws.map((rr) => rr.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `volunteers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    showNotification("CSV exported successfully");
  };

  if (loading) {
    return <div className="va-page content-pad">Loading volunteers...</div>;
  }

  return (
    <div className="va-page content-pad">
      {/* Notification */}
      {notification.show && (
        <div className={`va-notification va-notification--${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="va-header">
        <div>
          <h2 className="va-title">Volunteer Management</h2>
          <p className="va-sub">Click the <strong>eye icon</strong> for full details.</p>
          </div>
        <button className="va-btn va-btn--ghost" onClick={exportCSV}>
          <VaIcon>
            <IcExport />
          </VaIcon>{" "}
          Export CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="va-kpis">
        <div className="va-kpi kpi-total"><VaIcon><IcUsers/></VaIcon><div><div className="va-kpi__label">Total</div><div className="va-kpi__value">{totals.total}</div></div></div>
        <div className="va-kpi kpi-pending"><VaIcon><IcUsers/></VaIcon><div><div className="va-kpi__label">Pending</div><div className="va-kpi__value">{totals.pending}</div></div></div>
        <div className="va-kpi kpi-approved"><VaIcon><IcUsers/></VaIcon><div><div className="va-kpi__label">Approved</div><div className="va-kpi__value">{totals.approved}</div></div></div>
        <div className="va-kpi kpi-rejected"><VaIcon><IcUsers/></VaIcon><div><div className="va-kpi__label">Rejected</div><div className="va-kpi__value">{totals.rejected}</div></div></div>
      </div>

      {/* Filters */}
      <div className="va-card va-controls">
        <div className="va-search">
          <VaIcon>
            <IcSearch />
          </VaIcon>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, or phone…"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="va-card va-tablewrap">
        <table className="va-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Status</th>
              <th>Applied</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id}>
                <td>
                  <div className="va-applicant">
                    <div className="va-avatar">{r.fullName?.charAt(0)?.toUpperCase() || "?"}</div>
                    <div className="va-applicant__info">
                      <strong>{ellips(r.fullName, 22)}</strong>
                    </div>
                  </div>
                </td>
                <td className="va-muted">{ellips(r.email, 24)}</td>
                <td className="va-muted">{ellips(`${r.city || ''} • ${r.district || ''}`, 24)}</td>
                <td>
                  <span className={`va-status is-${r.status}`}>{r.status}</span>
                </td>
                <td className="va-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="va-rowactions">
                    <button
                      className="va-iconbtn"
                      title="View Details"
                      onClick={() => setDetail(r)}
                      aria-label="View Details"
                    >
                      <IcEye />
                    </button>
                    <button 
                      className="va-btn va-btn--xs va-btn--success" 
                      onClick={() => updateStatus(r._id, "approved")}
                      title="Approve"
                    >
                      <VaIcon><IcCheck /></VaIcon>
                    </button>
                    <button 
                      className="va-btn va-btn--xs va-btn--warning" 
                      onClick={() => updateStatus(r._id, "rejected")}
                      title="Reject"
                    >
                      <VaIcon><IcX /></VaIcon>
                    </button>
                    <button 
                      className="va-btn va-btn--xs va-btn--danger" 
                      onClick={() => deleteVolunteer(r._id)}
                      title="Delete"
                    >
                      <VaIcon><IcTrash /></VaIcon>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="va-empty">
                  No volunteers match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details modal */}
      {detail && (
        <div className="va-modal va-show" onClick={() => setDetail(null)}>
          <div className="va-modal__card" onClick={(e) => e.stopPropagation()}>
            <button className="va-modal__close" onClick={() => setDetail(null)} aria-label="Close">
              <IcClose />
            </button>
            <header className="va-modal__head">
              <h3>Volunteer Details</h3>
              <span className={`va-status is-${detail.status}`}>{detail.status}</span>
            </header>
            <div className="va-modal__body">
              <div className="va-pair"><span>Name</span><strong>{detail.fullName}</strong></div>
              <div className="va-pair"><span>Email</span><strong>{detail.email}</strong></div>
              <div className="va-pair"><span>Phone</span><strong>{detail.phone}</strong></div>
              <div className="va-pair"><span>Location</span><strong>{detail.city} • {detail.district}</strong></div>
              <div className="va-pair"><span>Availability</span><strong>{detail.availability}</strong></div>
              <div className="va-pair"><span>Role</span><strong>{detail.role}</strong></div>
              <div className="va-pair"><span>Interests</span><strong>{Array.isArray(detail.interests) ? detail.interests.join(", ") : detail.interests}</strong></div>
              <div className="va-pair"><span>Skills</span><strong>{detail.skills || "—"}</strong></div>
              <div className="va-pair"><span>Message</span><strong>{detail.message || "—"}</strong></div>
              <div className="va-pair"><span>Applied</span><strong>{new Date(detail.createdAt).toLocaleString()}</strong></div>
              {detail.cvFile && (
                <div className="va-pair">
                  <span>CV/Resume</span>
                  <strong>
                    <a 
                      href={`${BASE}${detail.cvFile}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="va-link"
                    >
                      Download CV
                    </a>
                  </strong>
                </div>
              )}
            </div>
            <footer className="va-modal__actions">
              <div className="va-modal__buttons">
                <button 
                  className="va-btn va-btn--success" 
                  onClick={() => updateStatus(detail._id, "approved")}
                  disabled={detail.status === "approved"}
                >
                  Approve
                </button>
                <button 
                  className="va-btn va-btn--warning" 
                  onClick={() => updateStatus(detail._id, "rejected")}
                  disabled={detail.status === "rejected"}
                >
                  Reject
                </button>
                <button 
                  className="va-btn va-btn--danger" 
                  onClick={() => deleteVolunteer(detail._id)}
                >
                  Delete
                </button>
                <button className="va-btn va-btn--ghost" onClick={() => setDetail(null)}>Close</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}