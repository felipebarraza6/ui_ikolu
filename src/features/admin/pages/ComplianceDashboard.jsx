import React, { useEffect, useState } from "react";
import {
  Flex,
  Typography,
  Button,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Form,
  Input,
  Select,
  Spin,
  message,
  Space,
} from "antd";
import { ReloadOutlined, FileProtectOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import orchestrator from "../../../api/orchestrator";

const { Title, Text } = Typography;
const { Option } = Select;

const levelColor = {
  safe: "green",
  warning: "orange",
  critical: "red",
  unknown: "default",
};

const levelLabel = {
  safe: "OK",
  warning: "Advertencia",
  critical: "Crítico",
  unknown: "Desconocido",
};

const ComplianceDashboard = () => {
  const token = useIkoluToken();
  const [data, setData] = useState({ stats: {}, points: [] });
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [form] = Form.useForm();

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const res = await orchestrator.compliance();
      setData({
        stats: res?.stats || {},
        points: res?.points || [],
      });
    } catch (err) {
      console.error("[ComplianceDashboard] error:", err);
      message.error("Error al cargar cumplimiento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompliance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (values) => {
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      const res = await orchestrator.verifyDgaVoucher(
        values.codigo_obra,
        values.numero_comprobante,
        values.tipo_dga
      );
      setVerifyResult(res);
    } catch (err) {
      message.error("Error al verificar comprobante");
    } finally {
      setVerifyLoading(false);
    }
  };

  const columns = [
    {
      title: "Punto",
      dataIndex: "point_name",
      key: "point_name",
      render: (v) => <Text strong>{v}</Text>,
    },
    { title: "Código", dataIndex: "code", key: "code", render: (v) => v || "—" },
    {
      title: "Tipo",
      key: "type",
      render: (_, r) => (
        <Space size={4}>
          {r.send_dga && <Tag color="blue">DGA</Tag>}
          {r.send_sma && <Tag color="purple">SMA</Tag>}
        </Space>
      ),
    },
    { title: "Estándar", dataIndex: "standard", key: "standard", render: (v) => v || "—" },
    {
      title: "Caudal autorizado",
      dataIndex: "authorized_flow",
      key: "authorized_flow",
      render: (v) => (v !== null ? `${v} l/s` : "—"),
    },
    {
      title: "Caudal actual",
      dataIndex: "flow",
      key: "flow",
      render: (v) => (v !== null ? `${v} l/s` : "—"),
    },
    {
      title: "Estado",
      key: "status",
      render: (_, r) => {
        const level = r.compliance_warning?.level || "unknown";
        return <Tag color={levelColor[level]}>{levelLabel[level]}</Tag>;
      },
    },
    {
      title: "Mensajes",
      key: "messages",
      render: (_, r) => {
        const messages = r.compliance_warning?.messages || [];
        return (
          <Space size={4} direction="vertical" style={{ maxWidth: 300 }}>
            {messages.map((m, i) => (
              <Text key={i} type="secondary" ellipsis title={m}>
                {m}
              </Text>
            ))}
            {messages.length === 0 && "—"}
          </Space>
        );
      },
    },
    {
      title: "% consumido",
      key: "pct",
      render: (_, r) => {
        const pct = r.compliance_warning?.flow_pct;
        return pct !== null && pct !== undefined ? `${pct.toFixed(1)}%` : "—";
      },
    },
  ];

  const stats = data.stats || {};

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <FileProtectOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Cumplimiento DGA / SMA
          </Title>
        </Flex>
        <Button icon={<ReloadOutlined />} onClick={loadCompliance} loading={loading}>
          Actualizar
        </Button>
      </Flex>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Puntos monitoreados" value={stats.total || 0} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Con advertencias"
                value={stats.with_warnings || 0}
                valueStyle={{ color: token.colorWarning }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Críticos"
                value={stats.with_critical || 0}
                valueStyle={{ color: token.colorError }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Por estándar" value={Object.keys(stats.by_standard || {}).length} />
            </Card>
          </Col>
        </Row>

        <SmartCard title="Puntos en seguimiento" style={{ marginBottom: 24 }}>
          <Table
            rowKey="point_id"
            columns={columns}
            dataSource={data.points}
            size="small"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        </SmartCard>

        <SmartCard title="Verificar comprobante DGA">
          <Form form={form} layout="vertical" onFinish={handleVerify}>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="numero_comprobante"
                  label="N° Comprobante"
                  rules={[{ required: true, message: "Requerido" }]}
                >
                  <Input placeholder="Ej: 12345678" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="codigo_obra" label="Código de obra">
                  <Input placeholder="Opcional" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="tipo_dga"
                  label="Tipo DGA"
                  initialValue="SUPERFICIAL"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="SUPERFICIAL">Superficial</Option>
                    <Option value="SUBTERRANEO">Subterráneo</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label=" ">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SafetyCertificateOutlined />}
                    loading={verifyLoading}
                    block
                  >
                    Verificar
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {verifyResult && (
            <Card
              size="small"
              style={{ marginTop: 16, background: token.colorBgContainer }}
              title={`Resultado: ${verifyResult.status === "00" ? "OK" : "Error"}`}
            >
              <Text>{verifyResult.message}</Text>
              {verifyResult.data && (
                <pre style={{ marginTop: 12, fontSize: 12 }}>
                  {JSON.stringify(verifyResult.data, null, 2)}
                </pre>
              )}
            </Card>
          )}
        </SmartCard>
      </Spin>
    </div>
  );
};

export default ComplianceDashboard;
