import React, { Suspense, lazy, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import LoginPage from "./features/auth/LoginPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import RoleGuard from "./features/auth/RoleGuard";
import { useAuth } from "./contexts/AuthContext";
import { useAppTheme } from "./contexts/ThemeContext";

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

const THEME_KEY = "ikolu-theme";

const RouteThemeSync = () => {
  const { pathname } = useLocation();
  const { isDark, setIsDark } = useAppTheme();
  const previousUserTheme = useRef(isDark);

  useEffect(() => {
    const isVoidRoute = pathname.startsWith("/admin") || pathname.startsWith("/control-center");
    document.documentElement.setAttribute("data-void-theme", isVoidRoute ? "true" : "false");
    document.documentElement.setAttribute("data-ikolu-theme", isVoidRoute ? "void" : "ocean");
    if (isVoidRoute) {
      previousUserTheme.current = isDark;
      if (!isDark) setIsDark(true);
    } else {
      // Restaurar preferencia del usuario fuera de rutas admin/staff
      const stored = localStorage.getItem(THEME_KEY);
      const storedDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark !== storedDark) setIsDark(storedDark);
    }
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
    </Suspense>
  );
};

export default AppRouter;