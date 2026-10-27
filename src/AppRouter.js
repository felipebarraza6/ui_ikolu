import { lazy, Suspense, useContext } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppContext } from "./App";
import { AppShell } from "./components/shell/AppShell";
import { RouteFallback } from "./routes/RouteFallback";

const LoginPage = lazy(() => import("./pages/login/LoginPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const TelemetryPage = lazy(() => import("./components/telemetry/TelemetryPage"));
const PreviewCertificatePage = lazy(() => import("./pages/preview/PreviewCertificatePage"));
const CaptureMapPage = lazy(() => import("./components/map/CaptureMapPage"));
const CompliancePage = lazy(() => import("./components/compliance/CompliancePage"));
const AvisosPage = lazy(() => import("./components/avisos/AvisosPage"));
const ReportsPage = lazy(() => import("./components/reports/ReportsPage"));
const AnalysisPage = lazy(() => import("./pages/analysis/AnalysisPage"));
const ServiceStatusPage = lazy(() => import("./pages/service/ServiceStatusPage"));
const DocumentsPage = lazy(() => import("./pages/documents/DocumentsPage"));
const AlertsPage = lazy(() => import("./pages/alerts/AlertsPage"));
const SupportPage = lazy(() => import("./pages/support/SupportPage"));
const RegistersPtiPage = lazy(() => import("./pages/registers/RegistersPtiPage"));
const HelpPage = lazy(() => import("./pages/help/HelpPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));

function RequireAuth() {
  const { state } = useContext(AppContext);
  const isAuth = state && state.isAuth && state.user && state.user.username;
  if (!isAuth) return <Navigate to="/login" replace />;
  return <Outlet />;
}

const AppRouter = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/preview-certificate" element={<PreviewCertificatePage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/mapa" element={<CaptureMapPage />} />
          <Route path="/telemetry" element={<TelemetryPage />} />
          <Route path="/well" element={<Navigate to="/telemetry" replace />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/dga" element={<CompliancePage />} />
          <Route path="/avisos" element={<AvisosPage />} />
          <Route path="/dga-analysis" element={<AnalysisPage />} />
          <Route path="/download" element={<ReportsPage />} />
          <Route path="/servicio" element={<ServiceStatusPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/extraction-data" element={<ReportsPage />} />
          <Route path="/registers-pti" element={<RegistersPtiPage />} />
          <Route path="/sys-data" element={<AnalysisPage />} />
          <Route path="/sys-data-dga" element={<AnalysisPage />} />
          <Route path="/sys-docs" element={<DocumentsPage />} />
          <Route path="/sys-support" element={<SupportPage />} />
          <Route path="/sys-alerts" element={<AlertsPage />} />
          <Route path="/charts" element={<AnalysisPage />} />
          <Route path="/form-multi-data" element={<AnalysisPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/supp" element={<SupportPage />} />
          <Route path="/documentation" element={<HelpPage />} />
          <Route path="/user-documentation" element={<HelpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>
);

export default AppRouter;
