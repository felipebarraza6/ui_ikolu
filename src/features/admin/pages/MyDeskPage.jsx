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
  Row,
  Col,
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
  getTicketPriorityConfig,
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
  });
  const [view, setView] = useState("kanban");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTicketsOpen, setDayTicketsOpen] = useState(false);

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
      avgResolutionHours: Math.round(avgResolutionHours),
    };
  }, [myDeskTickets]);

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
    myDeskTickets.forEach((ticket) => {
      const date = getTicketCalendarDate(ticket);
      if (!date) return;
      const key = date.format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(ticket);
    });
    return map;
  }, [myDeskTickets]);

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

    const highestPriority = tickets.reduce((prev, ticket) => {
      const order = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
      const current = order[String(ticket.priority).toUpperCase()] || 0;
      return current > prev.order ? { ticket, order: current } : prev;
    }, { ticket: tickets[0], order: 0 });
    const priority = getTicketPriorityConfig(highestPriority.ticket.priority);
    const color =
      typeof priority.borderColor === "string" && priority.borderColor.startsWith("var(")
        ? token.voidTextHeading
        : priority.borderColor;

    return (
      <Flex justify="center" style={{ marginTop: 6 }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleDateClick(value);
          }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: `0 2px 6px ${color}50`,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {tickets.length}
          </Text>
        </div>
      </Flex>
    );
  };

  const kpis = [
    { icon: <InboxOutlined />, label: "Mi bandeja", value: metrics.total },
    { icon: <FileTextOutlined />, label: "Abiertos", value: metrics.open },
    { icon: <ClockCircleOutlined />, label: "En progreso", value: metrics.inProgress },
    { icon: <CheckCircleOutlined />, label: "Resueltos", value: metrics.closed },
    { icon: <ThunderboltOutlined />, label: "Críticos", value: metrics.critical },
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
            {loading ? "Cargando..." : `${myDeskTickets.length} tickets`}
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

      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        {kpis.map((kpi, idx) => (
          <Col key={idx} xs={12} sm={8} md={6} lg={4}>
            <SmartKPICard variant="void"
              icon={kpi.icon}
              label={kpi.label}
              value={kpi.value}
              loading={loading}
              style={{ minHeight: 88 }}
              valueStyle={{ fontSize: isMobile ? 18 : 22 }}
              labelStyle={{ fontSize: 10, height: 28, lineHeight: "14px" }}
            />
          </Col>
        ))}
      </Row>

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
          <Button onClick={handleClearFilters} style={{ width: isMobile ? "100%" : "auto" }}>Limpiar</Button>
        </Flex>
      </div>

      {myDeskTickets.length === 0 && !loading ? (
        <Empty description="No tienes tickets en tu escritorio" />
      ) : view === "calendar" ? (
        <Card
          style={{
            background: token.glassBg,
            border: `1px solid ${token.glassBorder}`,
            borderRadius: token.voidRadius,
            backdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
        >
          <Calendar
            dateCellRender={dateCellRender}
            mode="month"
            fullscreen={!isMobile}
            onSelect={(date) => handleDateClick(date)}
          />
        </Card>
      ) : (
        <KanbanBoard
          tickets={myDeskTickets}
          onTicketClick={handleTicketClick}
          onStatusChange={handleStatusChange}
          loading={loading}
        />
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
            return (
              <List.Item
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setDayTicketsOpen(false);
                  handleTicketClick(ticket);
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ background: priority.borderColor }}
                    />
                  }
                  title={
                    <Text strong style={{ color: token.voidTextHeading }}>
                      {ticket.title || `Ticket #${ticket.id}`}
                    </Text>
                  }
                  description={
                    <Flex gap={8} wrap align="center">
                      <Tag color={priority.color}>{priority.label}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {ticket.status}
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
        getTicketById={getTicketById}
        getComments={getComments}
        getAttachments={getAttachments}
      />
    </div>
  );
};

export default MyDeskPage;
