import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  if (!token || role !== "Admin") {
    // send them to login and remember where they wanted to go
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
