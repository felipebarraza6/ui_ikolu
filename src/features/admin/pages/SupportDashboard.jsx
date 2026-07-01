import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Flex,
  Typography,
  Button,
  Select,
  DatePicker,
  Empty,
  Drawer,
  List,
  Tag,
  message,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useTickets } from "../hooks/useTickets";
import { useAdminStore } from "../stores/adminStore";
import KanbanBoard from "../components/TicketsKanban/KanbanBoard";
import TicketDetailDrawer from "../components/TicketsKanban/TicketDetailDrawer";
import TicketCreateDrawer from "../components/TicketsKanban/TicketCreateDrawer";
import {
  STATUS_FILTER_OPTIONS,
  PRIORITY_FILTER_OPTIONS,
  CATEGORY_OPTIONS,
  SOURCE_FILTER_OPTIONS,
  getTicketStatusLabel,
  getTicketPriorityConfig,
  isAutomaticTicket,
} from "../constants/tickets";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * Dashboard de soporte con métricas, filtros y tablero Kanban de tickets.
 */
const SupportDashboard = () => {
  const token = useIkoluToken();
  const { filters, setFilter, resetFilters } = useAdminStore();

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [warningsOpen, setWarningsOpen] = useState(false);

  const {
    tickets,
    ticketCount,
    stats,
    users,
    clientsWithProjects,
    points,
    loading,
    refresh,
    changeStatus,
    assignTicket,
    updateTicket,
    deleteTicket,
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
    if (filters.source) params.source = filters.source;
    if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
      params.created_from = filters.dateRange[0].format("YYYY-MM-DD");
      params.created_to = filters.dateRange[1].format("YYYY-MM-DD");
    }
    if (filters.project) {
      const pointIds = pointsByProject[filters.project] || [];
      if (pointIds.length > 0) {
        params.point_catchment = pointIds;
      }
    }
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

  const kanbanTickets = useMemo(
    () => tickets.filter((t) => !isAutomaticTicket(t.source)),
    [tickets]
  );

  const warningTickets = useMemo(
    () => tickets.filter((t) => isAutomaticTicket(t.source)),
    [tickets]
  );

  const handleConvertWarning = useCallback(
    async (ticket) => {
      try {
        await updateTicket(ticket.id, { source: "APP_ADMIN" });
        message.success("Advertencia convertida en ticket");
      } catch (err) {
        message.error(err.message || "Error al convertir");
      }
    },
    [updateTicket]
  );

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id || u.username,
        label: u.full_name || u.username || u.email,
      })),
    [users]
  );

  const projectOptions = useMemo(() => {
    const options = [];
    for (const client of clientsWithProjects) {
      for (const project of client.projects || []) {
        options.push({
          value: project.id,
          label: `${project.name || `Proyecto ${project.id}`} (${
            client.name || `Cliente ${client.id}`
          })`,
        });
      }
    }
    return options;
  }, [clientsWithProjects]);

  const pointsByProject = useMemo(() => {
    const map = {};
    for (const point of points) {
      if (!map[point.project]) map[point.project] = [];
      map[point.project].push(point.id);
    }
    return map;
  }, [points]);

  return (
    <div style={{ padding: 24 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Operaciones Soporte
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {loading ? "Cargando..." : `${kanbanTickets.length} de ${ticketCount} tickets`}
          </Text>
        </Flex>
        <Flex gap={12}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Actualizar
          </Button>
          <Button
            icon={<WarningOutlined />}
            onClick={() => setWarningsOpen(true)}
            style={{
              background: token.colorFillTertiary,
              borderColor: token.colorBorder,
              color: token.colorTextHeading,
            }}
          >
            Advertencias
            {warningTickets.length > 0 && (
              <span style={{ marginLeft: 6, color: token.colorError }}>
                ({warningTickets.length})
              </span>
            )}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: token.colorAccent,
              borderColor: token.colorAccent,
              color: "#fff",
            }}
          >
            Nuevo Ticket
          </Button>
        </Flex>
      </Flex>

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
            options={CATEGORY_OPTIONS}
          />
          <Select
            placeholder="Canal"
            allowClear
            style={{ minWidth: 160 }}
            value={filters.source || undefined}
            onChange={(v) => setFilter("source", v || null)}
            options={SOURCE_FILTER_OPTIONS}
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
            placeholder="Proyecto"
            allowClear
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              String(option?.label || "").toLowerCase().includes(input.toLowerCase())
            }
            style={{ minWidth: 240 }}
            value={filters.project || undefined}
            onChange={(v) => setFilter("project", v || null)}
            options={projectOptions}
          />
          <Button onClick={resetFilters}>Limpiar</Button>
        </Flex>
      </div>

      {kanbanTickets.length === 0 && !loading ? (
        <Empty description="No hay tickets para los filtros seleccionados" />
      ) : (
        <KanbanBoard
          tickets={kanbanTickets}
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
        onUpdateTicket={updateTicket}
        onDelete={deleteTicket}
        onCreateComment={createComment}
        onUploadAttachment={uploadAttachment}
        getTicketById={getTicketById}
        getComments={getComments}
        getAttachments={getAttachments}
      />

      <Drawer
        title="Advertencias del sistema"
        open={warningsOpen}
        onClose={() => setWarningsOpen(false)}
        width={480}
      >
        {warningTickets.length === 0 ? (
          <Empty description="No hay advertencias pendientes" />
        ) : (
          <List
            dataSource={warningTickets}
            renderItem={(ticket) => {
              const priority = getTicketPriorityConfig(ticket.priority);
              return (
                <List.Item
                  actions={[
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleConvertWarning(ticket)}
                    >
                      Convertir a ticket
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Flex align="center" gap={8}>
                        <Text strong>{ticket.title || `Ticket #${ticket.id}`}</Text>
                        <Tag color={priority.color}>{priority.label}</Tag>
                      </Flex>
                    }
                    description={
                      <Flex vertical gap={4}>
                        <Text type="secondary">
                          {getTicketStatusLabel(ticket.status)} ·{" "}
                          {ticket.point_title || `Punto ${ticket.point_catchment}`} ·{" "}
                          {ticket.client_name || "Cliente"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Fuente: {ticket.source}
                        </Text>
                      </Flex>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Drawer>

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
