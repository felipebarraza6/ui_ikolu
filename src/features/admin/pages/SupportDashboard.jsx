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
  Badge,
  Skeleton,
  message,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  WarningOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  TagsOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  UserOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTickets } from "../hooks/useTickets";
import { useTicketCatalogs } from "../hooks/useTicketCatalogs";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useAdminStore } from "../stores/adminStore";
import KanbanBoard from "../components/TicketsKanban/KanbanBoard";
import TicketDetailDrawer from "../components/TicketsKanban/TicketDetailDrawer";
import TicketCreateDrawer from "../components/TicketsKanban/TicketCreateDrawer";
import { SmartButton } from "../../../shared/ui";
import {
  PRIORITY_FILTER_OPTIONS,
  SOURCE_FILTER_OPTIONS,
  getTicketStatusLabel,
  getTicketPriorityConfig,
} from "../constants/tickets";

const { Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * Dashboard de soporte con métricas, filtros y tablero Kanban de tickets.
 */
const SupportDashboard = () => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const { isStaff, isSuperUser } = useAdminAuth();
  const { filters, setFilter, resetFilters } = useAdminStore();

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [warningsOpen, setWarningsOpen] = useState(false);

  const {
    tickets,
    warningTickets,
    loading: ticketsLoading,
    fetchTickets,
    fetchWarnings,
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
    confirmScheduledDate,
    cancelScheduledDate,
  } = useTickets({ autoLoad: false });

  const {
    users,
    clientsWithProjects,
    points,
    categories,
    loading: catalogsLoading,
    fetchUsers,
    fetchClientsWithProjects,
    fetchPoints,
    fetchCategories,
  } = useTicketCatalogs({ autoLoad: false });

  /** Construye query params a partir de los filtros globales del store. */
  const buildQueryParams = useCallback(() => {
    const params = {};
    if (isSuperUser) {
      params.origin = filters.origin ?? "CLIENTE";
    } else if (isStaff) {
      params.origin = "CLIENTE";
    }
    if (filters.priority) params.priority = filters.priority;
    if (filters.assignedTo) params.assigned_to = filters.assignedTo;
    if (filters.source) params.source = filters.source;
    if (filters.category) params.category = filters.category;
    if (filters.project) params.project_id = filters.project;
    if (filters.point) params.point_id = filters.point;
    if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
      params.created_from = filters.dateRange[0].format("YYYY-MM-DD");
      params.created_to = filters.dateRange[1].format("YYYY-MM-DD");
    }
    return params;
  }, [filters, isStaff, isSuperUser]);

  const loading = ticketsLoading || catalogsLoading;

  // Cargar catálogos una sola vez al montar; no dependen de filtros.
  useEffect(() => {
    Promise.all([
      fetchUsers(),
      fetchClientsWithProjects(),
      fetchPoints(),
      fetchCategories(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inicializar filtro de origen con CLIENTE por defecto.
  useEffect(() => {
    if (isSuperUser && filters.origin == null) {
      setFilter("origin", "CLIENTE");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar tickets cuando cambian los filtros globales.
  useEffect(() => {
    if (isStaff || isSuperUser) {
      fetchTickets(buildQueryParams());
    }
  }, [filters, buildQueryParams, isStaff, isSuperUser, fetchTickets]);

  // Cargar advertencias al montar y cuando se abre el drawer.
  useEffect(() => {
    if (isSuperUser) {
      fetchWarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperUser]);

  useEffect(() => {
    if (warningsOpen && isSuperUser) {
      fetchWarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warningsOpen, isSuperUser]);

  const handleRefresh = useCallback(() => {
    if (isStaff || isSuperUser) {
      fetchTickets(buildQueryParams());
    }
    if (isSuperUser) {
      fetchWarnings();
    }
    Promise.all([
      fetchUsers(),
      fetchClientsWithProjects(),
      fetchPoints(),
      fetchCategories(),
    ]);
  }, [fetchTickets, buildQueryParams, isStaff, isSuperUser, fetchWarnings, fetchUsers, fetchClientsWithProjects, fetchPoints, fetchCategories]);

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
      await createTicket(data, categories);
    },
    [createTicket, categories]
  );

  const handleResetFilters = useCallback(() => {
    resetFilters();
    if (isSuperUser) {
      setFilter("origin", "CLIENTE");
    }
  }, [resetFilters, setFilter, isSuperUser]);



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

  const categoryOptions = useMemo(() => {
    if (categories.length === 0) return [];
    const parents = categories.filter((c) => c.parent == null);
    const children = categories.filter((c) => c.parent != null);

    if (parents.length === 0) {
      return categories.map((c) => ({
        value: c.id,
        label: c.name || c.title || `Categoría ${c.id}`,
      }));
    }

    return parents.map((parent) => ({
      label: parent.name || parent.title || `Categoría ${parent.id}`,
      options: children
        .filter((c) => c.parent === parent.id)
        .map((c) => ({
          value: c.id,
          label: c.name || c.title || `Subcategoría ${c.id}`,
        })),
    }));
  }, [categories]);

  const projectOptions = useMemo(() => {
    const options = [];
    for (const client of clientsWithProjects) {
      for (const project of client.projects || []) {
        options.push({
          value: project.id,
          label: `${project.name || `Proyecto ${project.id}`} (${client.name || `Cliente ${client.id}`})`,
        });
      }
    }
    return options;
  }, [clientsWithProjects]);

  const selectedProject = filters.project;

  const pointOptions = useMemo(() => {
    if (!selectedProject) {
      return points.map((p) => ({
        value: p.id,
        label: p.name || p.title || `Punto ${p.id}`,
      }));
    }
    return points
      .filter((p) => p.project === selectedProject || p.project_id === selectedProject)
      .map((p) => ({
        value: p.id,
        label: p.name || p.title || `Punto ${p.id}`,
      }));
  }, [points, selectedProject]);

  const handleProjectChange = (value) => {
    setFilter("project", value || null);
    setFilter("point", null);
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          background: token.glassBg,
          borderRadius: token.voidRadius,
          border: `1px solid ${token.glassBorder}`,
          padding: 16,
          marginBottom: 24,
          backdropFilter: "blur(10px)",
        }}
      >
        <Flex wrap gap={12} align="center" vertical={isMobile} style={{ width: isMobile ? "100%" : "auto" }}>
          <RangePicker
            value={filters.dateRange || null}
            onChange={(dates) => setFilter("dateRange", dates)}
            style={{ minWidth: 240, width: isMobile ? "100%" : "auto" }}
            suffixIcon={<CalendarOutlined style={{ color: token.voidTextMuted }} />}
          />
          <Select
            placeholder="Prioridad"
            allowClear
            prefix={
              filters.priority ? (
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: getTicketPriorityConfig(filters.priority).borderColor,
                    display: "inline-block",
                    border: `1px solid ${token.voidSurface}`,
                  }}
                />
              ) : (
                <ThunderboltOutlined style={{ color: token.voidTextMuted }} />
              )
            }
            style={{ minWidth: 170, width: isMobile ? "100%" : "auto" }}
            value={filters.priority || undefined}
            onChange={(v) => setFilter("priority", v || null)}
            options={PRIORITY_FILTER_OPTIONS}
            optionRender={(option) => {
              const cfg = getTicketPriorityConfig(option.value);
              return (
                <Flex align="center" gap={8}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: cfg.borderColor,
                      display: "inline-block",
                      border: `1px solid ${token.voidSurface}`,
                    }}
                  />
                  {option.label}
                </Flex>
              );
            }}
            labelRender={(props) => props.label}
          />
          {isSuperUser && (
            <>
              <Select
                placeholder="Origen"
                allowClear
                prefix={<UserOutlined style={{ color: token.voidTextMuted }} />}
                style={{ minWidth: 170, width: isMobile ? "100%" : "auto" }}
                value={filters.origin || undefined}
                onChange={(v) => setFilter("origin", v || null)}
                options={[
                  { value: "CLIENTE", label: "Cliente" },
                  // El backend maneja "Operaciones" como origen INTERNO.
                  { value: "INTERNO", label: "Operaciones" },
                ]}
              />
              <Select
                placeholder="Categoría"
                allowClear
                prefix={<TagsOutlined style={{ color: token.voidTextMuted }} />}
                style={{ minWidth: 170, width: isMobile ? "100%" : "auto" }}
                value={filters.category || undefined}
                onChange={(v) => setFilter("category", v || null)}
                options={categoryOptions}
                showSearch
                optionFilterProp="label"
              />
            </>
          )}

          {isSuperUser && (
            <>
              <Select
                placeholder="Proyecto"
                allowClear
                showSearch
                optionFilterProp="label"
                prefix={<ProjectOutlined style={{ color: token.voidTextMuted }} />}
                style={{ minWidth: 170, width: isMobile ? "100%" : "auto" }}
                value={filters.project || undefined}
                onChange={handleProjectChange}
                options={projectOptions}
              />
              <Select
                placeholder={filters.project ? "Punto" : "Selecciona un proyecto"}
                allowClear
                showSearch
                optionFilterProp="label"
                prefix={<EnvironmentOutlined style={{ color: token.voidTextMuted }} />}
                style={{ minWidth: 170, width: isMobile ? "100%" : "auto" }}
                value={filters.point || undefined}
                onChange={(v) => setFilter("point", v || null)}
                options={pointOptions}
                disabled={!filters.project}
              />
            </>
          )}
          <Select
            placeholder="Canal"
            allowClear
            prefix={<MessageOutlined style={{ color: token.voidTextMuted }} />}
            style={{ minWidth: 170, width: isMobile ? "100%" : "auto" }}
            value={filters.source || undefined}
            onChange={(v) => setFilter("source", v || null)}
            options={SOURCE_FILTER_OPTIONS}
          />
          <Select
            placeholder="Asignado a"
            allowClear
            prefix={<UserOutlined style={{ color: token.voidTextMuted }} />}
            style={{ minWidth: 170, width: isMobile ? "100%" : "auto" }}
            value={filters.assignedTo || undefined}
            onChange={(v) => setFilter("assignedTo", v || null)}
            options={userOptions}
            showSearch
            optionFilterProp="label"
          />

          <Flex
            gap={8}
            align="center"
            justify={isMobile ? "flex-end" : "center"}
            style={{ marginLeft: isMobile ? 0 : "auto" }}
          >
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              shape="circle"
              title="Actualizar"
            />
            {isStaff && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateOpen(true)}
                shape="circle"
                title="Nuevo ticket"
                style={{
                  background: token.colorAccent,
                  borderColor: token.colorAccent,
                  color: "#fff",
                }}
              />
            )}
            <Button
              icon={<ClearOutlined />}
              onClick={handleResetFilters}
              shape="circle"
              title="Limpiar filtros"
            />
            {isSuperUser && (
              <div style={{ display: "inline-flex" }}>
                <Badge
                  count={warningTickets.length}
                  offset={[8, -8]}
                  showZero={false}
                >
                  <Button
                    icon={<WarningOutlined />}
                    onClick={() => setWarningsOpen(true)}
                    shape="circle"
                    title="Advertencias"
                    style={{
                      background: token.voidSurface,
                      borderColor: token.voidBorder,
                      color: token.voidTextHeading,
                    }}
                  />
                </Badge>
              </div>
            )}
          </Flex>
        </Flex>
      </div>

      {isStaff || isSuperUser ? (
        tickets.length === 0 && !loading ? (
          <Empty description="No hay tickets para los filtros seleccionados" />
        ) : (
          <div style={{ height: "calc(100vh - 180px)", overflow: "hidden" }}>
            <KanbanBoard
              tickets={tickets}
              onTicketClick={handleTicketClick}
              onStatusChange={handleStatusChange}
              loading={loading}
            />
          </div>
        )
      ) : warningTickets.length === 0 && !loading ? (
        <Empty description="No tienes alertas asignadas" />
      ) : (
        <div style={{ height: "calc(100vh - 180px)", overflow: "hidden" }}>
          <KanbanBoard
            tickets={warningTickets}
            onTicketClick={handleTicketClick}
            onStatusChange={handleStatusChange}
            loading={loading}
          />
        </div>
      )}

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        users={users}
        categories={categories}
        onChangeStatus={changeStatus}
        onAssign={assignTicket}
        onUpdateTicket={updateTicket}
        onDelete={deleteTicket}
        onCreateComment={createComment}
        onUploadAttachment={uploadAttachment}
        onConfirmScheduledDate={confirmScheduledDate}
        onCancelScheduledDate={cancelScheduledDate}
        getTicketById={getTicketById}
        getComments={getComments}
        getAttachments={getAttachments}
      />

      <Drawer
        title="Advertencias del sistema"
        open={warningsOpen}
        onClose={() => setWarningsOpen(false)}
        width={isMobile ? "100%" : 480}
        styles={{
          body: { background: token.glassBg, backdropFilter: "blur(10px)" },
          header: { background: token.glassBg, borderBottom: `1px solid ${token.glassBorder}` },
          footer: { background: token.glassBg, borderTop: `1px solid ${token.glassBorder}` },
        }}
      >
        {loading && warningTickets.length === 0 ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : warningTickets.length === 0 ? (
          <Empty description="No hay advertencias pendientes" />
        ) : (
          <List
            dataSource={warningTickets}
            renderItem={(ticket) => {
              const priority = getTicketPriorityConfig(ticket.priority);
              return (
                <List.Item
                  actions={[
                    <SmartButton
                      size="sm"
                      variant="void"
                      onClick={() => handleConvertWarning(ticket)}
                    >
                      Convertir a ticket
                    </SmartButton>,
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
        categories={categories}
      />
    </div>
  );
};

export default SupportDashboard;
