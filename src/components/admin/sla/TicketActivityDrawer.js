import React from 'react';
import {
  Drawer,
  Typography,
  Tag,
  Flex,
  Timeline,
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
import dayjs from 'dayjs';

const { Text, Title } = Typography;

/**
 * TicketActivityDrawer — Drawer aparte con el historial completo de actividad
 */
const TicketActivityDrawer = ({ ticket, visible, onClose }) => {
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

  const emailResponses = validResponses.filter(r => r.is_email);
  const commentResponses = validResponses.filter(r => !r.is_email);

  const timelineItems = [
    {
      dot: <ClockCircleOutlined style={{ color: '#1890FF' }} />,
      color: 'blue',
      children: (
        <div>
          <Text strong style={{ fontSize: 14 }}>Ticket creado</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(created).format('DD/MM/YYYY HH:mm')} por {user?.username || 'Usuario'}
            </Text>
          </div>
          {hasEmails && (
            <div style={{ marginTop: 4 }}>
              <Tag size="small" icon={<MailOutlined />} color="blue">
                Notificacion por correo activada
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    ...commentResponses.map((resp) => ({
      dot: <CommentOutlined style={{ color: '#52C41A' }} />,
      color: 'green',
      children: (
        <div>
          <Flex align="center" gap={6}>
            <Text strong style={{ fontSize: 13 }}>
              {resp.user?.username || 'Usuario'}
            </Text>
            <Tag size="small" icon={<CommentOutlined />} color="green">
              Comentario interno
            </Tag>
          </Flex>
          <Card
            size="small"
            style={{
              marginTop: 6,
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: '10px 14px' }}
          >
            <Text style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>
              {resp.response}
            </Text>
          </Card>
          <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
            {dayjs(resp.created).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
      ),
    })),
    ...emailResponses.map((resp) => ({
      dot: <MailOutlined style={{ color: '#1890FF' }} />,
      color: 'blue',
      children: (
        <div>
          <Flex align="center" gap={6}>
            <Text strong style={{ fontSize: 13 }}>
              {resp.user?.username || 'Usuario'}
            </Text>
            <Tag size="small" icon={<MailOutlined />} color="blue">
              Correo enviado
            </Tag>
          </Flex>
          <Card
            size="small"
            style={{
              marginTop: 6,
              background: '#eff6ff',
              border: '1px solid #93c5fd',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: '10px 14px' }}
          >
            <Text style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>
              {resp.response}
            </Text>
          </Card>
          <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
            {dayjs(resp.created).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
      ),
    })),
  ];

  if (is_finish) {
    timelineItems.push({
      dot: <CheckCircleOutlined style={{ color: '#52C41A' }} />,
      color: 'green',
      children: (
        <div>
          <Text strong style={{ color: '#52C41A', fontSize: 14 }}>
            Ticket resuelto
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(modified || created).format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
        </div>
      ),
    });
  }

  return (
    <Drawer
      title={
        <Flex vertical gap={4}>
          <Flex align="center" gap={8}>
            <HistoryOutlined style={{ color: '#1F3461', fontSize: 16 }} />
            <Title level={5} style={{ margin: 0 }}>Historial de Actividad</Title>
          </Flex>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Ticket {visualId} — {title}
          </Text>
        </Flex>
      }
      width={480}
      open={visible}
      onClose={onClose}
      bodyStyle={{ paddingBottom: 24 }}
    >
      {/* Resumen */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 8, background: '#fafafa' }}>
        <Flex gap={16} justify="space-around">
          <div style={{ textAlign: 'center' }}>
            <CommentOutlined style={{ color: '#52C41A', fontSize: 20 }} />
            <div style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 16 }}>{commentResponses.length}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Comentarios</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <MailOutlined style={{ color: '#1890FF', fontSize: 20 }} />
            <div style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 16 }}>{emailResponses.length}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Correos</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <ClockCircleOutlined style={{ color: '#722ED1', fontSize: 20 }} />
            <div style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 16 }}>{validResponses.length}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Total</Text>
          </div>
        </Flex>
      </Card>

      {/* Timeline */}
      {timelineItems.length === 1 && validResponses.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin actividad registrada"
          style={{ marginTop: 32 }}
        />
      ) : (
        <Timeline
          items={timelineItems}
          mode="left"
          style={{ paddingTop: 8 }}
        />
      )}
    </Drawer>
  );
};

export default React.memo(TicketActivityDrawer);
