import React, { useCallback } from "react";
import { Drawer, Form, Input, Select, Button, Flex, Typography, Card, theme, message } from "antd";
import { FaHeadset } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import sh from "../../api/sh/endpoints";

const { Text } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

const SUPPORT_TYPES = [
  { value: "TECNICO", label: "Soporte Técnico" },
  { value: "DGA", label: "Consulta DGA" },
  { value: "INSTALACION", label: "Instalación / Mantención" },
  { value: "DATOS", label: "Problema con Datos" },
  { value: "OTRO", label: "Otro" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
];

const CCSupportDrawer = ({ open, onClose, point, form, loading, setLoading, contextType = "SOPORTE" }) => {
  const { token } = useToken();
  const { user } = useAuth();

  const handleSubmit = useCallback(async (values) => {
    if (!point) return;
    setLoading(true);
    try {
      const payload = {
        title: `Solicitud de soporte - ${point.name}`,
        message: values.description.trim(),
        point_catchment: point.id,
        type_notification: "SUPPORT",
        type_alert: contextType,
        type_variable: "TODOS",
        priority: values.priority,
        assigned_to: null,
        is_periodic: false,
        is_active: true,
        is_read: false,
        is_response: false,
        is_finish: false,
        is_wait: false,
        status_dga: "PENDING",
        status_sma: "PENDING",
        emails: user?.email ? [user.email] : [],
      };
      const res = await sh.notifications.create(payload);
      message.success(`Ticket #${res.id} creado exitosamente`);
      form.resetFields();
      onClose();
    } catch (err) {
      console.error("[SupportRequest] Error:", err);
      message.error("Error al crear el ticket de soporte");
    } finally {
      setLoading(false);
    }
  }, [point, form, user?.email, onClose, setLoading, contextType]);

  return (
    <Drawer
      title={
        <Flex align="center" gap={8}>
          <FaHeadset style={{ color: token.colorPrimary, fontSize: 16 }} />
          <Text strong style={{ fontSize: 16 }}>Solicitud de soporte</Text>
        </Flex>
      }
      open={open}
      onClose={() => {
        onClose();
        form.resetFields();
      }}
      width={420}
      styles={{ body: { padding: 20 } }}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={() => { onClose(); form.resetFields(); }}>
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
          <Card size="small" bodyStyle={{ padding: 12 }} className="ocean-info-card">
            <Text className="ocean-text-base ocean-text-primary ocean-font-semibold" style={{ display: "block" }}>{point.name}</Text>
            {point.code ? (
              <Text className="ocean-text-sm ocean-text-muted">Código: {point.code}</Text>
            ) : point.client ? (
              <Text className="ocean-text-sm ocean-text-muted">Cliente: {point.client}</Text>
            ) : null}
          </Card>
        </Flex>
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="priority"
          label="Prioridad"
          initialValue="medium"
          rules={[{ required: true, message: "Selecciona la prioridad" }]}
        >
          <Select
            placeholder="Selecciona la prioridad"
            options={PRIORITY_OPTIONS}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descripción del problema"
          rules={[{ required: true, message: "Describe el problema o solicitud" }]}
        >
          <TextArea
            rows={5}
            placeholder="Describe el problema o solicitud de soporte..."
            maxLength={1000}
            showCount
            className="ocean-input-readonly"
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default React.memo(CCSupportDrawer);