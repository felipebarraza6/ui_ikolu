import React, { useState, useMemo, useCallback } from "react";
import {
  Flex,
  Typography,
  List,
  Avatar,
  Empty,
  Spin,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Popconfirm,
  Tag,
} from "antd";
import {
  PlusOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { SmartButton, SmartBadge } from "../../../../shared/ui";
import {
  TASK_STATUS_OPTIONS,
  getTaskStatusConfig,
  getTaskPriorityConfig,
} from "../../constants/tickets";

const { Text } = Typography;
const { TextArea } = Input;

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy HH:mm", { locale: es });
  } catch {
    return value;
  }
};

const formatDueDate = (value) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy HH:mm", { locale: es });
  } catch {
    return value;
  }
};

const resolveUserName = (users, userId) => {
  if (userId == null) return null;
  const user = users.find((u) => u.id === userId || u.username === userId);
  if (user) {
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.full_name || user.username || user.email;
  }
  return `Usuario ${userId}`;
};

const userOptions = (users) =>
  users.map((u) => {
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.full_name || u.username || u.email;
    return { value: u.id || u.username, label: name };
  });

const AttachmentList = ({ attachments, token }) => {
  if (!attachments?.length) return null;
  return (
    <Flex wrap gap={6}>
      {attachments.map((item) => {
        const fileUrl = item.file_url || item.file || item.url;
        const fileName = item.original_name || item.name || item.filename || `Adjunto ${item.id}`;
        return (
          <Tag
            key={item.id}
            style={{
              background: token.voidSurface,
              borderColor: token.voidBorder,
              color: token.voidTextHeading,
              borderRadius: 3,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              margin: 0,
            }}
          >
            <a href={fileUrl} target="_blank" rel="noreferrer" download={fileName} style={{ fontSize: 11 }}>
              {fileName}
            </a>
          </Tag>
        );
      })}
    </Flex>
  );
};

/**
 * Panel de tareas por ticket.
 * Registra la etapa (created_stage) en la que nació la tarea: snapshot del
 * estado del ticket en ese momento. El backend lo calcula automáticamente.
 */
