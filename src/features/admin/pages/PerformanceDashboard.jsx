import React, { useState, useCallback, useMemo } from "react";
import { Row, Col, Flex, Typography, Button, Segmented, Tooltip } from "antd";
import {
  BarChartOutlined,
  WifiOutlined,
  DisconnectOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  CloudServerOutlined,
  SyncOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { SmartKPICard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import useSystemStatus from "../hooks/useSystemStatus";
import SystemHealthPanel from "../components/SystemHealthPanel";
import DgaQueuePanel from "../components/DgaQueuePanel";
import PointsStatusTable from "../components/PointsStatusTable";
import EventLogTable from "../components/EventLogTable";
import PerformanceCharts from "../components/PerformanceCharts";
import DebugPanel from "../components/DebugPanel";
import { countPointStatuses } from "../utils/pointStatus";

const { Title, Text } = Typography;

const buildStatusParams = (status) => {
  // Según la documentación de la API, points_status solo acepta los filtros
  // booleanos `disconnected` y `active_telemetry`. El estado "Sin datos" no
  // tiene filtro de backend, por lo que se aplica localmente en la tabla.
  switch (status) {
    case "disconnected":
      return { disconnected: true };
    case "active":
      return { active_telemetry: true };
    case "no_data":
    default:
      return {};
  }
};

/**
 * Elimina valores vacíos/undefined/null de los query params para no enviarlos
 * al backend (evita errores como "Field 'id' expected a number but got 'undefined'").
 */
const cleanParams = (params) =>
  Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") return acc;
    acc[key] = value;
    return acc;
  }, {});

