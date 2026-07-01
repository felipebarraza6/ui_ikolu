import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import SupportDashboard from "./pages/SupportDashboard";
import SupportIndicatorsPage from "./pages/SupportIndicatorsPage";
import OperationalDashboard from "./pages/OperationalDashboard";
import ClientsPage from "./pages/ClientsPage";
import ProjectsPage from "./pages/ProjectsPage";
import PointsPage from "./pages/PointsPage";
import AlertsDashboard from "./pages/AlertsDashboard";
import AlertRulesPage from "./pages/AlertRulesPage";
import AlertChannelsPage from "./pages/AlertChannelsPage";
import AlertTriggersPage from "./pages/AlertTriggersPage";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import UsersPage from "./pages/UsersPage";
import SchemesAndVariablesPage from "./pages/SchemesAndVariablesPage";
import ProvidersPage from "./pages/ProvidersPage";

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/performance" replace />} />
      <Route path="/performance" element={<PerformanceDashboard />} />
      <Route path="/operational" element={<OperationalDashboard />} />
      <Route path="/support" element={<Navigate to="/admin/support/kanban" replace />} />
      <Route path="/support/kanban" element={<SupportDashboard />} />
      <Route path="/support/indicators" element={<SupportIndicatorsPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/points" element={<PointsPage />} />
      <Route path="/schemes" element={<SchemesAndVariablesPage />} />
      <Route path="/variables" element={<SchemesAndVariablesPage />} />
      <Route path="/providers" element={<ProvidersPage />} />
      <Route path="/alerts" element={<AlertsDashboard />} />
      <Route path="/alerts/rules" element={<AlertRulesPage />} />
      <Route path="/alerts/channels" element={<AlertChannelsPage />} />
      <Route path="/alerts/triggers" element={<AlertTriggersPage />} />
      <Route path="/compliance" element={<ComplianceDashboard />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/*" element={<Navigate to="/admin/performance" replace />} />
    </Routes>
  );
};

export default AdminRouter;
