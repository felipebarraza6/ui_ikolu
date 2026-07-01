import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Drawer, Form, Input, Select, Button, Flex, Typography } from "antd";
import { SmartButton } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import orchestrator from "../../../../api/orchestrator";
import {
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
} from "../../constants/tickets";

const { TextArea } = Input;
const { Text } = Typography;

/**
 * Drawer con formulario para crear un nuevo ticket de soporte.
 *
 * Utiliza tres selects en cascada: Cliente → Proyecto → Punto de captación.
 * Los puntos se cargan bajo demanda según el proyecto seleccionado.
 */
const TicketCreateDrawer = ({ open, onClose, onCreate, clientsWithProjects, loading }) => {
  const token = useIkoluToken();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointOptions, setPointOptions] = useState([]);

  const clientOptions = useMemo(
    () =>
      clientsWithProjects.map((client) => ({
        value: client.id,
        label: client.name || client.legal_name || `Cliente ${client.id}`,
      })),
    [clientsWithProjects]
  );

  const selectedClient = Form.useWatch("client", form);
  const selectedProject = Form.useWatch("project", form);

  const projectOptions = useMemo(() => {
    if (!selectedClient) return [];
    const client = clientsWithProjects.find((c) => c.id === selectedClient);
    return (client?.projects || []).map((project) => ({
      value: project.id,
      label: project.name || `Proyecto ${project.id}`,
    }));
  }, [selectedClient, clientsWithProjects]);

  const loadPoints = useCallback(async (projectId) => {
    if (!projectId) {
      setPointOptions([]);
      return;
    }
    setPointsLoading(true);
    try {
      const res = await orchestrator.admin.projectPoints(projectId);
      const points = Array.isArray(res?.points) ? res.points : Array.isArray(res) ? res : res?.results || [];
      setPointOptions(
        points.map((point) => ({
          value: point.id,
          label: point.name || point.title || `Punto ${point.id}`,
        }))
      );
    } catch (err) {
      console.error("[TicketCreateDrawer] error loading points:", err);
      setPointOptions([]);
    } finally {
      setPointsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadPoints(selectedProject);
    } else {
      setPointOptions([]);
    }
  }, [selectedProject, loadPoints]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setPointOptions([]);
    }
  }, [open, form]);

  const handleClientChange = () => {
    form.setFieldsValue({ project: undefined, point_catchment: undefined });
    setPointOptions([]);
  };

  const handleProjectChange = () => {
    form.setFieldsValue({ point_catchment: undefined });
    setPointOptions([]);
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        category: values.category,
      };
      if (values.point_catchment) {
        payload.point_catchment = values.point_catchment;
      }
      await onCreate(payload);
      form.resetFields();
      setPointOptions([]);
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
          name="description"
          label="Descripción"
          rules={[{ required: true, message: "Ingresa una descripción" }]}
        >
          <TextArea rows={4} placeholder="Describe el problema..." />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Prioridad"
          initialValue="MEDIA"
          rules={[{ required: true, message: "Selecciona una prioridad" }]}
        >
          <Select placeholder="Selecciona prioridad" options={PRIORITY_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="category"
          label="Categoría"
          initialValue="TELEMETRIA"
          rules={[{ required: true, message: "Selecciona una categoría" }]}
        >
          <Select placeholder="Selecciona categoría" options={CATEGORY_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="client"
          label="Cliente"
          rules={[{ required: true, message: "Selecciona un cliente" }]}
        >
          <Select
            placeholder="Selecciona cliente"
            options={clientOptions}
            onChange={handleClientChange}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <div
          style={{
            overflow: "hidden",
            transition: "all 0.25s ease",
            opacity: selectedClient ? 1 : 0,
            maxHeight: selectedClient ? 200 : 0,
            marginBottom: selectedClient ? 0 : -12,
          }}
        >
          <Form.Item
            name="project"
            label="Proyecto"
            rules={[{ required: true, message: "Selecciona un proyecto" }]}
          >
            <Select
              placeholder="Selecciona proyecto"
              options={projectOptions}
              onChange={handleProjectChange}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </div>

        <div
          style={{
            overflow: "hidden",
            transition: "all 0.25s ease",
            opacity: selectedProject ? 1 : 0,
            maxHeight: selectedProject ? 200 : 0,
            marginBottom: selectedProject ? 0 : -12,
          }}
        >
          <Form.Item
            name="point_catchment"
            label="Punto de captación"
            rules={[{ required: true, message: "Selecciona un punto de captación" }]}
          >
            <Select
              placeholder="Selecciona punto de captación"
              options={pointOptions}
              loading={pointsLoading}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  );
};

export default TicketCreateDrawer;
