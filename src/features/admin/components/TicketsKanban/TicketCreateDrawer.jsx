import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Drawer, Form, Input, Select, Flex, Steps, Typography, Tag, Switch, Result } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { SmartButton } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import { useResponsive } from "../../../../hooks/useResponsive";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import orchestrator from "../../../../api/orchestrator";
import {
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
} from "../../constants/tickets";

const { TextArea } = Input;
const { Text } = Typography;

const STEP_TITLES = ["Detalle", "Clasificación", "Asociación"];

const stepStyle = (active) => ({
  display: active ? "block" : "none",
});

/**
 * Drawer wizard para crear un nuevo ticket de soporte.
 *
 * Flujo de 3 pasos:
 * 1. Detalle: título, descripción, prioridad y fechas.
 * 2. Clasificación: categoría, origen y fuente.
 * 3. Asociación (opcional): Cliente → Proyecto → Punto de captación.
 */
const TicketCreateDrawer = ({
  open,
  onClose,
  onCreate,
  clientsWithProjects,
  loading,
  categories: propCategories,
}) => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const { isSuperUser } = useAdminAuth();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointOptions, setPointOptions] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [showAllPoints, setShowAllPoints] = useState(false);

  const categories = useMemo(() => propCategories || [], [propCategories]);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) {
      const parents = categories.filter((c) => c.parent == null);
      const children = categories.filter((c) => c.parent != null);

      if (parents.length === 0) {
        return categories.map((c) => ({
          value: c.id,
          label: c.name || c.title || `Categoría ${c.id}`,
        }));
      }

      return parents.map((parent) => ({
        label: parent.name || parent.title || `Categoría ${parent.id}`,
        options: children
          .filter((c) => c.parent === parent.id)
          .map((c) => ({
            value: c.id,
            label: c.name || c.title || `Subcategoría ${c.id}`,
          })),
      }));
    }
    return CATEGORY_OPTIONS;
  }, [categories]);

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

  const handleToggleAllPoints = useCallback(async (checked) => {
    setShowAllPoints(checked);
    form.setFieldsValue({ point_catchment: undefined });
    if (!checked) {
      setSelectedPoints([]);
      return;
    }
    setPointsLoading(true);
    try {
      let points = [];
      if (selectedProject) {
        const res = await orchestrator.admin.projectPoints(selectedProject);
        points = Array.isArray(res?.points) ? res.points : Array.isArray(res) ? res : res?.results || [];
      } else {
        points = await orchestrator.admin.pointsAll();
      }
      const options = points.map((point) => ({
        value: point.id,
        label: point.name || point.title || `Punto ${point.id}`,
      }));
      setSelectedPoints(options.map((option) => ({ id: option.value, label: option.label })));
      setPointOptions(options);
    } catch (err) {
      console.error("[TicketCreateDrawer] error loading all points:", err);
      setPointOptions([]);
      setSelectedPoints([]);
    } finally {
      setPointsLoading(false);
    }
  }, [form, selectedProject]);

  useEffect(() => {
    if (selectedProject && !showAllPoints) {
      loadPoints(selectedProject);
    } else if (!selectedProject && !showAllPoints) {
      setPointOptions([]);
    }
  }, [selectedProject, showAllPoints, loadPoints]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        priority: "MEDIA",
        origin: "CLIENTE",
        source: "APP_ADMIN",
      });
      setCreatedTicket(null);
    } else {
      form.resetFields();
      setCurrentStep(0);
      setPointOptions([]);
      setSelectedPoints([]);
      setShowAllPoints(false);
      setCreatedTicket(null);
    }
  }, [open, form]);

  const handleClientChange = () => {
    form.setFieldsValue({ project: undefined, point_catchment: undefined });
    setShowAllPoints(false);
    setSelectedPoints([]);
    setPointOptions([]);
  };

  const handleProjectChange = () => {
    form.setFieldsValue({ point_catchment: undefined });
    setShowAllPoints(false);
    setSelectedPoints([]);
  };

  const handlePointChange = (pointId) => {
    if (!pointId) return;
    const option = pointOptions.find((p) => p.value === pointId);
    if (!option) return;
    if (selectedPoints.some((p) => p.id === option.value)) {
      form.setFieldsValue({ point_catchment: undefined });
      return;
    }
    setSelectedPoints((prev) => [...prev, { id: option.value, label: option.label }]);
    form.setFieldsValue({ point_catchment: undefined });
  };

  const handleRemovePoint = (id) => {
    setSelectedPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearPoints = () => {
    setSelectedPoints([]);
  };

  const stepFields = useMemo(() => {
    const base = [["title", "description", "priority"], ["category"], ["client", "project", "point_catchment"]];
    if (isSuperUser) {
      base[1] = ["category", "source"];
    }
    return base;
  }, [isSuperUser]);

  const handleNext = async () => {
    try {
      await form.validateFields(stepFields[currentStep]);
      setCurrentStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
    } catch {
      // La validación de Ant Design ya muestra los mensajes de error.
    }
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleFinish = async (values) => {
    const missing = [];
    if (!values.title?.trim()) missing.push("título");
    if (!values.description?.trim()) missing.push("descripción");
    if (!values.priority) missing.push("prioridad");
    if (!values.category) missing.push("categoría");

    if (missing.length > 0) {
      form.scrollToField(missing[0]);
      setCurrentStep(0);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        priority: values.priority,
        category: values.category,
      };

      const hasPoints = selectedPoints.length > 0;

      if (hasPoints) {
        payload.point_catchment = selectedPoints[0].id;
        payload.points = selectedPoints.map((p) => p.id);
      }
      if (values.client) payload.client = values.client;
      if (values.project) payload.project = values.project;

      if (isSuperUser) {
        payload.source = values.source || "APP_ADMIN";
        payload.origin = hasPoints ? "CLIENTE" : "OPERACIONES";
      } else {
        payload.source = "APP_CLIENTE";
        payload.origin = hasPoints ? "CLIENTE" : "OPERACIONES";
      }

      const res = await onCreate(payload);
      setCreatedTicket(res?.id ? res : { id: res?.data?.id || res?.ticket?.id });
      form.resetFields();
      setCurrentStep(0);
      setPointOptions([]);
      setSelectedPoints([]);
    } catch (err) {
      console.error("[TicketCreateDrawer] create error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title={<span style={{ color: token.voidTextHeading }}>Crear Ticket</span>}
      open={open}
      onClose={onClose}
      width={isMobile ? "100%" : 620}
      styles={{
        body: { background: token.glassBg, backdropFilter: "blur(10px)" },
        header: { background: token.glassBg, borderBottom: `1px solid ${token.glassBorder}` },
        footer: { background: token.glassBg, borderTop: `1px solid ${token.glassBorder}` },
        mask: { background: "rgba(0, 0, 0, 0.65)" },
        content: { background: "transparent", boxShadow: token.voidShadow },
      }}
      footer={
        <Flex justify="end" gap={12}>
          {createdTicket ? (
            <>
              <SmartButton variant="voidGhost" onClick={onClose}>Cerrar</SmartButton>
              <SmartButton
                variant="void"
                onClick={() => {
                  setCreatedTicket(null);
                  form.resetFields();
                  setCurrentStep(0);
                }}
              >
                Crear otro ticket
              </SmartButton>
            </>
          ) : (
            <>
              <SmartButton variant="voidGhost" onClick={onClose}>Cancelar</SmartButton>
              {currentStep > 0 && <SmartButton variant="voidGhost" onClick={handlePrev}>Anterior</SmartButton>}
              {currentStep < STEP_TITLES.length - 1 ? (
                <SmartButton variant="void" onClick={handleNext} loading={pointsLoading}>
                  Siguiente
                </SmartButton>
              ) : (
                <SmartButton
                  variant="void"
                  onClick={() => form.submit()}
                  loading={submitting || loading}
                >
                  Crear Ticket
                </SmartButton>
              )}
            </>
          )}
        </Flex>
      }
    >
      {createdTicket ? (
        <Result
          status="success"
          title={<span style={{ color: token.voidTextHeading }}>Ticket creado</span>}
          subTitle={
            <span style={{ color: token.voidText }}>
              Número de ticket: <Text strong style={{ color: token.colorAccent, fontSize: 18 }}>#{createdTicket.id}</Text>
            </span>
          }
          style={{ background: "transparent" }}
        />
      ) : (
        <>
          <Steps
            current={currentStep}
            items={STEP_TITLES.map((title) => ({ title }))}
            style={{ marginBottom: 24 }}
          />
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ minHeight: 320 }}
      >
        {/* Paso 1: Detalle */}
        <div style={stepStyle(currentStep === 0)}>
          <Flex vertical gap={16}>
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
              rules={[{ required: true, message: "Selecciona una prioridad" }]}
            >
              <Select placeholder="Selecciona prioridad" options={PRIORITY_OPTIONS} />
            </Form.Item>
          </Flex>
        </div>

        {/* Paso 2: Clasificación */}
        <div style={stepStyle(currentStep === 1)}>
          <Flex vertical gap={16}>
            <Form.Item
              name="category"
              label="Categoría"
              rules={[{ required: true, message: "Selecciona una categoría" }]}
            >
              <Select placeholder="Selecciona categoría" options={categoryOptions} showSearch optionFilterProp="label" />
            </Form.Item>

            {isSuperUser && (
              <Form.Item
                name="source"
                label="Canal"
                rules={[{ required: true, message: "Selecciona un canal" }]}
              >
                <Select
                  placeholder="Selecciona canal"
                  options={[
                    { value: "APP_ADMIN", label: "App Admin" },
                    { value: "APP_CLIENTE", label: "App Cliente" },
                  ]}
                />
              </Form.Item>
            )}

            {!isSuperUser && (
              <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                El origen y canal se asignarán automáticamente según tu perfil.
              </Text>
            )}
          </Flex>
        </div>

        {/* Paso 3: Asociación (opcional) */}
        <div style={stepStyle(currentStep === 2)}>
          <Flex vertical gap={16}>
            <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
              Asocia el ticket a un punto de captación. Si no seleccionas nada, se creará como ticket interno.
            </Text>

            <Form.Item
              name="client"
              label="Cliente"
            >
              <Select
                placeholder="Selecciona cliente"
                options={clientOptions}
                onChange={handleClientChange}
                showSearch
                optionFilterProp="label"
                allowClear
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
              >
                <Select
                  placeholder="Selecciona proyecto"
                  options={projectOptions}
                  onChange={handleProjectChange}
                  showSearch
                  optionFilterProp="label"
                  allowClear
                />
              </Form.Item>
            </div>

            <div
              style={{
                overflow: "hidden",
                transition: "all 0.25s ease",
                opacity: selectedProject || showAllPoints ? 1 : 0,
                maxHeight: selectedProject || showAllPoints ? 500 : 0,
                marginBottom: selectedProject || showAllPoints ? 0 : -12,
              }}
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                  Puntos de captación
                </Text>
                <Flex align="center" gap={8}>
                  <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                    Todos los puntos
                  </Text>
                    <Switch
                      size="small"
                      checked={showAllPoints}
                      onChange={handleToggleAllPoints}
                    />
                </Flex>
              </Flex>

              <Form.Item
                name="point_catchment"
                style={{ marginBottom: 8 }}
              >
                <Select
                  placeholder="Selecciona un punto"
                  options={pointOptions}
                  loading={pointsLoading}
                  showSearch
                  optionFilterProp="label"
                  allowClear
                  onChange={handlePointChange}
                />
              </Form.Item>

              <Text style={{ fontSize: 11, color: token.voidTextMuted }}>
                El punto seleccionado se agrega automáticamente a la lista.
              </Text>
            </div>

            {selectedPoints.length > 0 && (
              <div
                style={{
                  padding: 12,
                  background: token.voidSurface,
                  borderRadius: token.voidRadius,
                  border: `1px solid ${token.voidBorder}`,
                }}
              >
                <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 12, color: token.voidTextHeading }}>
                    Puntos agregados ({selectedPoints.length})
                  </Text>
                  <SmartButton variant="voidGhost" size="sm" onClick={handleClearPoints}>
                    Limpiar
                  </SmartButton>
                </Flex>
                <Flex wrap gap={8}>
                  {selectedPoints.map((point) => (
                    <Tag
                      key={point.id}
                      closable
                      closeIcon={<CloseCircleOutlined />}
                      onClose={() => handleRemovePoint(point.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        margin: 0,
                      }}
                    >
                      {point.label}
                    </Tag>
                  ))}
                </Flex>
              </div>
            )}
          </Flex>
        </div>
      </Form>
      </>
      )}
    </Drawer>
  );
};

export default TicketCreateDrawer;