const TasksPanel = ({
  ticketId,
  tasks = [],
  loading,
  onCreate,
  onUpdate,
  onDelete,
  onUploadAttachment,
  users = [],
  isStaff,
  token,
}) => {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const options = useMemo(() => userOptions(users), [users]);

  const startCreate = useCallback(() => {
    form.resetFields();
    setEditingId("new");
  }, [form]);

  const startEdit = useCallback((task) => {
    form.setFieldsValue({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "PENDIENTE",
      priority: task.priority || "MEDIA",
      assigned_to: task.assigned_to ?? undefined,
      due_date: task.due_date ? dayjs(task.due_date) : null,
    });
    setEditingId(task.id);
  }, [form]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    form.resetFields();
  }, [form]);

  const handleFinish = useCallback(
    async (values) => {
      const payload = {
        title: values.title,
        description: values.description || "",
        status: values.status || "PENDIENTE",
        priority: values.priority || "MEDIA",
        due_date: values.due_date ? values.due_date.toISOString() : null,
      };
      if (values.assigned_to != null) payload.assigned_to = values.assigned_to;

      if (editingId === "new") {
        await onCreate(ticketId, payload);
      } else {
        await onUpdate(editingId, payload);
      }
      setEditingId(null);
      form.resetFields();
    },
    [editingId, ticketId, onCreate, onUpdate, form]
  );

  const handleUpload = useCallback(
    async (taskId, file) => {
      await onUploadAttachment(taskId, file);
    },
    [onUploadAttachment]
  );

  return (
    <Flex vertical gap={12}>
      {isStaff && (
        <Flex justify="flex-end">
          {editingId ? (
            <SmartButton variant="voidGhost" size="sm" onClick={cancelEdit} icon={<CloseOutlined />}>
              Cancelar
            </SmartButton>
          ) : (
            <SmartButton variant="void" size="sm" onClick={startCreate} icon={<PlusOutlined />}>
              Nueva tarea
            </SmartButton>
          )}
        </Flex>
      )}

      {editingId && (
        <div
          style={{
            padding: 12,
            background: token.glassBg,
            borderRadius: token.voidRadius,
            border: `1px solid ${token.glassBorder}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <Text strong style={{ color: token.voidTextHeading, display: "block", marginBottom: 8 }}>
            {editingId === "new" ? "Nueva tarea" : "Editar tarea"}
          </Text>
          <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ status: "PENDIENTE", priority: "MEDIA" }}>
            <Form.Item name="title" label="Título" rules={[{ required: true, message: "Indica el título de la tarea" }]}>
              <Input placeholder="Ej: Revisar sensor de nivel" />
            </Form.Item>
            <Form.Item name="description" label="Descripción">
              <TextArea rows={2} placeholder="Detalle de la tarea..." />
            </Form.Item>
            <Flex gap={12} wrap>
              <Form.Item name="status" label="Estado" style={{ flex: 1, minWidth: 140 }}>
                <Select options={TASK_STATUS_OPTIONS} />
              </Form.Item>
              <Form.Item name="priority" label="Prioridad" style={{ flex: 1, minWidth: 140 }}>
                <Select options={[["BAJA", "Baja"], ["MEDIA", "Media"], ["ALTA", "Alta"], ["CRITICA", "Crítica"]].map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Flex>
            <Flex gap={12} wrap>
              <Form.Item name="assigned_to" label="Asignar a" style={{ flex: 1, minWidth: 180 }}>
                <Select options={options} allowClear showSearch optionFilterProp="label" placeholder="Sin asignar" />
              </Form.Item>
              <Form.Item name="due_date" label="Fecha límite" style={{ flex: 1, minWidth: 180 }}>
                <DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            </Flex>
            <Form.Item style={{ marginBottom: 0 }}>
              <Flex justify="flex-end" gap={8}>
                <SmartButton variant="voidGhost" size="sm" onClick={cancelEdit}>
                  Cancelar
                </SmartButton>
                <SmartButton variant="void" size="sm" htmlType="submit" icon={<CheckOutlined />}>
                  Guardar
                </SmartButton>
              </Flex>
            </Form.Item>
          </Form>
        </div>
      )}

      <Spin spinning={loading}>
        <List
          dataSource={tasks}
          locale={{ emptyText: <Empty description="Sin tareas para este ticket" /> }}
          renderItem={(task) => {
            const statusCfg = getTaskStatusConfig(task.status);
            const priorityCfg = getTaskPriorityConfig(task.priority);
            const assignee = resolveUserName(users, task.assigned_to);
            return (
              <List.Item
                style={{
                  padding: "12px 0",
                  borderBottom: `1px solid ${token.glassBorder}`,
                }}
                actions={
                  isStaff
                    ? [
                        <Button
                          key="edit"
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => startEdit(task)}
                          style={{ color: token.voidTextMuted }}
                        />,
                        <Popconfirm
                          key="del"
                          title="¿Eliminar tarea?"
                          description="Esta acción no se puede deshacer."
                          okText="Eliminar"
                          okButtonProps={{ danger: true }}
                          cancelText="Cancelar"
                          onConfirm={() => onDelete(task.id)}
                        >
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  style={{ width: "100%" }}
                  avatar={
                    <Avatar
                      icon={<ClockCircleOutlined />}
                      style={{
                        background: priorityCfg.borderColor?.startsWith("var(")
                          ? token.voidSurface
                          : `${priorityCfg.borderColor}22`,
                        color: priorityCfg.borderColor?.startsWith("var(")
                          ? token.voidTextHeading
                          : priorityCfg.borderColor,
                        border: `1px solid ${priorityCfg.borderColor?.startsWith("var(") ? token.voidBorder : priorityCfg.borderColor}`,
                      }}
                    />
                  }
                  title={
                    <Flex align="center" gap={8} wrap>
                      <Text strong style={{ color: token.voidTextHeading }}>
                        {task.title || `Tarea #${task.id}`}
                      </Text>
                      <SmartBadge variant={statusCfg.variant} size="sm">
                        {statusCfg.label}
                      </SmartBadge>
                      <Tag
                        style={{
                          color: priorityCfg.borderColor?.startsWith("var(") ? token.voidTextHeading : priorityCfg.borderColor,
                          background: priorityCfg.borderColor?.startsWith("var(") ? token.voidSurface : `${priorityCfg.borderColor}12`,
                          border: `1px solid ${priorityCfg.borderColor?.startsWith("var(") ? token.voidBorderStrong : `${priorityCfg.borderColor}35`}`,
                          borderRadius: 3,
                          fontSize: 10,
                          lineHeight: "14px",
                          margin: 0,
                        }}
                      >
                        {priorityCfg.label}
                      </Tag>
                      {task.created_stage && (
                        <SmartBadge variant="void" size="sm">
                          Creada en: {String(task.created_stage).split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
                        </SmartBadge>
                      )}
                    </Flex>
                  }
                  description={
                    <Flex vertical gap={6}>
                      {task.description && (
                        <Text style={{ whiteSpace: "pre-wrap", color: token.voidText, fontSize: 13 }}>
                          {task.description}
                        </Text>
                      )}
                      <Flex wrap gap={12} style={{ fontSize: 12 }}>
                        {assignee && (
                          <Text style={{ color: token.voidTextMuted, fontSize: 12 }}>
                            Asignado: {assignee}
                          </Text>
                        )}
                        {task.due_date && (
                          <Text style={{ color: token.voidTextMuted, fontSize: 12 }}>
                            Vence: {formatDueDate(task.due_date)}
                          </Text>
                        )}
                        {task.created && (
                          <Text style={{ color: token.voidTextMuted, fontSize: 12 }}>
                            Creada: {formatDateTime(task.created)}
                          </Text>
                        )}
                      </Flex>
                      <AttachmentList attachments={task.attachments} token={token} />
                      {isStaff && (
                        <Upload
                          showUploadList={false}
                          customRequest={({ file }) => handleUpload(task.id, file)}
                        >
                          <Button size="small" type="text" icon={<PaperClipOutlined />} style={{ color: token.voidTextMuted, fontSize: 12, padding: 0, height: "auto" }}>
                            Adjuntar archivo
                          </Button>
                        </Upload>
                      )}
                    </Flex>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Spin>
    </Flex>
  );
};

export default TasksPanel;
