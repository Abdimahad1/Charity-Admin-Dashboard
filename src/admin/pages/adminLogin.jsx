// src/admin/pages/AdminLogin.jsx
import React, { useEffect, useState } from 'react';
import '../../styles/adminLogin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserShield,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Make login truly full-screen while mounted
  useEffect(() => {
    document.body.classList.add('no-header-pad');
    return () => document.body.classList.remove('no-header-pad');
  }, []);

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    if (token && role === 'Admin') {
      // Go to admin index (Dashboard) by default
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (loading) return; // prevent double clicks
    if (!form.email || !form.password) {
      toast.error('Email and Password are required.');
      return;
    }

    setLoading(true);
    // clear any previous session
    sessionStorage.clear();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/admin-login`,
        form
      );

      const userRole = res.data?.user?.role;
      if (userRole !== 'Admin') {
        toast.error('Unauthorized role.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('role', userRole);

      toast.success('Admin login successful!');

      // If they were intercepted by ProtectedRoute, send them back there,
      // but only allow admin area paths. Otherwise go to /admin (Dashboard index).
      const from = location.state?.from?.pathname;
      const target =
        from && from.startsWith('/admin') ? from : '/admin';

      setTimeout(() => {
        navigate(target, { replace: true });
      }, 900);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="admin-login-page" onKeyDown={onKeyDown}>
      <div className="admin-login-card">
        <div className="admin-login-header">
          <FontAwesomeIcon icon={faUserShield} className="admin-icon" />
          <h2>Admin Panel Login</h2>
          <p>Authorized personnel only</p>
        </div>

        <div className="admin-login-form">
          <div className="admin-input-box">
            <FontAwesomeIcon icon={faEnvelope} className="icon" />
            <input
              type="email"
              placeholder="Admin email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="admin-input-box">
            <FontAwesomeIcon icon={faLock} className="icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Admin password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button
            className="admin-login-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>

          <p
            className="admin-forgot-link"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </p>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default AdminLogin;
