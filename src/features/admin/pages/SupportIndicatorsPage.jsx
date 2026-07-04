import React, { useMemo, useEffect, useCallback } from "react";
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
} from "@ant-design/icons";
import { differenceInHours, parseISO, isValid, format } from "date-fns";
import { es } from "date-fns/locale";
import ReactApexChart from "react-apexcharts";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTicketIndicators } from "../hooks/useTicketIndicators";
import { useTicketCategories } from "../hooks/useTicketCategories";
import { useAdminStore } from "../stores/adminStore";
import {
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CATEGORY,
  TICKET_ORIGIN,
  getTicketPriorityConfig,
  getTicketStatusLabel,
} from "../constants/tickets";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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
        <Text type="secondary" style={{ fontSize: 12, display: "block", lineHeight: 1.3 }}>{kpi.label}</Text>
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

  const series = useMemo(() => [{ data: items.map((i) => i.value) }], [items]);

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

const DonutChart = ({ title, items, loading, total, token }) => {
  const { isMobile } = useResponsive();
  const isEmpty = items.length === 0;
  const series = useMemo(() => items.map((i) => i.value), [items]);

  const options = useMemo(
    () => ({
      chart: { type: "donut", toolbar: { show: false }, background: "transparent", fontFamily: token.fontFamily },
      theme: { mode: token.isDark ? "dark" : "light" },
      labels: items.map((i) => i.name),
      colors: items.map((i) => i.color),
      dataLabels: {
        enabled: true,
        formatter: (val, opts) => {
          const value = opts.w.config.series[opts.seriesIndex];
          return `${fmt(value)}\n${val.toFixed(1)}%`;
        },
        style: { fontSize: "10px" },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "55%",
            labels: {
              show: true,
              name: { fontSize: "12px", color: token.voidTextMuted },
              value: { fontSize: "18px", fontWeight: 700, color: token.voidTextHeading },
              total: { show: true, label: "Total", formatter: () => fmt(total), color: token.voidTextMuted },
            },
          },
        },
      },
      legend: {
        position: "bottom",
        fontSize: "11px",
        labels: { colors: token.voidTextHeading },
        formatter: (label, opts) => {
          const value = opts.w.globals.series[opts.seriesIndex];
          return `${label}: ${fmt(value)} (${fmtPct(value, total)})`;
        },
      },
      tooltip: { theme: token.isDark ? "dark" : "light", y: { formatter: (val) => `${fmt(val)} (${fmtPct(val, total)})` } },
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
      {isEmpty ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin datos" /> : <ReactApexChart options={options} series={series} type="donut" height={isMobile ? 220 : 260} />}
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

  return <Table size="small" rowKey="name" columns={columns} dataSource={data} pagination={false} loading={loading} locale={{ emptyText: "Sin datos" }} />;
};

const SupportIndicatorsPage = () => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const { filters, setFilter, resetFilters } = useAdminStore();
  const {
    stats,
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
  const { categories, fetchCategories } = useTicketCategories({ autoLoad: false });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(() => {
    refresh(buildQueryParams());
    fetchCategories();
  }, [refresh, buildQueryParams, fetchCategories]);

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

  const originItems = useMemo(() => {
    const byOrigin = stats?.by_origin || {};
    return Object.values(TICKET_ORIGIN)
      .map((o) => ({
        name: o.label,
        value: Math.max(0, Number(byOrigin[o.value]) || 0),
        color: o.value === "CLIENTE" ? token.voidTextHeading : token.colorSuccess,
      }))
      .filter((i) => i.value > 0);
  }, [stats, token]);

  const complianceItems = useMemo(() => {
    const { byStatus } = complianceStats;
    const hasBackendData = Object.keys(byStatus).length > 0;
    let grouped = {};
    if (hasBackendData) {
      Object.entries(byStatus).forEach(([status, count]) => {
        grouped[status] = count;
      });
    } else {
      overdueComplianceTickets.forEach((t) => {
        const status = t.status || "ABIERTO";
        grouped[status] = (grouped[status] || 0) + 1;
      });
    }
    return Object.values(TICKET_STATUS)
      .map((s) => ({ name: s.label, value: grouped[s.value] || 0, color: getStatusColor(s.value, token) }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [complianceStats, overdueComplianceTickets, token]);

  const kpis = [
    {
      icon: <UserOutlined />,
      label: "Tickets",
      value: realCount,
      color: token.voidTextHeading,
      pct: total ? (realCount / total) * 100 : 0,
      pctOf: total,
    },
    {
      icon: <ExclamationCircleOutlined />,
      label: "Nuevos",
      value: realOpenCount,
      color: realOpenCount > 50 ? token.colorError : realOpenCount > 20 ? token.colorWarning : token.voidText,
      pct: realCount ? (realOpenCount / realCount) * 100 : 0,
      pctOf: realCount,
    },
    {
      icon: <WarningOutlined />,
      label: "SLA resolución vencido",
      value: overdueSlaTickets.length,
      color: token.colorError,
      pct: realCount ? (overdueSlaTickets.length / realCount) * 100 : 0,
      pctOf: realCount,
    },
    {
      icon: <ClockCircleOutlined />,
      label: "SLA respuesta vencido",
      value: overdueResponseTickets.length,
      color: token.colorError,
      pct: realCount ? (overdueResponseTickets.length / realCount) * 100 : 0,
      pctOf: realCount,
    },
    {
      icon: <FireOutlined />,
      label: "Cumplimiento vencido",
      value: complianceStats.overdueResolution,
      color: token.colorError,
      pct: complianceStats.total ? (complianceStats.overdueResolution / complianceStats.total) * 100 : 0,
      pctOf: complianceStats.total,
    },
    {
      icon: <ToolOutlined />,
      label: "OT totales",
      value: workOrderStats.total,
      color: token.colorAccent,
    },
    {
      icon: <CarOutlined />,
      label: "OT con visita",
      value: workOrderStats.withVisit,
      color: token.colorSuccess,
      pct: workOrderStats.total ? (workOrderStats.withVisit / workOrderStats.total) * 100 : 0,
      pctOf: workOrderStats.total,
    },
  ];

  const overdueColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, render: (id) => <Text type="secondary">#{id}</Text> },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <Tooltip title={title || `Ticket #${record.id}`}>
          <Text strong style={{ color: token.voidTextHeading }}>{title || `Ticket #${record.id}`}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Prioridad",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority) => {
        const config = getTicketPriorityConfig(priority);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    { title: "Estado", dataIndex: "status", key: "status", width: 140, render: (status) => <Tag>{getTicketStatusLabel(status)}</Tag> },
    { title: "Límite resolución", dataIndex: "sla_deadline_resolution", key: "sla_deadline_resolution", width: 180, render: (value) => <Text style={{ fontSize: 12 }}>{formatDeadline(value)}</Text> },
    {
      title: "Días atraso",
      key: "overdueDays",
      width: 110,
      align: "center",
      render: (_, record) => {
        const days = getOverdueDays(record.sla_deadline_resolution);
        if (days == null) return <Text type="secondary">—</Text>;
        return <Tag color={days > 3 ? "red" : days > 1 ? "orange" : "gold"}>{days}d</Tag>;
      },
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
          </div>
          <Flex gap={12} align="center" wrap style={{ width: isMobile ? "100%" : "auto" }}>
            <FilterOutlined style={{ color: token.voidTextMuted, display: isMobile ? "none" : "inline" }} />
            <RangePicker value={filters.dateRange || null} onChange={(dates) => setFilter("dateRange", dates)} style={{ minWidth: 240, width: isMobile ? "100%" : "auto" }} />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} style={{ width: isMobile ? "100%" : "auto" }}>Actualizar</Button>
            <Button onClick={resetFilters} style={{ width: isMobile ? "100%" : "auto" }}>Limpiar</Button>
          </Flex>
        </Flex>
      </Card>

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

        <Col xs={24} lg={8}>
          <HorizontalBarChart title="Tickets por prioridad" items={priorityItems} total={priorityItems.reduce((s, i) => s + i.value, 0) || 1} loading={loading} token={token} />
        </Col>
        <Col xs={24} lg={8}>
          <DonutChart title="Origen de tickets" items={originItems} total={originItems.reduce((s, i) => s + i.value, 0) || 1} loading={loading} token={token} />
        </Col>
        <Col xs={24} lg={8}>
          <HorizontalBarChart title="Cumplimiento por estado" items={complianceItems} total={complianceItems.reduce((s, i) => s + i.value, 0) || 1} loading={loading} token={token} />
        </Col>
      </Row>

      <Text strong style={{ fontSize: 14, color: token.voidTextHeading, display: "block", marginBottom: 12 }}>Tickets críticos</Text>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <div style={{ background: token.glassBg, borderRadius: token.voidRadius, boxShadow: token.voidShadow, padding: 16, border: `1px solid ${token.glassBorder}`, backdropFilter: "blur(10px)" }}>
            <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
              <WarningOutlined style={{ color: token.colorError }} />
              <Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>SLA de resolución vencidos</Text>
              {overdueSlaTickets.length > 0 && <Tag color="error">{overdueSlaTickets.length}</Tag>}
            </Flex>
            <Table size="small" rowKey="id" columns={overdueColumns} dataSource={overdueSlaTickets.slice(0, 10)} pagination={false} loading={loading} locale={{ emptyText: "No hay tickets reales con SLA de resolución vencido" }} scroll={{ x: "max-content" }} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={{ background: token.glassBg, borderRadius: token.voidRadius, boxShadow: token.voidShadow, padding: 16, border: `1px solid ${token.glassBorder}`, backdropFilter: "blur(10px)" }}>
            <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
              <FireOutlined style={{ color: token.colorError }} />
              <Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>Cumplimiento con SLA vencido</Text>
              {overdueComplianceTickets.length > 0 && <Tag color="error">{overdueComplianceTickets.length}</Tag>}
            </Flex>
            <Table size="small" rowKey="id" columns={overdueColumns} dataSource={overdueComplianceTickets.slice(0, 10)} pagination={false} loading={loading} locale={{ emptyText: "No hay tickets de cumplimiento con SLA vencido" }} scroll={{ x: "max-content" }} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

function getStatusColor(status, token) {
  switch (String(status).toUpperCase()) {
    case "ABIERTO": return token.colorWarning;
    case "EN_ANALISIS": return token.voidTextMuted;
    case "EN_ORDEN_TRABAJO": return token.colorAccent;
    case "ESPERA_CLIENTE":
    case "ESPERA_PROVEEDOR": return token.voidTextMuted;
    case "RESUELTO":
    case "CERRADO": return token.colorSuccess;
    case "CANCELADO": return token.colorError;
    default: return token.voidTextHeading;
  }
}

const resolveVoidColor = (value, token) =>
  typeof value === "string" && value.startsWith("var(") ? token.voidTextHeading : value;

export default SupportIndicatorsPage;
