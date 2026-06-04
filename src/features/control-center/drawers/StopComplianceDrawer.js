import React from "react";
import { Drawer, Row, Col, Flex, Typography, Card, Button, Input, Form, DatePicker, Alert, theme } from "antd";
import { FaPauseCircle } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

const { Text } = Typography;
const { useToken } = theme;

const StopComplianceDrawer = ({
  open,
  onClose,
  point,
  form,
  loading,
  onSubmit,
  showDgaAlert,
  showDgaCriticalAlert,
}) => {
  const { token } = useToken();
  const { user } = useAuth();

  return (
    <Drawer
      title={
        <Flex align="center" gap={8}>
          <FaPauseCircle style={{ color: token.colorPrimary, fontSize: 16 }} />
          <Text strong style={{ fontSize: 16 }}>Solicitud para detener cumplimiento</Text>
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
        <Flex vertical gap={12} style={{ marginBottom: 16 }}>
          <Card size="small" bodyStyle={{ padding: 10 }} style={{ background: `${token.colorPrimary}06`, border: `1px solid ${token.colorPrimary}15` }}>
            <Text strong style={{ fontSize: 13, display: "block" }}>{point.name}</Text>
            <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Código: {point.code}</Text>
          </Card>
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
        {showDgaAlert && !showDgaCriticalAlert && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12, fontSize: 12 }}
            message="Informe Técnico requerido"
            description={
              <Text style={{ fontSize: 12 }}>
                La detención supera los 5 días. Se debe enviar el <strong>Informe Técnico</strong> (formato libre) que cumpla con los fundamentos principales y cuyo objetivo sea evidenciar las actividades realizadas en terreno.
              </Text>
            }
          />
        )}
        {showDgaCriticalAlert && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 12, fontSize: 12 }}
            message="Informe Detallado Obligatorio"
            description={
              <Text style={{ fontSize: 12 }}>
                La detención supera los 10 días. Se debe confeccionar un <strong>informe detallado de las actividades realizadas en terreno</strong>, evidenciando cada una de las labores ejecutadas.
              </Text>
            }
          />
        )}
        <Form.Item
          name="reason"
          label="Razón de la solicitud"
          rules={[{ required: true, message: "Ingresa la razón" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Ej: Pausa temporal por reconfiguración normativa..."
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

export default React.memo(StopComplianceDrawer);
