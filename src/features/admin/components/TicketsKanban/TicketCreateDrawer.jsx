import React, { useMemo, useState } from "react";
import { Drawer, Form, Input, Select, Button, Flex, Cascader } from "antd";
import { SmartButton } from "../../../../shared/ui";

const { TextArea } = Input;

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
  { value: "critical", label: "Crítica" },
];

/**
 * Drawer con formulario para crear un nuevo ticket de soporte.
 */
const TicketCreateDrawer = ({ open, onClose, onCreate, clientsWithProjects, loading }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const pointOptions = useMemo(() => {
    return clientsWithProjects.map((client) => ({
      value: client.id,
      label: client.name || client.legal_name || `Cliente ${client.id}`,
      children: (client.projects || []).map((project) => ({
        value: project.id,
        label: project.name || `Proyecto ${project.id}`,
        children: (project.points || project.catchment_points || []).map((point) => ({
          value: point.id,
          label: point.name || point.title || `Punto ${point.id}`,
        })),
      })),
    }));
  }, [clientsWithProjects]);

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        message: values.message,
        priority: values.priority,
        category: values.category,
      };
      if (values.emails) {
        payload.emails = values.emails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);
      }
      if (values.point && values.point.length >= 3) {
        payload.catchment_point = values.point[2];
      }
      await onCreate(payload);
      form.resetFields();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title="Crear Ticket"
      open={open}
      onClose={onClose}
      width={520}
      footer={
        <Flex justify="end" gap={12}>
          <Button onClick={onClose}>Cancelar</Button>
          <SmartButton
            variant="primary"
            onClick={() => form.submit()}
            loading={submitting || loading}
          >
            Crear Ticket
          </SmartButton>
        </Flex>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="title"
          label="Título"
          rules={[{ required: true, message: "Ingresa un título" }]}
        >
          <Input placeholder="Ej. Falla en telemetría punto norte" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Mensaje"
          rules={[{ required: true, message: "Ingresa un mensaje" }]}
        >
          <TextArea rows={4} placeholder="Describe el problema..." />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Prioridad"
          initialValue="medium"
          rules={[{ required: true, message: "Selecciona una prioridad" }]}
        >
          <Select placeholder="Selecciona prioridad" options={PRIORITY_OPTIONS} />
        </Form.Item>

        <Form.Item name="category" label="Categoría">
          <Input placeholder="Ej. Telemetría, Facturación, DGA" />
        </Form.Item>

        <Form.Item name="point" label="Punto de captación">
          <Cascader
            options={pointOptions}
            placeholder="Cliente / Proyecto / Punto"
            changeOnSelect
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item name="emails" label="Emails adicionales (separados por coma)">
          <Input placeholder="soporte@ejemplo.com, admin@ejemplo.com" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default TicketCreateDrawer;
