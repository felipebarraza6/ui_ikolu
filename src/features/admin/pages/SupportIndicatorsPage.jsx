import React, { useMemo, useEffect, useCallback } from "react";
import { Row, Col, Card, Flex, Typography, Empty, Statistic, DatePicker, Button } from "antd";
import {
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import ReactApexChart from "react-apexcharts";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useTickets } from "../hooks/useTickets";
import { useAdminStore } from "../stores/adminStore";
import {
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CATEGORY,
  TICKET_ORIGIN,
  getTicketStatusLabel,
} from "../constants/tickets";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const fmt = (value) => (value == null ? 0 : Number(value).toLocaleString("es-CL"));

/**
 * Página de indicadores de Soporte.
 *
 * Muestra todos los desgloses que entrega /api/ik/tickets/stats/:
 * estados, prioridades, categorías, orígenes y SLA vencidos.
 */
const SupportIndicatorsPage = () => {
  const token = useIkoluToken();
  const { filters, setFilter, resetFilters } = useAdminStore();
  const { tickets, stats, loading, refresh } = useTickets({ autoLoad: false });

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

  const handleRefresh = useCallback(() => {
    refresh(buildQueryParams());
  }, [refresh, buildQueryParams]);

  const byStatus = stats?.by_status || {};
  const byPriority = stats?.by_priority || {};
  const byCategory = stats?.by_category || {};
  const byOrigin = stats?.by_origin || {};

  const baseChartOptions = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        animations: { enabled: true },
        background: "transparent",
        fontFamily: token.fontFamily,
      },
      theme: { mode: token.isDark ? "dark" : "light" },
      dataLabels: { enabled: false },
      grid: { show: false },
      xaxis: {
        labels: { style: { colors: token.colorTextSecondary, fontSize: "10px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: token.colorTextSecondary, fontSize: "10px" } },
      },
      tooltip: {
        theme: token.isDark ? "dark" : "light",
        y: { formatter: (val) => fmt(val) },
      },
      legend: { show: false },
    }),
    [token]
  );

  const statusChart = useMemo(() => {
    const items = Object.values(TICKET_STATUS)
      .map((s) => ({ name: s.label, value: byStatus[s.value] || 0 }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      series: [{ data: items.map((i) => i.value) }],
      options: {
        ...baseChartOptions,
        colors: [token.colorPrimary],
        xaxis: { ...baseChartOptions.xaxis, categories: items.map((i) => i.name) },
      },
    };
  }, [byStatus, baseChartOptions, token.colorPrimary]);

  const priorityChart = useMemo(() => {
    const items = Object.values(TICKET_PRIORITY)
      .map((p) => ({ name: p.label, value: byPriority[p.value] || 0 }))
      .filter((i) => i.value > 0);

    return {
      series: items.map((i) => i.value),
      options: {
        ...baseChartOptions,
        labels: items.map((i) => i.name),
        colors: [token.colorError, token.colorWarning, token.colorInfo, token.colorSuccess],
        plotOptions: {
          pie: { donut: { size: "60%", labels: { show: false } } },
        },
      },
    };
  }, [byPriority, baseChartOptions, token]);

  const categoryChart = useMemo(() => {
    const items = Object.values(TICKET_CATEGORY)
      .map((c) => ({ name: c.label, value: byCategory[c.value] || 0 }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      series: [{ data: items.map((i) => i.value) }],
      options: {
        ...baseChartOptions,
        colors: [token.colorAccent],
        xaxis: { ...baseChartOptions.xaxis, categories: items.map((i) => i.name) },
      },
    };
  }, [byCategory, baseChartOptions, token.colorAccent]);

  const originChart = useMemo(() => {
    const items = Object.values(TICKET_ORIGIN)
      .map((o) => ({ name: o.label, value: byOrigin[o.value] || 0 }))
      .filter((i) => i.value > 0);

    return {
      series: items.map((i) => i.value),
      options: {
        ...baseChartOptions,
        labels: items.map((i) => i.name),
        colors: [token.colorInfo, token.colorSuccess],
        plotOptions: {
          pie: { donut: { size: "60%", labels: { show: false } } },
        },
      },
    };
  }, [byOrigin, baseChartOptions, token]);

  const renderChartCard = (title, chart, type = "bar") => {
    const isEmpty =
      chart.series.length === 0 ||
      (Array.isArray(chart.series[0]?.data)
        ? chart.series[0].data.length === 0
        : chart.series.length === 0);

    return (
      <Card
        size="small"
        loading={loading}
        title={<Text strong style={{ fontSize: 14, color: token.colorTextHeading }}>{title}</Text>}
        style={{
          background: token.colorBgContainer,
          borderColor: token.colorBorder,
          height: "100%",
        }}
        bodyStyle={{ padding: 12 }}
      >
        {isEmpty ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin datos" />
        ) : (
          <ReactApexChart options={chart.options} series={chart.series} type={type} height={240} />
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
          SLA — Indicadores
        </Title>
        <Flex gap={12} align="center">
          <FilterOutlined style={{ color: token.colorTextSecondary }} />
          <RangePicker
            value={filters.dateRange || null}
            onChange={(dates) => setFilter("dateRange", dates)}
            style={{ minWidth: 240 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Actualizar
          </Button>
          <Button onClick={resetFilters}>Limpiar</Button>
        </Flex>
      </Flex>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card size="small" style={{ background: token.colorBgContainer, borderColor: token.colorBorder }}>
            <Statistic
              title={<Text style={{ color: token.colorTextSecondary }}>Total Tickets</Text>}
              value={stats?.total || 0}
              formatter={(value) => fmt(value)}
              valueStyle={{ color: token.colorPrimary, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ background: token.colorBgContainer, borderColor: token.colorBorder }}>
            <Statistic
              title={<Text style={{ color: token.colorTextSecondary }}>SLA Resolución Vencida</Text>}
              value={stats?.sla_overdue_resolution || 0}
              formatter={(value) => fmt(value)}
              valueStyle={{ color: token.colorError, fontWeight: 700 }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ background: token.colorBgContainer, borderColor: token.colorBorder }}>
            <Statistic
              title={<Text style={{ color: token.colorTextSecondary }}>SLA Respuesta Vencida</Text>}
              value={stats?.sla_overdue_response || 0}
              formatter={(value) => fmt(value)}
              valueStyle={{ color: token.colorWarning, fontWeight: 700 }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ background: token.colorBgContainer, borderColor: token.colorBorder }}>
            <Statistic
              title={<Text style={{ color: token.colorTextSecondary }}>Resueltos</Text>}
              value={(byStatus.RESUELTO || 0) + (byStatus.CERRADO || 0)}
              formatter={(value) => fmt(value)}
              valueStyle={{ color: token.colorSuccess, fontWeight: 700 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          {renderChartCard("Tickets por Estado", statusChart, "bar")}
        </Col>
        <Col xs={24} md={12} lg={6}>
          {renderChartCard("Tickets por Prioridad", priorityChart, "donut")}
        </Col>
        <Col xs={24} md={12} lg={6}>
          {renderChartCard("Tickets por Categoría", categoryChart, "bar")}
        </Col>
        <Col xs={24} md={12} lg={6}>
          {renderChartCard("Tickets por Origen", originChart, "donut")}
        </Col>
      </Row>
    </div>
  );
};

export default SupportIndicatorsPage;
