import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Flex,
  Typography,
  Button,
  Select,
  DatePicker,
  Empty,
} from "antd";
import { PlusOutlined, ReloadOutlined, FilterOutlined } from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useTickets } from "../hooks/useTickets";
import { useAdminStore } from "../stores/adminStore";
import TicketMetrics from "../components/TicketsKanban/TicketMetrics";
import KanbanBoard from "../components/TicketsKanban/KanbanBoard";
import TicketDetailDrawer from "../components/TicketsKanban/TicketDetailDrawer";
import TicketCreateDrawer from "../components/TicketsKanban/TicketCreateDrawer";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const STATUS_FILTER_OPTIONS = [
  { value: "open", label: "Abierto" },
  { value: "in_review", label: "En Revisión" },
  { value: "in_progress", label: "En Progreso" },
  { value: "resolved", label: "Resuelto" },
  { value: "closed", label: "Cerrado" },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
  { value: "critical", label: "Crítica" },
];

/**
 * Dashboard de soporte con métricas, filtros y tablero Kanban de tickets.
 */
const SupportDashboard = () => {
  const token = useIkoluToken();
  const { filters, setFilter, resetFilters } = useAdminStore();

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const {
    tickets,
    stats,
    users,
    clientsWithProjects,
    loading,
    refresh,
    changeStatus,
    assignTicket,
    createTicket,
    getTicketById,
    getComments,
    getAttachments,
    createComment,
    uploadAttachment,
    filterOptions,
  } = useTickets({ autoLoad: false });

  /** Construye query params a partir de los filtros globales del store. */
  const buildQueryParams = useCallback(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.assignedTo) params.assigned_to = filters.assignedTo;
    if (filters.category) params.category = filters.category;
    if (filters.origin) params.origin = filters.origin;
    if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
      params.created_at__gte = filters.dateRange[0].format("YYYY-MM-DD");
      params.created_at__lte = filters.dateRange[1].format("YYYY-MM-DD");
    }
    if (filters.client) params.client = filters.client;
    if (filters.project) params.project = filters.project;
    if (filters.point) params.catchment_point = filters.point;
    return params;
  }, [filters]);

  useEffect(() => {
    refresh(buildQueryParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleRefresh = useCallback(() => {
    refresh(buildQueryParams());
  }, [refresh, buildQueryParams]);

  const handleTicketClick = useCallback((ticket) => {
    setSelectedTicketId(ticket.id);
    setDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    async (ticketId, status) => {
      await changeStatus(ticketId, status);
    },
    [changeStatus]
  );

  const handleCreate = useCallback(
    async (data) => {
      await createTicket(data);
    },
    [createTicket]
  );

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id || u.username,
        label: u.full_name || u.username || u.email,
      })),
    [users]
  );

  const pointOptions = useMemo(() => {
    const points = [];
    for (const client of clientsWithProjects) {
      for (const project of client.projects || []) {
        for (const point of project.points || project.catchment_points || []) {
          points.push({
            value: point.id,
            label: `${point.name || point.title || `Punto ${point.id}`} (${
              project.name || "Proyecto"
            })`,
          });
        }
      }
    }
    return points;
  }, [clientsWithProjects]);

  return (
    <div style={{ padding: 24 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
          Soporte
        </Title>
        <Flex gap={12}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Actualizar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: token.colorAccent,
              borderColor: token.colorAccent,
              color: token.colorPrimary,
            }}
          >
            Nuevo Ticket
          </Button>
        </Flex>
      </Flex>

      <TicketMetrics tickets={tickets} stats={stats} loading={loading} />

      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorder}`,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Flex wrap gap={12} align="center">
          <FilterOutlined style={{ color: token.colorTextSecondary }} />
          <Select
            placeholder="Estado"
            allowClear
            style={{ minWidth: 140 }}
            value={filters.status || undefined}
            onChange={(v) => setFilter("status", v || null)}
            options={STATUS_FILTER_OPTIONS}
          />
          <Select
            placeholder="Prioridad"
            allowClear
            style={{ minWidth: 140 }}
            value={filters.priority || undefined}
            onChange={(v) => setFilter("priority", v || null)}
            options={PRIORITY_FILTER_OPTIONS}
          />
          <Select
            placeholder="Categoría"
            allowClear
            style={{ minWidth: 160 }}
            value={filters.category || undefined}
            onChange={(v) => setFilter("category", v || null)}
            options={filterOptions.categories.map((c) => ({ value: c, label: c }))}
          />
          <Select
            placeholder="Origen"
            allowClear
            style={{ minWidth: 160 }}
            value={filters.origin || undefined}
            onChange={(v) => setFilter("origin", v || null)}
            options={filterOptions.sources.map((s) => ({ value: s, label: s }))}
          />
          <Select
            placeholder="Asignado a"
            allowClear
            style={{ minWidth: 180 }}
            value={filters.assignedTo || undefined}
            onChange={(v) => setFilter("assignedTo", v || null)}
            options={userOptions}
          />
          <RangePicker
            value={filters.dateRange || null}
            onChange={(dates) => setFilter("dateRange", dates)}
            style={{ minWidth: 240 }}
          />
          <Select
            placeholder="Proyecto / Punto"
            allowClear
            showSearch
            style={{ minWidth: 240 }}
            value={filters.point || undefined}
            onChange={(v) => setFilter("point", v || null)}
            options={pointOptions}
          />
          <Button onClick={resetFilters}>Limpiar</Button>
        </Flex>
      </div>

      {tickets.length === 0 && !loading ? (
        <Empty description="No hay tickets para los filtros seleccionados" />
      ) : (
        <KanbanBoard
          tickets={tickets}
          onTicketClick={handleTicketClick}
          onStatusChange={handleStatusChange}
          loading={loading}
        />
      )}

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        users={users}
        onChangeStatus={changeStatus}
        onAssign={assignTicket}
        onCreateComment={createComment}
        onUploadAttachment={uploadAttachment}
        getTicketById={getTicketById}
        getComments={getComments}
        getAttachments={getAttachments}
      />

      <TicketCreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        clientsWithProjects={clientsWithProjects}
        loading={loading}
      />
    </div>
  );
};

export default SupportDashboard;
