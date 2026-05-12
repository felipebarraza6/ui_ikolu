import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Card,
  Typography,
  Tag,
  Flex,
  Input,
  Button,
  Divider,
  Select,
  Badge,
  Row,
  Col,
  Upload,
  message,
  Empty,
  Tooltip,
  Progress,
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  MailOutlined,
  FileTextOutlined,
  ToolOutlined,
  EyeOutlined,
  FileAddOutlined,
  CommentOutlined,
  HistoryOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  PushpinOutlined,
  InfoCircleOutlined,
  FireOutlined,
  CheckSquareOutlined,
  BarsOutlined,
} from '@ant-design/icons';
import SimpleEmailEditor from './SimpleEmailEditor';
import SlaTaskNotes from './SlaTaskNotes';
import sh from '../../../api/sh/endpoints';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const STATUS_CONFIG = {
  nuevo: { label: 'Nuevo', color: '#0EA5E9', bg: '#F0F9FF', icon: <FileAddOutlined /> },
  revision: { label: 'En Revisión', color: '#F59E0B', bg: '#FFFBEB', icon: <EyeOutlined /> },
  desarrollo: { label: 'En Desarrollo', color: '#8B5CF6', bg: '#F5F3FF', icon: <ToolOutlined /> },
  resuelto: { label: 'Resuelto', color: '#10B981', bg: '#ECFDF5', icon: <CheckCircleOutlined /> },
};

const NAV_ITEMS = [
  { key: 'info', label: 'Información', icon: <InfoCircleOutlined />, color: '#0F172A' },
  { key: 'reply', label: 'Responder', icon: <MessageOutlined />, color: '#10B981' },
  { key: 'activity', label: 'Actividad', icon: <HistoryOutlined />, color: '#8B5CF6' },
  { key: 'notes', label: 'Tareas', icon: <PushpinOutlined />, color: '#F59E0B' },
];

/**
 * TicketDetailDrawer — Drawer moderno con sidebar vertical y resumen por sección
 */
