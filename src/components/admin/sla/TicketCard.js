import React, { memo, useState } from 'react';
import { Card, Badge, Tag, Typography, Flex, Tooltip, Popconfirm } from 'antd';
import {
  ClockCircleOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  HolderOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

/**
 * TicketCard — Tarjeta de ticket para el Kanban con soporte drag-and-drop
 */
const TicketCard = memo(({ ticket, onClick, isDragging, onDelete, showDelete }) => {
  const {
    id,
    title,
    message,
    point_title,
    project,
    client,
    type_variable,
    created,
    is_read,
    is_finish,
    responses,
  } = ticket;

  const [localDragging, setLocalDragging] = useState(false);

  const visualId = `#${id}`;
  const timeAgo = dayjs(created).fromNow();

  const priorityColors = {
    'CAUDAL': 'red',
    'CAUDAL PROMEDIO': 'orange',
    'NIVEL': 'blue',
    'TOTALIZADO': 'purple',
    'TODOS': 'default',
  };
  const priority = priorityColors[type_variable] || 'default';

  const horasSinRespuesta = dayjs().diff(dayjs(created), 'hour');
  const slaBreached = !is_read && horasSinRespuesta > 48;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(ticket));
    e.dataTransfer.effectAllowed = 'move';
    setLocalDragging(true);
    if (window.__kanbanDragStart) {
      window.__kanbanDragStart(ticket);
    }
  };

  const handleDragEnd = () => {
    setLocalDragging(false);
    if (window.__kanbanDragEnd) {
      window.__kanbanDragEnd();
    }
  };

  const opacity = isDragging || localDragging ? 0.4 : 1;

  return (
    <Card
      size="small"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        marginBottom: 8,
        borderRadius: 8,
        cursor: 'grab',
        borderLeft: `3px solid ${slaBreached ? '#FF4D4F' : is_finish ? '#52C41A' : '#1890FF'}`,
        transition: 'all 0.2s',
        opacity,
      }}
      bodyStyle={{ padding: 12 }}
      hoverable
      onClick={(e) => {
        // Evitar que el click en delete abra el drawer
        if (e.target.closest('.delete-btn')) return;
        onClick && onClick(ticket);
      }}
    >
      <Flex vertical gap={4}>
        {/* Header: ID + Tiempo + Drag handle + Delete */}
        <Flex justify="space-between" align="center">
          <Badge
            count={visualId}
            style={{
              backgroundColor: slaBreached ? '#FF4D4F' : '#1F3461',
              fontSize: 10,
              fontWeight: 600,
            }}
          />
          <Flex align="center" gap={8}>
            <Tooltip title={dayjs(created).format('DD/MM/YYYY HH:mm')}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {timeAgo}
              </Text>
            </Tooltip>
            <HolderOutlined style={{ color: '#bfbfbf', cursor: 'grab', fontSize: 12 }} />
            {showDelete && onDelete && (
              <Popconfirm
                title="¿Eliminar ticket?"
                description="Esta acción no se puede deshacer."
                onConfirm={(e) => {
                  e?.stopPropagation();
                  onDelete(ticket.id);
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText="Eliminar"
                okType="danger"
                cancelText="Cancelar"
              >
                <DeleteOutlined
                  className="delete-btn"
                  style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 12 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            )}
          </Flex>
        </Flex>

        {/* Título */}
        <Text strong style={{ fontSize: 13, lineHeight: 1.3, marginTop: 4 }} ellipsis>
          {title}
        </Text>

        {/* Mensaje preview */}
        <Text type="secondary" style={{ fontSize: 11 }} ellipsis={{ rows: 2 }}>
          {message}
        </Text>

        {/* Tags */}
        <Flex gap={4} wrap="wrap" style={{ marginTop: 4 }}>
          <Tag size="small" color={priority} style={{ fontSize: 10, margin: 0 }}>
            {type_variable || 'Soporte'}
          </Tag>
          {slaBreached && (
            <Tag size="small" color="error" style={{ fontSize: 10, margin: 0 }}>
              SLA &gt;48h
            </Tag>
          )}
        </Flex>

        {/* Footer: Punto + Comentarios */}
        <Flex justify="space-between" align="center" style={{ marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: 10 }}>
            <EnvironmentOutlined style={{ marginRight: 2 }} />
            {point_title || '—'}
          </Text>
          {responses && responses.length > 0 && (
            <Text type="secondary" style={{ fontSize: 10 }}>
              <MessageOutlined style={{ marginRight: 2 }} />
              {responses.length}
            </Text>
          )}
        </Flex>

        {/* Cliente/Proyecto */}
        {(client || project) && (
          <Text type="secondary" style={{ fontSize: 10 }}>
            {client}{project ? ` · ${project}` : ''}
          </Text>
        )}
      </Flex>
    </Card>
  );
});

TicketCard.displayName = 'TicketCard';

export default TicketCard;
