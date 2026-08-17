import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import LoginPage from "./features/auth/LoginPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import RoleGuard from "./features/auth/RoleGuard";
import { useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./shared/components/ErrorBoundary";

const AppLayout = lazy(() => import(/* webpackPrefetch: true */ "./features/layout/AppLayout"));
const ControlCenter = lazy(() => import(/* webpackPrefetch: true */ "./features/control-center/ControlCenter"));
const ProfilePage = lazy(() => import(/* webpackPrefetch: true */ "./features/profile/ProfilePage"));
const AdminRouter = lazy(() => import(/* webpackPrefetch: true */ "./features/admin/AdminRouter"));

const PageSpinner = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#030c18",
    }}
  >
    <Spin size="large" style={{ color: "#ffffff" }} />
  </div>
);

const ProtectedLayout = ({ children }) => {
  const { isAuth } = useAuth();
  return isAuth ? (
    <Suspense fallback={<PageSpinner />}>
      <AppLayout>{children}</AppLayout>
    </Suspense>
  ) : (
    <Navigate to="/login" replace />
  );
};

const AdminLayout = ({ children }) => (
  <RoleGuard>
    <Suspense fallback={<PageSpinner />}>
      <AppLayout>{children}</AppLayout>
    </Suspense>
  </RoleGuard>
);

const RouteThemeSync = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const isVoidRoute = pathname.startsWith("/admin") || pathname.startsWith("/control-center");
    document.documentElement.setAttribute("data-void-theme", isVoidRoute ? "true" : "false");
    document.documentElement.setAttribute("data-ikolu-theme", isVoidRoute ? "void" : "ocean");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};

const AppRouter = () => {
  const { isAuth } = useAuth();

  return (
    <Suspense fallback={<PageSpinner />}>
      <RouteThemeSync />
      <Routes>
        <Route
          path="/login"
          element={isAuth ? <Navigate to="/control-center/telemetry" replace /> : <LoginPage />}
        />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/control-center/:tab?"
          element={
            <ErrorBoundary>
              <ProtectedLayout>
                <ControlCenter />
              </ProtectedLayout>
            </ErrorBoundary>
          }
        />

        <Route
          path="/profile"
          element={
            <ErrorBoundary>
              <ProtectedLayout>
                <ProfilePage />
              </ProtectedLayout>
            </ErrorBoundary>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ErrorBoundary>
              <AdminLayout>
                <AdminRouter />
              </AdminLayout>
            </ErrorBoundary>
          }
        />

        <Route
          path="/*"
          element={<Navigate to={isAuth ? "/control-center/telemetry" : "/login"} replace />}
        />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;