import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Statistic, Flex, Button, Spin } from "antd";
import {
  TeamOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
  ApartmentOutlined,
  BuildOutlined,
  CloudOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import orchestrator from "../../../api/orchestrator";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const OperationalDashboard = () => {
  const token = useIkoluToken();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clients: 0,
    projects: 0,
    points: 0,
    schemes: 0,
    variables: 0,
    telemetryProviders: 0,
    complianceProviders: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [clients, projects, points, schemes, variables, telemetry, compliance] = await Promise.all([
        orchestrator.admin.clients({ page_size: 1 }).catch(() => ({ count: 0 })),
        orchestrator.admin.projects({ page_size: 1 }).catch(() => ({ count: 0 })),
        orchestrator.admin.points({ page_size: 1 }).catch(() => ({ count: 0 })),
        orchestrator.admin.schemes({ page_size: 1 }).catch(() => ({ count: 0 })),
        orchestrator.admin.variables({ page_size: 1 }).catch(() => ({ count: 0 })),
        orchestrator.admin.telemetryProviders({ page_size: 1 }).catch(() => ({ count: 0 })),
        orchestrator.admin.complianceProviders({ page_size: 1 }).catch(() => ({ count: 0 })),
      ]);
      setStats({
        clients: clients?.count || 0,
        projects: projects?.count || 0,
        points: points?.count || 0,
        schemes: schemes?.count || 0,
        variables: variables?.count || 0,
        telemetryProviders: telemetry?.count || 0,
        complianceProviders: compliance?.count || 0,
      });
    } catch (err) {
      console.error("[OperationalDashboard] error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    { label: "Clientes", value: stats.clients, icon: TeamOutlined, path: "/admin/clients", color: token.colorInfo },
    { label: "Proyectos", value: stats.projects, icon: ProjectOutlined, path: "/admin/projects", color: token.colorSuccess },
    { label: "Puntos de captación", value: stats.points, icon: EnvironmentOutlined, path: "/admin/points", color: token.colorWarning },
    { label: "Esquemas", value: stats.schemes, icon: BuildOutlined, path: "/admin/schemes", color: token.colorPrimary },
    { label: "Variables", value: stats.variables, icon: ApartmentOutlined, path: "/admin/variables", color: token.colorError },
    { label: "Proveedores de telemetría", value: stats.telemetryProviders, icon: CloudOutlined, path: "/admin/providers", color: token.colorTextSecondary },
    { label: "Proveedores de cumplimiento", value: stats.complianceProviders, icon: CloudOutlined, path: "/admin/providers", color: token.colorTextDisabled },
  ];

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
          Dashboard Operacional
        </Title>
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate("/admin/performance")}>
          Ir a Rendimiento
        </Button>
      </Flex>

      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        Vista general de los activos operacionales administrados desde Ikolu.
      </Text>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {cards.map((card) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={card.label}>
              <Card
                hoverable
                onClick={() => navigate(card.path)}
                style={{
                  background: token.colorBgElevated,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                }}
              >
                <Flex align="center" gap={16}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${card.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <card.icon style={{ fontSize: 24, color: card.color }} />
                  </div>
                  <Statistic
                    title={card.label}
                    value={card.value}
                    valueStyle={{ color: token.colorTextHeading, fontWeight: 700 }}
                  />
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
};

export default OperationalDashboard;
