import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Flex,
  Tag,
  Table,
  Spin,
  Typography,
  Badge,
  Progress,
  Alert,
} from "antd";
import {
  FaUsers,
  FaProjectDiagram,
  FaMapMarkerAlt,
  FaWifi,
  FaExclamationTriangle,
  FaDatabase,
  FaServer,
  FaChartLine,
} from "react-icons/fa";
import sh from "../../api/sh/endpoints";

const { Title, Text } = Typography;

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);
  const [resourcesStatus, setResourcesStatus] = useState(null);
  const [clientTree, setClientTree] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [statusRes, resourcesRes, clientsRes] = await Promise.all([
          sh.management.systemStatus().catch(() => null),
          sh.management.resourcesStatus().catch(() => null),
          sh.admin.clientsWithProjects().catch(() => []),
        ]);

        setSystemStatus(statusRes);
        setResourcesStatus(resourcesRes);
        setClientTree(Array.isArray(clientsRes) ? clientsRes : clientsRes?.results || []);
      } catch (e) {
        console.error("Error cargando overview:", e);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
        <Spin size="large" tip="Cargando dashboard..." />
      </Flex>
    );
  }

  const stats = systemStatus?.statistics || {};
  const server = resourcesStatus?.server || {};
  const db = resourcesStatus?.database || {};
  const redis = resourcesStatus?.redis || {};
  const django = resourcesStatus?.django || {};
  const modelCounts = django?.model_counts || {};

  const totalProjects = clientTree.reduce((acc, c) => acc + (c.projects?.length || 0), 0);

  const mainCards = [
    {
      icon: <FaUsers size={22} />,
      label: "Clientes",
      value: clientTree.length,
      color: "#1F3461",
    },
    {
      icon: <FaProjectDiagram size={22} />,
      label: "Proyectos",
      value: totalProjects,
      color: "#2A4A7A",
    },
    {
      icon: <FaMapMarkerAlt size={22} />,
      label: "Puntos",
      value: stats.total_points || 0,
      color: "#3B6CA8",
    },
    {
      icon: <FaWifi size={22} />,
      label: "Telemetría Activa",
      value: stats.active_telemetry || 0,
      color: "#4A8BC2",
    },
  ];

  return (
    <div>
      {/* HEADER */}
      <Flex align="center" justify="space-between" style={{ marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: "#1F3461" }}>
            Dashboard General
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Estado del sistema IKOLU
          </Text>
        </div>
        {(stats.total_alerts || 0) > 0 && (
          <Badge count={stats.total_alerts} style={{ backgroundColor: "#FF6B35" }}>
            <Tag icon={<FaExclamationTriangle />} color="error">
              Alertas
            </Tag>
          </Badge>
        )}
      </Flex>

      {/* KPIs PRINCIPALES */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {mainCards.map((card) => (
          <Col xs={12} sm={6} key={card.label}>
            <Card
              size="small"
              style={{
                borderRadius: 16,
                background: card.color,
                border: "none",
                boxShadow: `0 4px 12px ${card.color}40`,
              }}
              bodyStyle={{ padding: "18px 14px" }}
            >
              <Flex align="center" gap="small">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.7)",
                      display: "block",
                    }}
                  >
                    {card.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 26,
                      color: "white",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {card.value}
                  </Text>
                </div>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ESTADO DEL SERVICIO + REGISTROS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Flex align="center" gap="small">
                <FaServer style={{ color: "#1F3461" }} />
                <span>Servidor</span>
              </Flex>
            }
            style={{ borderRadius: 16 }}
          >
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text style={{ fontSize: 11, color: "#888", display: "block" }}>CPU</Text>
                  <Text style={{ fontSize: 20, fontWeight: 700, color: "#1F3461" }}>
                    {server.cpu_percent != null ? `${server.cpu_percent}%` : "N/A"}
                  </Text>
                  {server.cpu_percent != null && (
                    <Progress percent={server.cpu_percent} size="small" showInfo={false} strokeColor="#1F3461" />
                  )}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text style={{ fontSize: 11, color: "#888", display: "block" }}>RAM</Text>
                  <Text style={{ fontSize: 20, fontWeight: 700, color: "#1F3461" }}>
                    {server.memory_percent != null ? `${server.memory_percent}%` : "N/A"}
                  </Text>
                  {server.memory_percent != null && (
                    <Progress percent={server.memory_percent} size="small" showInfo={false} strokeColor="#2A4A7A" />
                  )}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Text style={{ fontSize: 11, color: "#888", display: "block" }}>Disco</Text>
                  <Text style={{ fontSize: 20, fontWeight: 700, color: "#1F3461" }}>
                    {server.disk_percent != null ? `${server.disk_percent}%` : "N/A"}
                  </Text>
                  {server.disk_percent != null && (
                    <Progress percent={server.disk_percent} size="small" showInfo={false} strokeColor="#3B6CA8" />
                  )}
                </div>
              </Col>
            </Row>
            {server.uptime && (
              <Tag color="blue" style={{ marginTop: 12 }}>
                Uptime: {server.uptime}
              </Tag>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Flex align="center" gap="small">
                <FaChartLine style={{ color: "#1F3461" }} />
                <span>Operaciones 24h</span>
              </Flex>
            }
            style={{ borderRadius: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: "center", padding: "12px", background: "#f2f5fa", borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, color: "#1F3461", display: "block" }}>Registros</Text>
                  <Text style={{ fontSize: 24, fontWeight: 700, color: "#1F3461" }}>
                    {(stats.records_24h || 0).toLocaleString()}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center", padding: "12px", background: "#f2f5fa", borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, color: "#1F3461", display: "block" }}>Cola DGA</Text>
                  <Text style={{ fontSize: 24, fontWeight: 700, color: "#1F3461" }}>
                    {(stats.dga_queue || 0).toLocaleString()}
                  </Text>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Activos: <b>{stats.active_telemetry || 0}</b> · Desconectados:{" "}
                <b style={{ color: "#FF6B35" }}>{stats.disconnected || 0}</b>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* SERVICIOS + MODELOS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card
            size="small"
            title={
              <Flex align="center" gap="small">
                <FaDatabase style={{ color: "#1F3461" }} />
                <span>Servicios</span>
              </Flex>
            }
            style={{ borderRadius: 16 }}
          >
            <Flex vertical gap="small">
              <Flex align="center" justify="space-between">
                <Text>PostgreSQL</Text>
                <Tag color={db.status === "connected" ? "success" : "error"}>
                  {db.status || "—"}
                </Tag>
              </Flex>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {db.size_mb ? `${db.size_mb} MB` : "—"}
              </Text>
              <div style={{ borderTop: "1px solid #f0f0f0", margin: "4px 0" }} />
              <Flex align="center" justify="space-between">
                <Text>Redis</Text>
                <Tag color={redis.status === "connected" ? "success" : "error"}>
                  {redis.status || "—"}
                </Tag>
              </Flex>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {redis.version ? `v${redis.version}` : "—"} · {redis.used_memory_human || "—"}
              </Text>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card
            size="small"
            title="Modelos Django"
            style={{ borderRadius: 16 }}
          >
            <Row gutter={[12, 12]}>
              {Object.entries(modelCounts).map(([model, count]) => (
                <Col span={8} key={model}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      background: "#f2f5fa",
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#888",
                        display: "block",
                        textTransform: "capitalize",
                      }}
                    >
                      {model.replace(/_/g, " ")}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: 700, color: "#1F3461" }}>
                      {count?.toLocaleString?.() || count}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* CLIENTES */}
      <Card
        size="small"
        title="Clientes"
        style={{ borderRadius: 16 }}
      >
        <Table
          size="small"
          pagination={{ pageSize: 5 }}
          dataSource={clientTree}
          columns={[
            { title: "Nombre", dataIndex: "name", key: "name" },
            { title: "RUT", dataIndex: "rut", key: "rut" },
            {
              title: "Proyectos",
              key: "projects",
              render: (_, record) => (
                <Tag color="blue">{record.projects?.length || 0}</Tag>
              ),
            },
            {
              title: "Email",
              dataIndex: "email",
              key: "email",
              render: (email) => (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {email}
                </Text>
              ),
            },
          ]}
          locale={{ emptyText: "No hay clientes" }}
        />
      </Card>

      {/* INSTRUCCIÓN */}
      <Alert
        message="Centro de Control"
        description="Selecciona un cliente y proyecto en el menú lateral para ver el detalle de sus puntos de captación."
        type="info"
        showIcon
        style={{ marginTop: 16, borderRadius: 12 }}
      />
    </div>
  );
};

export default AdminOverview;
