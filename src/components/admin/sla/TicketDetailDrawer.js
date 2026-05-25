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
  theme,
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
import { ikoluTokens } from '../../../theme';

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
  const { token } = theme.useToken();

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
      <Flex vertical gap={4}>
        {fileList.map((file, idx) => (
          <Flex
            key={idx}
            align="center"
            justify="space-between"
          >
            <Text ellipsis>
              <PaperClipOutlined />
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
          <div>
            <Flex justify="space-between" align="center">
              <Text strong>
                SLA {slaBreached ? 'excedido' : slaUrgente ? 'urgente' : 'en curso'}
              </Text>
              <Text strong>
                {horasSinRespuesta}h / 48h
              </Text>
            </Flex>
            <div>
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
            <Text>
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
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary">
          <FileTextOutlined />
          Descripción
        </Text>
        <div>
          <Text>
            {ticketMessage}
          </Text>
        </div>
      </Card>

      {/* Metadatos */}
      <Card
        size="small"
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary">
          <BarsOutlined />
          Detalles
        </Text>
        <Row gutter={[16, 14]}>
          <Col span={12}>
            <Text type="secondary">Punto</Text>
            <div>
              <EnvironmentOutlined />
              <Text strong>{point_title || '—'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Cliente</Text>
            <div>
              <UserOutlined />
              <Text strong>{client || '—'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Proyecto</Text>
            <div>
              <FileTextOutlined />
              <Text strong>{project || '—'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Variable</Text>
            <div>
              <Tag size="small">
                {type_variable || 'Soporte'}
              </Tag>
            </div>
          </Col>
          {type_alert && (
            <Col span={12}>
              <Text type="secondary">Tipo Alerta</Text>
              <div
              >
                <Tag size="small">{type_alert}</Tag>
              </div>
            </Col>
          )}
          <Col span={12}>
            <Text type="secondary">Periódico</Text>
            <div>
              <Text>{is_periodic ? 'Sí' : 'No'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Estado DGA</Text>
            <div>
              <Tag size="small">
                {status_dga || '—'}
              </Tag>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Estado SMA</Text>
            <div>
              <Tag size="small">
                {status_sma || '—'}
              </Tag>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Creado</Text>
            <div>
              <Text>{dayjs(created).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
          </Col>
        </Row>

        {hasEmails && (
          <>
            <Divider />
            <Text type="secondary">
              <MailOutlined />
              Correos configurados
            </Text>
            <Flex gap={6} wrap="wrap">
              {emails.map((email, idx) => (
                <Tag key={idx} size="small" icon={<MailOutlined />}>
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
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary">
          <ReloadOutlined />
          Cambiar Estado
        </Text>
        <Flex vertical gap={10}>
          {currentStatus === 'resuelto' && (
            <Text>
              Este ticket está resuelto. Solo puede reabrirse a "En Revisión".
            </Text>
          )}
          {currentStatus === 'revision' && (
            <Text type="secondary">
              De "En Revisión" puede pasar a "En Desarrollo" (re-apertura) o "Resuelto".
            </Text>
          )}
          <Flex gap={10} align="center">
            <Select
              value={newStatus || currentStatus}
              onChange={setNewStatus}
              placeholder="Seleccionar estado"
            >
              {allowedOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  <Flex align="center" gap={6}>
                    <div />
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
          bodyStyle={{ padding: 16 }}
        >
          <Flex align="center" gap={10}>
            <CheckCircleOutlined />
            <div>
              <Text strong>Ticket resuelto</Text>
              <Text type="secondary">
                Reabre el ticket a "En Revisión" para agregar nuevos comentarios o correos.
              </Text>
            </div>
          </Flex>
        </Card>
      ) : (
        <>
          <Flex>
            <Button
              type={activeReplyTab === 'comment' ? 'primary' : 'text'}
              icon={<CommentOutlined />}
              onClick={() => setActiveReplyTab('comment')}
            >
              Comentario interno
            </Button>
            <Button
              type={activeReplyTab === 'email' ? 'primary' : 'text'}
              icon={<MailOutlined />}
              onClick={() => setActiveReplyTab('email')}
            >
              Enviar correo
            </Button>
          </Flex>

          {activeReplyTab === 'comment' ? (
            <Card
              size="small"
              bodyStyle={{ padding: 16 }}
            >
              <Flex vertical gap={10}>
                <TextArea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe un comentario interno para el equipo de soporte..."
                />
                <Upload {...uploadProps(commentFiles, setCommentFiles)}>
                  <Button icon={<PaperClipOutlined />} size="small" type="dashed">
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
                >
                  Agregar comentario
                </Button>
              </Flex>
            </Card>
          ) : (
            <Card
              size="small"
              bodyStyle={{ padding: 16 }}
            >
              <Flex vertical gap={10}>
                {hasEmails && (
                  <div>
                    <Text type="secondary">Destinatarios:</Text>
                    <Flex gap={6} wrap="wrap">
                      {emails.map((email, idx) => (
                        <Tag key={idx} size="small" icon={<MailOutlined />}>
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
                  <Button icon={<PaperClipOutlined />} size="small" type="dashed">
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
        bodyStyle={{ padding: 14 }}
      >
        <Flex gap={16} justify="space-around">
          {[
            { icon: <CommentOutlined />, label: 'Comentarios', value: commentResponses.length, color: '#10B981' },
            { icon: <MailOutlined />, label: 'Correos', value: emailResponses.length, color: '#3B82F6' },
            { icon: <ClockCircleOutlined />, label: 'Total', value: realResponseCount, color: '#8B5CF6' },
          ].map((stat) => (
            <div key={stat.label}>
              <div>{stat.icon}</div>
              <Text strong>{stat.value}</Text>
              <Text>{stat.label}</Text>
            </div>
          ))}
        </Flex>
      </Card>

      {/* Timeline */}
      <Flex vertical gap={0}>
        {/* Created entry */}
        <Flex gap={12}>
          <Flex vertical align="center">
            <div>
              <FileAddOutlined />
            </div>
            <div />
          </Flex>
          <div>
            <Text type="secondary">
              {dayjs(created).format('DD/MM/YYYY HH:mm')}
            </Text>
            <Text strong>
              Ticket creado
            </Text>
            <Text>por {ticket.user?.username || 'Usuario'}</Text>
            {hasEmails && (
              <div>
                <Tag size="small" icon={<MailOutlined />}>
                  Notificación por correo activada
                </Tag>
              </div>
            )}
          </div>
        </Flex>

        {/* Responses */}
        {validResponses.map((resp, idx) => (
          <Flex key={idx} gap={12}>
            <Flex vertical align="center">
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: resp.is_email ? '#EFF6FF' : '#F0FDF4',
                border: `2px solid ${resp.is_email ? '#3B82F6' : '#10B981'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: resp.is_email ? '#3B82F6' : '#10B981',
              }}>
                {resp.is_email ? <MailOutlined /> : <CommentOutlined />}
              </div>
              {idx < validResponses.length - 1 || is_finish ? (
                <div />
              ) : (
                <div />
              )}
            </Flex>
            <div>
              <Text type="secondary">
                {dayjs(resp.created).format('DD/MM/YYYY HH:mm')}
              </Text>
              <Flex align="center" gap={6}>
                <Text strong>
                  {resp.user?.username || 'Usuario'}
                </Text>
                <Tag size="small">
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
                <Text>
                  {resp.response}
                </Text>
              </Card>
            </div>
          </Flex>
        ))}

        {/* Resolved entry */}
        {is_finish && (
          <Flex gap={12}>
            <Flex vertical align="center">
              <div>
                <CheckCircleOutlined />
              </div>
            </Flex>
            <div>
              <Text type="secondary">
                {dayjs(ticket.modified || created).format('DD/MM/YYYY HH:mm')}
              </Text>
              <Text strong>
                Ticket resuelto
              </Text>
            </div>
          </Flex>
        )}

        {validResponses.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin actividad registrada" />
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
      <div>
        <Flex justify="space-between" align="start">
          <Flex vertical gap={6}>
            <Flex align="center" gap={10} wrap="wrap">
              <Badge
                count={visualId}
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
                <Tag icon={<MailOutlined />}>
                  Email
                </Tag>
              )}
              {slaBreached && (
                <Tag icon={<FireOutlined />}>
                  SLA &gt;48h
                </Tag>
              )}
            </Flex>
            <Title level={5}>
              {title}
            </Title>
            <Text>
              <EnvironmentOutlined />
              {point_title || '—'}
              {project ? ` · ${project}` : ''}
              {client ? ` · ${client}` : ''}
            </Text>
          </Flex>
          <Button type="text" size="small" onClick={onClose}>
            ✕
          </Button>
        </Flex>
      </div>

      {/* Contenido con sidebar */}
      <Flex>
        {/* Sidebar de navegación */}
        <div>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            const data = navData[item.key];
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
              >
                <Flex align="center" gap={8}>
                  <span>
                    {item.icon}
                  </span>
                  <Text strong>
                    {item.label}
                  </Text>
                  {data.badge !== null && (
                    <Badge
                      count={data.badge}
                    />
                  )}
                </Flex>
                <Text>
                  {data.sub}
                </Text>
              </button>
            );
          })}
        </div>

        {/* Área de contenido */}
        <div>
          {sectionMap[activeSection]}
        </div>
      </Flex>
    </Drawer>
  );
};

export default React.memo(TicketDetailDrawer);
