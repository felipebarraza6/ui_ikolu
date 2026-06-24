import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ControlCenter from "./features/control-center/ControlCenter";
import LoginPage from "./features/auth/LoginPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import ProfilePage from "./features/profile/ProfilePage";
import AppLayout from "./features/layout/AppLayout";
import RoleGuard from "./features/auth/RoleGuard";
import AdminRouter from "./features/admin/AdminRouter";
import { useAuth } from "./contexts/AuthContext";

const ProtectedLayout = ({ children }) => {
  const { isAuth } = useAuth();
  return isAuth ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

const AdminLayout = ({ children }) => (
  <RoleGuard>
    <AppLayout>{children}</AppLayout>
  </RoleGuard>
);

const AppRouter = () => {
  const { isAuth } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuth ? <Navigate to="/control-center/telemetry" replace /> : <LoginPage />}
      />

      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route
        path="/control-center/:tab?"
        element={
          <ProtectedLayout>
            <ControlCenter />
          </ProtectedLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedLayout>
            <ProfilePage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin/*"
        element={
          <AdminLayout>
            <AdminRouter />
          </AdminLayout>
        }
      />

      <Route
        path="/*"
        element={<Navigate to={isAuth ? "/control-center/telemetry" : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRouter;