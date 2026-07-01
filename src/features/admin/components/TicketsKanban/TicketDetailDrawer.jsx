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
} from "@ant-design/icons";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { SmartBadge, SmartButton } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import {
  STATUS_OPTIONS,
  getTicketStatusLabel,
  getTicketPriorityConfig,
  getTicketCategoryLabel,
  getTicketField,
  getTicketDateValue,
  formatTicketDate,
  getSlaStatus,
  isTicketInOT,
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
  if (!deadline && !doneAt) return <Text type="secondary">-</Text>;
  return (
    <Flex align="center" gap={8} wrap>
      <Text style={{ color: status.variant === "error" ? token.colorError : token.colorText }}>
        {deadline ? formatDateTime(deadline) : "Sin límite"}
      </Text>
      <Tag color={status.variant === "error" ? "error" : status.variant === "success" ? "success" : "warning"}>
        {status.label}
      </Tag>
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
    await onCreateComment(ticketId, values);
    commentForm.resetFields();
    load();
  };

  const handleUpload = async ({ file }) => {
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

  const userOptions = users.map((u) => {
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.full_name || u.username || u.email;
    return {
      value: u.id || u.username,
      label: name,
    };
  });

  const renderOtSection = () => {
    if (!isStaff) return null;
    if (!isTicketInOT(ticket?.status)) return null;

    return (
      <div
        style={{
          padding: 12,
          background: token.colorFillTertiary,
          borderRadius: token.borderRadius,
        }}
      >
        <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
          <ToolOutlined style={{ color: token.colorCorporateBlue }} />
          <Text strong style={{ color: token.colorTextHeading }}>
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
              <SmartButton variant="neutral" size="sm" onClick={handleCancelEditOt}>
                Cancelar
              </SmartButton>
              <SmartButton variant="primary" size="sm" htmlType="submit" loading={savingOt}>
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
              <SmartButton variant="primary" size="sm" onClick={handleStartEditOt}>
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
              <Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
                {ticket.title || `Ticket #${ticket.id}`}
              </Title>
              <Tag color={getTicketPriorityConfig(ticket.priority).color}>
                {getTicketPriorityConfig(ticket.priority).label}
              </Tag>
            </Flex>

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Cliente">
                {ticket.client_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Punto de captación">
                {ticket.point_title || `Punto ${ticket.point_catchment}` || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <SmartBadge variant="info">{getTicketStatusLabel(ticket.status)}</SmartBadge>
              </Descriptions.Item>
              <Descriptions.Item label="Categoría">
                {getTicketCategoryLabel(ticket.category) || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Origen">
                {ticket.source || ticket.origin || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Creado">
                {formatTicketDateTime(ticket, "created", "created_at")}
              </Descriptions.Item>
              <Descriptions.Item label="Creado por">
                {ticket.created_by_name || (ticket.created_by ? `Usuario ${ticket.created_by}` : ticket.source === "SISTEMA" || ticket.origin === "INTERNO" ? "Support Agent" : "-" )}
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
              <Text strong>Descripción</Text>
              <div
                style={{
                  padding: 12,
                  background: token.colorFillTertiary,
                  borderRadius: token.borderRadius,
                  marginTop: 8,
                }}
              >
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {ticket.description || "-"}
                </Text>
              </div>
            </div>

            {renderOtSection()}

            <Flex gap={16} wrap>
              <div>
                <Text strong style={{ display: "block", marginBottom: 6 }}>
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
                <Text strong style={{ display: "block", marginBottom: 6 }}>
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
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
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
        <Form form={commentForm} onFinish={handleComment}>
          <Form.Item
            name="content"
            rules={[{ required: true, message: "Escribe un comentario" }]}
          >
            <TextArea rows={3} placeholder="Agregar comentario..." />
          </Form.Item>
          <SmartButton variant="primary" htmlType="submit" size="sm">
            Comentar
          </SmartButton>
        </Form>
        <List
          dataSource={comments}
          locale={{ emptyText: <Empty description="Sin comentarios" /> }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Flex justify="space-between">
                    <Text strong>
                      {item.author_name || item.author || "Usuario"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDateTime(item.created)}
                    </Text>
                  </Flex>
                }
                description={
                  <Text style={{ whiteSpace: "pre-wrap" }}>
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
        <Upload customRequest={handleUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Subir archivo</Button>
        </Upload>
        <List
          dataSource={attachments}
          locale={{ emptyText: <Empty description="Sin adjuntos" /> }}
          renderItem={(item) => (
            <List.Item>
              <a
                href={item.file || item.url || item.file_url}
                target="_blank"
                rel="noreferrer"
              >
                {item.name || item.filename || `Adjunto ${item.id}`}
              </a>
            </List.Item>
          )}
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
    children: (
      <List
        dataSource={ticket?.activity_logs || []}
        locale={{ emptyText: <Empty description="Sin actividad registrada" /> }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <Flex justify="space-between">
                  <Text strong>
                    {item.user_name || item.user || "Usuario"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDateTime(item.created)}
                  </Text>
                </Flex>
              }
              description={
                <Text>
                  {item.field_name === "CREACIÓN"
                    ? item.new_value
                    : `Cambió ${item.field_name}: ${item.old_value || "-"} → ${item.new_value || "-"}`}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    ),
  };

  const items = [infoTab, commentsTab, attachmentsTab, activityTab].filter(Boolean);

  return (
    <Drawer
      title="Detalle del Ticket"
      open={open}
      onClose={onClose}
      width={640}
      styles={{ body: { paddingBottom: 24 } }}
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
