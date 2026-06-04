import React from "react";
import { Drawer, Row, Col, Flex, Typography, Button, Input, Form, DatePicker, theme } from "antd";
import { FaHandPaper } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const { Text } = Typography;
const { useToken } = theme;

const StopTelemetryDrawer = ({
  open,
  onClose,
  point,
  form,
  loading,
  onSubmit,
}) => {
  const { token } = useToken();
  const { user } = useAuth();

  return (
    <Drawer
      title={
        <Flex align="center" gap={8}>
          <FaHandPaper style={{ color: token.colorPrimary, fontSize: 16 }} />
          <Text strong style={{ fontSize: 16 }}>Solicitud para detener telemetría</Text>
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={420}
      styles={{ body: { padding: 20 } }}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            Enviar solicitud
          </Button>
        </Flex>
      }
    >
      {point && (
        <Flex vertical style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 14 }}>{point.name}</Text>
        </Flex>
      )}
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item label="Solicitado por">
          <Input
            value={user ? `${user.first_name || user.username} (${user.email})` : "—"}
            readOnly
            style={{ borderRadius: 8, fontSize: 13, background: token.colorBgContainerDisabled }}
          />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="start_date"
              label="Fecha inicio"
              rules={[{ required: true, message: "Selecciona fecha" }]}
            >
              <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Inicio" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="end_date"
              label="Fecha fin"
              rules={[{ required: true, message: "Selecciona fecha" }]}
            >
              <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Fin" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="reason"
          label="Razón de la solicitud"
          rules={[{ required: true, message: "Ingresa la razón" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Ej: Mantenimiento programado del sensor..."
            maxLength={500}
            showCount
            style={{ borderRadius: 8, fontSize: 13 }}
          />
        </Form.Item>
        <Form.Item hidden name="pointId" initialValue={point?.id}>
          <Input />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default React.memo(StopTelemetryDrawer);
