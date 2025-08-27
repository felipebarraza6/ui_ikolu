import {
  Flex,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Button,
  Table,
  Progress,
  Alert,
  Space,
  Divider,
} from "antd";
import React from "react";
import { useUserProfilesContext } from "../../contexts/UserProfilesContext";
import {
  ReloadOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const CentroControl = () => {
  const { profiles, loading, error, refreshProfiles } =
    useUserProfilesContext();

  // Calcular estadísticas generales
  const stats = {
    totalPoints: profiles.length,
    activePoints: profiles.filter((p) => p.config_data?.is_active).length,
    telemetryPoints: profiles.filter((p) => p.config_data?.is_telemetry).length,
    dgaPoints: profiles.filter((p) => p.dga?.code_dga).length,
    standardPoints: profiles.filter((p) => p.standard === "STANDARD").length,
    smallFlowPoints: profiles.filter(
      (p) => p.standard === "CAUDALES_MUY_PEQUENOS"
    ).length,
    monitoringPoints: profiles.filter((p) => p.is_monitoring).length,
    criticalPoints: profiles.filter(
      (p) => p.config_data?.is_telemetry && !p.config_data?.is_active
    ).length,
  };

  // Calcular porcentajes
  const percentages = {
    active:
      profiles.length > 0
        ? Math.round((stats.activePoints / stats.totalPoints) * 100)
        : 0,
    telemetry:
      profiles.length > 0
        ? Math.round((stats.telemetryPoints / stats.totalPoints) * 100)
        : 0,
    monitoring:
      profiles.length > 0
        ? Math.round((stats.monitoringPoints / stats.totalPoints) * 100)
        : 0,
  };

  // Función para obtener color del estado
  const getStatusColor = (point) => {
    if (point.config_data?.is_telemetry && point.config_data?.is_active)
      return "success";
    if (point.config_data?.is_telemetry && !point.config_data?.is_active)
      return "warning";
    if (point.is_monitoring) return "processing";
    return "default";
  };

  // Función para obtener icono del estado
  const getStatusIcon = (point) => {
    if (point.config_data?.is_telemetry && point.config_data?.is_active)
      return <WifiOutlined />;
    if (point.config_data?.is_telemetry && !point.config_data?.is_active)
      return <AlertOutlined />;
    if (point.is_monitoring) return <PlayCircleOutlined />;
    return <PauseCircleOutlined />;
  };

  // Función para obtener texto del estado
  const getStatusText = (point) => {
    if (point.config_data?.is_telemetry && point.config_data?.is_active)
      return "Telemetría Activa";
    if (point.config_data?.is_telemetry && !point.config_data?.is_active)
      return "Telemetría Inactiva";
    if (point.is_monitoring) return "Monitoreando";
    return "Inactivo";
  };

  // Columnas para la tabla
  const columns = [
    {
      title: "Punto",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "600", color: "#1F3461" }}>{text}</div>
          <div style={{ fontSize: "11px", color: "#666" }}>ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: "Tipo",
      key: "type",
      render: (_, record) => (
        <Tag
          color={
            record.config_data?.is_telemetry
              ? record.config_data?.is_active
                ? "green"
                : "orange"
              : "default"
          }
          icon={
            record.config_data?.is_telemetry ? (
              record.config_data?.is_active ? (
                <WifiOutlined />
              ) : (
                <AlertOutlined />
              )
            ) : (
              <SettingOutlined />
            )
          }
        >
          {record.config_data?.is_telemetry
            ? record.config_data?.is_active
              ? "M3"
              : "M2"
            : "M1"}
        </Tag>
      ),
    },
    {
      title: "Estado",
      key: "status",
      render: (_, record) => (
        <Tag color={getStatusColor(record)} icon={getStatusIcon(record)}>
          {getStatusText(record)}
        </Tag>
      ),
    },
    {
      title: "DGA",
      dataIndex: ["dga", "code_dga"],
      key: "dga",
      render: (code) =>
        code ? (
          <Tag color="blue" style={{ fontFamily: "monospace" }}>
            {code}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Estándar",
      dataIndex: "standard",
      key: "standard",
      render: (standard) => (
        <Tag color={standard === "STANDARD" ? "blue" : "green"}>{standard}</Tag>
      ),
    },
    {
      title: "Frecuencia",
      dataIndex: "frecuency",
      key: "frecuency",
      render: (freq) => (
        <div style={{ textAlign: "center" }}>
          <Text strong>{freq || 1}</Text>
          <div style={{ fontSize: "10px", color: "#666" }}>min</div>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "24px", marginBottom: "16px" }}>🔄</div>
        <Text>Cargando datos del sistema...</Text>
      </div>
    );
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
    <div style={{ padding: "16px" }}>
      {/* Header con título y botón de actualizar */}
      <Flex
        align="center"
        justify="space-between"
        style={{ marginBottom: "16px" }}
      >
        <div>
          <Title level={2} style={{ margin: 0, color: "#1F3461" }}>
            🎛️ Centro de Control
          </Title>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Panel de control y monitoreo del sistema
          </Text>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={refreshProfiles}
          size="large"
        >
          Actualizar Sistema
        </Button>
      </Flex>

      {/* Alertas del sistema */}
      {stats.criticalPoints > 0 && (
        <Alert
          message={`⚠️ ${stats.criticalPoints} punto(s) con telemetría inactiva`}
          description="Estos puntos tienen telemetría configurada pero no están activos. Revisa la configuración."
          type="warning"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      {/* Estadísticas principales con barras de progreso */}
      <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center" }} size="small">
            <Statistic
              title="Total de Puntos"
              value={stats.totalPoints}
              prefix={<EnvironmentOutlined style={{ color: "#1F3461" }} />}
              valueStyle={{ color: "#1F3461", fontSize: "24px" }}
            />
            <Progress
              percent={100}
              showInfo={false}
              strokeColor="#1F3461"
              size="small"
              style={{ marginTop: "4px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center" }} size="small">
            <Statistic
              title="Puntos Activos"
              value={stats.activePoints}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: "24px" }}
            />
            <Progress
              percent={percentages.active}
              showInfo={false}
              strokeColor="#52c41a"
              size="small"
              style={{ marginTop: "4px" }}
            />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {percentages.active}% del total
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center" }} size="small">
            <Statistic
              title="Con Telemetría"
              value={stats.telemetryPoints}
              prefix={<WifiOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: "24px" }}
            />
            <Progress
              percent={percentages.telemetry}
              showInfo={false}
              strokeColor="#1890ff"
              size="small"
              style={{ marginTop: "4px" }}
            />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {percentages.telemetry}% del total
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: "center" }} size="small">
            <Statistic
              title="Monitoreando"
              value={stats.monitoringPoints}
              prefix={<PlayCircleOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: "24px" }}
            />
            <Progress
              percent={percentages.monitoring}
              showInfo={false}
              strokeColor="#722ed1"
              size="small"
              style={{ marginTop: "4px" }}
            />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {percentages.monitoring}% del total
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Resumen detallado */}
      <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
        <Col xs={24} md={12}>
          <Card title="📊 Distribución por Estándar" size="small">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Text>Estándar</Text>
              <Tag color="blue" style={{ margin: 0 }}>
                {stats.standardPoints}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Text>Caudales Muy Pequeños</Text>
              <Tag color="green" style={{ margin: 0 }}>
                {stats.smallFlowPoints}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>Otros</Text>
              <Tag color="default" style={{ margin: 0 }}>
                {stats.totalPoints -
                  stats.standardPoints -
                  stats.smallFlowPoints}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="🔍 Estado del Sistema" size="small">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Text>Puntos Activos</Text>
              <Tag color="green" style={{ margin: 0 }}>
                {stats.activePoints}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <Text>Con Telemetría</Text>
              <Tag color="blue" style={{ margin: 0 }}>
                {stats.telemetryPoints}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>Puntos Inactivos</Text>
              <Tag color="default" style={{ margin: 0 }}>
                {stats.totalPoints - stats.activePoints}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabla detallada de todos los puntos */}
      <Card
        title={
          <Space>
            <BarChartOutlined />
            📍 Vista Detallada de Puntos de Captación
          </Space>
        }
        extra={
          <Text type="secondary">
            Mostrando {profiles.length} punto{profiles.length !== 1 ? "s" : ""}
          </Text>
        }
        size="small"
      >
        <Table
          columns={columns}
          dataSource={profiles}
          rowKey="id"
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} puntos`,
            size: "small",
          }}
          size="small"
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Información adicional del sistema */}
      <Card
        title="ℹ️ Información del Sistema"
        style={{ marginTop: "12px" }}
        size="small"
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <ClockCircleOutlined
                style={{
                  fontSize: "20px",
                  color: "#1890ff",
                  marginBottom: "6px",
                }}
              />
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                Última Actualización
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {new Date().toLocaleString("es-ES")}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <EyeOutlined
                style={{
                  fontSize: "20px",
                  color: "#52c41a",
                  marginBottom: "6px",
                }}
              />
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                Puntos Visibles
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {profiles.length} de {profiles.length}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <SettingOutlined
                style={{
                  fontSize: "20px",
                  color: "#722ed1",
                  marginBottom: "6px",
                }}
              />
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                Configuración
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Sistema Operativo
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CentroControl;
