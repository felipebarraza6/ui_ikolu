import React, { useMemo, useEffect, useCallback, useState } from "react";
import {
  Row,
  Col,
  Card,
  Flex,
  Typography,
  Empty,
  DatePicker,
  Button,
  Table,
  Tag,
  Tooltip,
  Progress,
  Select,
  Space,
  Tabs,
} from "antd";
import {
  ClockCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  UserOutlined,
  ToolOutlined,
  CarOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { differenceInHours, parseISO, isValid, format } from "date-fns";
import { es } from "date-fns/locale";
import ReactApexChart from "react-apexcharts";
import { useNavigate } from "react-router-dom";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTicketIndicators } from "../hooks/useTicketIndicators";
import { useTicketRanking } from "../hooks/useTicketRanking";
import { useTicketCategories } from "../hooks/useTicketCategories";
import { useTickets } from "../hooks/useTickets";
import { useTicketCatalogs } from "../hooks/useTicketCatalogs";
import TicketDetailDrawer from "../components/TicketsKanban/TicketDetailDrawer";
import { useAdminStore } from "../stores/adminStore";
import {
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CATEGORY,
  STATUS_OPTIONS,
  getTicketPriorityConfig,
  getTicketStatusLabel,
} from "../constants/tickets";

const { Title, Text } = Typography;

const fmt = (value) => (value == null ? 0 : Number(value).toLocaleString("es-CL"));
const fmtPct = (value, total) => {
  const pct = total ? (value / total) * 100 : 0;
  return `${pct.toFixed(1)}%`;
};

const getOverdueDays = (deadlineValue) => {
  if (!deadlineValue) return null;
  try {
    const deadline = parseISO(deadlineValue);
    if (!isValid(deadline)) return null;
    const hours = differenceInHours(new Date(), deadline);
    return hours > 0 ? Math.max(1, Math.floor(hours / 24)) : 0;
  } catch {
    return null;
  }
};

const formatDeadline = (value) => {
  if (!value) return "—";
  try {
    const date = parseISO(value);
    if (!isValid(date)) return value;
    return format(date, "dd MMM yyyy HH:mm", { locale: es });
  } catch {
    return value;
  }
};

const getComplianceStats = (stats) => {
  const compliance = stats?.compliance || {};
  return {
    total: compliance.total ?? 0,
    overdueResolution: compliance.sla_overdue_resolution ?? 0,
    byStatus: compliance.by_status || {},
  };
};

const KpiCard = ({ kpi, token }) => (
  <Card
    size="small"
    style={{
      background: token.glassBg,
      borderColor: token.glassBorder,
      borderRadius: token.voidRadius,
      boxShadow: token.voidShadow,
      height: "100%",
      overflow: "hidden",
      backdropFilter: "blur(10px)",
    }}
    bodyStyle={{ padding: 16 }}
  >
    <Flex align="center" gap={14}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: `${kpi.color}18`,
          color: kpi.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {kpi.icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <Flex align="center" gap={6}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", lineHeight: 1.3 }}>{kpi.label}</Text>
          {kpi.tooltip && (
            <Tooltip title={kpi.tooltip}>
              <QuestionCircleOutlined style={{ fontSize: 11, color: token.voidTextMuted, cursor: "help" }} />
            </Tooltip>
          )}
        </Flex>
        <Text strong style={{ fontSize: 26, color: kpi.color, lineHeight: 1.2 }}>{fmt(kpi.value)}</Text>
        {kpi.sub ? (
          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{kpi.sub}</Text>
        ) : kpi.pct != null && kpi.pct > 0 ? (
          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{fmtPct(kpi.value, kpi.pctOf || 1)} del total</Text>
        ) : null}
      </div>
    </Flex>
  </Card>
);

const HorizontalBarChart = ({ title, items, loading, total, token }) => {
  const { isMobile } = useResponsive();
  const isEmpty = items.length === 0;

  const series = useMemo(
    () => [{ name: "Cantidad", data: items.map((i) => i.value) }],
    [items]
  );

  const options = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        animations: { enabled: true },
        background: "transparent",
        fontFamily: token.fontFamily,
      },
      theme: { mode: token.isDark ? "dark" : "light" },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          barHeight: "55%",
          distributed: true,
          dataLabels: { position: "bottom" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => fmt(val),
        style: { colors: [token.voidTextHeading], fontSize: "11px", fontWeight: 600 },
        offsetX: 24,
      },
      xaxis: {
        categories: items.map((i) => i.name),
        labels: {
          style: { colors: token.voidTextMuted, fontSize: "10px" },
          formatter: (val) => {
            if (val == null || val === "") return "";
            const num = Number(val);
            return Number.isNaN(num) ? String(val) : fmt(num);
          },
        },
        tickAmount: 5,
      },
      yaxis: {
        labels: {
          style: { colors: token.voidTextHeading, fontSize: "11px", fontWeight: 600 },
        },
      },
      colors: items.map((i) => i.color),
      tooltip: {
        theme: token.isDark ? "dark" : "light",
        y: { formatter: (val) => `${fmt(val)} (${fmtPct(val, total)})` },
      },
      grid: { strokeDashArray: 3, xaxis: { lines: { show: true } } },
      legend: { show: false },
    }),
    [items, total, token]
  );

  return (
    <Card
      size="small"
      loading={loading}
      title={<Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>{title}</Text>}
      style={{ background: token.glassBg, borderColor: token.glassBorder, borderRadius: token.voidRadius, boxShadow: token.voidShadow, height: "100%", backdropFilter: "blur(10px)" }}
      bodyStyle={{ padding: 12 }}
    >
      {isEmpty ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin datos" />
      ) : (
        <ReactApexChart options={options} series={series} type="bar" height={Math.max(200, items.length * (isMobile ? 32 : 42) + 70)} />
      )}
    </Card>
  );
};

