import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Statistic, Flex, Button, Spin } from "antd";
import {
  AlertOutlined,
  NotificationOutlined,
  FireOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useNavigate } from "react-router-dom";
import orchestrator from "../../../api/orchestrator";

const { Title } = Typography;

const AlertsDashboard = () => {
  const token = useIkoluToken();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ rules: 0, channels: 0, triggers: 0, activeTriggers: 0 });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [rules, channels, triggers] = await Promise.all([
        orchestrator.alerts.rules.get({ page_size: 1 }).catch(() => ({ count: 0 })),
        orchestrator.alerts.channels.get({ page_size: 1 }).catch(() => ({ count: 0 })),
        orchestrator.alerts.triggers.get({ page_size: 1, is_acknowledged: false }).catch(() => ({
          count: 0,
        })),
      ]);
      setStats({
        rules: rules?.count || 0,
        channels: channels?.count || 0,
        triggers: triggers?.count || 0,
        activeTriggers: triggers?.count || 0,
      });
    } catch (err) {
      console.error("[AlertsDashboard] error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      label: "Reglas",
      value: stats.rules,
      icon: AlertOutlined,
      path: "/admin/alerts/rules",
      color: token.colorWarning,
    },
    {
      label: "Canales",
      value: stats.channels,
      icon: NotificationOutlined,
      path: "/admin/alerts/channels",
      color: token.colorInfo,
    },
    {
      label: "Disparos activos",
      value: stats.activeTriggers,
      icon: FireOutlined,
      path: "/admin/alerts/triggers",
      color: token.colorError,
    },
  ];

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
          Centro de Alertas
        </Title>
        <Button icon={<ReloadOutlined />} onClick={loadStats} loading={loading}>
          Actualizar
        </Button>
      </Flex>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {cards.map((card) => (
            <Col xs={24} sm={12} lg={8} key={card.label}>
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

export default AlertsDashboard;
