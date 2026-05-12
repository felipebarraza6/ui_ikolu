import React, { useContext, useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Flex,
  Statistic,
  Table,
  Tag,
  Spin,
  Alert,
  Tabs,
  Button,
  Select,
  notification,
  Switch,
  Progress,
} from "antd";
import {
  DashboardOutlined,
  WifiOutlined,
  AlertOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  DesktopOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import { useResponsive } from "../../hooks/useResponsive";
import SlaDashboard from "./sla/SlaDashboard";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const KPI_CARD_STYLES = {
  puntos: { borderColor: "#1F3461", iconColor: "#1F3461", bg: "#F2F5FA" },
  activos: { borderColor: "#52C41A", iconColor: "#52C41A", bg: "#F6FFF0" },
  desconectados: { borderColor: "#FF6B35", iconColor: "#FF6B35", bg: "#FFF7F2" },
  registros: { borderColor: "#BDC00C", iconColor: "#BDC00C", bg: "#FAFBF0" },
  cola: { borderColor: "#006FB3", iconColor: "#006FB3", bg: "#F0F7FF" },
  alertas: { borderColor: "#722ED1", iconColor: "#722ED1", bg: "#F9F0FF" },
};

const AdminDashboard = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();

  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);
  const [systemMap, setSystemMap] = useState(null);
  const [resourcesStatus, setResourcesStatus] = useState(null);
  const [pointsStatus, setPointsStatus] = useState([]);
  const [dgaQueue, setDgaQueue] = useState(null);
  const [notificationsSummary, setNotificationsSummary] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const isStaff = state.user?.is_staff;

  const loadSystemStatus = async () => {
    try {
      const res = await sh.management.systemStatus();
      setSystemStatus(res);
    } catch (err) {
      console.error("Error cargando system status:", err);
    }
  };

  const loadSystemMap = async () => {
    try {
      const res = await sh.management.systemMap();
      setSystemMap(res);
    } catch (err) {
      console.error("Error cargando system map:", err);
    }
  };

  const loadResourcesStatus = async () => {
    try {
      const res = await sh.management.resourcesStatus();
      setResourcesStatus(res);
    } catch (err) {
      console.error("Error cargando resources status:", err);
    }
  };

  const loadPointsStatus = async (projectId = null) => {
    try {
      const params = projectId ? { project: projectId } : {};
      const res = await sh.management.pointsStatus(params);
      setPointsStatus(res.points || []);
    } catch (err) {
      console.error("Error cargando points status:", err);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await sh.admin.projects();
      setProjects(res.results || res || []);
    } catch (err) {
      console.error("Error cargando proyectos:", err);
    }
  };

  const loadDgaQueue = async () => {
    try {
      const res = await sh.management.dgaQueueStatus();
      setDgaQueue(res);
    } catch (err) {
      console.error("Error cargando DGA queue:", err);
    }
  };

  const loadNotificationsSummary = async () => {
    try {
      const res = await sh.management.notificationsSummary();
      setNotificationsSummary(res);
    } catch (err) {
      console.error("Error cargando notifications summary:", err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadSystemStatus(),
      loadSystemMap(),
      loadResourcesStatus(),
      loadPointsStatus(),
      loadDgaQueue(),
      loadNotificationsSummary(),
      loadProjects(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleTelemetry = async (pointId, enabled) => {
    setActionLoading(true);
    try {
      await sh.management.toggleTelemetry(pointId, enabled);
      notification.success({
        message: "Telemetría actualizada",
        description: `Punto ${pointId} ${enabled ? "activado" : "desactivado"}.`,
      });
      loadPointsStatus();
    } catch (err) {
      notification.error({
        message: "Error",
        description: "No se pudo actualizar la telemetría.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearDgaQueue = async () => {
    setActionLoading(true);
    try {
      await sh.management.clearDgaQueue({ only_errors: true });
      notification.success({ message: "Cola DGA limpiada" });
      loadDgaQueue();
    } catch (err) {
      notification.error({ message: "Error", description: "No se pudo limpiar la cola." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequeueDga = async () => {
    setActionLoading(true);
    try {
      await sh.management.requeueDga({ only_errors: false });
      notification.success({ message: "Registros reencolados" });
      loadDgaQueue();
    } catch (err) {
      notification.error({ message: "Error", description: "No se pudo reencolar." });
    } finally {
      setActionLoading(false);
    }
  };

  if (!isStaff) {
    return (
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 16px" }}>
        <Alert
          message="Acceso restringido"
          description="No tienes permisos de administrador para ver esta sección."
          type="warning"
          showIcon
          style={{ borderRadius: 12 }}
        />
      </div>
    );
  }

  const stats = systemStatus?.statistics || {};

  const renderKPIs = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      <Col xs={12} sm={8} md={4} lg={4}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.puntos.borderColor}`,
            background: KPI_CARD_STYLES.puntos.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="small">
            <DatabaseOutlined style={{ fontSize: 20, color: KPI_CARD_STYLES.puntos.iconColor }} />
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>Total Puntos</span>}
              value={stats.total_points || 0}
              valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4} lg={4}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.activos.borderColor}`,
            background: KPI_CARD_STYLES.activos.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="small">
            <WifiOutlined style={{ fontSize: 20, color: KPI_CARD_STYLES.activos.iconColor }} />
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>Activos</span>}
              value={stats.active_telemetry || 0}
              valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4} lg={4}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.desconectados.borderColor}`,
            background: KPI_CARD_STYLES.desconectados.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="small">
            <AlertOutlined style={{ fontSize: 20, color: KPI_CARD_STYLES.desconectados.iconColor }} />
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>Desconectados</span>}
              value={stats.disconnected_points || 0}
              valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4} lg={4}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.registros.borderColor}`,
            background: KPI_CARD_STYLES.registros.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="small">
            <ThunderboltOutlined style={{ fontSize: 20, color: KPI_CARD_STYLES.registros.iconColor }} />
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>Registros 24h</span>}
              value={stats.records_last_24h || 0}
              valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4} lg={4}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.cola.borderColor}`,
            background: KPI_CARD_STYLES.cola.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="small">
            <FileTextOutlined style={{ fontSize: 20, color: KPI_CARD_STYLES.cola.iconColor }} />
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>Cola DGA</span>}
              value={stats.dga_queue_size || 0}
              valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>
      <Col xs={12} sm={8} md={4} lg={4}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.alertas.borderColor}`,
            background: KPI_CARD_STYLES.alertas.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="small">
            <AlertOutlined style={{ fontSize: 20, color: KPI_CARD_STYLES.alertas.iconColor }} />
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>Alertas Activas</span>}
              value={stats.active_notifications || 0}
              valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>
    </Row>
  );

  const pointsColumns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Nombre", dataIndex: "title", render: (t) => <Text strong>{t}</Text> },
    { title: "Proyecto", dataIndex: "project" },
    { title: "Cliente", dataIndex: "client" },
    { title: "Frecuencia", dataIndex: "frecuency", render: (f) => `${f} min` },
    {
      title: "Telemetría",
      dataIndex: "telemetry_active",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>{active ? "Activa" : "Inactiva"}</Tag>
      ),
    },
    {
      title: "Última conexión",
      dataIndex: ["last_interaction", "days_not_connection"],
      render: (days) => (
        <Tag color={days === 0 ? "green" : days > 2 ? "red" : "orange"}>
          {days === 0 ? "Hoy" : `${days} días`}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Switch
          checked={record.telemetry_active}
          onChange={(checked) => handleToggleTelemetry(record.id, checked)}
          loading={actionLoading}
          size="small"
        />
      ),
    },
  ];

  const dgaQueueColumns = [
    { title: "Punto", dataIndex: "catchment_point__title" },
    { title: "ID", dataIndex: "catchment_point__id", width: 80 },
    { title: "Cantidad", dataIndex: "count", width: 100, render: (c) => <Text strong>{c}</Text> },
  ];

  return (
    <div
      style={{
        maxWidth: "1600px",
        margin: isMobile ? "12px auto" : "0 auto",
        padding: isMobile ? "0 8px" : "0",
        minHeight: "90vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderRadius: "12px",
          background: "linear-gradient(135deg, #1F3461 0%, #2A4B8D 100%)",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap="middle">
          <Flex align="center" gap="middle">
            <DashboardOutlined style={{ fontSize: 32, color: "white" }} />
            <div>
              <Title level={3} style={{ margin: 0, color: "white" }}>
                Panel de Administración
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                Gestión del sistema SmartHydro
              </Text>
            </div>
          </Flex>
          <Flex gap="small" align="center">
            <Select
              placeholder="Todos los proyectos"
              allowClear
              style={{ minWidth: 200 }}
              value={selectedProject}
              onChange={(value) => {
                setSelectedProject(value);
                loadPointsStatus(value);
              }}
            >
              {projects.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name || p.title || `Proyecto ${p.id}`}
                </Select.Option>
              ))}
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadAll}
              loading={loading}
              style={{
                background: "white",
                color: "#1F3461",
                borderColor: "white",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Actualizar
            </Button>
          </Flex>
        </Flex>
      </div>

      {loading && !systemStatus ? (
        <Flex justify="center" align="center" style={{ minHeight: 300 }}>
          <Spin size="large" tip="Cargando datos administrativos..." />
        </Flex>
      ) : (
        <>
          {renderKPIs()}

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            style={{ background: "white", borderRadius: 12, padding: "0 16px" }}
          >
            <TabPane tab="Puntos de Captación" key="1">
              <Card
                style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
              >
                <Table
                  size="small"
                  columns={pointsColumns}
                  dataSource={pointsStatus}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 900 }}
                  locale={{ emptyText: "No hay puntos disponibles" }}
                />
              </Card>
            </TabPane>

            <TabPane tab="Cola DGA" key="2">
              <Card
                style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
              >
                <Flex gap="small" wrap="wrap" style={{ marginBottom: 16 }}>
                  <Button onClick={handleClearDgaQueue} loading={actionLoading} danger>
                    Limpiar errores
                  </Button>
                  <Button onClick={handleRequeueDga} loading={actionLoading} type="primary" style={{ background: "#1F3461" }}>
                    Reencolar registros
                  </Button>
                </Flex>
                {dgaQueue && (
                  <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                      <Col span={8}>
                        <Statistic title="Total en cola" value={dgaQueue.queue_status?.total || 0} />
                      </Col>
                      <Col span={8}>
                        <Statistic title="Errores" value={dgaQueue.queue_status?.errors || 0} valueStyle={{ color: "#FF6B35" }} />
                      </Col>
                      <Col span={8}>
                        <Statistic title="Registros antiguos" value={dgaQueue.queue_status?.old_records || 0} />
                      </Col>
                    </Row>
                    <Table
                      size="small"
                      columns={dgaQueueColumns}
                      dataSource={dgaQueue.by_point || []}
                      rowKey="catchment_point__id"
                      pagination={{ pageSize: 5 }}
                    />
                  </>
                )}
              </Card>
            </TabPane>

            <TabPane tab="Alertas" key="3">
              <Card
                style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
              >
                {notificationsSummary && (
                  <Row gutter={[16, 16]}>
                    <Col span={6}>
                      <Statistic title="Total" value={notificationsSummary.summary?.total || 0} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="Activas" value={notificationsSummary.summary?.active || 0} valueStyle={{ color: "#FF6B35" }} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="No leídas" value={notificationsSummary.summary?.unread || 0} />
                    </Col>
                    <Col span={6}>
                      <Statistic title="Finalizadas" value={notificationsSummary.summary?.finished || 0} valueStyle={{ color: "#52C41A" }} />
                    </Col>
                  </Row>
                )}
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <GlobalOutlined />
                  Mapa del Sistema
                </span>
              }
              key="4"
            >
              <Card
                style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
              >
                {systemMap ? (
                  <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                      <Col span={8}>
                        <Statistic
                          title="Clientes"
                          value={systemMap.clients?.length || 0}
                          valueStyle={{ color: "#1F3461", fontWeight: 700 }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Proyectos"
                          value={systemMap.projects?.length || 0}
                          valueStyle={{ color: "#1F3461", fontWeight: 700 }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Puntos"
                          value={systemMap.points?.length || 0}
                          valueStyle={{ color: "#1F3461", fontWeight: 700 }}
                        />
                      </Col>
                    </Row>

                    <Title level={5} style={{ marginTop: 16, marginBottom: 12 }}>
                      Resumen por Cliente
                    </Title>
                    <Table
                      size="small"
                      columns={[
                        { title: "Cliente", dataIndex: "name", key: "name" },
                        { title: "Proyectos", dataIndex: "project_count", key: "project_count" },
                        { title: "Puntos", dataIndex: "point_count", key: "point_count" },
                      ]}
                      dataSource={systemMap.clients || []}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                      locale={{ emptyText: "No hay datos de clientes" }}
                    />

                    <Title level={5} style={{ marginTop: 24, marginBottom: 12 }}>
                      Puntos en el Mapa
                    </Title>
                    <Table
                      size="small"
                      columns={[
                        { title: "ID", dataIndex: "id", key: "id", width: 60 },
                        { title: "Título", dataIndex: "title", key: "title" },
                        { title: "Lat", dataIndex: "lat", key: "lat" },
                        { title: "Lon", dataIndex: "lon", key: "lon" },
                        {
                          title: "Estado",
                          key: "status",
                          render: (_, record) => (
                            <Tag color={record.is_active ? "green" : "red"}>
                              {record.is_active ? "Activo" : "Inactivo"}
                            </Tag>
                          ),
                        },
                      ]}
                      dataSource={systemMap.points || []}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 700 }}
                      locale={{ emptyText: "No hay puntos en el mapa" }}
                    />
                  </>
                ) : (
                  <Flex justify="center" align="center" style={{ minHeight: 200 }}>
                    <Spin tip="Cargando mapa del sistema..." />
                  </Flex>
                )}
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <DesktopOutlined />
                  Rendimiento
                </span>
              }
              key="5"
            >
              <Card
                style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
              >
                {resourcesStatus ? (
                  <>
                    {/* SERVIDOR */}
                    <Title level={5} style={{ marginBottom: 12 }}>
                      <DesktopOutlined style={{ marginRight: 8 }} />
                      Servidor
                    </Title>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                      <Col span={8}>
                        <Card size="small" style={{ background: "#f2f5fa", border: "none", borderRadius: 8, textAlign: "center" }}>
                          <Text style={{ fontSize: 11, color: "#1F3461", display: "block" }}>CPU</Text>
                          <Text style={{ fontSize: 22, fontWeight: 700, color: "#1F3461" }}>
                            {resourcesStatus.server?.cpu_percent != null ? `${resourcesStatus.server.cpu_percent}%` : "N/A"}
                          </Text>
                          {resourcesStatus.server?.cpu_percent != null && (
                            <Progress percent={resourcesStatus.server.cpu_percent} size="small" showInfo={false} strokeColor="#1F3461" />
                          )}
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small" style={{ background: "#f2f5fa", border: "none", borderRadius: 8, textAlign: "center" }}>
                          <Text style={{ fontSize: 11, color: "#1F3461", display: "block" }}>RAM</Text>
                          <Text style={{ fontSize: 22, fontWeight: 700, color: "#1F3461" }}>
                            {resourcesStatus.server?.memory_percent != null ? `${resourcesStatus.server.memory_percent}%` : "N/A"}
                          </Text>
                          {resourcesStatus.server?.memory_percent != null && (
                            <Progress percent={resourcesStatus.server.memory_percent} size="small" showInfo={false} strokeColor="#2A4A7A" />
                          )}
                          <Text style={{ fontSize: 10, color: "#888" }}>{resourcesStatus.server?.memory_used || "—"} / {resourcesStatus.server?.memory_total || "—"}</Text>
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card size="small" style={{ background: "#f2f5fa", border: "none", borderRadius: 8, textAlign: "center" }}>
                          <Text style={{ fontSize: 11, color: "#1F3461", display: "block" }}>Disco</Text>
                          <Text style={{ fontSize: 22, fontWeight: 700, color: "#1F3461" }}>
                            {resourcesStatus.server?.disk_percent != null ? `${resourcesStatus.server.disk_percent}%` : "N/A"}
                          </Text>
                          {resourcesStatus.server?.disk_percent != null && (
                            <Progress percent={resourcesStatus.server.disk_percent} size="small" showInfo={false} strokeColor="#3B6CA8" />
                          )}
                          <Text style={{ fontSize: 10, color: "#888" }}>{resourcesStatus.server?.disk_used_gb || "—"} / {resourcesStatus.server?.disk_total_gb || "—"} GB</Text>
                        </Card>
                      </Col>
                    </Row>
                    {resourcesStatus.server?.uptime && (
                      <Tag color="blue" style={{ marginBottom: 16 }}>
                        Uptime: {resourcesStatus.server.uptime}
                      </Tag>
                    )}

                    {/* BASE DE DATOS + REDIS */}
                    <Title level={5} style={{ marginBottom: 12 }}>
                      <DatabaseOutlined style={{ marginRight: 8 }} />
                      Servicios
                    </Title>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                      <Col span={12}>
                        <Card size="small" style={{ borderRadius: 8 }}>
                          <Flex align="center" justify="space-between">
                            <Text strong>PostgreSQL</Text>
                            <Tag color={resourcesStatus.database?.status === "connected" ? "success" : "error"}>
                              {resourcesStatus.database?.status || "—"}
                            </Tag>
                          </Flex>
                          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                            {resourcesStatus.database?.engine || "—"}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                            Tamaño: {resourcesStatus.database?.size_mb ? `${resourcesStatus.database.size_mb} MB` : "—"}
                          </Text>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small" style={{ borderRadius: 8 }}>
                          <Flex align="center" justify="space-between">
                            <Text strong>Redis</Text>
                            <Tag color={resourcesStatus.redis?.status === "connected" ? "success" : "error"}>
                              {resourcesStatus.redis?.status || "—"}
                            </Tag>
                          </Flex>
                          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                            Versión: {resourcesStatus.redis?.version || "—"}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                            Memoria: {resourcesStatus.redis?.used_memory_human || "—"} · Clientes: {resourcesStatus.redis?.connected_clients || 0}
                          </Text>
                        </Card>
                      </Col>
                    </Row>

                    {/* DJANGO STATS */}
                    <Title level={5} style={{ marginBottom: 12 }}>
                      <ThunderboltOutlined style={{ marginRight: 8 }} />
                      Django
                    </Title>
                    <Row gutter={[16, 16]}>
                      {resourcesStatus.django?.model_counts && Object.entries(resourcesStatus.django.model_counts).map(([model, count]) => (
                        <Col span={8} key={model}>
                          <Card size="small" style={{ background: "#f2f5fa", border: "none", borderRadius: 8, textAlign: "center" }}>
                            <Text style={{ fontSize: 11, color: "#1F3461", display: "block", textTransform: "capitalize" }}>
                              {model.replace(/_/g, " ")}
                            </Text>
                            <Text style={{ fontSize: 22, fontWeight: 700, color: "#1F3461" }}>
                              {count?.toLocaleString?.() || count}
                            </Text>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                    <div style={{ marginTop: 12 }}>
                      <Tag color="blue">Debug: {resourcesStatus.django?.debug ? "ON" : "OFF"}</Tag>
                      <Tag color="blue">Timezone: {resourcesStatus.django?.time_zone || "—"}</Tag>
                      <Tag color="blue">Apps: {resourcesStatus.django?.installed_apps_count || "—"}</Tag>
                    </div>
                  </>
                ) : (
                  <Flex justify="center" align="center" style={{ minHeight: 200 }}>
                    <Spin tip="Cargando estado del sistema..." />
                  </Flex>
                )}
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <CustomerServiceOutlined />
                  SLA
                </span>
              }
              key="6"
            >
              <SlaDashboard />
            </TabPane>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
