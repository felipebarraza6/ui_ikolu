import React, { useEffect, useState, useCallback } from "react";
import {
  Drawer,
  Tabs,
  Flex,
  Typography,
  Select,
  Button,
  Form,
  Input,
  List,
  Avatar,
  Upload,
  Spin,
  Empty,
  Descriptions,
  Tag,
  DatePicker,
  Popconfirm,
  Checkbox,
  Timeline,
  message,
} from "antd";
import {
  UserOutlined,
  PaperClipOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  UploadOutlined,
  ToolOutlined,
  DeleteOutlined,
  FileOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { SmartBadge, SmartButton } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import { useResponsive } from "../../../../hooks/useResponsive";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import {
  STATUS_OPTIONS,
  getTicketStatusLabel,
  getTicketPriorityConfig,
  getTicketCategoryLabel,
  getTicketSourceLabel,
  getTicketOriginLabel,
  getTicketDateValue,
  getSlaStatus,
  isTicketInOT,
  validateTicketAttachment,
} from "../../constants/tickets";

const { Title, Text } = Typography;
const { TextArea } = Input;

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy HH:mm", { locale: es });
  } catch {
    return value;
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy", { locale: es });
  } catch {
    return value;
  }
};

const formatTicketDateTime = (ticket, ...fields) => {
  const date = getTicketDateValue(ticket, ...fields);
  return date ? format(date, "dd MMM yyyy HH:mm", { locale: es }) : "-";
};

const formatTicketDateOnly = (ticket, ...fields) => {
  const date = getTicketDateValue(ticket, ...fields);
  return date ? format(date, "dd MMM yyyy", { locale: es }) : "-";
};

const SlaDetail = ({ deadline, doneAt }) => {
  const token = useIkoluToken();
  const status = getSlaStatus(deadline, doneAt);
  if (!deadline && !doneAt) return <Text style={{ color: token.voidTextMuted }}>-</Text>;
  return (
    <Flex align="center" gap={8} wrap>
      <Text style={{ color: token.voidText }}>
        {deadline ? formatDateTime(deadline) : "Sin límite"}
      </Text>
      <SmartBadge variant={status.variant} size="sm">
        {status.label}
      </SmartBadge>
    </Flex>
  );
};

/**
 * Drawer de detalle de ticket con pestañas de información, comentarios,
 * adjuntos y actividad.
 */
