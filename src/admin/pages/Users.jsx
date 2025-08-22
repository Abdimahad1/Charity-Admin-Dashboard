import React, { useState, useEffect } from "react";
import "../../styles/Users.css";
import Swal from "sweetalert2";
import axios from "axios";

/* ---------- API Configuration ---------- */
const LOCAL_BASE =
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const DEPLOY_BASE =
  (import.meta.env.VITE_API_DEPLOY_URL || "https://charity-backend-c05j.onrender.com/api").replace(/\/$/, "");

const isLocalHost = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
const BASE = isLocalHost ? LOCAL_BASE : DEPLOY_BASE;

const API = axios.create({ baseURL: BASE });

API.interceptors.request.use((cfg) => {
  const t = sessionStorage.getItem("token") || localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/* -------- Inline icons -------- */
const I = ({ children }) => <span className="us-ib">{children}</span>;
const IconUser = () => (<svg viewBox="0 0 24 24"><path d="M12 12a5 5 0 10-5-5 5 5 0 005 5zm-7 8a7 7 0 0114 0v2H5v-2z"/></svg>);
const IconAdd = () => (<svg viewBox="0 0 24 24"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>);
const IconEdit = () => (<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>);
const IconTrash = () => (<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2z"/></svg>);
const IconSave = () => (<svg viewBox="0 0 24 24"><path d="M5 3h14l2 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V5l2-2zm2 2v4h10V5H7zm0 14h10v-6H7v6z"/></svg>);
const IconSearch = () => (<svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 106.32 3.16L22 8l-4 4-1.68-5.68A8 8 0 0010 2zm0 4a4 4 0 110 8 4 4 0 010-8z"/></svg>);
const IconLock = () => (<svg viewBox="0 0 24 24"><path d="M12 2a5 5 0 015 5v2h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h1V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v2h6V7a3 3 0 00-3-3zm-6 6v8h12v-8H6zm6 3a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 011-1z"/></svg>);
const IconEye = () => (<svg viewBox="0 0 24 24"><path d="M12 9a3 3 0 100 6 3 3 0 000-6zm0 8a5 5 0 115-5 5 5 0 01-5 5zm0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg>);
const IconEyeOff = () => (<svg viewBox="0 0 24 24"><path d="M11.83 9L15 12.16V12a3 3 0 00-3-3h-.17zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 003 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 01-5-5c0-.79.2-1.53.53-2.2zm2.19-2.2l-1.4-1.4a9.86 9.86 0 00-2.32 2.32l1.42 1.42a7.86 7.86 0 012.3-2.34zM2.81 2.81L1.39 4.22l2.27 2.27A11.94 11.94 0 001 12c2.73 4.39 7 7.5 12 7.5 1.78 0 3.5-.37 5.06-1l2.27 2.27 1.41-1.41L2.81 2.81zM12 19.5c-4.1 0-7.73-2.59-9.5-6.5a11.3 11.3 0 013.2-4.2l1.46 1.46a7.86 7.86 0 00-2.16 2.74c1.33 2.23 3.27 4 6 4 .85 0 1.67-.15 2.44-.44l1.45 1.45c-.97.37-2.01.59-2.89.59zm8.5-7.5c-.6-1.47-1.5-2.8-2.6-3.9l-1.4 1.4c.9.9 1.6 2 2.1 3.2-1.33 2.23-3.27 4-6 4-.63 0-1.24-.07-1.83-.2l-1.46 1.46c.97.37 2.01.59 2.89.59 4.1 0 7.73-2.59 9.5-6.5a11.3 11.3 0 00-3.2-4.2l1.46-1.46A11.94 11.94 0 0121 12z"/></svg>);

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/users");
      // Handle both array response and object with users property
      const usersData = Array.isArray(data) ? data : (data.users || []);
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      const errorMessage = err.response?.data?.message || "Failed to load users. Please try again.";
      setError(errorMessage);
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: 'sweetalert-high-zindex'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open edit form
  const openEditForm = (user = null) => {
    if (user) {
      setEditingUser({ 
        ...user, 
        password: "",
        confirmPassword: "" 
      });
      setIsNewUser(false);
    } else {
      setEditingUser({
        name: "",
        email: "",
        role: "Admin",
        isActive: true,
        password: "",
        confirmPassword: ""
      });
      setIsNewUser(true);
    }
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(""); // Clear any previous errors
  };

  // Close edit form
  const closeEditForm = () => {
    setEditingUser(null);
    setIsNewUser(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Show error alert with high z-index
  const showErrorAlert = (message) => {
    return Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
      customClass: {
        popup: 'sweetalert-high-zindex'
      },
      backdrop: 'rgba(0,0,0,0.7)'
    });
  };

  // Save user
  const saveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validation
    if (!editingUser.name || !editingUser.email || !editingUser.role) {
      setError("Name, email, and role are required.");
      setSaving(false);
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(editingUser.email)) {
      setError("Please enter a valid email address.");
      setSaving(false);
      return;
    }

    if (isNewUser) {
      if (!editingUser.password || editingUser.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setSaving(false);
        return;
      }

      if (editingUser.password !== editingUser.confirmPassword) {
        await showErrorAlert("Passwords do not match. Please make sure both password fields are identical.");
        setSaving(false);
        return;
      }
    } else if (editingUser.password && editingUser.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSaving(false);
      return;
    }

    try {
      if (isNewUser) {
        await API.post("/users", editingUser);
        await Swal.fire({
          title: "Success!",
          text: "User created successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            popup: 'sweetalert-high-zindex'
          }
        });
      } else {
        // Don't send password if it's empty (not changing)
        const updateData = { ...editingUser };
        if (!updateData.password) {
          delete updateData.password;
        }
        delete updateData.confirmPassword; // Always remove confirmPassword
        
        await API.put(`/users/${editingUser._id || editingUser.id}`, updateData);
        await Swal.fire({
          title: "Success!",
          text: "User updated successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            popup: 'sweetalert-high-zindex'
          }
        });
      }
      
      closeEditForm();
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Failed to save user:", err);
      const errorMessage = err.response?.data?.message || "Failed to save user. Please try again.";
      await showErrorAlert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: 'sweetalert-high-zindex'
      }
    });

    if (result.isConfirmed) {
      try {
        setDeletingId(id);
        await API.delete(`/users/${id}`);
        await Swal.fire({
          title: "Deleted!",
          text: "User has been deleted.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            popup: 'sweetalert-high-zindex'
          }
        });
        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete user:", err);
        const errorMessage = err.response?.data?.message || "Failed to delete user.";
        await showErrorAlert(errorMessage);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="us-page">
      {/* Header */}
      <div className="us-header">
        <div>
          <h2 className="us-title">User Management</h2>
          <p className="us-sub">Create and manage admin users for the system.</p>
        </div>
        <button className="us-btn us-btn--primary" onClick={() => openEditForm()}>
          <I><IconAdd /></I> Add New User
        </button>
      </div>

      {/* Search */}
      <div className="us-search">
        <I><IconSearch /></I>
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error message */}
      {error && <div className="us-alert us-alert--error">{error}</div>}

      {/* Users Table */}
      <div className="us-table-container">
        {loading ? (
          <div className="us-loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="us-empty">
            {searchTerm ? "No users match your search." : "No users found."}
          </div>
        ) : (
          <table className="us-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id || user.id}>
                  <td>
                    <div className="us-user">
                      <div className="us-avatar">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="us-user-info">
                        <div className="us-user-name">{user.name || "Unknown"}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email || "No email"}</td>
                  <td>
                    <span className={`us-role us-role--${user.role?.toLowerCase() || "admin"}`}>
                      {user.role || "Admin"}
                    </span>
                  </td>
                  <td>
                    <span className={`us-status us-status--${user.isActive ? "active" : "inactive"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="us-actions">
                      <button 
                        className="us-btn us-btn--icon" 
                        onClick={() => openEditForm(user)}
                        title="Edit user"
                      >
                        <I><IconEdit /></I>
                      </button>
                      <button 
                        className="us-btn us-btn--icon us-btn--danger" 
                        onClick={() => deleteUser(user._id || user.id)}
                        disabled={deletingId === (user._id || user.id)}
                        title="Delete user"
                      >
                        <I>
                          {deletingId === (user._id || user.id) ? (
                            <div className="us-spinner"></div>
                          ) : (
                            <IconTrash />
                          )}
                        </I>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit/Create User Modal */}
      {editingUser && (
        <div className="us-modal-overlay" onClick={closeEditForm}>
          <div className="us-modal" onClick={(e) => e.stopPropagation()}>
            <div className="us-modal-header">
              <h3>{isNewUser ? "Create New User" : "Edit User"}</h3>
              <button className="us-modal-close" onClick={closeEditForm}>
                &times;
              </button>
            </div>

            <form onSubmit={saveUser} className="us-form">
              <div className="us-form-grid">
                <div className="us-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editingUser.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="us-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={editingUser.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="us-field">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={editingUser.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Admin">Admin</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div className="us-field">
                  <label>Status</label>
                  <select
                    name="isActive"
                    value={editingUser.isActive ? "true" : "false"}
                    onChange={(e) => setEditingUser(prev => ({
                      ...prev,
                      isActive: e.target.value === "true"
                    }))}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="us-password-section">
                <h4>
                  <I><IconLock /></I>
                  {isNewUser ? "Set Password" : "Change Password"}
                  {!isNewUser && <small>(Leave blank to keep current password)</small>}
                </h4>

                <div className="us-form-grid">
                  <div className="us-field us-field--password">
                    <label>Password {isNewUser && "*"}</label>
                    <div className="us-password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={editingUser.password}
                        onChange={handleInputChange}
                        placeholder={isNewUser ? "Enter password" : "New password (optional)"}
                        minLength={isNewUser ? 6 : 0}
                      />
                      <button
                        type="button"
                        className="us-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <I>{showPassword ? <IconEyeOff /> : <IconEye />}</I>
                      </button>
                    </div>
                  </div>

                  <div className="us-field us-field--password">
                    <label>Confirm Password {isNewUser && "*"}</label>
                    <div className="us-password-input">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={editingUser.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        minLength={isNewUser ? 6 : 0}
                      />
                      <button
                        type="button"
                        className="us-password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <I>{showConfirmPassword ? <IconEyeOff /> : <IconEye />}</I>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="us-form-actions">
                <button
                  type="button"
                  className="us-btn us-btn--secondary"
                  onClick={closeEditForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="us-btn us-btn--primary"
                  disabled={saving}
                >
                  <I><IconSave /></I>
                  {saving ? "Saving..." : (isNewUser ? "Create User" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add CSS for SweetAlert z-index */}
      <style>
        {`
          .sweetalert-high-zindex {
            z-index: 10000 !important;
          }
        `}
      </style>
    </div>
  );
}