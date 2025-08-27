import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../styles/Homepage.css";

/* ---------------------------------------
   API base detection (local vs deployed)
---------------------------------------- */
const API_BASE =
  (window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1"))
    ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "")
    : (import.meta.env.VITE_API_DEPLOY_URL || import.meta.env.VITE_API_DEPLOY || "https://charity-backend-c05j.onrender.com/api").replace(/\/$/, "");
const API_ORIGIN = API_BASE.replace(/\/api(?:\/.*)?$/, "");

/* ---------------------------------------
   Axios instance + interceptors
---------------------------------------- */
const API = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  withCredentials: false
});

API.interceptors.request.use((cfg) => {
  const t = sessionStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

API.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response) {
      console.error(`[API ${error.response.status}]`, error.config?.url, error.response?.data || error.message);
    } else {
      console.error(`[API error]`, error?.message || error);
    }
    return Promise.reject(error);
  }
);

/* ---------------------------------------
   URL helpers (variant-aware + fallbacks)
---------------------------------------- */
const isBlobLike = (u = "") => /^blob:|^data:/i.test(String(u));

const absolutizeUploadUrl = (u) => {
  if (!u) return "";
  let s = String(u).trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(s) || isBlobLike(s)) return s;
  if (!s.startsWith("/")) s = `/${s}`;
  s = s.replace(/^\/api(?=\/uploads\/)/i, "");          // normalize accidental /api prefix
  if (/^\/images\//i.test(s)) s = `/uploads${s}`;       // /images/... -> /uploads/images/...
  if (/^\/[^/]+\.(jpg|jpeg|png|gif|webp|avif)$/i.test(s)) s = `/uploads/images${s}`;
  if (/^\/uploads\//i.test(s)) return `${API_ORIGIN}${s}`;
  return `${API_ORIGIN}${s}`;
};

const toVariantUrl = (absUrl) => {
  // Turn .../uploads/images/<file> -> .../api/upload/variant/<file>
  const m = absUrl.match(/\/uploads\/images\/([^/?#]+)/i);
  return m ? `${API_BASE}/upload/variant/${m[1]}` : absUrl.split("?")[0];
};

const responsiveUrl = (url, width, format = "webp") => {
  if (!url || isBlobLike(url)) return url || "";
  const abs = absolutizeUploadUrl(url);
  const variant = toVariantUrl(abs);
  // your backend returns optimized images (e.g., webp) at this route
  return `${variant}?width=${width}&format=${format}`;
};

const buildSrcSet = (url) => {
  if (!url || isBlobLike(url)) return "";
  const widths = [320, 480, 640, 768, 1024, 1280, 1536, 1920];
  return widths.map((w) => `${responsiveUrl(url, w)} ${w}w`).join(", ");
};

const pickSlideSrc = (s) => {
  if (s?.src) return absolutizeUploadUrl(s.src);
  const img0 = Array.isArray(s?.images) ? s.images[0] : undefined;
  const img0Url = (img0 && typeof img0 === "object") ? (img0.url ?? img0.src ?? img0.path) : img0;
  const candidate =
    s?.image ??
    s?.url ??
    s?.file?.url ??
    img0Url ??
    (s?.filename ? `/uploads/images/${s.filename}` : "");
  return absolutizeUploadUrl(candidate);
};

const pickEventCover = (e) => {
  if (e?.coverImage) return absolutizeUploadUrl(e.coverImage);
  const img0 = Array.isArray(e?.images) ? e.images[0] : undefined;
  const img0Url = (img0 && typeof img0 === "object") ? (img0.url ?? img0.src ?? img0.path) : img0;
  const candidate =
    e?.cover?.url ??
    e?.image ??
    img0Url ??
    (e?.filename ? `/uploads/images/${e.filename}` : "");
  return absolutizeUploadUrl(candidate);
};

/* ---------- Toast notifications ---------- */
const showToast = (icon, title, message = "") => {
  Swal.fire({
    icon,
    title,
    text: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

/* ---------- Icons ---------- */
const I = ({ children }) => <span className="hm-ib">{children}</span>;
const IconImage = () => (<svg viewBox="0 0 24 24"><path d="M21 5H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V7a2 2 0 00-2-2zM4 8a2 2 0 114 0 2 2 0 01-4 0zm0 9l5-6 4 4 3-3 4 5H4z"/></svg>);
const IconText = () => (<svg viewBox="0 0 24 24"><path d="M4 5h16v2H13v12h-2V7H4z"/></svg>);
const IconEye = () => (<svg viewBox="0 0 24 24"><path d="M12 5c5 0 9 4 10 7-1 3-5 7-10 7S3 15 2 12c1-3 5-7 10-7zm0 3a4 4 0 104 4 4 4 0 00-4-4z"/></svg>);
const IconTrash = () => (<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2z"/></svg>);
const IconUp = () => (<svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5H7z"/></svg>);
const IconDown = () => (<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>);
const IconSave = () => (<svg viewBox="0 0 24 24"><path d="M5 3h14l2 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V5l2-2zm2 2v4h10V5H7zm10 14v-6H7v6h10z"/></svg>);
const IconAlign = () => (<svg viewBox="0 0 24 24"><path d="M3 7h18v2H3V7zm4 4h10v2H7v-2zm-4 4h18v2H3v-2z"/></svg>);
const IconEdit = () => (<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm18.71-11.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.99-1.66z"/></svg>);
const IconChevronLeft = () => (<svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>);
const IconChevronRight = () => (<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>);
const IconEvent = () => (<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a3 3 0 00-3 3v11a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 14a1 1 0 01-1 1H5a1 1 0 01-1-1V10h16v8zM4 8V7a1 1 0 011-1h14a1 1 0 011 1v1H4z"/></svg>);
const IconCalendar = () => (<svg viewBox="0 0 24 24"><path d="M7 2h2v3H7V2zm8 0h2v3h-2V2zM4 7h16v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm3 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>);
const IconTag = () => (<svg viewBox="0 0 24 24"><path d="M10 3H3v7l8 8 7-7-8-8zm-6 2h4v4H4V5z"/></svg>);

/* ===================================================================
   Component
=================================================================== */
export default function HomepageAdmin() {
  /* ================= SLIDES ================ */
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    alt: "",
    align: "left",
    overlay: 44,
    published: true,
    file: null,
    preview: ""
  });

  const fileRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get("/slides");
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        const normalized = items.map((s) => ({
          ...s,
          src: pickSlideSrc(s)
        }));
        if (mounted) {
          setSlides(normalized);
          if (normalized.length > 0) setCurrentIdx(0);
        }
      } catch (e) {
        setError("Failed to load homepage slides.");
        console.error(e);
        showToast('error', 'Error', 'Failed to load homepage slides.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const selectedSlide = slides[currentIdx] || null;
  const currentPreview = useMemo(() => {
    if (form.preview) return form.preview;
    if (editingId) {
      const s = slides.find((x) => (x._id || x.id) === editingId);
      if (s?.src) return s.src;
    }
    return selectedSlide?.src || "";
  }, [form.preview, editingId, slides, selectedSlide]);

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setForm((s) => ({ ...s, file: null, preview: "" }));
      return;
    }
    const url = URL.createObjectURL(f);
    setForm((s) => ({ ...s, file: f, preview: url }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      alt: "",
      align: "left",
      overlay: 44,
      published: true,
      file: null,
      preview: ""
    });
    setEditingId("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const loadSlideIntoForm = (idx) => {
    const s = slides[idx];
    if (!s) return;
    setCurrentIdx(idx);
    setEditingId(s._id || s.id || "");
    setForm({
      title: s.title || "",
      subtitle: s.subtitle || "",
      alt: s.alt || "",
      align: (s.align || "left").toLowerCase(),
      overlay: Number(s.overlay ?? 40),
      published: !!s.published,
      file: null,
      preview: ""
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  async function addSlide(e) {
    e.preventDefault();
    if (!form.file) {
      showToast('warning', 'Image Required', 'Please pick an image.');
      return;
    }
    if (!form.title.trim()) {
      showToast('warning', 'Headline Required', 'Headline is required.');
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("file", form.file);
      const up = await API.post("/upload/image", fd);
      const url = up.data?.url ? absolutizeUploadUrl(up.data.url) : "";

      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        alt: form.alt.trim() || "Homepage slide",
        src: url,
        align: form.align,
        overlay: Number(form.overlay) || 40,
        published: !!form.published
      };

      const { data } = await API.post("/slides", payload);
      const normalized = { ...data, src: pickSlideSrc({ ...data, src: data.src || url }) };
      setSlides((arr) => [normalized, ...arr]);
      setCurrentIdx(0);
      setEditingId(normalized._id || normalized.id || "");
      setForm((s) => ({ ...s, file: null, preview: "" }));
      if (fileRef.current) fileRef.current.value = "";
      showToast('success', 'Success', 'Slide created successfully!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', err?.response?.data?.message || "Failed to create slide.");
    } finally {
      setSaving(false);
    }
  }

  async function updateSlide(e) {
    e.preventDefault();
    if (!editingId) return;

    try {
      setSaving(true);
      let newSrc;
      if (form.file) {
        const fd = new FormData();
        fd.append("file", form.file);
        const up = await API.post("/upload/image", fd);
        newSrc = up.data?.url ? absolutizeUploadUrl(up.data.url) : undefined;
      }

      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        alt: form.alt.trim() || "Homepage slide",
        align: form.align,
        overlay: Number(form.overlay) || 40,
        published: !!form.published,
        ...(newSrc ? { src: newSrc } : {})
      };

      const { data } = await API.put(`/slides/${editingId}`, payload);
      const normalized = { ...data, src: pickSlideSrc({ ...data }) };
      setSlides((arr) =>
        arr.map((s) => ((s._id || s.id) === editingId ? { ...s, ...normalized } : s))
      );
      const idx = slides.findIndex((s) => (s._id || s.id) === editingId);
      if (idx >= 0) setCurrentIdx(idx);
      setForm((s) => ({ ...s, file: null, preview: "" }));
      if (fileRef.current) fileRef.current.value = "";
      showToast('success', 'Success', 'Slide updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', err?.response?.data?.message || "Failed to update slide.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSlide(id) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/slides/${id}`);
      setSlides((arr) => arr.filter((s) => (s._id || s.id) !== id));
      if (editingId === id) {
        resetForm();
        setCurrentIdx(0);
      } else {
        setCurrentIdx((idx) => Math.max(0, Math.min(idx, slides.length - 2)));
      }
      showToast('success', 'Deleted', 'Slide has been deleted.');
    } catch (e) {
      console.error(e);
      showToast('error', 'Error', e?.response?.data?.message || "Failed to delete slide.");
    }
  }

  async function togglePub(id) {
    try {
      const slide = slides.find((s) => (s._id || s.id) === id);
      if (!slide) return;
      const updated = { ...slide, published: !slide.published };
      setSlides((arr) => arr.map((s) => ((s._id || s.id) === id ? updated : s)));
      await API.put(`/slides/${id}`, { published: updated.published });
      if ((slide._id || slide.id) === editingId) {
        setForm((f) => ({ ...f, published: updated.published }));
      }
      showToast('success', 'Updated', `Slide ${updated.published ? 'published' : 'unpublished'}`);
    } catch (e) {
      console.error(e);
      showToast('error', 'Error', e?.response?.data?.message || "Failed to update publish state.");
    }
  }

  async function move(id, dir) {
    setMovingId(id);
    try {
      const { data } = await API.patch(`/slides/${id}/move`, null, { params: { dir } });
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      const normalized = items.map((s) => ({ ...s, src: pickSlideSrc(s) }));
      setSlides(normalized);
      const tgtIndex = normalized.findIndex((s) => (s._id || s.id) === id);
      if (tgtIndex >= 0) setCurrentIdx(tgtIndex);
      showToast('success', 'Moved', `Slide moved ${dir}`);
    } catch (e) {
      console.error(e);
      showToast('error', 'Error', e?.response?.data?.message || "Failed to reorder slide.");
    } finally {
      setMovingId("");
    }
  }
  const moveUp = (id) => move(id, "up");
  const moveDown = (id) => move(id, "down");

  /* ================= EVENTS ================ */
  const [events, setEvents] = useState([]);
  const [evLoading, setEvLoading] = useState(true);
  const [evSaving, setEvSaving] = useState(false);
  const [evEditingId, setEvEditingId] = useState("");

  const evFileRef = useRef(null);
  const [evForm, setEvForm] = useState({
    title: "",
    category: "",
    date: "",
    location: "",
    description: "",
    published: true,
    file: null,
    preview: ""
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get("/events");
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        const normalized = items.map((e) => ({
          ...e,
          coverImage: pickEventCover(e)
        }));
        if (mounted) setEvents(normalized);
      } catch (e) {
        console.error(e);
        showToast('error', 'Error', 'Failed to load events.');
      } finally {
        if (mounted) setEvLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const evPick = () => evFileRef.current?.click();
  const evFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setEvForm((s) => ({ ...s, file: null, preview: "" }));
      return;
    }
    const url = URL.createObjectURL(f);
    setEvForm((s) => ({ ...s, file: f, preview: url }));
  };

  const evReset = () => {
    setEvForm({
      title: "",
      category: "",
      date: "",
      location: "",
      description: "",
      published: true,
      file: null,
      preview: ""
    });
    setEvEditingId("");
    if (evFileRef.current) evFileRef.current.value = "";
  };

  function loadEventIntoForm(id) {
    const e = events.find((x) => (x._id || x.id) === id);
    if (!e) return;
    setEvEditingId(e._id || e.id || "");
    setEvForm({
      title: e.title || "",
      category: (e.category?.name || e.category || "") + "",
      date: (e.date || e.publishedAt || "").slice(0, 10),
      location: e.location || "",
      description: e.description || e.excerpt || "",
      published: !!e.published,
      file: null,
      preview: pickEventCover(e) || ""
    });
    if (evFileRef.current) evFileRef.current.value = "";
  }

  async function addEvent(e) {
    e.preventDefault();
    if (!evForm.file) {
      showToast('warning', 'Image Required', 'Please choose an event image.');
      return;
    }
    if (!evForm.title.trim()) {
      showToast('warning', 'Title Required', 'Title is required.');
      return;
    }
    try {
      setEvSaving(true);
      const fd = new FormData();
      fd.append("file", evForm.file);
      const up = await API.post("/upload/image", fd);
      const cover = up.data?.url ? absolutizeUploadUrl(up.data.url) : "";

      const payload = {
        title: evForm.title.trim(),
        category: evForm.category.trim(),
        date: evForm.date ? new Date(evForm.date).toISOString() : undefined,
        location: evForm.location.trim(),
        description: evForm.description.trim(),
        coverImage: cover,
        published: !!evForm.published
      };
      const { data } = await API.post("/events", payload);
      const normalized = { ...data, coverImage: pickEventCover({ ...data }) };
      setEvents((arr) => [normalized, ...arr]);
      evReset();
      showToast('success', 'Success', 'Event created successfully!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', err?.response?.data?.message || "Failed to create event.");
    } finally {
      setEvSaving(false);
    }
  }

  async function updateEvent(e) {
    e.preventDefault();
    if (!evEditingId) return;
    try {
      setEvSaving(true);
      let newCover;
      if (evForm.file) {
        const fd = new FormData();
        fd.append("file", evForm.file);
        const up = await API.post("/upload/image", fd);
        newCover = up.data?.url ? absolutizeUploadUrl(up.data.url) : undefined;
      }
      const payload = {
        title: evForm.title.trim(),
        category: evForm.category.trim(),
        date: evForm.date ? new Date(evForm.date).toISOString() : undefined,
        location: evForm.location.trim(),
        description: evForm.description.trim(),
        published: !!evForm.published,
        ...(newCover ? { coverImage: newCover } : {})
      };
      const { data } = await API.put(`/events/${evEditingId}`, payload);
      const normalized = { ...data, coverImage: pickEventCover({ ...data }) };
      setEvents((arr) => arr.map((x) => ((x._id || x.id) === evEditingId ? { ...x, ...normalized } : x)));
      evReset();
      showToast('success', 'Success', 'Event updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', err?.response?.data?.message || "Failed to update event.");
    } finally {
      setEvSaving(false);
    }
  }

  async function deleteEvent(id) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/events/${id}`);
      setEvents((arr) => arr.filter((x) => (x._id || x.id) !== id));
      if (evEditingId === id) evReset();
      showToast('success', 'Deleted', 'Event has been deleted.');
    } catch (e) {
      console.error(e);
      showToast('error', 'Error', e?.response?.data?.message || "Failed to delete event.");
    }
  }

  async function toggleEventPub(id) {
    try {
      const item = events.find((x) => (x._id || x.id) === id);
      if (!item) return;
      const updated = { ...item, published: !item.published };
      setEvents((arr) => arr.map((x) => ((x._id || x.id) === id ? updated : x)));
      await API.put(`/events/${id}`, { published: updated.published });
      if (evEditingId === id) setEvForm((f) => ({ ...f, published: updated.published }));
      showToast('success', 'Updated', `Event ${updated.published ? 'published' : 'unpublished'}`);
    } catch (e) {
      console.error(e);
      showToast('error', 'Error', e?.response?.data?.message || "Failed to update publish state.");
    }
  }

  const stripTags = (html = "") => html.replace(/<[^>]*>/g, " ");
  const brief = (s = "", n = 120) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  /* ================= RENDER ================ */
  const hasPreview = !!form.preview;

  return (
    <div className="hm-page">
      {/* Header */}
      <div className="hm-header">
        <div>
          <h2 className="hm-title">Homepage Manager</h2>
          <p className="hm-sub">Upload hero/background images and edit overlay text.</p>
        </div>
        <div className="hm-kpi-row">
          <div className="hm-kpi">
            <I><IconImage /></I>
            <div className="hm-kpi__meta">
              <div className="hm-kpi__label">Total Slides</div>
              <div className="hm-kpi__value">{slides.length}</div>
            </div>
          </div>
          <div className="hm-kpi">
            <I><IconEye /></I>
            <div className="hm-kpi__meta">
              <div className="hm-kpi__label">Published</div>
              <div className="hm-kpi__value">{slides.filter(s => s.published).length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Form + Preview */}
      <section className="hm-grid">
        {/* FORM */}
        <form className="hm-card hm-form" onSubmit={editingId ? updateSlide : addSlide}>
          <div className="hm-form-head">
            <h3 className="hm-card__title">
              <I><IconImage /></I> {editingId ? "Edit Background" : "New Background"}
            </h3>
            <div className="hm-form-tools">
              {editingId ? (
                <button type="button" className="hm-btn hm-btn--ghost" onClick={resetForm}>+ New</button>
              ) : null}
            </div>
          </div>

          <div className="hm-field">
            <label>Image</label>
            <div className="hm-file-row">
              <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} hidden />
              <button type="button" className="hm-btn" onClick={onPickFile}>
                <I><IconImage /></I> {editingId ? "Replace Image" : "Choose Image"}
              </button>
              <span className="hm-filehint">
                {hasPreview ? "Preview ready" : "JPG/PNG/WEBP, large landscape works best"}
              </span>
            </div>
          </div>

          <div className="hm-field">
            <label>Headline</label>
            <input
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="e.g., Building Hope Together"
            />
          </div>

          <div className="hm-field">
            <label>Subtitle (optional)</label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm((s) => ({ ...s, subtitle: e.target.value }))}
              placeholder="Short supporting line"
            />
          </div>

          <div className="hm-grid-2">
            <div className="hm-field">
              <label>Alt text</label>
              <input
                value={form.alt}
                onChange={(e) => setForm((s) => ({ ...s, alt: e.target.value }))}
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div className="hm-field">
              <label><I><IconAlign /></I> Text Alignment</label>
              <select
                value={form.align}
                onChange={(e) => setForm((s) => ({ ...s, align: e.target.value }))}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <div className="hm-field">
            <label>Overlay Darkness: <strong>{form.overlay}%</strong></label>
            <input
              type="range" min="10" max="80" step="1"
              value={form.overlay}
              onChange={(e) => setForm((s) => ({ ...s, overlay: Number(e.target.value) }))}
            />
          </div>

          <label className="hm-switch">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((s) => ({ ...s, published: e.target.checked }))}
            />
            <span>Publish</span>
          </label>

          <div className="hm-actions">
            <button className="hm-btn hm-btn--primary" type="submit" disabled={saving}>
              <I><IconSave /></I> {saving ? "Saving…" : editingId ? "Update Slide" : "Add Slide"}
            </button>
            <button type="button" className="hm-btn hm-btn--ghost" onClick={resetForm}>
              {editingId ? "Cancel Edit" : "Reset"}
            </button>
          </div>
        </form>

        {/* LIVE PREVIEW */}
        <aside className="hm-card hm-preview">
          <div className="hm-preview-head">
            <h3 className="hm-card__title"><I><IconEye /></I> Live Preview</h3>
            {editingId ? <div className="hm-muted">Editing: <code>{editingId}</code></div> : null}
          </div>

          <div
            className={`hm-hero ${form.align}`}
            style={{
              backgroundImage: currentPreview ? `url('${responsiveUrl(currentPreview, 1280)}')` : undefined,
              "--hm-overlay": `${(Number(form.overlay) || 40) / 100}`
            }}
          >
            <button
              type="button"
              className="hm-hero-arrow left"
              onClick={() => currentIdx > 0 && loadSlideIntoForm(currentIdx - 1)}
              disabled={slides.length === 0}
              title="Previous slide"
            >
              <IconChevronLeft />
            </button>

            {/* offscreen img to force-load preview & fallback to original if needed */}
            {currentPreview ? (
              <img
                alt=""
                aria-hidden="true"
                className="hm-preloader"
                loading="lazy"
                decoding="async"
                src={responsiveUrl(currentPreview, 1280)}
                srcSet={buildSrcSet(currentPreview)}
                sizes="(max-width: 1024px) 100vw, 1280px"
                onError={(e) => {
                  const orig = absolutizeUploadUrl(currentPreview).split("?")[0];
                  if (orig && e.currentTarget.src !== orig) {
                    e.currentTarget.src = orig;
                    e.currentTarget.srcset = "";
                  }
                }}
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
              />
            ) : null}

            <div className="hm-hero__tint" />
            <div className="hm-hero__text">
              <span className="hm-badge">Homepage</span>
              <h1 className="hm-hero__title">{form.title || selectedSlide?.title || "Headline goes here"}</h1>
              {form.subtitle || selectedSlide?.subtitle ? (
                <p className="hm-hero__sub">{form.subtitle || selectedSlide?.subtitle}</p>
              ) : (
                <p className="hm-hero__sub hm-ghost">Subtitle shows here</p>
              )}
              <div className="hm-hero__cta">
                <span className="hm-btn-pill">Donate</span>
                <span className="hm-btn-pill ghost">Volunteer</span>
              </div>
            </div>

            <button
              type="button"
              className="hm-hero-arrow right"
              onClick={() => currentIdx < slides.length - 1 && loadSlideIntoForm(currentIdx + 1)}
              disabled={slides.length === 0}
              title="Next slide"
            >
              <IconChevronRight />
            </button>
          </div>

          <div className="hm-preview-foot">
            {selectedSlide ? (
              <>
                <button
                  type="button"
                  className="hm-btn"
                  onClick={() => loadSlideIntoForm(currentIdx)}
                  title="Load this slide into the form for editing"
                >
                  <I><IconEdit /></I> Edit This Slide
                </button>
                {!editingId && slides.length > 1 ? (
                  <span className="hm-muted">Tip: use ◀ ▶ to load different slides</span>
                ) : null}
              </>
            ) : (
              <span className="hm-muted">No slides to preview yet.</span>
            )}
          </div>
        </aside>
      </section>

      {/* SLIDES LIST */}
      <section className="hm-card hm-list">
        <div className="hm-list__head">
          <h3 className="hm-card__title"><I><IconImage /></I> Slides</h3>
          <div className="hm-muted">Use ↑ / ↓ to reorder</div>
        </div>

        {loading ? (
          <div className="hm-empty">Loading slides…</div>
        ) : slides.length === 0 ? (
          <div className="hm-empty">No slides yet. Add your first background above.</div>
        ) : (
          <ul className="hm-slides">
            {slides.map((s, idx) => {
              const id = s._id || s.id;
              const thumbSrc = responsiveUrl(s.src, 480);
              const thumbSet = buildSrcSet(s.src);
              const sizes = "(max-width: 900px) 50vw, 480px";
              return (
                <li key={id} className={`hm-slide ${idx === currentIdx ? "is-current" : ""}`}>
                  <button
                    className="hm-thumb"
                    onClick={() => loadSlideIntoForm(idx)}
                    title="Click to load this slide into the form"
                    aria-label={`Edit ${s.title || "slide"}`}
                  >
                    {/* Use real <img> so we get decoding/lazy/srcset + error fallback */}
                    {s.src ? (
                      <picture>
                        <source srcSet={thumbSet} sizes={sizes} type="image/webp" />
                        <img
                          alt={s.alt || s.title || "Slide"}
                          loading="lazy"
                          decoding="async"
                          src={thumbSrc}
                          srcSet={thumbSet}
                          sizes={sizes}
                          onError={(e) => {
                            const orig = absolutizeUploadUrl(s.src).split("?")[0];
                            if (orig && e.currentTarget.src !== orig) {
                              e.currentTarget.src = orig;
                              e.currentTarget.srcset = "";
                              return;
                            }
                            e.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      </picture>
                    ) : null}
                  </button>

                  <div className="hm-slide__meta">
                    <div className="hm-slide__title">{s.title || <span className="hm-muted">(untitled)</span>}</div>
                    <div className="hm-slide__row">
                      <span className={`hm-status ${s.published ? "on" : ""}`}>
                        {s.published ? "Published" : "Draft"}
                      </span>
                      <span className="hm-muted">
                        Added {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="hm-rowactions">
                    <button className="hm-iconbtn" disabled={movingId===id || idx===0} onClick={() => moveUp(id)} title="Move up"><IconUp /></button>
                    <button className="hm-iconbtn" disabled={movingId===id || idx===slides.length-1} onClick={() => moveDown(id)} title="Move down"><IconDown /></button>
                    <button className={`hm-iconbtn ${s.published ? "on" : ""}`} onClick={() => togglePub(id)} title="Toggle publish"><IconEye /></button>
                    <button className="hm-iconbtn" onClick={() => loadSlideIntoForm(idx)} title="Edit"><IconEdit /></button>
                    <button className="hm-iconbtn danger" onClick={() => removeSlide(id)} title="Delete"><IconTrash /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ================= EVENTS MANAGER ================= */}
      <div className="he-header">
        <div className="he-titlewrap">
          <h3 className="he-title"><I><IconEvent /></I> Events Manager</h3>
          <p className="he-sub">Post recent events shown on the homepage "Recent Events" section.</p>
        </div>
        <div className="he-kpis">
          <div className="hm-kpi">
            <I><IconEvent /></I>
            <div className="hm-kpi__meta">
              <div className="hm-kpi__label">Total Events</div>
              <div className="hm-kpi__value">{events.length}</div>
            </div>
          </div>
          <div className="hm-kpi">
            <I><IconEye /></I>
            <div className="hm-kpi__meta">
              <div className="hm-kpi__label">Published</div>
              <div className="hm-kpi__value">{events.filter(e => e.published).length}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="he-grid">
        {/* EVENTS FORM */}
        <form className="hm-card he-form" onSubmit={evEditingId ? updateEvent : addEvent}>
          <div className="he-form-head">
            <h4 className="hm-card__title"><I><IconEvent /></I> {evEditingId ? "Edit Event" : "New Event"}</h4>
            {evEditingId ? (
              <button type="button" className="hm-btn hm-btn--ghost" onClick={evReset}>+ New</button>
            ) : null}
          </div>

          <div className="hm-field">
            <label>Event Image</label>
            <div className="hm-file-row">
              <input ref={evFileRef} type="file" accept="image/*" onChange={evFileChange} hidden />
              <button type="button" className="hm-btn" onClick={evPick}>
                <I><IconImage /></I> {evEditingId ? "Replace Image" : "Choose Image"}
              </button>
              <span className="hm-filehint">{evForm.preview ? "Preview ready" : "JPG/PNG/WEBP, landscape recommended"}</span>
            </div>
          </div>

          <div className="hm-field">
            <label>Title</label>
            <input
              value={evForm.title}
              onChange={(e) => setEvForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="e.g., New Borehole Commissioned in Balcad"
            />
          </div>

          <div className="hm-grid-2">
            <div className="hm-field">
              <label><IconTag /> Category</label>
              <input
                value={evForm.category}
                onChange={(e) => setEvForm((s) => ({ ...s, category: e.target.value }))}
                placeholder="Water / Health / Education..."
              />
            </div>
            <div className="hm-field">
              <label><IconCalendar /> Date</label>
              <input
                type="date"
                value={evForm.date}
                onChange={(e) => setEvForm((s) => ({ ...s, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="hm-field">
            <label>Location</label>
            <input
              value={evForm.location}
              onChange={(e) => setEvForm((s) => ({ ...s, location: e.target.value }))}
              placeholder="City / District"
            />
          </div>

          <div className="hm-field">
            <label>Description</label>
            <textarea
              rows="3"
              value={evForm.description}
              onChange={(e) => setEvForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="Short summary that will appear on homepage…"
              maxLength={300}
            />
            <small className="he-count">{evForm.description.length}/300</small>
          </div>

          <label className="hm-switch">
            <input
              type="checkbox"
              checked={evForm.published}
              onChange={(e) => setEvForm((s) => ({ ...s, published: e.target.checked }))}
            />
            <span>Publish</span>
          </label>

          <div className="hm-actions">
            <button className="hm-btn hm-btn--primary" type="submit" disabled={evSaving}>
              <I><IconSave /></I> {evSaving ? "Saving…" : evEditingId ? "Update Event" : "Add Event"}
            </button>
            <button type="button" className="hm-btn hm-btn--ghost" onClick={evReset}>
              {evEditingId ? "Cancel Edit" : "Reset"}
            </button>
          </div>
        </form>

        {/* EVENTS PREVIEW CARD */}
        <aside className="hm-card he-preview">
          <div className="he-preview-head">
            <h4 className="hm-card__title"><I><IconEye /></I> Card Preview</h4>
          </div>

          <article className="he-card">
            <div className="he-cover" aria-hidden="true">
              {evForm.preview ? (
                <picture>
                  <source srcSet={buildSrcSet(evForm.preview)} type="image/webp" />
                  <img
                    className="he-cover-img"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    src={responsiveUrl(evForm.preview, 800)}
                    srcSet={buildSrcSet(evForm.preview)}
                    sizes="(max-width:1100px) 50vw, 33vw"
                    onError={(e) => {
                      const orig = absolutizeUploadUrl(evForm.preview).split("?")[0];
                      if (orig && e.currentTarget.src !== orig) {
                        e.currentTarget.src = orig;
                        e.currentTarget.srcset = "";
                        return;
                      }
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                </picture>
              ) : null}
            </div>

            <div className="he-meta">
              <div className="he-top">
                <span className="he-badge">{evForm.category || "Event"}</span>
                <span className="he-date">{evForm.date ? fmtDate(evForm.date) : "—"}</span>
              </div>
              <h3 className="he-title">{evForm.title || "Event title goes here"}</h3>
              <p className="he-desc">{brief(stripTags(evForm.description || ""), 140) || "Short description preview…"}</p>
              {evForm.location ? <small className="he-loc">📍 {evForm.location}</small> : null}
            </div>
          </article>
        </aside>
      </section>

      {/* EVENTS LIST */}
      <section className="hm-card he-list">
        <div className="he-list-head">
          <h4 className="hm-card__title"><I><IconEvent /></I> Events</h4>
          <div className="hm-muted">Latest first</div>
        </div>

        {evLoading ? (
          <div className="hm-empty">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="hm-empty">No events yet. Add your first event above.</div>
        ) : (
          <ul className="he-items">
            {events.map((e) => {
              const id = e._id || e.id;
              const cover = pickEventCover(e) || "";
              const coverSmall = cover ? responsiveUrl(cover, 600) : "";
              const coverSet = cover ? buildSrcSet(cover) : "";
              const sizes = "(max-width:1100px) 50vw, 33vw";

              return (
                <li key={id} className="he-item">
                  <div className="he-thumb">
                    {cover ? (
                      <picture>
                        <source srcSet={coverSet} sizes={sizes} type="image/webp" />
                        <img
                          className="he-thumb-img"
                          alt={e.title || "Event"}
                          loading="lazy"
                          decoding="async"
                          src={coverSmall}
                          srcSet={coverSet}
                          sizes={sizes}
                          onError={(ev) => {
                            const orig = absolutizeUploadUrl(cover).split("?")[0];
                            if (orig && ev.currentTarget.src !== orig) {
                              ev.currentTarget.src = orig;
                              ev.currentTarget.srcset = "";
                              return;
                            }
                            ev.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      </picture>
                    ) : null}
                  </div>

                  <div className="he-info">
                    <div className="he-line">
                      <strong className="he-name">{e.title || "(untitled)"}</strong>
                      <span className={`hm-status ${e.published ? "on" : ""}`}>{e.published ? "Published" : "Draft"}</span>
                    </div>
                    <div className="he-line he-mutedline">
                      <span className="he-cat">{e.category?.name || e.category || "—"}</span>
                      <span>•</span>
                      <span>{e.location || "—"}</span>
                      <span>•</span>
                      <span>{fmtDate(e.date || e.createdAt) || "—"}</span>
                    </div>
                  </div>
                  <div className="hm-rowactions">
                    <button className={`hm-iconbtn ${e.published ? "on" : ""}`} title="Toggle publish" onClick={() => toggleEventPub(id)}><IconEye /></button>
                    <button className="hm-iconbtn" title="Edit" onClick={() => loadEventIntoForm(id)}><IconEdit /></button>
                    <button className="hm-iconbtn danger" title="Delete" onClick={() => deleteEvent(id)}><IconTrash /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {error && <div className="hm-alert">{error}</div>}
    </div>
  );
}