const TicketDetailDrawer = ({
  ticketId,
  open,
  onClose,
  users,
  categories,
  onChangeStatus,
  onAssign,
  onUpdateTicket,
  onDelete,
  onCreateComment,
  onUploadAttachment,
  getTicketById,
  getComments,
  getAttachments,
}) => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const { isStaff } = useAdminAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingOt, setSavingOt] = useState(false);
  const [editingOt, setEditingOt] = useState(false);
  const [commentForm] = Form.useForm();
  const [otForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("info");

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const [t, c, a] = await Promise.all([
        getTicketById(ticketId),
        getComments(ticketId),
        getAttachments(ticketId),
      ]);
      setTicket(t);
      setComments(c);
      setAttachments(a);
    } finally {
      setLoading(false);
    }
  }, [ticketId, getTicketById, getComments, getAttachments]);

  useEffect(() => {
    if (open) load();
  }, [open, ticketId, load]);

  useEffect(() => {
    if (!open) {
      setTicket(null);
      setComments([]);
      setAttachments([]);
      setActiveTab("info");
      setEditingOt(false);
      commentForm.resetFields();
      otForm.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (ticket && editingOt) {
      otForm.setFieldsValue({
        scheduled_date: ticket.scheduled_date ? dayjs(ticket.scheduled_date) : null,
        visit_report: ticket.visit_report || "",
      });
    }
  }, [ticket, editingOt, otForm]);

  const handleStatusChange = async (status) => {
    await onChangeStatus(ticketId, status);
    load();
  };

  const handleAssign = async (userId) => {
    await onAssign(ticketId, userId);
    load();
  };

  const handleComment = async (values) => {
    const payload = {
      content: values.content,
    };
    if (isStaff) {
      if (values.is_internal) payload.is_internal = true;
      if (values.status_change) payload.status_change = values.status_change;
    }
    await onCreateComment(ticketId, payload);
    commentForm.resetFields();
    load();
  };

  const handleUpload = async ({ file }) => {
    const validation = validateTicketAttachment(file);
    if (!validation.valid) {
      message.error(validation.error);
      return;
    }
    await onUploadAttachment(ticketId, file);
    load();
  };

  const handleDelete = async () => {
    await onDelete(ticketId);
    onClose();
  };

  const handleStartEditOt = () => {
    otForm.setFieldsValue({
      scheduled_date: ticket.scheduled_date ? dayjs(ticket.scheduled_date) : null,
      visit_report: ticket.visit_report || "",
    });
    setEditingOt(true);
  };

  const handleCancelEditOt = () => {
    setEditingOt(false);
    otForm.resetFields();
  };

  const handleSaveOt = async (values) => {
    setSavingOt(true);
    try {
      const payload = {};
      if (values.scheduled_date) {
        payload.scheduled_date = values.scheduled_date.format("YYYY-MM-DD");
      } else {
        payload.scheduled_date = null;
      }
      payload.visit_report = values.visit_report || "";
      await onUpdateTicket(ticketId, payload);
      setEditingOt(false);
      await load();
    } finally {
      setSavingOt(false);
    }
  };

  const resolveUserName = (userId) => {
    if (userId == null) return "Desconocido";
    const user = users.find((u) => u.id === userId || u.username === userId);
    if (user) {
      return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.full_name || user.username || user.email;
    }
    return `Usuario ${userId}`;
  };

  const userOptions = users.map((u) => {
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.full_name || u.username || u.email;
    return {
      value: u.id || u.username,
      label: name,
    };
  });

  const resolveCategoryName = (ticket) => {
    if (!ticket) return "-";
    if (ticket.category_detail?.name) return ticket.category_detail.name;
    const found = categories?.find((c) => c.id === ticket.category);
    if (found?.name) return found.name;
    return getTicketCategoryLabel(ticket.category_detail) || `Categoría ${ticket.category}`;
  };

  const resolvePointsLabel = (ticket) => {
    if (!ticket?.points?.length) {
      if (ticket?.point_title) return ticket.point_title;
      if (ticket?.point_catchment) return `Punto ${ticket.point_catchment}`;
      return "-";
    }
    return ticket.points.map((p) => p.title || `Punto ${p.id}`).join(", ");
  };

  const renderOtSection = () => {
    if (!isStaff) return null;
    if (!isTicketInOT(ticket?.status)) return null;

    return (
      <div
        style={{
          padding: 12,
          background: token.glassBg,
          borderRadius: token.voidRadius,
          border: `1px solid ${token.glassBorder}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
          <ToolOutlined style={{ color: token.voidTextHeading }} />
          <Text strong style={{ color: token.voidTextHeading }}>
            Orden de Trabajo
          </Text>
        </Flex>

        {editingOt ? (
          <Form form={otForm} layout="vertical" onFinish={handleSaveOt}>
            <Form.Item name="scheduled_date" label="Fecha programada">
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="visit_report" label="Reporte de visita">
              <TextArea rows={4} placeholder="Detalle del reporte de visita..." />
            </Form.Item>
            <Flex gap={8} justify="flex-end">
              <SmartButton variant="voidGhost" size="sm" onClick={handleCancelEditOt}>
                Cancelar
              </SmartButton>
              <SmartButton variant="void" size="sm" htmlType="submit" loading={savingOt}>
                Guardar
              </SmartButton>
            </Flex>
          </Form>
        ) : (
          <Flex vertical gap={12}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Fecha programada">
                {formatDate(ticket.scheduled_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Reporte de visita">
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {ticket.visit_report || "-"}
                </Text>
              </Descriptions.Item>
            </Descriptions>
            <Flex justify="flex-end">
              <SmartButton variant="void" size="sm" onClick={handleStartEditOt}>
                Editar OT
              </SmartButton>
            </Flex>
          </Flex>
        )}
      </div>
    );
  };

  const infoTab = ticket
    ? {
        key: "info",
        label: (
          <Flex align="center" gap={6}>
            <InfoCircleOutlined /> Información
          </Flex>
        ),
        children: (
          <Flex vertical gap={16}>
            <Flex justify="space-between" align="flex-start" gap={12}>
              <div>
                <Text style={{ color: token.voidTextMuted }}>#{ticket.id}</Text>
                <Title level={4} style={{ margin: 0, color: token.voidTextHeading }}>
                  {ticket.title || `Ticket #${ticket.id}`}
                </Title>
              </div>
              <Tag color={getTicketPriorityConfig(ticket.priority).color}>
                {getTicketPriorityConfig(ticket.priority).label}
              </Tag>
            </Flex>

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Cliente">
                {ticket.client_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Punto(s) de captación">
                {resolvePointsLabel(ticket)}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <SmartBadge variant="void" size="sm">
                  {getTicketStatusLabel(ticket.status)}
                </SmartBadge>
              </Descriptions.Item>
              <Descriptions.Item label="Prioridad">
                {getTicketPriorityConfig(ticket.priority).label}
              </Descriptions.Item>
              <Descriptions.Item label="Categoría">
                {resolveCategoryName(ticket)}
              </Descriptions.Item>
              <Descriptions.Item label="Origen">
                {getTicketOriginLabel(ticket.origin) || ticket.origin || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Canal">
                {getTicketSourceLabel(ticket.source) || ticket.source || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Creado">
                {formatTicketDateTime(ticket, "created", "created_at")}
              </Descriptions.Item>
              <Descriptions.Item label="Creado por">
                {ticket.created_by_name || (ticket.created_by ? `Usuario ${ticket.created_by}` : ticket.source === "SISTEMA" || ticket.origin === "INTERNO" ? "Sistema" : "-")}
              </Descriptions.Item>
              <Descriptions.Item label="Asignado a">
                {ticket.assigned_to_name || (ticket.assigned_to ? `Usuario ${ticket.assigned_to}` : "Sin asignar")}
              </Descriptions.Item>
              <Descriptions.Item label="Actualizado">
                {formatTicketDateTime(ticket, "modified", "updated_at")}
              </Descriptions.Item>
              <Descriptions.Item label="SLA Respuesta">
                <SlaDetail deadline={ticket.sla_deadline_response} doneAt={ticket.sla_responded_at} />
              </Descriptions.Item>
              <Descriptions.Item label="SLA Resolución">
                <SlaDetail deadline={ticket.sla_deadline_resolution} doneAt={ticket.sla_resolved_at} />
              </Descriptions.Item>
              {ticket.scheduled_date && (
                <Descriptions.Item label="Fecha programada">
                  {formatTicketDateOnly(ticket, "scheduled_date")}
                </Descriptions.Item>
              )}
              {ticket.visit_report && (
                <Descriptions.Item label="Reporte de visita">
                  <Text style={{ whiteSpace: "pre-wrap" }}>{ticket.visit_report}</Text>
                </Descriptions.Item>
              )}
              {ticket.alert_trigger && (
                <Descriptions.Item label="Alerta">
                  Alerta #{ticket.alert_trigger}
                </Descriptions.Item>
              )}
              {ticket.system_event && (
                <Descriptions.Item label="Evento de sistema">
                  Evento #{ticket.system_event}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div>
              <Text strong style={{ color: token.voidTextHeading }}>
                Descripción
              </Text>
              <div
                style={{
                  padding: 12,
                  background: token.glassBg,
                  borderRadius: token.voidRadius,
                  border: `1px solid ${token.glassBorder}`,
                  backdropFilter: "blur(10px)",
                  marginTop: 8,
                }}
              >
                <Text style={{ whiteSpace: "pre-wrap", color: token.voidText }}>
                  {ticket.description || "-"}
                </Text>
              </div>
            </div>

            {renderOtSection()}

            <Flex gap={16} wrap>
              <div>
                <Text strong style={{ display: "block", marginBottom: 6, color: token.voidTextHeading }}>
                  Cambiar estado
                </Text>
                <Select
                  value={ticket.status}
                  style={{ width: 180 }}
                  onChange={handleStatusChange}
                  options={STATUS_OPTIONS}
                />
              </div>
              <div>
                <Text strong style={{ display: "block", marginBottom: 6, color: token.voidTextHeading }}>
                  Asignar a
                </Text>
                <Select
                  value={ticket.assigned_to || undefined}
                  style={{ width: 220 }}
                  onChange={handleAssign}
                  options={userOptions}
                  allowClear
                  placeholder={ticket.assigned_to_name || "Seleccionar usuario"}
                />
                {ticket.assigned_to_name && (
                  <Text style={{ fontSize: 12, display: "block", marginTop: 4, color: token.voidTextMuted }}>
                    Actual: {ticket.assigned_to_name}
                  </Text>
                )}
              </div>

              {ticket.status === "ABIERTO" && (
                <div style={{ marginLeft: "auto", alignSelf: "flex-end" }}>
                  <Popconfirm
                    title="¿Eliminar ticket?"
                    description="Esta acción no se puede deshacer."
                    onConfirm={handleDelete}
                    okText="Eliminar"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancelar"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Eliminar
                    </Button>
                  </Popconfirm>
                </div>
              )}
            </Flex>
          </Flex>
        ),
      }
    : null;

  const commentsTab = {
    key: "comments",
    label: (
      <Flex align="center" gap={6}>
        <CommentOutlined /> Comentarios ({comments.length})
      </Flex>
    ),
    children: (
      <Flex vertical gap={16}>
        <Form form={commentForm} onFinish={handleComment} layout="vertical">
          <Form.Item
            name="content"
            label="Comentario"
            rules={[{ required: true, message: "Escribe un comentario" }]}
          >
            <TextArea rows={3} placeholder="Agregar comentario..." />
          </Form.Item>
          {isStaff && (
            <>
              <Form.Item name="is_internal" valuePropName="checked">
                <Checkbox>Comentario interno</Checkbox>
              </Form.Item>
              <Form.Item name="status_change" label="Cambiar estado (opcional)">
                <Select
                  allowClear
                  options={STATUS_OPTIONS}
                  placeholder="Sin cambio de estado"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <SmartButton variant="void" htmlType="submit" size="sm">
              Comentar
            </SmartButton>
          </Form.Item>
        </Form>
        <List
          dataSource={comments}
          locale={{ emptyText: <Empty description="Sin comentarios" /> }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Flex justify="space-between" align="center">
                    <Flex align="center" gap={8}>
                      <Text strong style={{ color: token.voidTextHeading }}>
                        {item.author_name || item.author || "Usuario"}
                      </Text>
                      {item.is_internal && (
                        <SmartBadge variant="void" size="sm">
                          Interno
                        </SmartBadge>
                      )}
                    </Flex>
                    <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                      {formatDateTime(item.created)}
                    </Text>
                  </Flex>
                }
                description={
                  <Text style={{ whiteSpace: "pre-wrap", color: token.voidText }}>
                    {item.content || item.text || item.message}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Flex>
    ),
  };

  const attachmentsTab = {
    key: "attachments",
    label: (
      <Flex align="center" gap={6}>
        <PaperClipOutlined /> Adjuntos ({attachments.length})
      </Flex>
    ),
    children: (
      <Flex vertical gap={16}>
        <Upload.Dragger
          customRequest={handleUpload}
          showUploadList={false}
          style={{
            background: token.glassBg,
            borderColor: token.glassBorder,
            borderRadius: token.voidRadius,
            backdropFilter: "blur(10px)",
          }}
        >
          <Flex vertical align="center" gap={8} style={{ padding: "8px 0" }}>
            <UploadOutlined style={{ fontSize: 28, color: token.voidTextHeading }} />
            <Text style={{ fontSize: 14, color: token.voidTextHeading }}>
              Haz clic o arrastra un archivo aquí
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Imágenes, PDFs o documentos
            </Text>
          </Flex>
        </Upload.Dragger>
        <List
          dataSource={attachments}
          locale={{ emptyText: <Empty description="Sin adjuntos" /> }}
          renderItem={(item) => {
            const fileUrl = item.file_url || item.file || item.url;
            const fileName = item.original_name || item.name || item.filename || `Adjunto ${item.id}`;
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<FileOutlined />} style={{ background: token.voidSurface }} />}
                  title={
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={fileName}
                      style={{ fontWeight: 500 }}
                    >
                      {fileName}
                    </a>
                  }
                  description={
                    <Flex gap={16}>
                      <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                        Autor: {item.uploaded_by_name || resolveUserName(item.uploaded_by)}
                      </Text>
                      <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                        Subido: {formatDateTime(item.created_at || item.created || item.uploaded_at)}
                      </Text>
                    </Flex>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Flex>
    ),
  };

  const activityTab = {
    key: "activity",
    label: (
      <Flex align="center" gap={6}>
        <HistoryOutlined /> Actividad ({ticket?.activity_logs?.length || 0})
      </Flex>
    ),
    children: ticket?.activity_logs?.length ? (
      <Timeline
        mode="left"
        items={ticket.activity_logs.map((item) => ({
          label: (
            <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
              {formatDateTime(item.created)}
            </Text>
          ),
          children: (
            <div>
              <Text strong style={{ color: token.voidTextHeading }}>
                {item.user_name || item.user || "Sistema"}
              </Text>
              <div>
                {item.field_name === "CREACIÓN" ? (
                  <Text style={{ color: token.voidText }}>{item.new_value || "Ticket creado"}</Text>
                ) : (
                  <Text style={{ color: token.voidText }}>
                    Cambió <Text strong style={{ color: token.voidTextHeading }}>{item.field_name}</Text>:{" "}
                    <Text style={{ color: token.voidTextMuted }}>{item.old_value || "-"}</Text>{" "}
                    → <Text style={{ color: token.voidText }}>{item.new_value || "-"}</Text>
                  </Text>
                )}
              </div>
            </div>
          ),
        }))}
      />
    ) : (
      <Empty description="Sin actividad registrada" />
    ),
  };

  const items = [infoTab, commentsTab, attachmentsTab, activityTab].filter(Boolean);

  return (
    <Drawer
      title={<span style={{ color: token.voidTextHeading }}>Detalle del Ticket</span>}
      open={open}
      onClose={onClose}
      width={isMobile ? "100%" : 640}
      styles={{
        body: {
          padding: isMobile ? 16 : 24,
          paddingBottom: 24,
          background: token.glassBg,
          backdropFilter: "blur(10px)",
        },
        header: {
          background: token.glassBg,
          borderBottom: `1px solid ${token.glassBorder}`,
        },
        mask: { background: "rgba(0, 0, 0, 0.65)" },
        content: { background: "transparent", boxShadow: token.voidShadow },
      }}
    >
      <Spin spinning={loading} tip="Cargando ticket...">
        {ticket ? (
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        ) : (
          <Empty description="No se encontró el ticket" />
        )}
      </Spin>
    </Drawer>
  );
};

export default TicketDetailDrawer;
