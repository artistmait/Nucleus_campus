// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Not logged in
  if (!token || !user?.role_id) {
    return <Navigate to="/auth/login" replace />;
  }

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role_id)) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, allow access
  return <Outlet />;
};

export default ProtectedRoute;
