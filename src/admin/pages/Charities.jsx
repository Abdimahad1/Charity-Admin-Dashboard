// src/admin/pages/Charities.jsx
import React, { useMemo, useState, useEffect } from "react";
import "../../styles/Charities.css";
import axios from "axios";

/* Minimal inline icons */
const I = ({ children }) => <span className="i-bubble">{children}</span>;
const IconSearch = () => (
  <svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 106.32 3.16L22 8l-4 4-1.68-5.68A8 8 0 0010 2zm0 4a4 4 0 110 8 4 4 0 010-8z"/></svg>
);
const IconPlus = () => (<svg viewBox="0 0 24 24"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>);
const IconEdit = () => (<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>);
const IconTrash = () => (<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2z"/></svg>);
const IconPublish = () => (<svg viewBox="0 0 24 24"><path d="M12 3l7 7h-4v7H9v-7H5l7-7z"/></svg>);
const IconUnpub = () => (<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>);

const CATEGORIES = ["Education", "Health", "Water", "Food", "Empowerment"];

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

/* helpers */
const normalizeOne = (r) => {
  if (!r) return r;
  // ensure `id` exists even if backend uses `_id`
  return { id: r.id || r._id, ...r };
};
const normalizeMany = (data) => {
  // support either [] or {items: []}
  const arr = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return arr.map(normalizeOne);
};

export default function Charities() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(null); // object | null
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  
  // New state for pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50); // adjust if you add UI for it
  const [total, setTotal] = useState(0);

  // Fetch charities with params
  const fetchRows = async ({ q = "", status = "all", page = 1, limit = 50 } = {}) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/charities/admin/list", {
        params: { q, status, page, limit },
      });
      setRows(normalizeMany(data));
      // supports { items, total } or []
      if (Array.isArray(data?.items)) {
        setTotal(Number(data.total || 0));
      } else {
        setTotal(Array.isArray(data) ? data.length : 0);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load charities.");
    } finally {
      setLoading(false);
    }
  };

  // Load once on mount
  useEffect(() => {
    fetchRows({ q, status, page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when status or page changes
  useEffect(() => {
    fetchRows({ q, status, page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  // Debounce search (q)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchRows({ q, status, page: 1, limit });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, [q]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchQ =
        !q ||
        r.title?.toLowerCase().includes(q.toLowerCase()) ||
        r.location?.toLowerCase().includes(q.toLowerCase());
      const matchStatus = status === "all" || r.status === status;
      return matchQ && matchStatus;
    });
  }, [rows, q, status]);

  const openNew = () =>
    setEditing({
      id: null,
      title: "",
      excerpt: "",
      category: CATEGORIES[0],
      location: "",
      goal: 0,
      raised: 0,
      status: "Draft",
      cover: "",
      donationLink: "",
      featured: false,
    });

  const openEdit = (row) => setEditing({ ...row });

  const save = async () => {
    if (!editing?.title?.trim()) return alert("Title is required");
    if (!editing.goal || Number(editing.goal) <= 0) return alert("Goal is required");
    try {
      setSaving(true);
      if (editing.id) {
        const { data } = await API.put(`/charities/${editing.id}`, editing);
        const updated = normalizeOne(data);
        setRows((rs) => rs.map((r) => (r.id === editing.id ? updated : r)));
      } else {
        const { data } = await API.post("/charities", editing);
        const created = normalizeOne(data);
        setRows((rs) => [created, ...rs]);
      }
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert("Failed to save charity.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this charity?")) return;
    try {
      setDeletingId(id);
      await API.delete(`/charities/${id}`);
      setRows((rs) => rs.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete charity.");
    } finally {
      setDeletingId(null);
    }
  };

  const togglePub = async (row) => {
    const newStatus = row.status === "Published" ? "Draft" : "Published";
    // optimistic UI
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r)));
    try {
      await API.put(`/charities/${row.id}`, { ...row, status: newStatus });
    } catch (e) {
      console.error(e);
      // revert if failed
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: row.status } : r)));
      alert("Failed to update publish status.");
    }
  };

  const handleImagePickAndUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await API.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = data?.url || "";
      setEditing((ed) => ({ ...ed, cover: uploadedUrl }));
    } catch (err) {
      console.error(err);
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="charities concise">
      {/* Header */}
      <div className="char-head">
        <h2>Charities</h2>
        <div className="char-actions">
          <div className="search">
            <I><IconSearch /></I>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title or location…"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
          <button className="btn" onClick={openNew}>
            <I><IconPlus /></I> New Charity
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="empty">Loading charities…</div>
        ) : (
          <table className="tbl compact">
            <thead>
              <tr>
                <th>Cover</th> {/* Added Cover column */}
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Progress</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const pct = Math.min(
                  100,
                  Math.round((Number(r.raised || 0) / Number(r.goal || 1)) * 100)
                );
                return (
                  <tr key={r.id}>
                    <td className="cell-title with-thumb">
                      {r.cover ? (
                        <img className="cover-thumb" src={r.cover} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <div className="cover-thumb ph" aria-hidden="true" />
                      )}
                      <div className="title-stack">
                        <strong>{r.title}</strong>
                        <div className="muted small">{r.excerpt}</div>
                      </div>
                    </td>
                    <td><span className="chip ghost">{r.category}</span></td>
                    <td className="muted">{r.location}</td>
                    <td>
                      <div className="mini-progress">
                        <div className="bar"><span style={{ "--w": `${pct}%` }} /></div>
                        <small className="muted">
                          ${(r.raised || 0).toLocaleString()} / ${Number(r.goal || 0).toLocaleString()} • {pct}%
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className={`status st-${(r.status || "").toLowerCase()}`}>{r.status}</span>
                    </td>
                    <td className="row-actions">
                      <button className="btn xs ghost" onClick={() => togglePub(r)}>
                        <I>{r.status === "Published" ? <IconUnpub /> : <IconPublish />}</I>
                        {r.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                      <button className="btn xs ghost" onClick={() => openEdit(r)}><I><IconEdit /></I>Edit</button>
                      <button
                        className="btn xs danger"
                        disabled={deletingId === r.id}
                        onClick={() => remove(r.id)}
                      >
                        <I><IconTrash /></I>{deletingId === r.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan="7">
                    <div className="empty">No charities found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing.id ? "Edit Charity" : "New Charity"}</h3>
              <button className="close-btn" onClick={() => setEditing(null)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="edit-grid">
                <div className="col form">
                  <div className="field">
                    <label>Title</label>
                    <input
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      placeholder="Charity title"
                    />
                  </div>
                  <div className="field">
                    <label>Short Excerpt</label>
                    <input
                      value={editing.excerpt}
                      onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                      placeholder="One-line summary"
                    />
                  </div>

                  <div className="grid-3">
                    <div className="field">
                      <label>Category</label>
                      <select
                        value={editing.category}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Location</label>
                      <input
                        value={editing.location}
                        onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Status</label>
                      <select
                        value={editing.status}
                        onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                      >
                        <option>Draft</option>
                        <option>Published</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="field">
                      <label>Goal (USD)</label>
                      <input
                        type="number"
                        min="0"
                        value={editing.goal}
                        onChange={(e) => setEditing({ ...editing, goal: Number(e.target.value || 0) })}
                      />
                    </div>
                    <div className="field">
                      <label>Raised (USD)</label>
                      <input
                        type="number"
                        min="0"
                        value={editing.raised}
                        onChange={(e) => setEditing({ ...editing, raised: Number(e.target.value || 0) })}
                      />
                    </div>
                    <div className="field">
                      <label>Donation Link</label>
                      <input
                        placeholder="https://"
                        value={editing.donationLink}
                        onChange={(e) => setEditing({ ...editing, donationLink: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Cover Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagePickAndUpload}
                    />
                    <small className="muted">
                      {uploading ? "Uploading…" : editing.cover ? "Image uploaded." : "Pick an image to upload."}
                    </small>
                    {editing.cover && (
                      <div className="thumb">
                        <img src={editing.cover} alt="cover preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="col preview">
                  <PreviewCard data={editing} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-save" disabled={saving} onClick={save}>
                {saving ? "Saving…" : editing.id ? "Save Changes" : "Create Charity"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewCard({ data }) {
  const pct = Math.min(100, Math.round((data.raised / data.goal) * 100));
  return (
    <article className="pv-card">
      <div className="pv-top">
        <span className="pv-badge">{data.category || "Category"}</span>
        <span className="pv-loc">{data.location || "Location"}</span>
      </div>

      <div className="pv-title-row">
        <span className="pv-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="3" ry="3"/></svg>
        </span>
        <h3 className="pv-title">{data.title || "Untitled charity"}</h3>
      </div>

      <p className="pv-excerpt">{data.excerpt || "Short description appears here."}</p>

      <div className="pv-progress">
        <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        <div className="legend">
          <span className="raised">${Number(data.raised || 0).toLocaleString()}</span>
          <span className="goal">of ${Number(data.goal || 0).toLocaleString()}</span>
          <span className="pct">{pct}%</span>
        </div>
      </div>

      <div className="pv-actions">
        <button className="pv-btn primary">Donate</button>
        <button className="pv-btn ghost">Details</button>
      </div>
    </article>
  );
}