const PerformanceDashboard = () => {
  const token = useIkoluToken();
  const [filters, setFilters] = useState({ client: undefined, project: undefined, status: undefined });
  const [eventPage, setEventPage] = useState(1);
  const [range, setRange] = useState("24h");

  const {
    loading,
    refreshing,
    resources,
    pointsStatus,
    telemetryMetrics,
    dgaQueue,
    events,
    debug,
    refetch,
    refetchEvents,
  } = useSystemStatus();

  // telemetry_metrics solo acepta el parámetro `days` (sin soporte para horas).
  const rangeParams = useMemo(() => {
    switch (range) {
      case "1h":
        return { days: 1 };
      case "24h":
        return { days: 1 };
      case "7d":
        return { days: 7 };
      case "30d":
        return { days: 30 };
      default:
        return { days: 1 };
    }
  }, [range]);

  const getFetchParams = useCallback(() => {
    const { status, ...rest } = { ...rangeParams, ...filters };
    return cleanParams({ ...rest, ...buildStatusParams(status) });
  }, [rangeParams, filters]);

  const handleRefresh = useCallback(() => {
    refetch(getFetchParams(), eventPage);
  }, [refetch, getFetchParams, eventPage]);

  const handleFiltersChange = useCallback(
    (next) => {
      setFilters(next);
      const { status, ...rest } = { ...rangeParams, ...next };
      refetch(cleanParams({ ...rest, ...buildStatusParams(status) }), eventPage);
    },
    [refetch, rangeParams, eventPage]
  );

  const handleRangeChange = useCallback(
    (value) => {
      setRange(value);
      const days = value === "7d" ? 7 : value === "30d" ? 30 : 1;
      const nextParams = { ...filters, days };
      const { status, ...rest } = nextParams;
      refetch(cleanParams({ ...rest, ...buildStatusParams(status) }), eventPage);
    },
    [refetch, filters, eventPage]
  );

  const handleEventPageChange = useCallback(
    (page) => {
      setEventPage(page);
      refetchEvents(page);
    },
    [refetchEvents]
  );

  const points = pointsStatus?.results || [];
  const statusCounts = useMemo(() => countPointStatuses(points), [points]);

  const metrics = telemetryMetrics?.metrics || {};
  const totalRecords = metrics.total_records ?? 0;
  const processingErrors = metrics.error_count ?? 0;
  const avgLatency = metrics.avg_latency_ms ?? 0;

  const servicesHealthy = useMemo(() => {
    if (!resources) return 0;
    const healthyValues = [true, "healthy", "up", "ok", "success", "running", "active"];
    if (Array.isArray(resources)) return resources.filter((s) => healthyValues.includes(s?.status) || healthyValues.includes(s?.healthy)).length;
    if (typeof resources === "object") {
      return Object.values(resources).filter((v) => {
        if (typeof v === "boolean") return v;
        return healthyValues.includes(v?.status) || healthyValues.includes(v?.healthy);
      }).length;
    }
    return 0;
  }, [resources]);

  const servicesTotal = useMemo(() => {
    if (!resources) return 0;
    if (Array.isArray(resources)) return resources.length;
    if (typeof resources === "object") return Object.keys(resources).length;
    return 0;
  }, [resources]);

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            <BarChartOutlined style={{ marginRight: 12, color: token.colorPrimary }} />
            Dashboard de Rendimiento
          </Title>
          <Text type="secondary">Estado del sistema, métricas de telemetría y cola DGA.</Text>
        </div>
        <Flex align="center" gap={12}>
          <Segmented
            value={range}
            onChange={handleRangeChange}
            options={[
              { label: "1H", value: "1h" },
              { label: "24H", value: "24h" },
              { label: "7D", value: "7d" },
              { label: "30D", value: "30d" },
            ]}
          />
          <Tooltip title="Refrescar datos">
            <Button icon={<ReloadOutlined spin={refreshing} />} onClick={handleRefresh} loading={loading}>
              Refrescar
            </Button>
          </Tooltip>
        </Flex>
      </Flex>

      <DebugPanel debug={debug} />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={6}>
          <SmartKPICard
            icon={<WifiOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Puntos Activos"
            value={statusCounts.active}
            suffix={`/${points.length}`}
            gradient={`linear-gradient(135deg, ${token.colorSuccess} 0%, ${token.colorSuccess}dd 100%)`}
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <SmartKPICard
            icon={<DisconnectOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Desconectados"
            value={statusCounts.disconnected}
            gradient={`linear-gradient(135deg, ${token.colorError} 0%, ${token.colorError}dd 100%)`}
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <SmartKPICard
            icon={<QuestionCircleOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Sin Datos"
            value={statusCounts.noData}
            gradient={`linear-gradient(135deg, ${token.colorWarning} 0%, ${token.colorError} 100%)`}
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <SmartKPICard
            icon={<DatabaseOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Registros Procesados"
            value={totalRecords.toLocaleString("es-CL")}
            gradient={token.gradientPrimary}
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <SmartKPICard
            icon={<ExclamationCircleOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Errores de Procesamiento"
            value={processingErrors}
            gradient={`linear-gradient(135deg, ${token.colorError} 0%, #ff7875 100%)`}
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <SmartKPICard
            icon={<ClockCircleOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Latencia Promedio"
            value={avgLatency ? avgLatency.toFixed(1) : 0}
            suffix="ms"
            gradient={`linear-gradient(135deg, ${token.colorInfo} 0%, ${token.colorInfo}dd 100%)`}
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <SmartKPICard
            icon={<SyncOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="DGA Pendientes"
            value={dgaQueue?.pending ?? dgaQueue?.pending_count ?? 0}
            suffix="cola"
            gradient={`linear-gradient(135deg, ${token.colorAccent} 0%, ${token.colorAccentHover} 100%)`}
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <SmartKPICard
            icon={<CloudServerOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Servicios Saludables"
            value={servicesHealthy}
            suffix={`/${servicesTotal}`}
            gradient={`linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorCorporateBlueLight} 100%)`}
            loading={loading}
            wave
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 24 }}>
        <PerformanceCharts
          telemetryMetrics={telemetryMetrics}
          pointsStatus={pointsStatus}
          loading={loading}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <SystemHealthPanel data={resources} loading={loading} />
        </Col>
        <Col xs={24} lg={12}>
          <DgaQueuePanel data={dgaQueue} loading={loading} onChange={handleRefresh} />
        </Col>
      </Row>

      <div style={{ marginBottom: 24 }}>
        <PointsStatusTable
          data={pointsStatus}
          loading={loading}
          onChange={handleRefresh}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      <div>
        <EventLogTable
          data={events}
          loading={loading}
          page={eventPage}
          onPageChange={handleEventPageChange}
        />
      </div>
    </div>
  );
};

export default PerformanceDashboard;
