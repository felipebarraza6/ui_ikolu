import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import SupportDashboard from "./pages/SupportDashboard";
import SupportIndicatorsPage from "./pages/SupportIndicatorsPage";
import MyDeskPage from "./pages/MyDeskPage";
import TicketCategoriesPage from "./pages/TicketCategoriesPage";
import SlaConfigsPage from "./pages/SlaConfigsPage";
import FilesDrivePage from "./pages/FilesDrivePage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import PointsPage from "./pages/PointsPage";
import PointDetailPage from "./pages/PointDetailPage";
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
      <Route path="/support" element={<Navigate to="/admin/support/my-desk" replace />} />
      <Route path="/support/kanban" element={<Navigate to="/admin/support/tickets" replace />} />
      <Route path="/support/tickets" element={<SupportDashboard />} />
      <Route path="/support/indicators" element={<SupportIndicatorsPage />} />
      <Route path="/support/my-desk/:ticketId" element={<MyDeskPage />} />
      <Route path="/support/my-desk" element={<MyDeskPage />} />
      <Route path="/support/categories" element={<TicketCategoriesPage />} />
      <Route path="/support/sla-configs" element={<SlaConfigsPage />} />
      <Route path="/support/files" element={<FilesDrivePage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/clients/:clientId" element={<ClientDetailPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
      <Route path="/points" element={<PointsPage />} />
      <Route path="/points/:pointId/*" element={<PointDetailPage />} />
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
