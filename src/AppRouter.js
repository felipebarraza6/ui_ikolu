import { lazy, Suspense, useContext } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppContext } from "./App";
import { AppShell } from "./components/shell/AppShell";
import { RouteFallback } from "./routes/RouteFallback";

const LoginPage = lazy(() => import("./pages/login/LoginPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const TelemetryPage = lazy(() => import("./components/telemetry/TelemetryPage"));
const PreviewModalQR = lazy(() => import("./components/dga/PreviewModalQR"));
const CaptureMapPage = lazy(() => import("./components/map/CaptureMapPage"));
const CompliancePage = lazy(() => import("./components/compliance/CompliancePage"));
const AvisosPage = lazy(() => import("./components/avisos/AvisosPage"));
const ReportsPage = lazy(() => import("./components/reports/ReportsPage"));
const ResponsiveSmartAnalysis = lazy(() => import("./components/smart_data/ResponsiveSmartAnalysis"));
const GraphisNavDga = lazy(() => import("./components/smart_data/GraphisNavDga"));

const DocRes = lazy(() => import("./components/docres/DocRes"));
const ResponsiveAlerts = lazy(() => import("./components/alerts/ResponsiveAlerts"));
const Dash = lazy(() => import("./components/support/Dash"));
const DataTable = lazy(() => import("./components/prototype_umi/DataTable"));
const Well = lazy(() => import("./components/mywell/Well"));
const GraphisNav = lazy(() => import("./components/smart_data/GraphisNav"));
const MyGraphics = lazy(() => import("./components/graphics/MyGraphics"));
const FormMultiData = lazy(() => import("./containers/FormMultiData"));
const Supp = lazy(() => import("./components/home/Supp"));
const Documentation = lazy(() => import("./components/documentation/Documentation"));
const UserDocumentation = lazy(() => import("./components/documentation/UserDocumentation"));
const UserProfile = lazy(() => import("./components/profile/UserProfile"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));

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
      <Route path="/preview-certificate" element={<PreviewModalQR />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/mapa" element={<CaptureMapPage />} />
        <Route path="/telemetry" element={<TelemetryPage />} />
        <Route path="/analysis" element={<ResponsiveSmartAnalysis />} />
        <Route path="/dga" element={<CompliancePage />} />
        <Route path="/avisos" element={<AvisosPage />} />
        <Route path="/dga-analysis" element={<GraphisNavDga />} />
        <Route path="/download" element={<ReportsPage />} />
        <Route path="/documents" element={<DocRes />} />
        <Route path="/alerts" element={<ResponsiveAlerts />} />
        <Route path="/support" element={<Dash />} />
        <Route path="/extraction-data" element={<ReportsPage />} />
        <Route path="/registers-pti" element={<DataTable />} />
        <Route path="/well" element={<Well />} />
        <Route path="/sys-data" element={<GraphisNav />} />
        <Route path="/sys-data-dga" element={<GraphisNavDga />} />
        <Route path="/sys-docs" element={<DocRes />} />
        <Route path="/sys-support" element={<Dash />} />
        <Route path="/sys-alerts" element={<ResponsiveAlerts />} />
        <Route path="/charts" element={<MyGraphics />} />
        <Route path="/form-multi-data" element={<FormMultiData />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/supp" element={<Supp />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/user-documentation" element={<UserDocumentation />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>
);

export default AppRouter;
