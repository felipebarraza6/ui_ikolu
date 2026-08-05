import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Modal,
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
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { SmartBadge, SmartButton } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import { useResponsive } from "../../../../hooks/useResponsive";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import TasksPanel from "./TasksPanel";
import {
  STATUS_OPTIONS,
  getTicketStatusLabel,
  getTicketPriorityConfig,
  getTicketCategoryLabel,
  getTicketCategoryTypeLabel,
  getTicketSourceLabel,
  getTicketOriginLabel,
  getTicketDateValue,
  getSlaStatus,
  isTicketInOT,
  validateTicketAttachment,
  filterWorkOrderCategories,
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

const ACTIVITY_FIELD_LABELS = {
  title: "Título",
  description: "Descripción",
  status: "Estado",
  priority: "Prioridad",
  category: "Categoría",
  category_type: "Tipo de categoría",
  origin: "Origen",
  source: "Fuente",
  assigned_to: "Asignado a",
  assigned_to_id: "Asignado a",
  project_id: "Proyecto",
  client_id: "Cliente",
  point_id: "Punto",
  sla_deadline_resolution: "Límite resolución",
  sla_deadline_response: "Límite respuesta",
  sla_responded_at: "Respuesta SLA",
  sla_resolved_at: "Resolución SLA",
  due_date: "Fecha límite",
  scheduled_date: "Visita agendada",
  created_at: "Fecha de creación",
  updated_at: "Fecha de actualización",
};

const ACTIVITY_DATE_FIELDS = [
  "sla_responded_at",
  "sla_resolved_at",
  "sla_deadline_resolution",
  "sla_deadline_response",
  "due_date",
  "scheduled_date",
  "created_at",
  "created",
  "updated_at",
  "updated",
];

const cleanEnumText = (value) => {
  const str = String(value);
  if (!/^[A-Z0-9_]+$/.test(str)) return str;
  return str
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const activityFieldLabel = (fieldName) => {
  const raw = String(fieldName || "");
  const lower = raw.toLowerCase();
  return ACTIVITY_FIELD_LABELS[lower] || cleanEnumText(raw) || raw;
};

const isCreationEvent = (item) => {
  const field = String(item?.field_name || "").toUpperCase();
  return field.includes("CREACION") || field.includes("CREACIÓN") || field === "CREATED";
};

const SlaDetail = ({ deadline, doneAt, ticketStatus }) => {
  const token = useIkoluToken();
  const status = getSlaStatus(deadline, doneAt, ticketStatus);
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
  onDeleteComment,
  onUploadAttachment,
  onUploadCommentAttachment,
  onConfirmScheduledDate,
  onCancelScheduledDate,
  getTicketById,
  getComments,
  getAttachments,
  getTasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onUploadTaskAttachment,
}) => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const { isStaff } = useAdminAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingOt, setSavingOt] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [editingOt, setEditingOt] = useState(false);
  const [pendingOtStatus, setPendingOtStatus] = useState(null);
  const [otCategory, setOtCategory] = useState(null);
  const [attachmentSearch, setAttachmentSearch] = useState("");
  const [pendingCommentFiles, setPendingCommentFiles] = useState([]);
  const [commentForm] = Form.useForm();
  const [otForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("info");

  const workOrderCategories = useMemo(
    () => filterWorkOrderCategories(categories || []),
    [categories]
  );

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const [t, c, a, tk] = await Promise.all([
        getTicketById(ticketId),
        getComments(ticketId),
        getAttachments(ticketId),
        getTasks?.(ticketId) || Promise.resolve([]),
      ]);
      setTicket(t);
      setComments(c);
      setAttachments(a);
      setTasks(tk);
    } finally {
      setLoading(false);
    }
  }, [ticketId, getTicketById, getComments, getAttachments, getTasks]);

  useEffect(() => {
    if (open) load();
  }, [open, ticketId, load]);

  useEffect(() => {
    if (!open) {
      setTicket(null);
      setComments([]);
      setAttachments([]);
      setTasks([]);
      setActiveTab("info");
      setEditingOt(false);
      setPendingOtStatus(null);
      setOtCategory(null);
      setAttachmentSearch("");
      setPendingCommentFiles([]);
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
    if (status === "EN_ORDEN_TRABAJO") {
      setOtCategory(ticket?.work_order_category ?? undefined);
      setPendingOtStatus(status);
      return;
    }
    await onChangeStatus(ticketId, status);
    load();
  };

  const handleConfirmOtStatus = async () => {
    if (!otCategory) {
      message.error("Selecciona la categoría de la orden de trabajo");
      return;
    }
    await onChangeStatus(ticketId, pendingOtStatus, otCategory);
    setPendingOtStatus(null);
    setOtCategory(null);
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
      payload.is_internal = !values.is_public;
    }
    const res = await onCreateComment(ticketId, payload);

    // Subir adjuntos pendientes al comentario recién creado (en paralelo)
    const commentId = res?.id ?? res?.data?.id ?? res?.comment?.id;
    if (commentId && pendingCommentFiles.length > 0) {
      const uploads = pendingCommentFiles.map(async (item) => {
        if (!onUploadCommentAttachment) return;
        const file = item?.originFileObj || item;
        const validation = validateTicketAttachment(file);
        if (!validation.valid) {
          message.error(validation.error);
          return;
        }
        try {
          await onUploadCommentAttachment(ticketId, commentId, file);
        } catch {
          // el hook ya notifica el error
        }
      });
      await Promise.all(uploads);
    }

    commentForm.resetFields();
    setPendingCommentFiles([]);
    load();
  };

  const handleAddPendingCommentFile = (file) => {
    const validation = validateTicketAttachment(file);
    if (!validation.valid) {
      message.error(validation.error);
      return Upload.LIST_IGNORE;
    }
    setPendingCommentFiles((prev) => [...prev, file]);
    return false;
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

  const handleCommentUpload = async (commentId, file) => {
    const validation = validateTicketAttachment(file);
    if (!validation.valid) {
      message.error(validation.error);
      return;
    }
    if (!onUploadCommentAttachment) return;
    await onUploadCommentAttachment(ticketId, commentId, file);
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

  const handleConfirmScheduledDate = async () => {
    if (!onConfirmScheduledDate) return;
    setConfirming(true);
    try {
      const updated = await onConfirmScheduledDate(ticketId);
      setTicket(updated);
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelScheduledDate = async () => {
    if (!onCancelScheduledDate) return;
    setCancelling(true);
    try {
      const updated = await onCancelScheduledDate(ticketId, cancelReason || undefined);
      setTicket(updated);
      setCancelModalOpen(false);
      setCancelReason("");
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate) return;
    setRescheduling(true);
    try {
      const payload = { scheduled_date: rescheduleDate.format("YYYY-MM-DD") };
      await onUpdateTicket(ticketId, payload);
      setRescheduling(false);
      setRescheduleDate(null);
      await load();
    } catch {
      setRescheduling(false);
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

  const formatActivityValue = (fieldName, value) => {
    if (value === null || value === undefined || value === "") return "-";
    const field = String(fieldName || "").toLowerCase();
    if (field === "assigned_to" || field === "assigned_to_id") {
      const id = Number(value);
      return Number.isNaN(id) ? value : resolveUserName(id);
    }
    if (field === "status") return getTicketStatusLabel(value);
    if (field === "priority") return getTicketPriorityConfig(value).label;
    if (field === "category" || field === "category_id") return getTicketCategoryLabel(value);
    if (field === "category_type") return getTicketCategoryTypeLabel(value);
    if (field === "origin") return getTicketOriginLabel(value);
    if (field === "source") return getTicketSourceLabel(value);
    if (ACTIVITY_DATE_FIELDS.includes(field)) {
      const formatted = formatDateTime(value);
      return formatted === "-" ? value : formatted;
    }
    return cleanEnumText(value);
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
    if (!isTicketInOT(ticket?.status) && !ticket?.scheduled_date) return null;

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
                {ticket.scheduled_date ? formatDate(ticket.scheduled_date) : "Sin fecha"}
              </Descriptions.Item>
              <Descriptions.Item label="Reporte de visita">
                <Text style={{ whiteSpace: "pre-wrap" }}>
                  {ticket.visit_report || "-"}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {ticket.scheduled_date && (
              <div style={{
                padding: 10,
                background: token.glassBg,
                borderRadius: token.voidRadius,
                border: `1px solid ${token.glassBorder}`,
              }}>
                {ticket.scheduled_date_cancelled ? (
                  <Flex vertical gap={8}>
                    <Flex align="center" gap={8}>
                      <CloseCircleOutlined style={{ color: token.colorError, fontSize: 14 }} />
                      <Text style={{ color: token.colorError, fontWeight: 600 }}>
                        Fecha cancelada
                      </Text>
                      {ticket.scheduled_date_cancelled_by_name && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          por {ticket.scheduled_date_cancelled_by_name}
                          {ticket.scheduled_date_cancelled_at && ` el ${formatDateTime(ticket.scheduled_date_cancelled_at)}`}
                        </Text>
                      )}
                    </Flex>
                    {ticket.scheduled_date_cancelled_reason && (
                      <Text type="secondary" style={{ fontSize: 12, fontStyle: "italic" }}>
                        "{ticket.scheduled_date_cancelled_reason}"
                      </Text>
                    )}
                    <Flex gap={8}>
                      <DatePicker
                        value={rescheduleDate}
                        onChange={setRescheduleDate}
                        format="YYYY-MM-DD"
                        placeholder="Nueva fecha"
                        style={{ flex: 1 }}
                      />
                      <SmartButton
                        variant="void"
                        size="sm"
                        loading={rescheduling}
                        disabled={!rescheduleDate}
                        onClick={handleReschedule}
                      >
                        Re-agendar
                      </SmartButton>
                    </Flex>
                  </Flex>
                ) : ticket.scheduled_date_confirmed ? (
                  <Flex align="center" justify="space-between" gap={8}>
                    <Flex align="center" gap={8}>
                      <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 14 }} />
                      <Text style={{ color: token.colorSuccess, fontWeight: 600 }}>
                        Confirmada
                      </Text>
                      {ticket.scheduled_date_confirmed_by_name && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          por {ticket.scheduled_date_confirmed_by_name}
                          {ticket.scheduled_date_confirmed_at && ` el ${formatDateTime(ticket.scheduled_date_confirmed_at)}`}
                        </Text>
                      )}
                    </Flex>
                    {onCancelScheduledDate && (
                      <SmartButton
                        variant="voidGhost"
                        size="sm"
                        danger
                        onClick={() => setCancelModalOpen(true)}
                      >
                        Cancelar
                      </SmartButton>
                    )}
                  </Flex>
                ) : (
                  <Flex align="center" justify="space-between">
                    <Text style={{ color: token.voidTextMuted, fontSize: 13 }}>
                      Sin confirmar
                    </Text>
                    {onConfirmScheduledDate && (
                      <SmartButton
                        variant="void"
                        size="sm"
                        loading={confirming}
                        onClick={handleConfirmScheduledDate}
                      >
                        Confirmar fecha
                      </SmartButton>
                    )}
                  </Flex>
                )}
              </div>
            )}

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
              {ticket.work_order_category_detail && (
                <Descriptions.Item label="Categoría OT">
                  {ticket.work_order_category_detail.name || `Categoría ${ticket.work_order_category}`}
                </Descriptions.Item>
              )}
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
                <SlaDetail deadline={ticket.sla_deadline_response} doneAt={ticket.sla_responded_at} ticketStatus={ticket.status} />
              </Descriptions.Item>
              <Descriptions.Item label="SLA Resolución">
                <SlaDetail deadline={ticket.sla_deadline_resolution} doneAt={ticket.sla_resolved_at} ticketStatus={ticket.status} />
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
                {pendingOtStatus === "EN_ORDEN_TRABAJO" && (
                  <Flex align="center" gap={8} wrap style={{ marginTop: 8 }}>
                    <Select
                      placeholder="Categoría de la OT"
                      style={{ width: 220 }}
                      value={otCategory}
                      onChange={setOtCategory}
                      options={workOrderCategories.map((c) => ({
                        value: c.id,
                        label: c.name || `Categoría ${c.id}`,
                      }))}
                      showSearch
                      optionFilterProp="label"
                    />
                    <SmartButton variant="void" size="sm" onClick={handleConfirmOtStatus}>
                      Aplicar estado OT
                    </SmartButton>
                    <SmartButton variant="voidGhost" size="sm" onClick={() => setPendingOtStatus(null)}>
                      Cancelar
                    </SmartButton>
                  </Flex>
                )}
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
          <Form.Item label="Adjuntos" style={{ marginBottom: 8 }}>
            <Upload
              fileList={pendingCommentFiles}
              beforeUpload={handleAddPendingCommentFile}
              onRemove={(file) =>
                setPendingCommentFiles((prev) =>
                  prev.filter((f) => f.uid !== file.uid)
                )
              }
              maxCount={5}
            >
              <Button size="small" type="dashed" icon={<PaperClipOutlined />}>
                Adjuntar archivo
              </Button>
            </Upload>
          </Form.Item>
          {isStaff && (
            <Form.Item name="is_public" valuePropName="checked">
              <Checkbox>Comentario para cliente</Checkbox>
            </Form.Item>
          )}
          <Form.Item>
            <Flex align="center" gap={12}>
              <SmartButton variant="void" htmlType="submit" size="sm">
                Comentar
              </SmartButton>
              {isStaff && (
                <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
                  Por defecto es interno. Marca "Comentario para cliente" para publicarlo.
                </Text>
              )}
            </Flex>
          </Form.Item>
        </Form>
        <List
          dataSource={comments}
          locale={{ emptyText: <Empty description="Sin comentarios" /> }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Text key="date" style={{ fontSize: 12, color: token.voidTextMuted }}>
                  {formatDateTime(item.created)}
                </Text>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Flex align="center" gap={8}>
                    <Text strong style={{ color: token.voidTextHeading }}>
                      {item.author_name || item.author || "Usuario"}
                    </Text>
                    {item.is_internal ? (
                      <SmartBadge variant="void" size="sm">
                        Interno
                      </SmartBadge>
                    ) : (
                      <SmartBadge variant="success" size="sm">
                        Cliente
                      </SmartBadge>
                    )}
                  </Flex>
                }
                description={
                  <Flex vertical gap={6}>
                    <Text style={{ whiteSpace: "pre-wrap", color: token.voidText }}>
                      {item.content || item.text || item.message}
                    </Text>
                    {item.attachments?.length > 0 && (
                      <Flex wrap gap={6}>
                        {item.attachments.map((att) => {
                          const fileUrl = att.file_url || att.file || att.url;
                          const fileName =
                            att.original_name || att.name || att.filename || `Adjunto ${att.id}`;
                          return (
                            <Tag
                              key={att.id}
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
                              <PaperClipOutlined style={{ fontSize: 10 }} />
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                download={fileName}
                                style={{ fontSize: 11 }}
                              >
                                {fileName}
                              </a>
                            </Tag>
                          );
                        })}
                      </Flex>
                    )}
                    {isStaff && onUploadCommentAttachment && (
                      <Upload
                        showUploadList={false}
                        customRequest={({ file }) => handleCommentUpload(item.id, file)}
                      >
                        <Button
                          size="small"
                          type="text"
                          icon={<PaperClipOutlined />}
                          style={{
                            alignSelf: "flex-start",
                            color: token.voidTextMuted,
                            fontSize: 12,
                            padding: 0,
                            height: "auto",
                          }}
                        >
                          Adjuntar archivo
                        </Button>
                      </Upload>
                    )}
                  </Flex>
                }
              />
            </List.Item>
          )}
        />
      </Flex>
    ),
  };

  const filteredAttachments = useMemo(() => {
    if (!attachmentSearch?.trim()) return attachments;
    const term = attachmentSearch.trim().toLowerCase();
    return attachments.filter((item) => {
      const name = item.original_name || item.name || item.filename || "";
      return String(name).toLowerCase().includes(term);
    });
  }, [attachments, attachmentSearch]);

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
        {attachments.length > 0 && (
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: token.voidTextMuted }} />}
            placeholder="Filtrar adjuntos por nombre..."
            value={attachmentSearch}
            onChange={(e) => setAttachmentSearch(e.target.value)}
          />
        )}
        <List
          dataSource={filteredAttachments}
          locale={{
            emptyText: (
              <Empty description={attachments.length ? "Sin coincidencias" : "Sin adjuntos"} />
            ),
          }}
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
                {isCreationEvent(item) ? (
                  <Text style={{ color: token.voidText }}>{item.new_value || "Ticket creado"}</Text>
                ) : (
                  <Text style={{ color: token.voidText }}>
                    Cambió <Text strong style={{ color: token.voidTextHeading }}>{activityFieldLabel(item.field_name)}</Text>:{" "}
                    <Text style={{ color: token.voidTextMuted }}>{formatActivityValue(item.field_name, item.old_value)}</Text>{" "}
                    → <Text style={{ color: token.voidText }}>{formatActivityValue(item.field_name, item.new_value)}</Text>
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

  const tasksTab = {
    key: "tasks",
    label: (
      <Flex align="center" gap={6}>
        <ToolOutlined /> Tareas ({tasks.length})
      </Flex>
    ),
    children: (
      <TasksPanel
        ticketId={ticketId}
        tasks={tasks}
        loading={loading}
        onCreate={onCreateTask}
        onUpdate={onUpdateTask}
        onDelete={onDeleteTask}
        onUploadAttachment={onUploadTaskAttachment}
        users={users}
        isStaff={isStaff}
        token={token}
      />
    ),
  };

  const items = [infoTab, commentsTab, tasksTab, attachmentsTab, activityTab].filter(Boolean);

  return (
    <>
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

    <Modal
      title="Cancelar fecha de visita"
      open={cancelModalOpen}
      onOk={handleCancelScheduledDate}
      onCancel={() => {
        setCancelModalOpen(false);
        setCancelReason("");
      }}
      confirmLoading={cancelling}
      okText="Cancelar fecha"
      okButtonProps={{ danger: true }}
      cancelText="Volver"
      styles={{
        body: { background: token.glassBg },
        header: { background: token.glassBg, borderBottom: `1px solid ${token.glassBorder}` },
        footer: { background: token.glassBg, borderTop: `1px solid ${token.glassBorder}` },
      }}
    >
      <Flex vertical gap={8}>
        <Text style={{ color: token.voidText }}>
          ¿Estás seguro de cancelar la visita del{" "}
          <Text strong>{ticket?.scheduled_date ? formatDate(ticket.scheduled_date) : ""}</Text>?
        </Text>
        <Input.TextArea
          placeholder="Motivo de cancelación (opcional)"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          rows={2}
          style={{
            background: token.voidSurface,
            borderColor: token.voidBorder,
            color: token.voidText,
          }}
        />
      </Flex>
    </Modal>
    </>
  );
};

export default TicketDetailDrawer;
