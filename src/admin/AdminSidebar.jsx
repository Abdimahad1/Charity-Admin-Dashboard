import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Icon = ({ children }) => <span className="i">{children}</span>;

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of the admin panel",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear all session data
        sessionStorage.clear();
        // Redirect to admin login page
        navigate('/admin/login', { replace: true });
      }
    });
  };

  return (
    <nav className="a-nav" aria-label="Admin">
      <NavLink to="/admin" end className="a-link">
        <Icon>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z"/></svg>
        </Icon>
        <span>Dashboard</span>
      </NavLink>

      <div className="a-section">Charities</div>
      <NavLink to="/admin/charities" className="a-link">
        <Icon>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-4.5-8-10a5 5 0 019-3 5 5 0 019 3c0 5.5-8 10-8 10z"/></svg>
        </Icon>
        <span>All Charities</span>
      </NavLink>

      <NavLink to="/admin/donations" className="a-link">
        <Icon>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zm1 5v2h2a2 2 0 110 4h-2v2h-2v-2H9v-2h2V8h2z"/></svg>
        </Icon>
        <span>Donations</span>
      </NavLink>
      <NavLink to="/admin/reports" className="a-link">
        <Icon>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16v-2H4v2zM6 16h3V8H6v8zm5 0h3V4h-3v12zm5 0h3v-6h-3v6z"/></svg>
        </Icon>
        <span>Reports</span>
      </NavLink>

      <div className="a-section">Volunteers</div>
      <NavLink to="/admin/volunteers" className="a-link">
        <Icon>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10a3 3 0 110-6 3 3 0 010 6zm8 0a3 3 0 110-6 3 3 0 010 6zM2 20v-1c0-2.5 3.5-4 6-4s6 1.5 6 4v1H2zm10 0v-1c0-1 .5-1.8 1.3-2.5.9-.6 2.2-.9 3.7-.9 2.5 0 6 1.5 6 4v1h-11z"/></svg>
        </Icon>
        <span>Volunteer Management</span>
      </NavLink>

      <div className="a-section">Media & Homepage</div>
      <NavLink to="/admin/homepage" className="a-link">
        <Icon>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 8h-3v10h-6v-6H11v6H5V11H2l10-8z"/></svg>
        </Icon>
        <span>Homepage Manager</span>
      </NavLink>

      <div className="a-section">Settings</div>
      <NavLink to="/admin/settings" className="a-link">
        <Icon>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94a7.48 7.48 0 000-1.88l2.03-1.58-2-3.46-2.39.5a7.52 7.52 0 00-1.62-.94l-.36-2.46h-4l-.36 2.46a7.52 7.52 0 00-1.62.94l-2.39-.5-2 3.46 2.03 1.58a7.48 7.48 0 000 1.88L2.83 14.5l2 3.46 2.39-.5c.5.39 1.05.71 1.62.94l.36 2.46h4l.36-2.46c.57-.23 1.12-.55 1.62-.94l2.39.5 2-3.46-2.03-1.56zM12 15.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z"/></svg>
        </Icon>
        <span>Settings</span>
      </NavLink>

      {/* Logout Button */}
      <button onClick={handleLogout} className="a-link logout-btn">
        <Icon>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16 17v-3h-3v-2h3V9l4 3-4 3zM2 11h8v2H2zm0-4h8v2H2zm0 8h8v2H2z"/>
          </svg>
        </Icon>
        <span>Log Out</span>
      </button>
    </nav>
  );
}