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
} from "antd";
import {
  UserOutlined,
  PaperClipOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { SmartBadge, SmartButton } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: "open", label: "Abierto" },
  { value: "in_review", label: "En Revisión" },
  { value: "in_progress", label: "En Progreso" },
  { value: "resolved", label: "Resuelto" },
  { value: "closed", label: "Cerrado" },
];

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy HH:mm", { locale: es });
  } catch {
    return value;
  }
};

const priorityColor = (priority) => {
  const p = priority?.toLowerCase?.() || "medium";
  if (["critical", "urgent"].includes(p)) return "error";
  if (p === "high") return "warning";
  if (p === "low") return "success";
  return "processing";
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
  onCreateComment,
  onUploadAttachment,
  getTicketById,
  getComments,
  getAttachments,
}) => {
  const token = useIkoluToken();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentForm] = Form.useForm();
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

  const userOptions = users.map((u) => ({
    value: u.id || u.username,
    label: u.full_name || u.username || u.email,
  }));

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
              <Tag color={priorityColor(ticket.priority)}>
                {ticket.priority || "Sin prioridad"}
              </Tag>
            </Flex>

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Estado">
                <SmartBadge variant="info">{ticket.status || "Desconocido"}</SmartBadge>
              </Descriptions.Item>
              <Descriptions.Item label="Categoría">
                {ticket.category || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Origen">
                {ticket.source || ticket.origin || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Creado">
                {formatDateTime(ticket.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Actualizado">
                {formatDateTime(ticket.updated_at)}
              </Descriptions.Item>
              <Descriptions.Item label="SLA">
                {formatDateTime(ticket.sla_due_at)}
              </Descriptions.Item>
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
                  {ticket.message || ticket.description || "-"}
                </Text>
              </div>
            </div>

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
                  value={
                    ticket.assigned_to
                      ? ticket.assigned_to.id || ticket.assigned_to.username
                      : undefined
                  }
                  style={{ width: 220 }}
                  onChange={handleAssign}
                  options={userOptions}
                  allowClear
                  placeholder="Seleccionar usuario"
                />
              </div>
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
            name="text"
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
                      {formatDateTime(item.created_at)}
                    </Text>
                  </Flex>
                }
                description={
                  <Text style={{ whiteSpace: "pre-wrap" }}>
                    {item.text || item.content || item.message}
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
        <HistoryOutlined /> Actividad
      </Flex>
    ),
    children: (
      <List
        dataSource={comments}
        locale={{ emptyText: <Empty description="Sin actividad registrada" /> }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <Text strong>
                  {item.author_name || item.author || "Usuario"}
                </Text>
              }
              description={
                <Flex vertical>
                  <Text>Comentó: {item.text || item.content || item.message}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDateTime(item.created_at)}
                  </Text>
                </Flex>
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