const RankingTable = ({ data, total, loading, color }) => {
  const columns = [
    { title: "Item", dataIndex: "name", key: "name", render: (name) => <Text strong style={{ fontSize: 12 }}>{name}</Text> },
    { title: "Cantidad", dataIndex: "value", key: "value", width: 90, align: "right", render: (value) => <Text style={{ fontSize: 12 }}>{fmt(value)}</Text> },
    {
      title: "%",
      key: "pct",
      width: 120,
      render: (_, record) => (
        <Flex align="center" gap={8}>
          <Progress percent={total ? Number(((record.value / total) * 100).toFixed(1)) : 0} size="small" strokeColor={record.color || color} showInfo={false} style={{ width: 60 }} />
          <Text style={{ fontSize: 11 }}>{fmtPct(record.value, total)}</Text>
        </Flex>
      ),
    },
  ];

  return <Table size="small" rowKey={(record) => record.userId ?? record.name} columns={columns} dataSource={data} pagination={false} loading={loading} locale={{ emptyText: "Sin datos" }} />;
};

const PersonRankingCard = ({ title, data, total, loading, color, icon, token }) => (
  <Card
    size="small"
    title={
      <Flex align="center" gap={8}>
        <span style={{ color }}>{icon}</span>
        <Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>{title}</Text>
        <Tag>{fmt(total)}</Tag>
      </Flex>
    }
    style={{
      background: token.glassBg,
      borderColor: token.glassBorder,
      borderRadius: token.voidRadius,
      boxShadow: token.voidShadow,
      height: "100%",
      backdropFilter: "blur(10px)",
    }}
  >
    <RankingTable data={data} total={total} loading={loading} color={color} />
  </Card>
);

