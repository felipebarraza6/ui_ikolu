import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const RoleGuard = ({ children }) => {
  const { isAuth, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!isAuth) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/control-center/telemetry" replace />;

  return children;
};

export default RoleGuard;
