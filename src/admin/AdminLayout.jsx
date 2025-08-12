import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../styles/Admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      {/* Sidebar: render as a direct grid child (no extra <aside>) */}
      <AdminSidebar />

      {/* Main area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-page-title">Dashboard</h1>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