const SupportIndicatorsPage = () => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const { filters, setFilter, resetFilters } = useAdminStore();
  const {
    stats,
    meta,
    realTickets,
    distributionByOrigin,
    workOrderStats,
    realCount,
    realOpenCount,
    overdueSlaTickets,
    overdueResponseTickets,
    overdueComplianceTickets,
    loading,
    refresh,
  } = useTicketIndicators({ autoLoad: false });
  const {
    byResolved,
    byAssigned,
    byCreated,
    bySlaResolutionOverdue,
    bySlaResponseOverdue,
    loading: rankingLoading,
    refresh: refreshRanking,
  } = useTicketRanking({ autoLoad: false });
  const { categories, fetchCategories } = useTicketCategories({ autoLoad: false });
  const {
    users,
    categories: drawerCategories,
    fetchUsers,
    fetchCategories: fetchDrawerCategories,
  } = useTicketCatalogs({ autoLoad: false });
  const {
    changeStatus,
    updateTicket,
    deleteTicket,
    createComment,
    uploadAttachment,
    getTicketById,
    getComments,
    getAttachments,
    assignTicket,
    confirmScheduledDate,
    cancelScheduledDate,
  } = useTickets({ autoLoad: false });

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [changingStatusId, setChangingStatusId] = useState(null);

  const buildQueryParams = useCallback(() => {
    const params = {};
    if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
      params.created_at__gte = filters.dateRange[0].format("YYYY-MM-DD");
      params.created_at__lte = filters.dateRange[1].format("YYYY-MM-DD");
    }
    return params;
  }, [filters]);

  useEffect(() => {
    refresh(buildQueryParams());
    refreshRanking(buildQueryParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    fetchUsers();
    fetchDrawerCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(() => {
    refresh(buildQueryParams());
    refreshRanking(buildQueryParams());
    fetchCategories();
  }, [refresh, refreshRanking, buildQueryParams, fetchCategories]);

  const categoryTypeMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.category_type;
    });
    return map;
  }, [categories]);

  const total = stats?.total || 0;
  const complianceStats = useMemo(() => getComplianceStats(stats), [stats]);

  const activeDistribution = useMemo(
    () => ({
      status: distributionByOrigin.real.status,
      priority: distributionByOrigin.real.priority,
      categoryType: distributionByOrigin.real.categoryType,
    }),
    [distributionByOrigin]
  );

  const statusItems = useMemo(() => {
    const data = activeDistribution.status;
    return Object.values(TICKET_STATUS)
      .map((s) => ({ name: s.label, value: data[s.value] || 0, color: getStatusColor(s.value, token) }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [activeDistribution, token]);

  const categoryTypeItems = useMemo(() => {
    const data = activeDistribution.categoryType;
    const hasData = Object.keys(data || {}).length > 0;

    let grouped = {};
    if (hasData) {
      Object.entries(data).forEach(([type, count]) => {
        grouped[type] = count;
      });
    } else if (realTickets.length > 0 && categories.length > 0) {
      grouped = {};
      realTickets.forEach((t) => {
        const type = t.category_type || categoryTypeMap[t.category] || "SOFTWARE";
        grouped[type] = (grouped[type] || 0) + 1;
      });
    }

    return Object.values(TICKET_CATEGORY)
      .map((c) => ({ name: c.label, value: grouped[c.value] || 0, color: resolveVoidColor(c.borderColor, token) }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [activeDistribution, categories, categoryTypeMap, realTickets, token]);

  const priorityItems = useMemo(() => {
    const data = activeDistribution.priority;
    return Object.values(TICKET_PRIORITY)
      .map((p) => ({ name: p.label, value: data[p.value] || 0, color: resolveVoidColor(p.borderColor, token) }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [activeDistribution, token]);

  const handleViewTicket = useCallback((ticket) => {
    setSelectedTicketId(ticket.id);
    setDetailOpen(true);
  }, []);

  const handleChangeStatus = useCallback(
    async (ticketId, status) => {
      await changeStatus(ticketId, status);
      refresh(buildQueryParams());
    },
    [changeStatus, refresh, buildQueryParams]
  );

  const handleQuickStatusChange = useCallback(
    async (ticket, status) => {
      setChangingStatusId(ticket.id);
      try {
        await changeStatus(ticket.id, status);
        refresh(buildQueryParams());
      } finally {
        setChangingStatusId(null);
      }
    },
    [changeStatus, refresh, buildQueryParams]
  );

  const handleUpdateTicket = useCallback(
    async (id, data) => {
      await updateTicket(id, data);
      refresh(buildQueryParams());
    },
    [updateTicket, refresh, buildQueryParams]
  );

  const handleDeleteTicket = useCallback(
    async (id) => {
      await deleteTicket(id);
      refresh(buildQueryParams());
    },
    [deleteTicket, refresh, buildQueryParams]
  );

  const handleAssignTicket = useCallback(
    async (id, assignedTo) => {
      await assignTicket(id, assignedTo);
      refresh(buildQueryParams());
    },
    [assignTicket, refresh, buildQueryParams]
  );

  const handleConfirmScheduledDate = useCallback(
    async (id) => {
      await confirmScheduledDate(id);
      refresh(buildQueryParams());
    },
    [confirmScheduledDate, refresh, buildQueryParams]
  );

  const handleCancelScheduledDate = useCallback(
    async (id, reason) => {
      await cancelScheduledDate(id, reason);
      refresh(buildQueryParams());
    },
    [cancelScheduledDate, refresh, buildQueryParams]
  );

  const buildRankingItems = useCallback(
    (list, color) =>
      (list || [])
        .map((item) => ({ name: item.name, value: Number(item.total) || 0, color, userId: item.user_id }))
        .sort((a, b) => b.value - a.value),
    []
  );

  const resolvedRankingItems = useMemo(() => buildRankingItems(byResolved, token.colorSuccess), [byResolved, buildRankingItems, token]);
  const assignedRankingItems = useMemo(() => buildRankingItems(byAssigned, token.colorCorporateBlue), [byAssigned, buildRankingItems, token]);
  const createdRankingItems = useMemo(() => buildRankingItems(byCreated, token.colorAccent), [byCreated, buildRankingItems, token]);
  const slaResolutionOverdueRankingItems = useMemo(() => buildRankingItems(bySlaResolutionOverdue, token.colorError), [bySlaResolutionOverdue, buildRankingItems, token]);
  const slaResponseOverdueRankingItems = useMemo(() => buildRankingItems(bySlaResponseOverdue, token.colorWarning), [bySlaResponseOverdue, buildRankingItems, token]);

  const resolvedRankingTotal = useMemo(() => resolvedRankingItems.reduce((s, i) => s + i.value, 0), [resolvedRankingItems]);
  const assignedRankingTotal = useMemo(() => assignedRankingItems.reduce((s, i) => s + i.value, 0), [assignedRankingItems]);
  const createdRankingTotal = useMemo(() => createdRankingItems.reduce((s, i) => s + i.value, 0), [createdRankingItems]);
  const slaResolutionOverdueRankingTotal = useMemo(() => slaResolutionOverdueRankingItems.reduce((s, i) => s + i.value, 0), [slaResolutionOverdueRankingItems]);
  const slaResponseOverdueRankingTotal = useMemo(() => slaResponseOverdueRankingItems.reduce((s, i) => s + i.value, 0), [slaResponseOverdueRankingItems]);

  const appliedRangeLabel = useMemo(() => {
    if (meta?.filters_applied) {
      const fa = meta.filters_applied;
      if (typeof fa === "string") return fa;
      if (typeof fa === "object") {
        const gte = fa.created_at__gte || fa.created_from;
        const lte = fa.created_at__lte || fa.created_to;
        if (gte && lte) return `${gte} → ${lte}`;
        if (gte) return `Desde ${gte}`;
        if (lte) return `Hasta ${lte}`;
      }
    }
    if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
      return `${filters.dateRange[0].format("DD MMM YYYY")} → ${filters.dateRange[1].format("DD MMM YYYY")}`;
    }
    return null;
  }, [meta, filters.dateRange]);

  const handleMonthChange = useCallback(
    (date) => {
      if (!date) {
        setFilter("dateRange", [null, null]);
        return;
      }
      setFilter("dateRange", [date.startOf("month"), date.endOf("month")]);
    },
    [setFilter]
  );

  const kpis = [
    {
      icon: <UserOutlined />,
      label: "Tickets",
      value: realCount,
      color: token.voidTextHeading,
      pct: total ? (realCount / total) * 100 : 0,
      pctOf: total,
      tooltip: "Tickets de soporte (CLIENTE) en el rango",
    },
    {
      icon: <ExclamationCircleOutlined />,
      label: "Nuevos",
      value: realOpenCount,
      color: realOpenCount > 50 ? token.colorError : realOpenCount > 20 ? token.colorWarning : token.voidText,
      pct: realCount ? (realOpenCount / realCount) * 100 : 0,
      pctOf: realCount,
      tooltip: "Tickets con status=ABIERTO en el rango",
    },
    {
      icon: <WarningOutlined />,
      label: "SLA resolución vencido",
      value: overdueSlaTickets.length,
      color: token.colorError,
      pct: realCount ? (overdueSlaTickets.length / realCount) * 100 : 0,
      pctOf: realCount,
      tooltip: "Cierre vencido: deadline < hoy, sin resolver, estado abierto",
    },
    {
      icon: <ClockCircleOutlined />,
      label: "SLA respuesta vencido",
      value: overdueResponseTickets.length,
      color: token.colorError,
      pct: realCount ? (overdueResponseTickets.length / realCount) * 100 : 0,
      pctOf: realCount,
      tooltip: "Primera respuesta vencida",
    },
    {
      icon: <FireOutlined />,
      label: "Cumplimiento vencido",
      value: complianceStats.overdueResolution,
      color: token.colorError,
      pct: complianceStats.total ? (complianceStats.overdueResolution / complianceStats.total) * 100 : 0,
      pctOf: complianceStats.total,
      tooltip: "Cumplimiento vencido (DGA/SMA)",
    },
    {
      icon: <ToolOutlined />,
      label: "OT totales",
      value: workOrderStats.total,
      color: token.colorAccent,
      tooltip: "OTs (WORK_ORDER) en el rango",
    },
    {
      icon: <CarOutlined />,
      label: "OT con visita",
      value: workOrderStats.withVisit,
      color: token.colorSuccess,
      pct: workOrderStats.total ? (workOrderStats.withVisit / workOrderStats.total) * 100 : 0,
      pctOf: workOrderStats.total,
      tooltip: "OTs con visita confirmada",
    },
  ];

  const overdueColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 90,
      render: (id, record) => (
        <Text
          type="secondary"
          style={{ cursor: "pointer", color: token.colorCorporateBlueMid }}
          onClick={() => handleViewTicket(record)}
        >
          #{id}
        </Text>
      ),
    },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <Tooltip title={title || `Ticket #${record.id}`}>
          <Text
            strong
            style={{ color: token.voidTextHeading, cursor: "pointer" }}
            onClick={() => handleViewTicket(record)}
          >
            {title || `Ticket #${record.id}`}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Prioridad",
      dataIndex: "priority",
      key: "priority",
      width: 110,
      render: (priority) => {
        const config = getTicketPriorityConfig(priority);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    { title: "Estado", dataIndex: "status", key: "status", width: 130, render: (status) => <Tag>{getTicketStatusLabel(status)}</Tag> },
    { title: "Límite resolución", dataIndex: "sla_deadline_resolution", key: "sla_deadline_resolution", width: 170, render: (value) => <Text style={{ fontSize: 12 }}>{formatDeadline(value)}</Text> },
    {
      title: "Días atraso",
      key: "overdueDays",
      width: 100,
      align: "center",
      render: (_, record) => {
        const days = record.overdue_days != null ? Number(record.overdue_days) : getOverdueDays(record.sla_deadline_resolution);
        if (days == null) return <Text type="secondary">—</Text>;
        return <Tag color={days > 3 ? "red" : days > 1 ? "orange" : "gold"}>{days}d</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 230,
      render: (_, record) => (
        <Space size={4} wrap>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewTicket(record)}>
            Ver
          </Button>
          <Select
            size="small"
            placeholder="Cambiar estado"
            loading={changingStatusId === record.id}
            value={undefined}
            style={{ minWidth: 140 }}
            onChange={(status) => handleQuickStatusChange(record, status)}
            options={STATUS_OPTIONS}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: token.voidBg, minHeight: "100%" }}>
      <Card
        style={{
          background: token.glassBg,
          borderColor: token.glassBorder,
          borderRadius: token.voidRadius,
          boxShadow: token.voidShadow,
          marginBottom: 24,
          backdropFilter: "blur(10px)",
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Flex justify="space-between" align={isMobile ? "flex-start" : "center"} wrap="wrap" gap={16} vertical={isMobile}>
          <div>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: token.voidTextHeading }}>Métricas SLA — Indicadores</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Panel de gestión de tickets y cumplimiento</Text>
            {appliedRangeLabel && (
              <Flex align="center" gap={6} style={{ marginTop: 4 }}>
                <ClockCircleOutlined style={{ fontSize: 12, color: token.voidTextMuted }} />
                <Text style={{ fontSize: 12, color: token.colorCorporateBlueMid }}>Rango aplicado: {appliedRangeLabel}</Text>
              </Flex>
            )}
          </div>
          <Flex gap={12} align="center" wrap style={{ width: isMobile ? "100%" : "auto" }}>
            <FilterOutlined style={{ color: token.voidTextMuted, display: isMobile ? "none" : "inline" }} />
            <DatePicker
              picker="month"
              value={filters.dateRange?.[0] || null}
              onChange={handleMonthChange}
              format="MMMM YYYY"
              style={{ minWidth: 180, width: isMobile ? "100%" : "auto" }}
            />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} style={{ width: isMobile ? "100%" : "auto" }}>Actualizar</Button>
            <Button onClick={resetFilters} style={{ width: isMobile ? "100%" : "auto" }}>Limpiar</Button>
          </Flex>
        </Flex>
      </Card>

      <Tabs
        defaultActiveKey="area"
        items={[
          {
            key: "area",
            label: "Gestión",
            children: (
              <>
                <Text strong style={{ fontSize: 14, color: token.voidTextHeading, display: "block", marginBottom: 12 }}>Indicadores principales</Text>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  {kpis.slice(0, 4).map((kpi, idx) => (
                    <Col key={idx} xs={12} md={12} lg={6}>
                      <KpiCard kpi={kpi} token={token} />
                    </Col>
                  ))}
      </Row>

      <Text strong style={{ fontSize: 14, color: token.voidTextHeading, display: "block", marginBottom: 12 }}>Órdenes de trabajo</Text>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.slice(4).map((kpi, idx) => (
          <Col key={idx} xs={12} md={12} lg={8}>
            <KpiCard kpi={kpi} token={token} />
          </Col>
        ))}
      </Row>

      <Text strong style={{ fontSize: 14, color: token.colorError, display: "block", marginBottom: 12 }}>
        <WarningOutlined /> SLA vencidos — atacar primero
      </Text>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <div
            style={{
              background: token.glassBg,
              borderRadius: token.voidRadius,
              boxShadow: token.voidShadow,
              padding: 16,
              border: `1px solid ${token.colorError}40`,
              backdropFilter: "blur(10px)",
              height: "100%",
            }}
          >
            <Flex align="center" justify="space-between" wrap="wrap" gap={12} style={{ marginBottom: 12 }}>
              <Flex align="center" gap={8}>
                <WarningOutlined style={{ color: token.colorError }} />
                <Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>Cierres vencidos ({overdueSlaTickets.length})</Text>
                <Tag color="error">{overdueSlaTickets.length} tickets</Tag>
              </Flex>
              <Button
                size="small"
                icon={<LinkOutlined />}
                onClick={() => navigate("/admin/support/tickets")}
                disabled={overdueSlaTickets.length === 0}
              >
                Ver todos en el listado
              </Button>
            </Flex>
            <Table
              size="small"
              rowKey="id"
              columns={overdueColumns}
              dataSource={overdueSlaTickets}
              pagination={false}
              loading={loading}
              locale={{ emptyText: "No hay tickets con SLA de resolución vencido" }}
              scroll={{ x: "max-content" }}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div
            style={{
              background: token.glassBg,
              borderRadius: token.voidRadius,
              boxShadow: token.voidShadow,
              padding: 16,
              border: `1px solid ${token.colorError}40`,
              backdropFilter: "blur(10px)",
              height: "100%",
            }}
          >
            <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
              <ClockCircleOutlined style={{ color: token.colorError }} />
              <Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>Respuesta vencida ({overdueResponseTickets.length})</Text>
              {overdueResponseTickets.length > 0 && <Tag color="error">{overdueResponseTickets.length} tickets</Tag>}
            </Flex>
            <Table
              size="small"
              rowKey="id"
              columns={overdueColumns}
              dataSource={overdueResponseTickets}
              pagination={false}
              loading={loading}
              locale={{ emptyText: "No hay tickets con SLA de respuesta vencido" }}
              scroll={{ x: "max-content" }}
            />
          </div>
        </Col>
      </Row>

      <Text strong style={{ fontSize: 14, color: token.voidTextHeading, display: "block", marginBottom: 12 }}>Distribución</Text>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <HorizontalBarChart title="Tickets por estado" items={statusItems} total={statusItems.reduce((s, i) => s + i.value, 0) || 1} loading={loading} token={token} />
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" loading={loading} title={<Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>Ranking por estado</Text>} style={{ background: token.glassBg, borderColor: token.glassBorder, borderRadius: token.voidRadius, boxShadow: token.voidShadow, height: "100%", backdropFilter: "blur(10px)" }}>
            <RankingTable data={statusItems} total={statusItems.reduce((s, i) => s + i.value, 0) || 1} loading={loading} color={token.voidTextHeading} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <HorizontalBarChart title="Tickets por tipo de categoría" items={categoryTypeItems} total={categoryTypeItems.reduce((s, i) => s + i.value, 0) || 1} loading={loading} token={token} />
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" loading={loading} title={<Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>Ranking por tipo</Text>} style={{ background: token.glassBg, borderColor: token.glassBorder, borderRadius: token.voidRadius, boxShadow: token.voidShadow, height: "100%", backdropFilter: "blur(10px)" }}>
            <RankingTable data={categoryTypeItems} total={categoryTypeItems.reduce((s, i) => s + i.value, 0) || 1} loading={loading} color={token.colorAccent} />
          </Card>
        </Col>

        <Col xs={24} lg={24}>
          <HorizontalBarChart title="Tickets por prioridad" items={priorityItems} total={priorityItems.reduce((s, i) => s + i.value, 0) || 1} loading={loading} token={token} />
        </Col>
      </Row>
              </>
            ),
          },
          {
            key: "personal",
            label: "Colaboradores",
            children: (
              <>
                <Text strong style={{ fontSize: 14, color: token.voidTextHeading, display: "block", marginBottom: 12 }}>Ranking de tickets de soporte (CLIENTE)</Text>
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={8}>
                    <PersonRankingCard
                      title="Resueltos"
                      data={resolvedRankingItems}
                      total={resolvedRankingTotal}
                      loading={rankingLoading}
                      color={token.colorSuccess}
                      icon={<CheckCircleOutlined />}
                      token={token}
                    />
                  </Col>
                  <Col xs={24} lg={8}>
                    <PersonRankingCard
                      title="Asignados"
                      data={assignedRankingItems}
                      total={assignedRankingTotal}
                      loading={rankingLoading}
                      color={token.colorCorporateBlue}
                      icon={<UserOutlined />}
                      token={token}
                    />
                  </Col>
                  <Col xs={24} lg={8}>
                    <PersonRankingCard
                      title="Creados"
                      data={createdRankingItems}
                      total={createdRankingTotal}
                      loading={rankingLoading}
                      color={token.colorAccent}
                      icon={<PlusOutlined />}
                      token={token}
                    />
                  </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} lg={12}>
                    <PersonRankingCard
                      title="SLA resolución vencido"
                      data={slaResolutionOverdueRankingItems}
                      total={slaResolutionOverdueRankingTotal}
                      loading={rankingLoading}
                      color={token.colorError}
                      icon={<WarningOutlined />}
                      token={token}
                    />
                  </Col>
                  <Col xs={24} lg={12}>
                    <PersonRankingCard
                      title="SLA respuesta vencido"
                      data={slaResponseOverdueRankingItems}
                      total={slaResponseOverdueRankingTotal}
                      loading={rankingLoading}
                      color={token.colorWarning}
                      icon={<ClockCircleOutlined />}
                      token={token}
                    />
                  </Col>
                </Row>
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 12 }}>
                  Cada lista es independiente y ordenada por total desc: una misma persona puede aparecer en varias listas. Los SLA vencidos sin asignar quedan en la tabla del dashboard, no en el ranking.
                </Text>
              </>
            ),
          },
        ]}
      />

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        users={users}
        categories={drawerCategories}
        onChangeStatus={handleChangeStatus}
        onAssign={handleAssignTicket}
        onUpdateTicket={handleUpdateTicket}
        onDelete={handleDeleteTicket}
        onCreateComment={createComment}
        onUploadAttachment={uploadAttachment}
        onConfirmScheduledDate={handleConfirmScheduledDate}
        onCancelScheduledDate={handleCancelScheduledDate}
        getTicketById={getTicketById}
        getComments={getComments}
        getAttachments={getAttachments}
      />
    </div>
  );
};

function getStatusColor(status, token) {
  switch (String(status).toUpperCase()) {
    case "RESUELTO":
    case "CERRADO": return token.colorSuccess;
    case "ABIERTO":
    case "EN_ANALISIS":
    case "ESPERA_CLIENTE":
    case "ESPERA_PROVEEDOR": return token.colorWarning;
    case "EN_ORDEN_TRABAJO": return token.colorError;
    case "CANCELADO": return token.voidTextMuted;
    default: return token.voidTextHeading;
  }
}

const resolveVoidColor = (value, token) =>
  typeof value === "string" && value.startsWith("var(") ? token.voidTextHeading : value;

export default SupportIndicatorsPage;
