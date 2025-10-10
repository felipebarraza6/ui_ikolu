import { Alert, Button, Space, Typography } from "antd";
import {
  AlertOutlined,
  ControlOutlined,
  ReloadOutlined,
  WarningOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfilesContext } from "../../contexts/UserProfilesContext";
import { useControlCenterStats } from "../../hooks/useControlCenterStats";
import LoadingScreen from "./LoadingScreen";
import StatsCards from "./StatsCards";
import DetailedStats from "./DetailedStats";
import PointsTable from "./PointsTable";
import SystemInfo from "./SystemInfo";

const { Title, Text } = Typography;

const ControlCenter = () => {
  const navigate = useNavigate();
  const { profiles, loading, error, refreshProfiles } =
    useUserProfilesContext();

  const { stats, standardStats, percentages, getPointData, pointsWithConnectionIssues } =
    useControlCenterStats(profiles);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Alert
        message="Error al cargar datos"
        description={error}
        type="error"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%", padding: "16px" }}>
      {/* Header con título y botón de actualizar */}
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0, color: "#1F3461" }}>
            <ControlOutlined style={{ marginRight: "8px" }} />
            Centro de Control
          </Title>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Panel de control y monitoreo del sistema
          </Text>
        </Space>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={refreshProfiles}
          size="large"
        >
          Actualizar Sistema
        </Button>
      </Space>

      {/* Alertas del sistema */}
      {stats.withErrors > 0 && (
        <Alert
          message={`${stats.withErrors} punto(s) con errores detectados`}
          description="Estos puntos tienen errores en las mediciones. Revisa el estado de los dispositivos."
          type="error"
          showIcon
          icon={<AlertOutlined />}
          closable
        />
      )}

      {/* Alerta de problemas de conexión en puntos con telemetría */}
      {stats.telemetryWithConnectionIssues > 0 && (
        <Alert
          message={`${stats.telemetryWithConnectionIssues} señal${stats.telemetryWithConnectionIssues > 1 ? 'es' : ''} con desconexión detectada${stats.telemetryWithConnectionIssues > 1 ? 's' : ''}`}
          description={
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div style={{ fontSize: "13px" }}>
                {pointsWithConnectionIssues.map((point, index) => (
                  <span key={point.id}>
                    <Text strong style={{ color: "#d46b08" }}>{point.title}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {` (${point.daysNotConnected} día${point.daysNotConnected > 1 ? 's' : ''})`}
                    </Text>
                    {index < pointsWithConnectionIssues.length - 1 && <span>, </span>}
                  </span>
                ))}
              </div>
              <Space size="small">
                <Text style={{ fontSize: "13px" }}>
                  Revisar instalación en terreno.
                </Text>
                <Button
                  type="link"
                  size="small"
                  icon={<CustomerServiceOutlined />}
                  onClick={() => navigate("/soporte")}
                  style={{ padding: 0, height: "auto" }}
                >
                  Contactar soporte
                </Button>
              </Space>
            </Space>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          closable
        />
      )}

      {/* Estadísticas principales con barras de progreso */}
      <StatsCards stats={stats} percentages={percentages} />

      {/* Resumen detallado */}
      <DetailedStats stats={stats} standardStats={standardStats} />

      {/* Tabla detallada de todos los puntos */}
      <PointsTable profiles={profiles} getPointData={getPointData} />

      {/* Información adicional del sistema */}
      <SystemInfo
        profiles={profiles}
        stats={stats}
        percentages={percentages}
      />
    </Space>
  );
};

export default ControlCenter;
