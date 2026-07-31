import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Flex,
  Typography,
  Button,
  Select,
  DatePicker,
  Empty,
  Calendar,
  Segmented,
  Card,
  Drawer,
  List,
  Avatar,
  Tag,
} from "antd";
import {
  ReloadOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  InboxOutlined,
  CalendarOutlined,
  ProjectOutlined,
  UserOutlined,
  ToolOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTickets } from "../hooks/useTickets";
import { useTicketCatalogs } from "../hooks/useTicketCatalogs";
import KanbanBoard from "../components/TicketsKanban/KanbanBoard";
import TicketDetailDrawer from "../components/TicketsKanban/TicketDetailDrawer";
import { SmartKPICard } from "../../../shared/ui";
import {
  STATUS_FILTER_OPTIONS,
  PRIORITY_FILTER_OPTIONS,
  SLA_FILTER_OPTIONS,
  getTicketPriorityConfig,
  getTicketOverallSla,
  getTicketColumn,
  isTicketClosed,
} from "../constants/tickets";

const { Title, Text } = Typography;

/**
 * Página "Mi Escritorio" para operadores de soporte.
 *
 * Muestra los tickets asignados al usuario actual o aquellos en categorías
 * donde es operador, con KPIs, alertas de SLA y un tablero Kanban por estado.
 */
