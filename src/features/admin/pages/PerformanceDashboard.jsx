import React, { useState, useCallback, useMemo } from "react";
import { Row, Col, Flex, Typography, Button, Segmented, Tooltip } from "antd";
import {
  BarChartOutlined,
  WifiOutlined,
  DisconnectOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { SmartKPICard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import useSystemStatus from "../hooks/useSystemStatus";
import EventLogTable from "../components/EventLogTable";
import { countPointStatuses } from "../utils/pointStatus";

const { Title, Text } = Typography;

const PerformanceDashboard = () => {
  const token = useIkoluToken();
  const [eventPage, setEventPage] = useState(1);
  const [range, setRange] = useState("24h");

  const {
    loading,
    refreshing,
    pointsStatus,
    telemetryMetrics,
    events,
    refetch,
    refetchEvents,
  } = useSystemStatus();

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

  const handleRefresh = useCallback(() => {
    refetch(rangeParams, eventPage);
  }, [refetch, rangeParams, eventPage]);

  const handleRangeChange = useCallback(
    (value) => {
      setRange(value);
      const days = value === "7d" ? 7 : value === "30d" ? 30 : 1;
      refetch({ days }, eventPage);
    },
    [refetch, eventPage]
  );

  const handleEventPageChange = useCallback(
    (page) => {
      setEventPage(page);
      refetchEvents(page);
    },
    [refetchEvents]
  );

  const statusCounts = useMemo(
    () => countPointStatuses(pointsStatus?.results || []),
    [pointsStatus?.results]
  );

  const metrics = telemetryMetrics?.metrics || {};
  const totalRecords = metrics.total_records ?? 0;
  const processingErrors = metrics.error_count ?? 0;

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: token.voidTextHeading }}>
            <BarChartOutlined style={{ marginRight: 12, color: token.voidTextHeading }} />
            Dashboard de Rendimiento
          </Title>
          <Text type="secondary">Métricas de telemetría y eventos del sistema.</Text>
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <SmartKPICard variant="void"
            icon={<WifiOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Puntos Activos"
            value={statusCounts.active}
            gradient={`linear-gradient(135deg, ${token.colorSuccess} 0%, ${token.colorSuccess}dd 100%)`}
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <SmartKPICard variant="void"
            icon={<DisconnectOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Desconectados"
            value={statusCounts.disconnected}
            gradient={`linear-gradient(135deg, ${token.colorError} 0%, ${token.colorError}dd 100%)`}
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <SmartKPICard variant="void"
            icon={<DatabaseOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Registros Procesados"
            value={totalRecords.toLocaleString("es-CL")}
            gradient="var(--ikolu-void-text-heading)"
            loading={loading}
            wave
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <SmartKPICard variant="void"
            icon={<ExclamationCircleOutlined style={{ fontSize: 18, color: "#fff" }} />}
            label="Errores de Procesamiento"
            value={processingErrors}
            gradient={`linear-gradient(135deg, ${token.colorError} 0%, #ff7875 100%)`}
            loading={loading}
            wave
          />
        </Col>
      </Row>

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
