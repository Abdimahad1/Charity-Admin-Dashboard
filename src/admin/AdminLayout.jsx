import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../styles/Admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="dot" aria-hidden="true" />
          <strong>Charity Admin</strong>
        </div>
        <AdminSidebar />
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-page-title">Dashboard</h1>
        </header>

        <section className="admin-content">
          {/* Child routes render here */}
          <Outlet />
        </section>
      </main>
    </div>
  );
}
