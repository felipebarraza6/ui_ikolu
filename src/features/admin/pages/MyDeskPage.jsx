import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Flex,
  Typography,
  Button,
  Select,
  Input,
  DatePicker,
  Empty,
  Calendar,
  Segmented,
  Drawer,
  List,
  Avatar,
  Tag,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  InboxOutlined,
  CalendarOutlined,
  ProjectOutlined,
  UserOutlined,
  ToolOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTickets } from "../hooks/useTickets";
import { useTicketCatalogs } from "../hooks/useTicketCatalogs";
import KanbanBoard from "../components/TicketsKanban/KanbanBoard";
import TicketDetailDrawer from "../components/TicketsKanban/TicketDetailDrawer";
import TicketCreateDrawer from "../components/TicketsKanban/TicketCreateDrawer";
import { SmartKPICard } from "../../../shared/ui";
import {
  PRIORITY_FILTER_OPTIONS,
  SLA_FILTER_OPTIONS,
  getTicketPriorityConfig,
  getTicketOverallSla,
  getTicketColumn,
  isTicketClosed,
} from "../constants/tickets";
import { getEntityVocab } from "../constants/entityVocab";

const { Text } = Typography;

/**
 * Página "Mi Escritorio" para operadores de soporte.
 *
 * Muestra los tickets asignados al usuario actual o aquellos en categorías
 * donde es operador, con KPIs, alertas de SLA y un tablero Kanban por estado.
 */
