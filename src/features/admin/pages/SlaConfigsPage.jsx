import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Flex,
  Typography,
  Card,
  Form,
  Select,
  InputNumber,
  Switch,
  Popconfirm,
  Empty,
  Button,
  message,
  Row,
  Col,
  Avatar,
  Tooltip,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  HourglassOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useResponsive } from "../../../hooks/useResponsive";
import { useSlaConfigs } from "../hooks/useSlaConfigs";
import { useTicketCatalogs } from "../hooks/useTicketCatalogs";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { SmartButton } from "../../../shared/ui";
import { PRIORITY_OPTIONS, getTicketPriorityConfig } from "../constants/tickets";


const { Title, Text } = Typography;

/**
 * Formatea un número de horas en días/horas legibles.
 */
const formatHours = (hours) => {
  if (hours == null) return "-";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remaining = hours % 24;
  if (remaining === 0) return `${days}d`;
  return `${days}d ${remaining}h`;
};

/**
 * Página de configuración SLA.
 *
 * Muestra cada configuración como una tarjeta visual por prioridad.
 * Solo administradores pueden crear/editar/eliminar.
 */
const SlaConfigsPage = () => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const { isAdmin, isSuperUser } = useAdminAuth();
  const canEdit = isAdmin || isSuperUser;

  const {
    slaConfigs,
    loading: slaLoading,
    fetchSlaConfigs,
    createSlaConfig,
    updateSlaConfig,
    deleteSlaConfig,
  } = useSlaConfigs({ autoLoad: true });

  const { users, fetchUsers } = useTicketCatalogs({ autoLoad: false });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (drawerOpen && editingConfig) {
      form.setFieldsValue({
        priority: editingConfig.priority,
        response_time_hours: editingConfig.response_time_hours,
        resolution_time_hours: editingConfig.resolution_time_hours,
        business_hours_only:
          editingConfig.business_hours_only !== undefined
            ? editingConfig.business_hours_only
            : true,
        is_active:
          editingConfig.is_active !== undefined ? editingConfig.is_active : true,
        escalation_user: editingConfig.escalation_user || undefined,
      });
    } else if (drawerOpen) {
      form.resetFields();
      form.setFieldsValue({
        business_hours_only: true,
        is_active: true,
      });
    }
  }, [drawerOpen, editingConfig, form]);

  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  const handleRefresh = useCallback(() => {
    fetchSlaConfigs();
    fetchUsers();
  }, [fetchSlaConfigs, fetchUsers]);

  const handleOpenCreate = useCallback(() => {
    setEditingConfig(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((record) => {
    setEditingConfig(record);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingConfig(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        priority: values.priority,
        response_time_hours: Number(values.response_time_hours),
        resolution_time_hours: Number(values.resolution_time_hours),
        business_hours_only: values.business_hours_only,
        is_active: values.is_active,
        escalation_user: values.escalation_user || null,
      };

      if (editingConfig) {
        await updateSlaConfig(editingConfig.id, payload);
      } else {
        await createSlaConfig(payload);
      }

      handleCloseDrawer();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err.message || "Error al guardar la configuración SLA");
    } finally {
      setSubmitting(false);
    }
  }, [form, editingConfig, createSlaConfig, updateSlaConfig, handleCloseDrawer]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteSlaConfig(id);
      } catch (err) {
        message.error(err.message || "Error al eliminar la configuración SLA");
      }
    },
    [deleteSlaConfig]
  );

  const sortedConfigs = useMemo(() => {
    const order = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3 };
    return [...slaConfigs].sort(
      (a, b) => (order[a.priority] ?? 99) - (order[b.priority] ?? 99)
    );
  }, [slaConfigs]);

  return (
    <div style={{ padding: 24 }}>
      <Flex
        justify="space-between"
        align="center"
        gap={isMobile ? 12 : 0}
        style={{ marginBottom: 24 }}
        vertical={isMobile}
        wrap
      >
        <Flex align="center" gap={12} wrap>
          <SettingOutlined style={{ fontSize: 24, color: token.colorAccent }} />
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: token.voidTextHeading }}>
            Configuración SLA
          </Title>
        </Flex>
        <Flex gap={12} align="center" justify={isMobile ? "flex-end" : "flex-start"} style={{ width: isMobile ? "100%" : "auto" }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={slaLoading}
            shape={isMobile ? "circle" : "default"}
            style={{ width: isMobile ? "auto" : "auto" }}
            title="Actualizar"
          >
            {!isMobile && "Actualizar"}
          </Button>
          {canEdit && (
            <SmartButton
              variant="void"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              shape={isMobile ? "circle" : "default"}
              title="Nueva configuración"
            >
              {!isMobile && "Nueva configuración"}
            </SmartButton>
          )}
        </Flex>
      </Flex>

      {slaLoading && slaConfigs.length === 0 ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col key={i} xs={24} md={12} lg={6}>
              <Card loading style={{ minHeight: 260 }} />
            </Col>
          ))}
        </Row>
      ) : slaConfigs.length === 0 ? (
        <Empty description="No hay configuraciones SLA registradas" />
      ) : (
        <Row gutter={[16, 16]}>
          {sortedConfigs.map((config) => {
            const priority = getTicketPriorityConfig(config.priority);
            const escalationName =
              config.escalation_user_name ||
              userMap[config.escalation_user]?.full_name ||
              userMap[config.escalation_user]?.username ||
              (config.escalation_user ? `Usuario ${config.escalation_user}` : null);

            return (
              <Col key={config.id} xs={24} md={12} lg={6}>
                <Card
                  style={{
                    background: token.voidSurface,
                    borderColor: priority.borderColor || token.voidBorder,
                    borderTop: `4px solid ${priority.borderColor || priority.color}`,
                    height: "100%",
                    opacity: config.is_active === false ? 0.65 : 1,
                  }}
                  bodyStyle={{ padding: 20 }}
                  actions={
                    canEdit
                      ? [
                          <Tooltip title="Editar" key="edit">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleOpenEdit(config)}
                            />
                          </Tooltip>,
                          <Popconfirm
                            key="delete"
                            title="¿Eliminar configuración SLA?"
                            description="Esta acción no se puede deshacer."
                            onConfirm={() => handleDelete(config.id)}
                            okText="Eliminar"
                            cancelText="Cancelar"
                            okButtonProps={{ danger: true }}
                          >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                          </Popconfirm>,
                        ]
                      : undefined
                  }
                >
                  <Flex vertical gap={16}>
                    <Flex justify="space-between" align="center">
                      <Flex align="center" gap={10}>
                        <Avatar
                          size="large"
                          style={{
                            background: priority.borderColor || priority.color,
                            color: "#fff",
                            fontWeight: 700,
                          }}
                        >
                          {priority.label.charAt(0)}
                        </Avatar>
                        <div>
                          <Text strong style={{ fontSize: 16, color: token.voidTextHeading }}>
                            SLA {priority.label}
                          </Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              ID #{config.id}
                            </Text>
                          </div>
                        </div>
                      </Flex>
                      {config.is_active ? (
                        <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 18 }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: token.colorError, fontSize: 18 }} />
                      )}
                    </Flex>

                    {!config.is_active && (
                      <Tag color="default" style={{ alignSelf: "flex-start" }}>
                        Inactiva
                      </Tag>
                    )}

                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <Card
                          size="small"
                          style={{ background: token.voidSurface, border: "none" }}
                          bodyStyle={{ padding: 12 }}
                        >
                          <Flex vertical align="center" gap={4}>
                            <ThunderboltOutlined
                              style={{ color: token.colorWarning, fontSize: 18 }}
                            />
                            <Text strong style={{ fontSize: 18 }}>
                              {formatHours(config.response_time_hours)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Respuesta
                            </Text>
                          </Flex>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card
                          size="small"
                          style={{ background: token.voidSurface, border: "none" }}
                          bodyStyle={{ padding: 12 }}
                        >
                          <Flex vertical align="center" gap={4}>
                            <HourglassOutlined
                              style={{ color: token.voidTextMuted, fontSize: 18 }}
                            />
                            <Text strong style={{ fontSize: 18 }}>
                              {formatHours(config.resolution_time_hours)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Resolución
                            </Text>
                          </Flex>
                        </Card>
                      </Col>
                    </Row>

                    <Flex vertical gap={8}>
                      <Flex align="center" gap={8}>
                        <ClockCircleOutlined style={{ color: token.voidTextMuted }} />
                        <Text style={{ fontSize: 13 }}>
                          Horario:{" "}
                          <Text strong>
                            {config.business_hours_only ? "Hábil" : "24/7"}
                          </Text>
                        </Text>
                      </Flex>
                      {escalationName ? (
                        <Flex align="center" gap={8}>
                          <Avatar
                            size="small"
                            style={{
                              background: token.voidSurface,
                              color: token.voidTextHeading,
                              fontSize: 10,
                            }}
                          >
                            <UserOutlined style={{ fontSize: 10 }} />
                          </Avatar>
                          <Text style={{ fontSize: 13 }}>
                            Escalación:{" "}
                            <Text strong>{escalationName}</Text>
                          </Text>
                        </Flex>
                      ) : (
                        <Flex align="center" gap={8}>
                          <Avatar
                            size="small"
                            style={{
                              background: token.voidSurface,
                              color: token.voidTextMuted,
                              fontSize: 10,
                            }}
                          >
                            <UserOutlined style={{ fontSize: 10 }} />
                          </Avatar>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Sin usuario de escalación
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                  </Flex>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Card
        title={editingConfig ? "Editar configuración SLA" : "Nueva configuración SLA"}
        style={{
          position: "fixed",
          top: 0,
          right: drawerOpen ? 0 : (isMobile ? "-100%" : -420),
          width: isMobile ? "100%" : 420,
          height: "100vh",
          zIndex: 1000,
          borderRadius: 0,
          transition: "right 0.25s ease",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.35)",
          background: token.glassBg,
          borderLeft: `1px solid ${token.glassBorder}`,
          backdropFilter: "blur(10px)",
        }}
        headStyle={{ background: token.glassBg, borderBottom: `1px solid ${token.glassBorder}` }}
        bodyStyle={{ padding: 20, overflowY: "auto", height: "calc(100% - 110px)", background: "transparent" }}
        extra={
          <Button type="text" onClick={handleCloseDrawer} style={{ color: token.voidTextHeading }}>
            Cerrar
          </Button>
        }
        actions={[
          <Flex key="actions" justify="flex-end" gap={12} style={{ padding: "0 16px", background: "transparent" }}>
            <SmartButton variant="voidGhost" onClick={handleCloseDrawer}>Cancelar</SmartButton>
            <SmartButton variant="void" onClick={handleSubmit} loading={submitting}>
              {editingConfig ? "Guardar cambios" : "Crear configuración"}
            </SmartButton>
          </Flex>,
        ]}
      >
        {!canEdit ? (
          <Empty description="No tienes permisos para editar configuraciones SLA" />
        ) : (
          <Form form={form} layout="vertical" disabled={submitting}>
            <Form.Item
              name="priority"
              label="Prioridad"
              rules={[{ required: true, message: "Selecciona una prioridad" }]}
            >
              <Select
                placeholder="Selecciona prioridad"
                options={PRIORITY_OPTIONS}
                disabled={!!editingConfig}
              />
            </Form.Item>

            <Form.Item
              name="response_time_hours"
              label="Tiempo máximo de primera respuesta (horas)"
              rules={[
                { required: true, message: "Ingresa el tiempo de respuesta" },
                { type: "number", min: 0, message: "Debe ser mayor o igual a 0" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} placeholder="Ej: 4" />
            </Form.Item>

            <Form.Item
              name="resolution_time_hours"
              label="Tiempo máximo de resolución (horas)"
              rules={[
                { required: true, message: "Ingresa el tiempo de resolución" },
                { type: "number", min: 0, message: "Debe ser mayor o igual a 0" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} placeholder="Ej: 24" />
            </Form.Item>

            <Form.Item name="escalation_user" label="Usuario de escalación">
              <Select
                placeholder="Selecciona un usuario"
                allowClear
                showSearch
                optionFilterProp="label"
                options={users.map((u) => ({
                  value: u.id,
                  label: u.full_name || u.username || u.email || `Usuario ${u.id}`,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="business_hours_only"
              label="Solo horario hábil"
              valuePropName="checked"
            >
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>

            <Form.Item name="is_active" label="Activo" valuePropName="checked">
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
          </Form>
        )}
      </Card>

      {drawerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 999,
          }}
          onClick={handleCloseDrawer}
        />
      )}
    </div>
  );
};

export default SlaConfigsPage;
