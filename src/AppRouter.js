import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ControlCenter from "./features/control-center/ControlCenter";
import LoginPage from "./features/auth/LoginPage";
import ProfilePage from "./features/profile/ProfilePage";
import AppLayout from "./features/layout/AppLayout";
import { useAuth } from "./contexts/AuthContext";

const ProtectedLayout = ({ children }) => {
  const { isAuth } = useAuth();
  return isAuth ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

const AppRouter = () => {
  const { isAuth } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuth ? <Navigate to="/control-center/telemetry" replace /> : <LoginPage />}
      />

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
        path="/*"
        element={<Navigate to={isAuth ? "/control-center/telemetry" : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRouter;