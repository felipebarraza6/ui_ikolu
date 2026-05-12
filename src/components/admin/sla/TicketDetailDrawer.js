import React, { useState } from 'react';
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
} from '@ant-design/icons';
import SimpleEmailEditor from './SimpleEmailEditor';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * TicketDetailDrawer — Drawer con detalle completo de un ticket SUPPORT
 *
 * Caracteristicas:
 * - Flujo restrictivo de estados (resuelto solo -> revision, revision solo -> desarrollo)
 * - Timeline movido a drawer aparte (TicketActivityDrawer)
 * - Separacion clara entre COMENTARIOS INTERNOS y ENVIO DE CORREOS
 * - Editor simple para correos con herramientas de formato
 * - Adjuntar archivos en comentarios y correos
 * - Cambio de estado con PATCH al backend
 */
const TicketDetailDrawer = ({
  ticket,
  visible,
  onClose,
  onStatusChange,
  onAddComment,
  onOpenActivity,
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
  } = ticket;

  const visualId = `#${id}`;

  const getCurrentStatus = () => {
    if (!is_read) return 'nuevo';
    if (is_wait) return 'revision';
    if (is_active && !is_finish) return 'desarrollo';
    return 'resuelto';
  };

  const currentStatus = getCurrentStatus();

  // Flujo restrictivo de estados
  const getAllowedStatusOptions = () => {
    const all = [
      { value: 'nuevo', label: 'Nuevo' },
      { value: 'revision', label: 'En Revision' },
      { value: 'desarrollo', label: 'En Desarrollo' },
      { value: 'resuelto', label: 'Resuelto' },
    ];

    switch (currentStatus) {
      case 'resuelto':
        // Ticket resuelto solo puede reabrirse a Revision
        return all.filter((o) => o.value === 'revision');
      case 'revision':
        // De revision pasa a desarrollo (re-apertura) o resuelto
        return all.filter((o) => o.value === 'desarrollo' || o.value === 'resuelto');
      case 'desarrollo':
        // Desarrollo puede ir a revision o resuelto
        return all.filter((o) => o.value === 'revision' || o.value === 'resuelto');
      case 'nuevo':
      default:
        // Nuevo puede ir a cualquiera excepto el mismo
        return all;
    }
  };

  const allowedOptions = getAllowedStatusOptions();

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
      message.success(`Estado actualizado a "${statusConfig[newStatus]?.label || newStatus}"`);
      setNewStatus(null);
    } catch {
      message.error('Error al actualizar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusConfig = {
    nuevo: { label: 'Nuevo', color: 'blue', icon: <FileAddOutlined /> },
    revision: { label: 'En Revision', color: 'orange', icon: <EyeOutlined /> },
    desarrollo: { label: 'En Desarrollo', color: 'purple', icon: <ToolOutlined /> },
    resuelto: { label: 'Resuelto', color: 'green', icon: <CheckCircleOutlined /> },
  };

  const slaConfig = statusConfig[currentStatus];

  const hasEmails = emails && emails.length > 0;
  const validResponses = (responses || []).filter(
    (r) => r.response && r.response.trim().length > 0
  );
  const emailResponses = validResponses.filter((r) => r.is_email);
  const commentResponses = validResponses.filter((r) => !r.is_email);

  // Configuracion de upload para adjuntos
  const uploadProps = (fileList, setFileList) => ({
    fileList,
    onChange: ({ fileList: fl }) => setFileList(fl.slice(-3)), // max 3 archivos
    beforeUpload: () => false, // prevent auto upload
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
              background: '#f5f5f5',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            <Text ellipsis style={{ maxWidth: 200, fontSize: 12 }}>
              <PaperClipOutlined style={{ marginRight: 4 }} />
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

  return (
    <Drawer
      title={
        <Flex vertical gap={4}>
          <Flex align="center" gap={8}>
            <Badge
              count={visualId}
              style={{ backgroundColor: '#1F3461', fontSize: 11 }}
            />
            <Tag
              icon={slaConfig.icon}
              color={slaConfig.color}
              style={{ fontSize: 12 }}
            >
              {slaConfig.label}
            </Tag>
            {hasEmails && (
              <Tag icon={<MailOutlined />} color="blue" style={{ fontSize: 12 }}>
                Email
              </Tag>
            )}
          </Flex>
          <Text strong style={{ fontSize: 14 }}>{title}</Text>
        </Flex>
      }
      width={560}
      open={visible}
      onClose={onClose}
      bodyStyle={{ paddingBottom: 80 }}
    >
      {/* Info del ticket */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #e8e8e8' }}
      >
        <Flex vertical gap={8}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <FileTextOutlined style={{ marginRight: 4 }} />
              Descripcion
            </Text>
            <div style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{ticketMessage}</Text>
            </div>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <Row gutter={[16, 12]}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Punto</Text>
              <div>
                <EnvironmentOutlined style={{ marginRight: 4, color: '#1890FF' }} />
                <Text strong style={{ fontSize: 12 }}>{point_title || '—'}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Cliente</Text>
              <div>
                <UserOutlined style={{ marginRight: 4, color: '#722ED1' }} />
                <Text strong style={{ fontSize: 12 }}>{client || '—'}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Proyecto</Text>
              <div>
                <FileTextOutlined style={{ marginRight: 4, color: '#13C2C2' }} />
                <Text strong style={{ fontSize: 12 }}>{project || '—'}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Variable</Text>
              <div>
                <Tag size="small" color="processing">{type_variable || 'Soporte'}</Tag>
              </div>
            </Col>
            {type_alert && (
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11 }}>Tipo Alerta</Text>
                <div>
                  <Tag size="small">{type_alert}</Tag>
                </div>
              </Col>
            )}
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Periodico</Text>
              <div>
                <Text style={{ fontSize: 12 }}>{is_periodic ? 'Si' : 'No'}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Estado DGA</Text>
              <div>
                <Tag size="small" color={status_dga === 'PENDING' ? 'warning' : 'success'}>
                  {status_dga || '—'}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Estado SMA</Text>
              <div>
                <Tag size="small" color={status_sma === 'PENDING' ? 'warning' : 'success'}>
                  {status_sma || '—'}
                </Tag>
              </div>
            </Col>
          </Row>

          {hasEmails && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <MailOutlined style={{ marginRight: 4 }} />
                  Correos configurados
                </Text>
                <Flex gap={4} wrap="wrap" style={{ marginTop: 4 }}>
                  {emails.map((email, idx) => (
                    <Tag key={idx} size="small" icon={<MailOutlined />} color="blue">
                      {email}
                    </Tag>
                  ))}
                </Flex>
              </div>
            </>
          )}
        </Flex>
      </Card>

      {/* Cambiar estado con flujo restrictivo */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #e8e8e8' }}
        title={
          <Flex align="center" gap={6}>
            <ReloadOutlined />
            Cambiar Estado
            <Tag size="small" color={slaConfig.color} style={{ marginLeft: 8 }}>
              {slaConfig.label}
            </Tag>
          </Flex>
        }
      >
        <Flex vertical gap={8}>
          {currentStatus === 'resuelto' && (
            <Text type="warning" style={{ fontSize: 12 }}>
              Este ticket está resuelto. Solo puede reabrirse a "En Revisión".
            </Text>
          )}
          {currentStatus === 'revision' && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              De "En Revisión" puede pasar a "En Desarrollo" (re-apertura) o "Resuelto".
            </Text>
          )}
          <Flex gap={8} align="center">
            <Select
              style={{ width: 220 }}
              value={newStatus || currentStatus}
              onChange={setNewStatus}
              placeholder="Seleccionar estado"
            >
              {allowedOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleStatusChange}
              loading={updatingStatus}
              disabled={!newStatus || newStatus === currentStatus}
              style={{ background: '#1F3461' }}
            >
              Actualizar
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Boton para abrir historial */}
      <Button
        icon={<HistoryOutlined />}
        onClick={onOpenActivity}
        style={{ marginBottom: 16, width: '100%' }}
      >
        Ver historial de actividad
        {validResponses.length > 0 && (
          <Badge
            count={validResponses.length}
            style={{ marginLeft: 8, backgroundColor: '#722ED1' }}
          />
        )}
      </Button>

      {/* Resumen rapido de actividad */}
      {validResponses.length > 0 && (
        <Card
          size="small"
          style={{ marginBottom: 16, borderRadius: 8, background: '#fafafa', border: '1px solid #e8e8e8' }}
        >
          <Flex gap={16} justify="space-around">
            <div style={{ textAlign: 'center' }}>
              <CommentOutlined style={{ color: '#52C41A', fontSize: 18 }} />
              <div style={{ marginTop: 4 }}>
                <Text strong>{commentResponses.length}</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>Comentarios</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <MailOutlined style={{ color: '#1890FF', fontSize: 18 }} />
              <div style={{ marginTop: 4 }}>
                <Text strong>{emailResponses.length}</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>Correos</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ color: '#722ED1', fontSize: 18 }} />
              <div style={{ marginTop: 4 }}>
                <Text strong>{validResponses.length}</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>Total</Text>
            </div>
          </Flex>
        </Card>
      )}

      {/* Seccion de respuesta: Comentario vs Correo */}
      {!is_finish && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <Title level={5} style={{ marginBottom: 12 }}>
            <MessageOutlined style={{ marginRight: 6 }} />
            Agregar Respuesta
          </Title>

          {/* Tabs personalizados con mejor contraste */}
          <Flex style={{ marginBottom: 12 }}>
            <Button
              type={activeReplyTab === 'comment' ? 'primary' : 'default'}
              icon={<CommentOutlined />}
              onClick={() => setActiveReplyTab('comment')}
              style={{
                flex: 1,
                borderRadius: '6px 0 0 6px',
                background: activeReplyTab === 'comment' ? '#52C41A' : undefined,
              }}
            >
              Comentario interno
            </Button>
            <Button
              type={activeReplyTab === 'email' ? 'primary' : 'default'}
              icon={<MailOutlined />}
              onClick={() => setActiveReplyTab('email')}
              style={{
                flex: 1,
                borderRadius: '0 6px 6px 0',
                background: activeReplyTab === 'email' ? '#1890FF' : undefined,
              }}
            >
              Enviar correo
            </Button>
          </Flex>

          {/* Contenido del tab activo */}
          {activeReplyTab === 'comment' ? (
            <Card
              size="small"
              style={{
                borderRadius: 8,
                border: '1px solid #b7eb8f',
                background: '#f6ffed',
              }}
              bodyStyle={{ padding: 12 }}
            >
              <Flex vertical gap={10}>
                <TextArea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe un comentario interno para el equipo de soporte..."
                  style={{ background: '#fff', borderRadius: 6 }}
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
                  style={{ alignSelf: 'flex-end', background: '#52C41A' }}
                >
                  Agregar comentario
                </Button>
              </Flex>
            </Card>
          ) : (
            <Card
              size="small"
              style={{
                borderRadius: 8,
                border: '1px solid #91caff',
                background: '#e6f4ff',
              }}
              bodyStyle={{ padding: 12 }}
            >
              <Flex vertical gap={10}>
                {hasEmails && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Destinatarios:
                    </Text>
                    <Flex gap={4} wrap="wrap" style={{ marginTop: 4 }}>
                      {emails.map((email, idx) => (
                        <Tag key={idx} size="small" icon={<MailOutlined />} color="blue">
                          {email}
                        </Tag>
                      ))}
                    </Flex>
                  </div>
                )}
                <SimpleEmailEditor
                  value={emailContent}
                  onChange={setEmailContent}
                  placeholder={
                    hasEmails
                      ? 'Escribe el contenido del correo...'
                      : 'Escribe el contenido del correo (sin destinatarios configurados)...'
                  }
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
                  style={{ alignSelf: 'flex-end', background: '#1890FF' }}
                >
                  Enviar correo
                </Button>
              </Flex>
            </Card>
          )}
        </>
      )}

      {/* Si esta resuelto, mostrar mensaje en vez del formulario */}
      {is_finish && (
        <Card
          size="small"
          style={{
            marginTop: 16,
            borderRadius: 8,
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
          }}
        >
          <Flex align="center" gap={8}>
            <CheckCircleOutlined style={{ color: '#52C41A', fontSize: 18 }} />
            <Text strong style={{ color: '#52C41A' }}>
              Ticket resuelto
            </Text>
          </Flex>
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
            Reabre el ticket a "En Revisión" para agregar nuevos comentarios o correos.
          </Text>
        </Card>
      )}
    </Drawer>
  );
};

export default React.memo(TicketDetailDrawer);
