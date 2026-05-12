import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Typography,
  Tag,
  Flex,
  Empty,
  Card,
} from 'antd';
import {
  ClockCircleOutlined,
  MailOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import sh from '../../../api/sh/endpoints';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

/**
 * TicketActivityDrawer — Drawer elegante con historial completo
 */
const TicketActivityDrawer = ({ ticket, visible, onClose }) => {
  const [backendResponseCount, setBackendResponseCount] = useState(null);

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
    if ((ticket?.response_count ?? 0) <= 10) {
      load();
    }
    return () => { cancelled = true; };
  }, [ticket?.id, ticket?.response_count]);

  if (!ticket) return null;

  const {
    id,
    title,
    created,
    modified,
    is_finish,
    emails,
    responses,
    user,
  } = ticket;

  const visualId = `#${id}`;
  const hasEmails = emails && emails.length > 0;

  const validResponses = (responses || []).filter(
    (r) => r.response && r.response.trim().length > 0
  );
  const realResponseCount = backendResponseCount ?? ticket.response_count ?? validResponses.length;

  const emailResponses = validResponses.filter(r => r.is_email);
  const commentResponses = validResponses.filter(r => !r.is_email);

  const items = [
    {
      dot: <ClockCircleOutlined style={{ color: '#3B82F6' }} />,
      color: '#3B82F6',
      time: dayjs(created).format('DD/MM/YYYY HH:mm'),
      content: (
        <div>
          <Text strong style={{ fontSize: 14, color: '#0F172A' }}>Ticket creado</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              por {user?.username || 'Usuario'}
            </Text>
          </div>
          {hasEmails && (
            <div style={{ marginTop: 4 }}>
              <Tag
                size="small"
                icon={<MailOutlined />}
                style={{
                  fontSize: 11,
                  color: '#3B82F6',
                  background: '#EFF6FF',
                  borderColor: '#BFDBFE',
                  borderRadius: 4,
                }}
              >
                Notificación por correo activada
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    ...commentResponses.map((resp) => ({
      dot: <CommentOutlined style={{ color: '#10B981' }} />,
      color: '#10B981',
      time: dayjs(resp.created).format('DD/MM/YYYY HH:mm'),
      content: (
        <div>
          <Flex align="center" gap={6}>
            <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
              {resp.user?.username || 'Usuario'}
            </Text>
            <Tag
              size="small"
              icon={<CommentOutlined />}
              style={{
                fontSize: 10,
                color: '#10B981',
                background: '#ECFDF5',
                borderColor: '#A7F3D0',
                borderRadius: 4,
                margin: 0,
              }}
            >
              Comentario interno
            </Tag>
          </Flex>
          <Card
            size="small"
            style={{
              marginTop: 8,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: '10px 14px' }}
          >
            <Text style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: '#334155' }}>
              {resp.response}
            </Text>
          </Card>
        </div>
      ),
    })),
    ...emailResponses.map((resp) => ({
      dot: <MailOutlined style={{ color: '#3B82F6' }} />,
      color: '#3B82F6',
      time: dayjs(resp.created).format('DD/MM/YYYY HH:mm'),
      content: (
        <div>
          <Flex align="center" gap={6}>
            <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
              {resp.user?.username || 'Usuario'}
            </Text>
            <Tag
              size="small"
              icon={<MailOutlined />}
              style={{
                fontSize: 10,
                color: '#3B82F6',
                background: '#EFF6FF',
                borderColor: '#BFDBFE',
                borderRadius: 4,
                margin: 0,
              }}
            >
              Correo enviado
            </Tag>
          </Flex>
          <Card
            size="small"
            style={{
              marginTop: 8,
              background: '#F0F9FF',
              border: '1px solid #BFDBFE',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: '10px 14px' }}
          >
            <Text style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: '#334155' }}>
              {resp.response}
            </Text>
          </Card>
        </div>
      ),
    })),
  ];

  if (is_finish) {
    items.push({
      dot: <CheckCircleOutlined style={{ color: '#10B981' }} />,
      color: '#10B981',
      time: dayjs(modified || created).format('DD/MM/YYYY HH:mm'),
      content: (
        <div>
          <Text strong style={{ color: '#059669', fontSize: 14 }}>
            Ticket resuelto
          </Text>
        </div>
      ),
    });
  }

  return (
    <Drawer
      title={
        <Flex vertical gap={4}>
          <Flex align="center" gap={8}>
            <HistoryOutlined style={{ color: '#0F172A', fontSize: 18 }} />
            <Title level={5} style={{ margin: 0, color: '#0F172A' }}>Historial de Actividad</Title>
          </Flex>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Ticket {visualId} — {title}
          </Text>
        </Flex>
      }
      width={520}
      open={visible}
      onClose={onClose}
      bodyStyle={{ padding: '20px 24px' }}
    >
      {/* Resumen */}
      <Card
        size="small"
        style={{ marginBottom: 20, borderRadius: 10, background: '#FAFBFC', border: '1px solid #E2E8F0' }}
        bodyStyle={{ padding: 14 }}
      >
        <Flex gap={16} justify="space-around">
          <div style={{ textAlign: 'center' }}>
            <CommentOutlined style={{ color: '#10B981', fontSize: 22 }} />
            <div style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 18 }}>{commentResponses.length}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Comentarios</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <MailOutlined style={{ color: '#3B82F6', fontSize: 22 }} />
            <div style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 18 }}>{emailResponses.length}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Correos</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <ClockCircleOutlined style={{ color: '#8B5CF6', fontSize: 22 }} />
            <div style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 18 }}>{realResponseCount}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Total</Text>
          </div>
        </Flex>
      </Card>

      {/* Timeline custom */}
      {items.length === 1 && realResponseCount === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin actividad registrada"
          style={{ marginTop: 32 }}
        />
      ) : (
        <Flex vertical gap={0}>
          {items.map((item, idx) => (
            <Flex key={idx} gap={12}>
              {/* Línea y dot */}
              <Flex vertical align="center" style={{ width: 24, flexShrink: 0 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `${item.color}15`,
                    border: `2px solid ${item.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    color: item.color,
                    zIndex: 1,
                  }}
                >
                  {item.dot}
                </div>
                {idx < items.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      background: '#E2E8F0',
                      marginTop: 4,
                      marginBottom: -8,
                    }}
                  />
                )}
              </Flex>
              {/* Contenido */}
              <div style={{ paddingBottom: 20, flex: 1 }}>
                <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>
                  {item.time}
                </Text>
                <div style={{ marginTop: 2 }}>
                  {item.content}
                </div>
              </div>
            </Flex>
          ))}
        </Flex>
      )}
    </Drawer>
  );
};

export default React.memo(TicketActivityDrawer);