const MyDeskPage = () => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();

  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    category: null,
    scheduledDate: null,
    scope: null,
    createdRange: null,
    sla: null,
  });
  const [view, setView] = useState("kanban");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTicketsOpen, setDayTicketsOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState("month");

  const {
    myDeskTickets,
    loading: ticketsLoading,
    fetchMyDesk,
    changeStatus,
    assignTicket,
    updateTicket,
    deleteTicket,
    createComment,
    uploadAttachment,
    getTicketById,
    getComments,
    getAttachments,
    confirmScheduledDate,
    cancelScheduledDate,
  } = useTickets({ autoLoad: false });

  const {
    users,
    categories,
    loading: catalogsLoading,
    fetchUsers,
    fetchCategories,
  } = useTicketCatalogs({ autoLoad: false });

  /** Construye los query params para /api/ik/tickets/my_desk/. */
  const buildQueryParams = useCallback(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.category) params.category = filters.category;
    if (filters.scope) params.scope = filters.scope;
    if (filters.scheduledDate) {
      params.scheduled_date = filters.scheduledDate.format("YYYY-MM-DD");
    }
    if (filters.createdRange) {
      if (filters.createdRange[0]) params.created_from = filters.createdRange[0].format("YYYY-MM-DD");
      if (filters.createdRange[1]) params.created_to = filters.createdRange[1].format("YYYY-MM-DD");
    }
    return params;
  }, [filters]);

  const loading = ticketsLoading || catalogsLoading;

  // Catálogos solo al montar; no dependen de filtros.
  useEffect(() => {
    fetchUsers();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar Mi Escritorio cuando cambian los filtros locales.
  useEffect(() => {
    fetchMyDesk(buildQueryParams());
  }, [fetchMyDesk, buildQueryParams]);

  const handleRefresh = useCallback(() => {
    fetchUsers();
    fetchCategories();
    fetchMyDesk(buildQueryParams());
  }, [fetchUsers, fetchCategories, fetchMyDesk, buildQueryParams]);

  const handleTicketClick = useCallback((ticket) => {
    setSelectedTicketId(ticket.id);
    setDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    async (ticketId, status) => {
      await changeStatus(ticketId, status);
      fetchMyDesk(buildQueryParams());
    },
    [changeStatus, fetchMyDesk, buildQueryParams]
  );

  const handleSetFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || null }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: null,
      priority: null,
      category: null,
      scheduledDate: null,
      scope: null,
      createdRange: null,
      sla: null,
    });
  }, []);

  const metrics = useMemo(() => {
    const total = myDeskTickets.length;
    const open = myDeskTickets.filter((t) => t.status === "ABIERTO").length;
    const inProgress = myDeskTickets.filter((t) =>
      ["EN_ANALISIS", "EN_ORDEN_TRABAJO", "ESPERA_CLIENTE", "ESPERA_PROVEEDOR"].includes(t.status)
    ).length;
    const closed = myDeskTickets.filter((t) => isTicketClosed(t.status)).length;
    const critical = myDeskTickets.filter((t) =>
      ["ALTA", "CRITICA"].includes(t.priority)
    ).length;

    const isOT = (t) => getTicketColumn(t.status) === "ot";
    const otTickets = myDeskTickets.filter(isOT);
    const otTotal = otTickets.length;
    const otPending = otTickets.filter((t) => !isTicketClosed(t.status)).length;
    const otOverdue = otTickets.filter(
      (t) => !isTicketClosed(t.status) && getTicketOverallSla(t) === "overdue"
    ).length;
    const otUnconfirmed = otTickets.filter(
      (t) => t.scheduled_date && !t.scheduled_date_confirmed
    ).length;

    const avgResolutionHours =
      myDeskTickets
        .filter((t) => isTicketClosed(t.status) && t.created_at && (t.resolved_at || t.updated_at))
        .reduce((acc, t) => {
          const created = new Date(t.created_at);
          const closed = new Date(t.resolved_at || t.updated_at);
          return acc + (closed - created) / 36e5;
        }, 0) /
        Math.max(
          1,
          myDeskTickets.filter((t) => isTicketClosed(t.status)).length
        );

    return {
      total,
      open,
      inProgress,
      closed,
      critical,
      otTotal,
      otPending,
      otOverdue,
      otUnconfirmed,
      avgResolutionHours: Math.round(avgResolutionHours),
    };
  }, [myDeskTickets]);

  /** Aplica filtro de SLA del lado del cliente */
  const displayTickets = useMemo(() => {
    if (!filters.sla) return myDeskTickets;
    return myDeskTickets.filter((t) => getTicketOverallSla(t) === filters.sla);
  }, [myDeskTickets, filters.sla]);

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name || c.title || `Categoría ${c.id}`,
      })),
    [categories]
  );

  const getTicketCalendarDate = (ticket) => {
    if (ticket.scheduled_date) return dayjs(ticket.scheduled_date);
    if (ticket.created_at) return dayjs(ticket.created_at);
    if (ticket.created) return dayjs(ticket.created);
    return null;
  };

  const calendarTickets = useMemo(() => {
    const map = {};
    displayTickets.forEach((ticket) => {
      const date = getTicketCalendarDate(ticket);
      if (!date) return;
      const key = date.format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(ticket);
    });
    return map;
  }, [displayTickets]);

  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
    setDayTicketsOpen(true);
  }, []);

  const selectedDateTickets = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.format("YYYY-MM-DD");
    return calendarTickets[key] || [];
  }, [selectedDate, calendarTickets]);

  const dateCellRender = (value) => {
    const key = value.format("YYYY-MM-DD");
    const tickets = calendarTickets[key] || [];
    if (tickets.length === 0) return null;

    const visible = tickets.slice(0, isMobile ? 1 : 2);
    const extra = tickets.length - visible.length;

    return (
      <Flex
        vertical
        gap={2}
        style={{ marginTop: 4, padding: "0 4px", overflow: "hidden" }}
      >
        {visible.map((ticket) => {
          const closed = isTicketClosed(ticket.status);
          const client = ticket.client_name || ticket.client || "-";
          const responsible = ticket.assigned_to_name || "Sin asignar";
          const rowColor = closed ? token.colorCorporateBlueMid : token.voidTextHeading;
          return (
            <div
              key={ticket.id}
              title={ticket.title || `Ticket #${ticket.id}`}
              style={{
                fontSize: 10,
                lineHeight: 1.25,
                color: rowColor,
                fontWeight: closed ? 700 : 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Text
                strong
                style={{ fontSize: 10, color: closed ? token.colorCorporateBlue : token.colorAccent }}
              >
                #{ticket.id}
              </Text>{" "}
              {client}
              <Text
                style={{
                  fontSize: 10,
                  color: closed ? token.colorCorporateBlueMid : token.voidTextMuted,
                }}
              >
                {" "}· {responsible}
              </Text>
            </div>
          );
        })}
        {extra > 0 && (
          <Text style={{ fontSize: 10, color: token.voidTextMuted }}>+{extra} más</Text>
        )}
      </Flex>
    );
  };

  /** Vista de año: agrupa los tickets por mes del panel actual. */
  const monthCellRender = (value) => {
    const prefix = value.format("YYYY-MM");
    let count = 0;
    Object.entries(calendarTickets).forEach(([key, list]) => {
      if (key.startsWith(prefix)) count += list.length;
    });
    if (count === 0) return null;
    return (
      <div style={{ marginTop: 6, textAlign: "center" }}>
        <Tag style={{ background: token.voidSurface, color: token.voidTextHeading, border: 0 }}>
          {count} tickets
        </Tag>
      </div>
    );
  };

  const handleCalendarSelect = useCallback((date, selectInfo) => {
    if (selectInfo && selectInfo.source && selectInfo.source !== "date") return;
    handleDateClick(date);
  }, [handleDateClick]);

  const kpis = [
    { icon: <InboxOutlined />, label: "Mi bandeja", value: metrics.total },
    { icon: <FileTextOutlined />, label: "Abiertos", value: metrics.open },
    { icon: <ClockCircleOutlined />, label: "En progreso", value: metrics.inProgress },
    { icon: <CheckCircleOutlined />, label: "Resueltos", value: metrics.closed },
    { icon: <ThunderboltOutlined />, label: "Críticos", value: metrics.critical },
    { icon: <ToolOutlined />, label: "OT", value: metrics.otTotal },
    { icon: <ClockCircleOutlined />, label: "OT pendientes", value: metrics.otPending },
    { icon: <ExclamationCircleOutlined />, label: "OT vencidas", value: metrics.otOverdue },
    { icon: <CalendarOutlined />, label: "Sin confirmar", value: metrics.otUnconfirmed },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Flex
        justify="space-between"
        align={isMobile ? "flex-start" : "center"}
        gap={isMobile ? 12 : 0}
        style={{ marginBottom: 24 }}
        vertical={isMobile}
      >
        <Flex align="center" gap={12} wrap>
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: token.voidTextHeading }}>
            Mi Escritorio
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {loading ? "Cargando..." : `${displayTickets.length} tickets`}
          </Text>
        </Flex>
        <Flex gap={12} align="center" wrap>
          <Segmented
            value={filters.scope || "all"}
            onChange={(v) => handleSetFilter("scope", v === "all" ? null : v)}
            options={[
              { value: "all", label: "Todo" },
              { value: "assigned", label: "Mis asignaciones" },
              { value: "category", label: "Mis responsabilidades" },
            ]}
          />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "kanban", icon: <ProjectOutlined /> },
              { value: "calendar", icon: <CalendarOutlined /> },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Actualizar
          </Button>
        </Flex>
      </Flex>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ flex: isMobile ? "1 1 140px" : "1 1 0", minWidth: isMobile ? 140 : 0 }}>
            <SmartKPICard variant="void"
              icon={kpi.icon}
              label={kpi.label}
              value={kpi.value}
              loading={loading}
              style={{ minHeight: 64, padding: "8px 10px 6px", gap: 2 }}
              valueStyle={{ fontSize: isMobile ? 16 : 20 }}
              labelStyle={{ fontSize: 9, height: 22, lineHeight: "11px" }}
            />
          </div>
        ))}
      </div>

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
          <FilterOutlined style={{ color: token.voidTextMuted, display: isMobile ? "none" : "inline" }} />
          <Select
            placeholder="Estado"
            allowClear
            style={{ minWidth: 140, width: isMobile ? "100%" : "auto" }}
            value={filters.status || undefined}
            onChange={(v) => handleSetFilter("status", v)}
            options={STATUS_FILTER_OPTIONS}
          />
          <Select
            placeholder="Prioridad"
            allowClear
            style={{ minWidth: 140, width: isMobile ? "100%" : "auto" }}
            value={filters.priority || undefined}
            onChange={(v) => handleSetFilter("priority", v)}
            options={PRIORITY_FILTER_OPTIONS}
          />
          <Select
            placeholder="Categoría"
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ minWidth: 180, width: isMobile ? "100%" : "auto" }}
            value={filters.category || undefined}
            onChange={(v) => handleSetFilter("category", v)}
            options={categoryOptions}
          />
          <DatePicker
            placeholder="Fecha programada"
            value={filters.scheduledDate}
            onChange={(date) => handleSetFilter("scheduledDate", date)}
            format="YYYY-MM-DD"
            style={{ minWidth: 160, width: isMobile ? "100%" : "auto" }}
          />
          <DatePicker.RangePicker
            placeholder={["Creado desde", "Creado hasta"]}
            value={filters.createdRange}
            onChange={(dates) => handleSetFilter("createdRange", dates)}
            format="YYYY-MM-DD"
            style={{ minWidth: 240, width: isMobile ? "100%" : "auto" }}
          />
          <Select
            placeholder="SLA"
            allowClear
            style={{ minWidth: 160, width: isMobile ? "100%" : "auto" }}
            value={filters.sla || undefined}
            onChange={(v) => handleSetFilter("sla", v)}
            options={SLA_FILTER_OPTIONS}
          />
          <Button onClick={handleClearFilters} style={{ width: isMobile ? "100%" : "auto" }}>Limpiar</Button>
        </Flex>
      </div>

      {displayTickets.length === 0 && !loading ? (
        <Empty description="No tienes tickets en tu escritorio" />
      ) : view === "calendar" ? (
        <Card
          className="my-desk-calendar"
          style={{
            background: token.glassBg,
            border: `1px solid ${token.glassBorder}`,
            borderRadius: token.voidRadius,
            backdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
        >
          <style>{`
            .my-desk-calendar .ant-picker-cell-today .ant-picker-cell-inner::before {
              border-color: ${token.colorAccent} !important;
              opacity: 0.4;
            }
            .my-desk-calendar .ant-picker-cell-selected .ant-picker-cell-inner {
              background: ${token.voidSurface} !important;
              border-radius: ${token.voidRadius}px;
            }
            .my-desk-calendar .ant-picker-cell-selected .ant-picker-cell-inner::before {
              border-color: ${token.colorAccent} !important;
            }
            .my-desk-calendar .ant-picker-cell:hover .ant-picker-cell-inner {
              background: rgba(255,255,255,0.06) !important;
            }
            .my-desk-calendar .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
              border-color: ${token.colorAccent} !important;
            }
            .my-desk-calendar .ant-picker-cell-inner {
              overflow: hidden !important;
            }
            .my-desk-calendar .ant-picker-calendar-date {
              overflow: hidden !important;
            }
            .my-desk-calendar .ant-picker-calendar-date-content {
              overflow: hidden !important;
            }
          `}</style>
          <Calendar
            dateCellRender={dateCellRender}
            monthCellRender={monthCellRender}
            mode={calendarMode}
            onPanelChange={(date, mode) => setCalendarMode(mode)}
            fullscreen={!isMobile}
            onSelect={handleCalendarSelect}
          />
        </Card>
      ) : (
        <div style={{ height: "calc(100vh - 290px)", overflow: "hidden" }}>
          <KanbanBoard
            tickets={displayTickets}
            onTicketClick={handleTicketClick}
            onStatusChange={handleStatusChange}
            loading={loading}
          />
        </div>
      )}

      <Drawer
        title={`Tickets - ${selectedDate ? selectedDate.format("DD MMM YYYY") : ""}`}
        open={dayTicketsOpen}
        onClose={() => setDayTicketsOpen(false)}
        width={isMobile ? "100%" : 420}
        styles={{
          body: { background: token.glassBg, backdropFilter: "blur(10px)" },
          header: { background: token.glassBg, borderBottom: `1px solid ${token.glassBorder}` },
          footer: { background: token.glassBg, borderTop: `1px solid ${token.glassBorder}` },
        }}
      >
        <List
          dataSource={selectedDateTickets}
          locale={{ emptyText: <Empty description="Sin tickets este día" /> }}
          renderItem={(ticket) => {
            const priority = getTicketPriorityConfig(ticket.priority);
            const closed = isTicketClosed(ticket.status);
            const client = ticket.client_name || ticket.client || "-";
            const responsible = ticket.assigned_to_name || "Sin asignar";
            return (
              <List.Item
                style={{ cursor: "pointer" }}
                onClick={() => handleTicketClick(ticket)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      style={{
                        background: closed ? token.colorCorporateBlue : priority.borderColor,
                      }}
                    />
                  }
                  title={
                    <Text
                      strong
                      style={{
                        color: closed ? token.colorCorporateBlueMid : token.voidTextHeading,
                      }}
                    >
                      #{ticket.id} · {ticket.title || `Ticket #${ticket.id}`}
                    </Text>
                  }
                  description={
                    <Flex vertical gap={4}>
                      <Flex gap={8} wrap align="center">
                        <Tag color={priority.color}>{priority.label}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {ticket.status}
                        </Text>
                      </Flex>
                      <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                        {client} · Responsable: {responsible}
                      </Text>
                    </Flex>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Drawer>

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
    </div>
  );
};

export default MyDeskPage;