const MyDeskPage = () => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const location = useLocation();
  const vocab = getEntityVocab(location.pathname);
  const entityPluralCap = vocab.entityPlural.charAt(0).toUpperCase() + vocab.entityPlural.slice(1);
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const urlTicketId = useMemo(() => {
    const n = Number(ticketId);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [ticketId]);

  const [filters, setFilters] = useState({
    searchId: urlTicketId ? String(urlTicketId) : "",
    priority: null,
    category: null,
    scope: null,
    createdRange: [dayjs().startOf("month"), dayjs().endOf("month")],
    sla: null,
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
    createTicket,
    createComment,
    deleteComment,
    updateComment,
    likeComment,
    getMentionableUsers,
    getTicketNotifications,
    markTicketNotificationsRead,
    uploadAttachment,
    uploadCommentAttachment,
    tasks,
    getTicketById,
    getComments,
    getAttachments,
    confirmScheduledDate,
    cancelScheduledDate,
  } = useTickets({ autoLoad: false });

  const [createOpen, setCreateOpen] = useState(false);

  const {
    users,
    categories,
    clientsWithProjects,
    loading: catalogsLoading,
    fetchUsers,
    fetchCategories,
    fetchClientsWithProjects,
  } = useTicketCatalogs({ autoLoad: false });

  /** Construye los query params para /api/ik/tickets/my_desk/. */
  const buildQueryParams = useCallback(() => {
    const params = {};
    if (vocab.origin === "OPERACIONES") params.origin = vocab.origin;
    if (filters.searchId) params.id = filters.searchId;
    if (filters.priority) params.priority = filters.priority;
    if (filters.category) params.category = filters.category;
    if (filters.scope) params.scope = filters.scope;
    if (filters.createdRange) {
      if (filters.createdRange[0]) params.created_from = filters.createdRange[0].format("YYYY-MM-DD");
      if (filters.createdRange[1]) params.created_to = filters.createdRange[1].format("YYYY-MM-DD");
    }
    return params;
  }, [vocab, filters]);

  const loading = ticketsLoading || catalogsLoading;

  // Catálogos solo al montar; no dependen de filtros.
  useEffect(() => {
    fetchUsers();
    fetchCategories();
    fetchClientsWithProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar Mi Escritorio cuando cambian los filtros locales.
  useEffect(() => {
    fetchMyDesk(buildQueryParams());
  }, [fetchMyDesk, buildQueryParams]);

  const handleRefresh = useCallback(() => {
    fetchUsers();
    fetchCategories();
    fetchClientsWithProjects();
    fetchMyDesk(buildQueryParams());
  }, [fetchUsers, fetchCategories, fetchClientsWithProjects, fetchMyDesk, buildQueryParams]);

  const handleTicketClick = useCallback((ticket) => {
    setSelectedTicketId(ticket.id);
    setDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    async (ticketId, status, workOrderCategory) => {
      await changeStatus(ticketId, status, workOrderCategory);
      fetchMyDesk(buildQueryParams());
    },
    [changeStatus, fetchMyDesk, buildQueryParams]
  );

  const handleSetFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || null }));
    if (key === "searchId" && !value && ticketId) {
      navigate(vocab.origin === "OPERACIONES" ? "/admin/operations/my-desk" : "/admin/support/my-desk", { replace: true });
    }
  }, [navigate, ticketId]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      searchId: "",
      priority: null,
      category: null,
      scope: null,
      createdRange: [dayjs().startOf("month"), dayjs().endOf("month")],
      sla: null,
    });
    if (ticketId) {
      navigate(vocab.origin === "OPERACIONES" ? "/admin/operations/my-desk" : "/admin/support/my-desk", { replace: true });
    }
  }, [navigate, ticketId]);

  const handleCreate = useCallback(
    async (data) => {
      await createTicket(data, categories);
      setCreateOpen(false);
      fetchMyDesk(buildQueryParams());
    },
    [createTicket, categories, buildQueryParams, fetchMyDesk]
  );

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

  /** Aplica filtros del lado del cliente: SLA + búsqueda por ID.
   *  La búsqueda por ID se filtra localmente porque /my_desk/ no soporta el
   *  parámetro `id` (solo lo soporta el listado general /tickets/).
   *  Si viene un ticketId en la URL, el filtro es exacto para abrir ese ticket. */
  const displayTickets = useMemo(() => {
    let list = myDeskTickets;
    if (filters.createdRange?.[0] && filters.createdRange?.[1]) {
      const from = filters.createdRange[0].startOf("day");
      const to = filters.createdRange[1].endOf("day");
      list = list.filter((t) => {
        const date = t.created_at ? dayjs(t.created_at) : dayjs(t.created);
        return date.isValid() && date.valueOf() >= from.valueOf() && date.valueOf() <= to.valueOf();
      });
    }
    if (filters.sla) {
      list = list.filter((t) => getTicketOverallSla(t) === filters.sla);
    }
    if (filters.searchId) {
      if (urlTicketId) {
        list = list.filter((t) => t.id === urlTicketId);
      } else {
        const idStr = String(filters.searchId).trim();
        list = list.filter((t) => String(t.id).includes(idStr));
      }
    }
    return list;
  }, [myDeskTickets, filters.sla, filters.searchId, filters.createdRange, urlTicketId]);

  const openedFromUrlRef = useRef(null);

  useEffect(() => {
    if (!urlTicketId) {
      openedFromUrlRef.current = null;
      return;
    }
    if (openedFromUrlRef.current === urlTicketId) return;
    const match = displayTickets.find((t) => t.id === urlTicketId);
    if (match) {
      handleTicketClick(match);
      openedFromUrlRef.current = urlTicketId;
    }
  }, [urlTicketId, displayTickets, handleTicketClick]);

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

  const calendarValue = useMemo(() => {
    if (filters.createdRange?.[0]) return filters.createdRange[0].startOf("month");
    return dayjs().startOf("month");
  }, [filters.createdRange]);

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
              title={ticket.title || `${vocab.entitySingularCap} #${ticket.id}`}
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
          {count} {vocab.entityPlural}
        </Tag>
      </div>
    );
  };

  const handleCalendarSelect = useCallback((date, selectInfo) => {
    if (selectInfo && selectInfo.source && selectInfo.source !== "date") return;
    handleDateClick(date);
  }, [handleDateClick]);

  const kpis = [
    { icon: <InboxOutlined />, label: "Total", value: metrics.total },
    { icon: <FileTextOutlined />, label: "Abiertos", value: metrics.open },
    { icon: <ClockCircleOutlined />, label: "En progreso", value: metrics.inProgress },
    { icon: <ThunderboltOutlined />, label: "Críticos", value: metrics.critical },
    { icon: <ToolOutlined />, label: "OT", value: metrics.otTotal },
  ];

  return (
    <>
      <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto" }}>
      <Flex
        justify="space-between"
        align={isMobile ? "flex-start" : "center"}
        gap={isMobile ? 12 : 0}
        style={{ marginBottom: 16 }}
        vertical={isMobile}
        wrap
      >
        <Segmented
          value={filters.scope || "all"}
          onChange={(v) => handleSetFilter("scope", v === "all" ? null : v)}
          size="small"
          options={[
            { value: "all", label: isMobile ? "Todo" : "Todo" },
            { value: "assigned", label: isMobile ? "Asignados" : "Mis asignaciones" },
            { value: "category", label: isMobile ? "Responsable" : "Mis responsabilidades" },
          ]}
        />
        <Flex gap={8} align="center" wrap>
          <Segmented
            value={view}
            onChange={setView}
            size="small"
            options={[
              { value: "kanban", icon: <ProjectOutlined /> },
              { value: "calendar", icon: <CalendarOutlined /> },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            shape="circle"
            title={`Nuevo ${vocab.entitySingular}`}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            shape="circle"
            title="Actualizar"
          />
        </Flex>
      </Flex>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ flex: isMobile ? "1 1 calc(50% - 4px)" : "1 1 0", minWidth: isMobile ? "calc(50% - 4px)" : 0 }}>
            <SmartKPICard
              variant="void"
              icon={kpi.icon}
              label={kpi.label}
              value={kpi.value}
              loading={loading}
              compact
              layout="horizontal"
              style={{ minHeight: 40, padding: "4px 8px" }}
              valueStyle={{ fontSize: isMobile ? 15 : 17 }}
              labelStyle={{ fontSize: 8, height: 10, lineHeight: "10px" }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <Flex
          wrap={isMobile ? "wrap" : "nowrap"}
          gap={8}
          align="flex-end"
          style={{ width: "100%" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: isMobile ? "100%" : 160, flex: isMobile ? "1 1 100%" : "1 1 160px" }}>
            <Text style={{ fontSize: 11, color: token.voidTextMuted, lineHeight: 1 }}>{`ID ${vocab.entitySingular}`}</Text>
            <Input
              size="small"
              placeholder="Buscar ID..."
              value={filters.searchId}
              onChange={(e) => handleSetFilter("searchId", e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: isMobile ? "calc(33.333% - 6px)" : 120, flex: isMobile ? "1 1 calc(33.333% - 6px)" : "0 0 120px" }}>
            <Text style={{ fontSize: 11, color: token.voidTextMuted, lineHeight: 1 }}>Prioridad</Text>
            <Select
              placeholder="Todas"
              allowClear
              value={filters.priority || undefined}
              onChange={(v) => handleSetFilter("priority", v)}
              options={PRIORITY_FILTER_OPTIONS}
              size="small"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: isMobile ? "calc(33.333% - 6px)" : 150, flex: isMobile ? "1 1 calc(33.333% - 6px)" : "1 1 150px" }}>
            <Text style={{ fontSize: 11, color: token.voidTextMuted, lineHeight: 1 }}>Categoría</Text>
            <Select
              placeholder="Todas"
              allowClear
              showSearch
              optionFilterProp="label"
              value={filters.category || undefined}
              onChange={(v) => handleSetFilter("category", v)}
              options={categoryOptions}
              size="small"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: isMobile ? "calc(33.333% - 6px)" : 120, flex: isMobile ? "1 1 calc(33.333% - 6px)" : "0 0 120px" }}>
            <Text style={{ fontSize: 11, color: token.voidTextMuted, lineHeight: 1 }}>SLA</Text>
            <Select
              placeholder="Todos"
              allowClear
              value={filters.sla || undefined}
              onChange={(v) => handleSetFilter("sla", v)}
              options={SLA_FILTER_OPTIONS}
              size="small"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: isMobile ? "100%" : 220, flex: isMobile ? "1 1 100%" : "1 1 220px" }}>
            <Text style={{ fontSize: 11, color: token.voidTextMuted, lineHeight: 1 }}>Creado entre</Text>
            <DatePicker.RangePicker
              placeholder={["Desde", "Hasta"]}
              value={filters.createdRange}
              onChange={(dates) => handleSetFilter("createdRange", dates)}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              size="small"
            />
          </div>

          <Button
            icon={<ClearOutlined style={{ fontSize: 12 }} />}
            onClick={handleClearFilters}
            shape="circle"
            size="small"
            title="Limpiar filtros"
            style={{ flex: "0 0 28px", height: 28, width: 28, minWidth: 28, alignSelf: "flex-end", padding: 0 }}
          />
        </Flex>
      </div>

      {displayTickets.length === 0 && !loading ? (
        <Empty description={`No tienes ${vocab.entityPlural} en tu escritorio`} />
      ) : view === "calendar" ? (
        <div
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
            fullscreen={!isMobile}
            value={calendarValue}
            headerRender={() => null}
            onSelect={handleCalendarSelect}
          />
        </div>
      ) : (
        <div style={{ height: "calc(100vh - 290px)", overflow: "hidden" }}>
          <KanbanBoard
            tickets={displayTickets}
            onTicketClick={handleTicketClick}
            onStatusChange={handleStatusChange}
            loading={loading}
            workOrderCategories={categories}
            vocab={vocab}
          />
        </div>
      )}

      <Drawer
        title={`${entityPluralCap} - ${selectedDate ? selectedDate.format("DD MMM YYYY") : ""}`}
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
          locale={{ emptyText: <Empty description={`Sin ${vocab.entityPlural} este día`} /> }}
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
                      #{ticket.id} · {ticket.title || `${vocab.entitySingularCap} #${ticket.id}`}
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
        onDeleteComment={deleteComment}
        onUpdateComment={updateComment}
        onLikeComment={likeComment}
        getMentionableUsers={getMentionableUsers}
        getTicketNotifications={getTicketNotifications}
        markTicketNotificationsRead={markTicketNotificationsRead}
        onUploadAttachment={uploadAttachment}
        onUploadCommentAttachment={uploadCommentAttachment}
        onConfirmScheduledDate={confirmScheduledDate}
        onCancelScheduledDate={cancelScheduledDate}
        getTicketById={getTicketById}
        getComments={getComments}
        getAttachments={getAttachments}
        getTasks={tasks.get}
        onCreateTask={tasks.create}
        onUpdateTask={tasks.update}
        onDeleteTask={tasks.delete}
        onUploadTaskAttachment={tasks.uploadAttachment}
        vocab={vocab}
      />

      <TicketCreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        clientsWithProjects={clientsWithProjects}
        categories={categories}
        loading={loading}
        vocab={vocab}
      />
    </div>
    </>
  );
};

export default MyDeskPage;