const TicketDetailDrawer = ({
  ticket,
  visible,
  onClose,
  onStatusChange,
  onAddComment,
  currentUser,
}) => {
  const [comment, setComment] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [newStatus, setNewStatus] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeReplyTab, setActiveReplyTab] = useState('comment');
  const [commentFiles, setCommentFiles] = useState([]);
  const [emailFiles, setEmailFiles] = useState([]);
  const [activeSection, setActiveSection] = useState('info');
  const [backendResponseCount, setBackendResponseCount] = useState(null);

  // Cargar count real de respuestas desde el backend (las embebidas vienen paginadas a 10)
  useEffect(() => {
    if (!ticket) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await sh.notifications.responses.get(ticket.id, 1);
        if (!cancelled) setBackendResponseCount(res?.count ?? null);
      } catch {
        if (!cancelled) setBackendResponseCount(null);
      }
    };
    if ((ticket.response_count ?? 0) <= 10) {
      load();
    }
    return () => { cancelled = true; };
  }, [ticket?.id, ticket?.response_count]);

  if (!ticket) return null;

  const {
    id,
    title,
    message: ticketMessage,
    point_title,
    project,
    client,
    type_variable,
    type_alert,
    is_read,
    is_wait,
    is_active,
    is_finish,
    is_periodic,
    status_dga,
    status_sma,
    emails,
    responses,
    created,
  } = ticket;

  const visualId = `#${id}`;

  const getCurrentStatus = () => {
    if (!is_read) return 'nuevo';
    if (is_wait) return 'revision';
    if (is_active && !is_finish) return 'desarrollo';
    return 'resuelto';
  };

  const currentStatus = getCurrentStatus();

  const getAllowedStatusOptions = () => {
    const all = [
      { value: 'nuevo', label: 'Nuevo' },
      { value: 'revision', label: 'En Revisión' },
      { value: 'desarrollo', label: 'En Desarrollo' },
      { value: 'resuelto', label: 'Resuelto' },
    ];
    switch (currentStatus) {
      case 'resuelto': return all.filter((o) => o.value === 'revision');
      case 'revision': return all.filter((o) => o.value === 'desarrollo' || o.value === 'resuelto');
      case 'desarrollo': return all.filter((o) => o.value === 'revision' || o.value === 'resuelto');
      default: return all;
    }
  };

  const allowedOptions = getAllowedStatusOptions();
  const slaCfg = STATUS_CONFIG[currentStatus];

  // Métricas SLA
  const horasSinRespuesta = dayjs().diff(dayjs(created), 'hour');
  const slaBreached = !is_read && horasSinRespuesta > 48;
  const slaUrgente = !is_read && horasSinRespuesta > 24 && horasSinRespuesta <= 48;
  const slaProgress = Math.min((horasSinRespuesta / 48) * 100, 100);
  const slaBarColor = slaBreached ? '#EF4444' : slaUrgente ? '#F59E0B' : '#3B82F6';
  const slaRemaining = Math.max(0, 48 - horasSinRespuesta);

  const hasEmails = emails && emails.length > 0;
  const validResponses = (responses || []).filter((r) => r.response && r.response.trim().length > 0);
  const emailResponses = validResponses.filter((r) => r.is_email);
  const commentResponses = validResponses.filter((r) => !r.is_email);

  // Datos para resumen del sidebar
  const realResponseCount = backendResponseCount ?? ticket?.response_count ?? validResponses.length;
  const navData = {
    info: { badge: null, sub: slaBreached ? 'SLA excedido' : slaUrgente ? 'SLA urgente' : `${slaRemaining}h restantes` },
    reply: { badge: realResponseCount, sub: `${commentResponses.length} comentarios` },
    activity: { badge: realResponseCount, sub: `${emailResponses.length} correos` },
    notes: { badge: null, sub: 'Tareas internas' },
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    setSendingComment(true);
    try {
      await onAddComment(ticket.id, comment.trim(), false);
      setComment('');
      setCommentFiles([]);
      message.success('Comentario agregado');
    } catch {
      message.error('Error al agregar comentario');
    } finally {
      setSendingComment(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailContent.trim()) return;
    setSendingEmail(true);
    try {
      await onAddComment(ticket.id, emailContent.trim(), true);
      setEmailContent('');
      setEmailFiles([]);
      message.success('Correo enviado');
    } catch {
      message.error('Error al enviar correo');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === currentStatus) return;
    setUpdatingStatus(true);
    try {
      await onStatusChange(ticket.id, newStatus);
      message.success(`Estado actualizado a "${STATUS_CONFIG[newStatus]?.label || newStatus}"`);
      setNewStatus(null);
    } catch {
      message.error('Error al actualizar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const uploadProps = (fileList, setFileList) => ({
    fileList,
    onChange: ({ fileList: fl }) => setFileList(fl.slice(-3)),
    beforeUpload: () => false,
    multiple: true,
    maxCount: 3,
  });

  const renderFileList = (fileList, setFileList) =>
    fileList.length > 0 && (
      <Flex vertical gap={4} style={{ marginTop: 4 }}>
        {fileList.map((file, idx) => (
          <Flex
            key={idx}
            align="center"
            justify="space-between"
            style={{
              padding: '4px 8px',
              background: '#F8FAFC',
              borderRadius: 6,
              fontSize: 12,
              border: '1px solid #E2E8F0',
            }}
          >
            <Text ellipsis style={{ maxWidth: 200, fontSize: 12, color: '#0F172A' }}>
              <PaperClipOutlined style={{ marginRight: 4, color: '#64748B' }} />
              {file.name}
            </Text>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setFileList(fileList.filter((_, i) => i !== idx))}
            />
          </Flex>
        ))}
      </Flex>
    );

  // ==================== SECCIONES ====================

  const renderInfo = () => (
    <Flex vertical gap={16}>
      {/* SLA Card resumen */}
      <Card
        size="small"
        style={{
          borderRadius: 12,
          border: `1px solid ${slaBarColor}30`,
          background: `${slaBarColor}08`,
        }}
        bodyStyle={{ padding: 14 }}
      >
        <Flex align="center" gap={12}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${slaBarColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: slaBarColor,
            }}
          >
            {slaBreached ? <FireOutlined /> : <ClockCircleOutlined />}
          </div>
          <div style={{ flex: 1 }}>
            <Flex justify="space-between" align="center">
              <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
                SLA {slaBreached ? 'excedido' : slaUrgente ? 'urgente' : 'en curso'}
              </Text>
              <Text strong style={{ fontSize: 13, color: slaBarColor }}>
                {horasSinRespuesta}h / 48h
              </Text>
            </Flex>
            <div style={{ marginTop: 6, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${slaProgress}%`,
                  height: '100%',
                  background: slaBarColor,
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, display: 'block' }}>
              {slaBreached
                ? 'Este ticket excedió el tiempo de respuesta establecido.'
                : slaUrgente
                ? `Quedan ${slaRemaining} horas para responder.`
                : `Tiempo transcurrido: ${horasSinRespuesta} horas.`}
            </Text>
          </div>
        </Flex>
      </Card>

      {/* Descripción */}
      <Card
        size="small"
        style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FAFBFC' }}
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
          <FileTextOutlined style={{ marginRight: 4 }} />
          Descripción
        </Text>
        <div style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 14, whiteSpace: 'pre-wrap', color: '#0F172A', lineHeight: 1.6 }}>
            {ticketMessage}
          </Text>
        </div>
      </Card>

      {/* Metadatos */}
      <Card
        size="small"
        style={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
          <BarsOutlined style={{ marginRight: 4 }} />
          Detalles
        </Text>
        <Row gutter={[16, 14]} style={{ marginTop: 10 }}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>Punto</Text>
            <div style={{ marginTop: 2 }}>
              <EnvironmentOutlined style={{ marginRight: 4, color: '#3B82F6', fontSize: 12 }} />
              <Text strong style={{ fontSize: 13, color: '#0F172A' }}>{point_title || '—'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>Cliente</Text>
            <div style={{ marginTop: 2 }}>
              <UserOutlined style={{ marginRight: 4, color: '#8B5CF6', fontSize: 12 }} />
              <Text strong style={{ fontSize: 13, color: '#0F172A' }}>{client || '—'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>Proyecto</Text>
            <div style={{ marginTop: 2 }}>
              <FileTextOutlined style={{ marginRight: 4, color: '#14B8A6', fontSize: 12 }} />
              <Text strong style={{ fontSize: 13, color: '#0F172A' }}>{project || '—'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>Variable</Text>
            <div style={{ marginTop: 2 }}>
              <Tag size="small" style={{ fontSize: 11, color: '#3B82F6', background: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 4 }}>
                {type_variable || 'Soporte'}
              </Tag>
            </div>
          </Col>
          {type_alert && (
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>Tipo Alerta</Text>
              <div style={{ marginTop: 2 }}
              >
                <Tag size="small" style={{ fontSize: 11, borderRadius: 4 }}>{type_alert}</Tag>
              </div>
            </Col>
          )}
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>Periódico</Text>
            <div style={{ marginTop: 2 }}>
              <Text style={{ fontSize: 13, color: '#0F172A' }}>{is_periodic ? 'Sí' : 'No'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>Estado DGA</Text>
            <div style={{ marginTop: 2 }}>
              <Tag size="small" style={{ fontSize: 11, borderRadius: 4, color: status_dga === 'PENDING' ? '#D97706' : '#059669', background: status_dga === 'PENDING' ? '#FFFBEB' : '#ECFDF5', borderColor: status_dga === 'PENDING' ? '#FDE68A' : '#A7F3D0' }}>
                {status_dga || '—'}
              </Tag>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>Estado SMA</Text>
            <div style={{ marginTop: 2 }}>
              <Tag size="small" style={{ fontSize: 11, borderRadius: 4, color: status_sma === 'PENDING' ? '#D97706' : '#059669', background: status_sma === 'PENDING' ? '#FFFBEB' : '#ECFDF5', borderColor: status_sma === 'PENDING' ? '#FDE68A' : '#A7F3D0' }}>
                {status_sma || '—'}
              </Tag>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>Creado</Text>
            <div style={{ marginTop: 2 }}>
              <Text style={{ fontSize: 13, color: '#0F172A' }}>{dayjs(created).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
          </Col>
        </Row>

        {hasEmails && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              Correos configurados
            </Text>
            <Flex gap={6} wrap="wrap" style={{ marginTop: 6 }}>
              {emails.map((email, idx) => (
                <Tag key={idx} size="small" icon={<MailOutlined />} style={{ fontSize: 11, color: '#3B82F6', background: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 4 }}>
                  {email}
                </Tag>
              ))}
            </Flex>
          </>
        )}
      </Card>

      {/* Cambiar estado */}
      <Card
        size="small"
        style={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
          <ReloadOutlined style={{ marginRight: 4 }} />
          Cambiar Estado
        </Text>
        <Flex vertical gap={10} style={{ marginTop: 10 }}>
          {currentStatus === 'resuelto' && (
            <Text style={{ fontSize: 12, color: '#D97706', background: '#FFFBEB', padding: '6px 10px', borderRadius: 6 }}>
              Este ticket está resuelto. Solo puede reabrirse a "En Revisión".
            </Text>
          )}
          {currentStatus === 'revision' && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              De "En Revisión" puede pasar a "En Desarrollo" (re-apertura) o "Resuelto".
            </Text>
          )}
          <Flex gap={10} align="center">
            <Select
              style={{ width: 220, borderRadius: 8 }}
              value={newStatus || currentStatus}
              onChange={setNewStatus}
              placeholder="Seleccionar estado"
            >
              {allowedOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  <Flex align="center" gap={6}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_CONFIG[opt.value]?.color }} />
                    {opt.label}
                  </Flex>
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleStatusChange}
              loading={updatingStatus}
              disabled={!newStatus || newStatus === currentStatus}
              style={{ background: '#0F172A', borderRadius: 8 }}
            >
              Actualizar
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );

  const renderReply = () => (
    <Flex vertical gap={14}>
      {is_finish ? (
        <Card
          size="small"
          style={{ borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0' }}
          bodyStyle={{ padding: 16 }}
        >
          <Flex align="center" gap={10}>
            <CheckCircleOutlined style={{ color: '#10B981', fontSize: 22 }} />
            <div>
              <Text strong style={{ color: '#059669', fontSize: 14 }}>Ticket resuelto</Text>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                Reabre el ticket a "En Revisión" para agregar nuevos comentarios o correos.
              </Text>
            </div>
          </Flex>
        </Card>
      ) : (
        <>
          <Flex style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E2E8F0', background: '#fff' }}>
            <Button
              type={activeReplyTab === 'comment' ? 'primary' : 'text'}
              icon={<CommentOutlined />}
              onClick={() => setActiveReplyTab('comment')}
              style={{
                flex: 1,
                borderRadius: 0,
                background: activeReplyTab === 'comment' ? '#10B981' : undefined,
                color: activeReplyTab === 'comment' ? '#fff' : '#64748B',
                border: 'none',
                borderRight: '1px solid #E2E8F0',
                fontWeight: activeReplyTab === 'comment' ? 600 : 400,
              }}
            >
              Comentario interno
            </Button>
            <Button
              type={activeReplyTab === 'email' ? 'primary' : 'text'}
              icon={<MailOutlined />}
              onClick={() => setActiveReplyTab('email')}
              style={{
                flex: 1,
                borderRadius: 0,
                background: activeReplyTab === 'email' ? '#3B82F6' : undefined,
                color: activeReplyTab === 'email' ? '#fff' : '#64748B',
                border: 'none',
                fontWeight: activeReplyTab === 'email' ? 600 : 400,
              }}
            >
              Enviar correo
            </Button>
          </Flex>

          {activeReplyTab === 'comment' ? (
            <Card
              size="small"
              style={{ borderRadius: 12, border: '1px solid #BBF7D0', background: '#F0FDF4' }}
              bodyStyle={{ padding: 16 }}
            >
              <Flex vertical gap={10}>
                <TextArea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe un comentario interno para el equipo de soporte..."
                  style={{ background: '#fff', borderRadius: 8, fontSize: 13 }}
                />
                <Upload {...uploadProps(commentFiles, setCommentFiles)}>
                  <Button icon={<PaperClipOutlined />} size="small" type="dashed" style={{ borderRadius: 6 }}>
                    Adjuntar archivo
                  </Button>
                </Upload>
                {renderFileList(commentFiles, setCommentFiles)}
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendComment}
                  loading={sendingComment}
                  disabled={!comment.trim()}
                  style={{ alignSelf: 'flex-end', background: '#10B981', borderRadius: 8 }}
                >
                  Agregar comentario
                </Button>
              </Flex>
            </Card>
          ) : (
            <Card
              size="small"
              style={{ borderRadius: 12, border: '1px solid #BFDBFE', background: '#EFF6FF' }}
              bodyStyle={{ padding: 16 }}
            >
              <Flex vertical gap={10}>
                {hasEmails && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, color: '#64748B' }}>Destinatarios:</Text>
                    <Flex gap={6} wrap="wrap" style={{ marginTop: 6 }}>
                      {emails.map((email, idx) => (
                        <Tag key={idx} size="small" icon={<MailOutlined />} style={{ fontSize: 11, color: '#3B82F6', background: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 4 }}>
                          {email}
                        </Tag>
                      ))}
                    </Flex>
                  </div>
                )}
                <SimpleEmailEditor
                  value={emailContent}
                  onChange={setEmailContent}
                  placeholder={hasEmails ? 'Escribe el contenido del correo...' : 'Escribe el contenido del correo (sin destinatarios configurados)...'}
                />
                <Upload {...uploadProps(emailFiles, setEmailFiles)}>
                  <Button icon={<PaperClipOutlined />} size="small" type="dashed" style={{ borderRadius: 6 }}>
                    Adjuntar archivo
                  </Button>
                </Upload>
                {renderFileList(emailFiles, setEmailFiles)}
                <Button
                  type="primary"
                  icon={<MailOutlined />}
                  onClick={handleSendEmail}
                  loading={sendingEmail}
                  disabled={!emailContent.trim()}
                  style={{ alignSelf: 'flex-end', background: '#3B82F6', borderRadius: 8 }}
                >
                  Enviar correo
                </Button>
              </Flex>
            </Card>
          )}
        </>
      )}
    </Flex>
  );

  const renderActivity = () => (
    <Flex vertical gap={12}>
      {/* Resumen de actividad */}
      <Card
        size="small"
        style={{ borderRadius: 12, background: '#FAFBFC', border: '1px solid #E2E8F0' }}
        bodyStyle={{ padding: 14 }}
      >
        <Flex gap={16} justify="space-around">
          {[
            { icon: <CommentOutlined />, label: 'Comentarios', value: commentResponses.length, color: '#10B981' },
            { icon: <MailOutlined />, label: 'Correos', value: emailResponses.length, color: '#3B82F6' },
            { icon: <ClockCircleOutlined />, label: 'Total', value: realResponseCount, color: '#8B5CF6' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, color: stat.color }}>{stat.icon}</div>
              <Text strong style={{ fontSize: 18, display: 'block', lineHeight: 1.3 }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: '#94A3B8' }}>{stat.label}</Text>
            </div>
          ))}
        </Flex>
      </Card>

      {/* Timeline */}
      <Flex vertical gap={0}>
        {/* Created entry */}
        <Flex gap={12}>
          <Flex vertical align="center" style={{ width: 32, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', border: '2px solid #3B82F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#3B82F6',
            }}>
              <FileAddOutlined />
            </div>
            <div style={{ width: 2, flex: 1, background: '#E2E8F0', marginTop: 4 }} />
          </Flex>
          <div style={{ paddingBottom: 16, flex: 1 }}>
            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>
              {dayjs(created).format('DD/MM/YYYY HH:mm')}
            </Text>
            <Text strong style={{ fontSize: 14, color: '#0F172A', display: 'block', marginTop: 2 }}>
              Ticket creado
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B' }}>por {ticket.user?.username || 'Usuario'}</Text>
            {hasEmails && (
              <div style={{ marginTop: 4 }}>
                <Tag size="small" icon={<MailOutlined />} style={{ fontSize: 10, color: '#3B82F6', background: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 4, margin: 0 }}>
                  Notificación por correo activada
                </Tag>
              </div>
            )}
          </div>
        </Flex>

        {/* Responses */}
        {validResponses.map((resp, idx) => (
          <Flex key={idx} gap={12}>
            <Flex vertical align="center" style={{ width: 32, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: resp.is_email ? '#EFF6FF' : '#F0FDF4',
                border: `2px solid ${resp.is_email ? '#3B82F6' : '#10B981'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: resp.is_email ? '#3B82F6' : '#10B981',
              }}>
                {resp.is_email ? <MailOutlined /> : <CommentOutlined />}
              </div>
              {idx < validResponses.length - 1 || is_finish ? (
                <div style={{ width: 2, flex: 1, background: '#E2E8F0', marginTop: 4 }} />
              ) : (
                <div style={{ width: 2, flex: 1, background: 'transparent', marginTop: 4 }} />
              )}
            </Flex>
            <div style={{ paddingBottom: 16, flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>
                {dayjs(resp.created).format('DD/MM/YYYY HH:mm')}
              </Text>
              <Flex align="center" gap={6} style={{ marginTop: 2 }}>
                <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
                  {resp.user?.username || 'Usuario'}
                </Text>
                <Tag size="small" style={{
                  fontSize: 10, margin: 0, borderRadius: 4,
                  color: resp.is_email ? '#3B82F6' : '#10B981',
                  background: resp.is_email ? '#EFF6FF' : '#ECFDF5',
                  borderColor: resp.is_email ? '#BFDBFE' : '#A7F3D0',
                }}>
                  {resp.is_email ? 'Correo' : 'Comentario'}
                </Tag>
              </Flex>
              <Card
                size="small"
                style={{
                  marginTop: 8,
                  background: resp.is_email ? '#F0F9FF' : '#F0FDF4',
                  border: `1px solid ${resp.is_email ? '#BFDBFE' : '#BBF7D0'}`,
                  borderRadius: 8,
                }}
                bodyStyle={{ padding: '10px 12px' }}
              >
                <Text style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: '#334155' }}>
                  {resp.response}
                </Text>
              </Card>
            </div>
          </Flex>
        ))}

        {/* Resolved entry */}
        {is_finish && (
          <Flex gap={12}>
            <Flex vertical align="center" style={{ width: 32, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#ECFDF5', border: '2px solid #10B981',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#10B981',
              }}>
                <CheckCircleOutlined />
              </div>
            </Flex>
            <div style={{ paddingBottom: 16, flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>
                {dayjs(ticket.modified || created).format('DD/MM/YYYY HH:mm')}
              </Text>
              <Text strong style={{ fontSize: 14, color: '#059669', display: 'block', marginTop: 2 }}>
                Ticket resuelto
              </Text>
            </div>
          </Flex>
        )}

        {validResponses.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin actividad registrada" style={{ marginTop: 16 }} />
        )}
      </Flex>
    </Flex>
  );

  const renderNotes = () => <SlaTaskNotes ticketId={id} currentUser={currentUser} />;

  const sectionMap = {
    info: renderInfo(),
    reply: renderReply(),
    activity: renderActivity(),
    notes: renderNotes(),
  };

  return (
    <Drawer
      title={null}
      width={720}
      open={visible}
      onClose={onClose}
      bodyStyle={{ padding: 0 }}
      closable={false}
    >
      {/* Header del drawer */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #E2E8F0',
        background: '#FAFBFC',
      }}>
        <Flex justify="space-between" align="start">
          <Flex vertical gap={6} style={{ flex: 1 }}>
            <Flex align="center" gap={10} wrap="wrap">
              <Badge
                count={visualId}
                style={{ backgroundColor: '#0F172A', fontSize: 11, fontWeight: 600 }}
              />
              <Tag
                icon={slaCfg.icon}
                style={{
                  fontSize: 12,
                  color: slaCfg.color,
                  background: slaCfg.bg,
                  borderColor: `${slaCfg.color}40`,
                  borderRadius: 4,
                  fontWeight: 500,
                }}
              >
                {slaCfg.label}
              </Tag>
              {hasEmails && (
                <Tag icon={<MailOutlined />} style={{ fontSize: 12, color: '#3B82F6', background: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 4 }}>
                  Email
                </Tag>
              )}
              {slaBreached && (
                <Tag icon={<FireOutlined />} style={{ fontSize: 12, color: '#EF4444', background: '#FEF2F2', borderColor: '#FECACA', borderRadius: 4, fontWeight: 500 }}>
                  SLA &gt;48h
                </Tag>
              )}
            </Flex>
            <Title level={5} style={{ margin: 0, color: '#0F172A', fontSize: 16, lineHeight: 1.35, fontWeight: 600 }}>
              {title}
            </Title>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {point_title || '—'}
              {project ? ` · ${project}` : ''}
              {client ? ` · ${client}` : ''}
            </Text>
          </Flex>
          <Button type="text" size="small" onClick={onClose} style={{ color: '#94A3B8', fontSize: 18, padding: 4 }}>
            ✕
          </Button>
        </Flex>
      </div>

      {/* Contenido con sidebar */}
      <Flex style={{ height: 'calc(100vh - 140px)' }}>
        {/* Sidebar de navegación */}
        <div style={{
          width: 180,
          borderRight: '1px solid #E2E8F0',
          background: '#F8FAFC',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            const data = navData[item.key];
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: isActive ? '#fff' : 'transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  outline: 'none',
                }}
              >
                <Flex align="center" gap={8}>
                  <span style={{ color: isActive ? item.color : '#94A3B8', fontSize: 14, transition: 'color 0.2s' }}>
                    {item.icon}
                  </span>
                  <Text strong style={{
                    fontSize: 13,
                    color: isActive ? '#0F172A' : '#64748B',
                    transition: 'color 0.2s',
                  }}>
                    {item.label}
                  </Text>
                  {data.badge !== null && (
                    <Badge
                      count={data.badge}
                      style={{
                        backgroundColor: isActive ? item.color : '#CBD5E1',
                        fontSize: 10,
                        marginLeft: 'auto',
                      }}
                    />
                  )}
                </Flex>
                <Text style={{
                  fontSize: 10,
                  color: isActive ? '#64748B' : '#94A3B8',
                  paddingLeft: 22,
                  transition: 'color 0.2s',
                }}>
                  {data.sub}
                </Text>
              </button>
            );
          })}
        </div>

        {/* Área de contenido */}
        <div style={{
          flex: 1,
          padding: '20px 24px',
          overflowY: 'auto',
          background: '#fff',
        }}>
          {sectionMap[activeSection]}
        </div>
      </Flex>
    </Drawer>
  );
};

export default React.memo(TicketDetailDrawer);
