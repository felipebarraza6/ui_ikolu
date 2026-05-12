import React, { memo, useState } from 'react';
import { Card, Badge, Tag, Typography, Flex, Tooltip, Popconfirm, Avatar } from 'antd';
import {
  ClockCircleOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  HolderOutlined,
  DeleteOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

const PRIORITY_COLORS = {
  'CAUDAL': { color: '#EF4444', bg: '#FEF2F2', label: 'Caudal' },
  'CAUDAL PROMEDIO': { color: '#F97316', bg: '#FFF7ED', label: 'Caudal Medio' },
  'NIVEL': { color: '#3B82F6', bg: '#EFF6FF', label: 'Nivel' },
  'TOTALIZADO': { color: '#8B5CF6', bg: '#F5F3FF', label: 'Totalizado' },
  'TODOS': { color: '#64748B', bg: '#F1F5F9', label: 'General' },
};

const PRIORITY_MAP = {
  critical: { color: '#7C2D12', bg: '#FFF7ED', label: 'Crítica', icon: <ExclamationCircleOutlined /> },
  high: { color: '#EF4444', bg: '#FEF2F2', label: 'Alta', icon: <ThunderboltOutlined /> },
  medium: { color: '#F59E0B', bg: '#FFFBEB', label: 'Media', icon: <FlagOutlined /> },
  low: { color: '#10B981', bg: '#ECFDF5', label: 'Baja', icon: <FlagOutlined /> },
};

/**
 * TicketCard — Tarjeta moderna con prioridad, asignado y SLA visual
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
    response_count,
    priority,
    assigned_to,
    category,
    source,
  } = ticket;

  const [localDragging, setLocalDragging] = useState(false);

  const visualId = `#${id}`;
  const timeAgo = dayjs(created).fromNow();

  const priorityCfg = PRIORITY_MAP[priority] || null;
  const variableCfg = PRIORITY_COLORS[type_variable] || PRIORITY_COLORS['TODOS'];

  const horasSinRespuesta = dayjs().diff(dayjs(created), 'hour');
  const slaBreached = !is_read && horasSinRespuesta > 48;
  const slaUrgente = !is_read && horasSinRespuesta > 24 && horasSinRespuesta <= 48;

  const slaProgress = Math.min((horasSinRespuesta / 48) * 100, 100);
  const slaBarColor = slaBreached ? '#EF4444' : slaUrgente ? '#F59E0B' : '#3B82F6';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(ticket));
    e.dataTransfer.effectAllowed = 'move';
    setLocalDragging(true);
    if (window.__kanbanDragStart) window.__kanbanDragStart(ticket);
  };

  const handleDragEnd = () => {
    setLocalDragging(false);
    if (window.__kanbanDragEnd) window.__kanbanDragEnd();
  };

  const opacity = isDragging || localDragging ? 0.35 : 1;
  const scale = isDragging || localDragging ? 0.98 : 1;

  const borderLeftColor = slaBreached
    ? '#EF4444'
    : is_finish
    ? '#10B981'
    : slaUrgente
    ? '#F59E0B'
    : '#3B82F6';

  return (
    <Card
      size="small"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        marginBottom: 2,
        borderRadius: 10,
        cursor: 'grab',
        borderLeft: `4px solid ${borderLeftColor}`,
        borderTop: '1px solid #F1F5F9',
        borderRight: '1px solid #F1F5F9',
        borderBottom: '1px solid #F1F5F9',
        transition: 'all 0.2s ease',
        opacity,
        transform: `scale(${scale})`,
        boxShadow: isDragging || localDragging ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
      }}
      bodyStyle={{ padding: 12 }}
      hoverable
      onClick={(e) => {
        if (e.target.closest('.delete-btn')) return;
        onClick && onClick(ticket);
      }}
    >
      <Flex vertical gap={6}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <Badge
              count={visualId}
              style={{
                backgroundColor: slaBreached ? '#EF4444' : '#0F172A',
                fontSize: 10,
                fontWeight: 600,
                padding: '0 6px',
              }}
            />
            {(slaBreached || slaUrgente) && (
              <Tooltip title={slaBreached ? 'SLA excedido (>48h)' : 'SLA urgente (>24h)'}>
                <FireOutlined style={{ color: slaBreached ? '#EF4444' : '#F59E0B', fontSize: 12 }} />
              </Tooltip>
            )}
            {priorityCfg && (
              <Tag
                size="small"
                style={{
                  fontSize: 10,
                  margin: 0,
                  color: priorityCfg.color,
                  background: priorityCfg.bg,
                  borderColor: `${priorityCfg.color}30`,
                  borderRadius: 4,
                  fontWeight: 500,
                  padding: '0 6px',
                }}
              >
                {priorityCfg.icon}
                <span style={{ marginLeft: 3 }}>{priorityCfg.label}</span>
              </Tag>
            )}
          </Flex>
          <Flex align="center" gap={8}>
            <Tooltip title={dayjs(created).format('DD/MM/YYYY HH:mm')}>
              <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>
                <ClockCircleOutlined style={{ marginRight: 3, fontSize: 10 }} />
                {timeAgo}
              </Text>
            </Tooltip>
            <HolderOutlined style={{ color: '#CBD5E1', cursor: 'grab', fontSize: 12 }} />
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
                  style={{ color: '#EF4444', cursor: 'pointer', fontSize: 12 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            )}
          </Flex>
        </Flex>

        {/* Título */}
        <Text strong style={{ fontSize: 13, lineHeight: 1.35, color: '#0F172A', display: 'block' }} ellipsis={{ tooltip: true }}>
          {title}
        </Text>

        {/* Mensaje preview */}
        <Text type="secondary" style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }} ellipsis={{ rows: 2, tooltip: true }}>
          {message}
        </Text>

        {/* SLA progress bar (solo activos) */}
        {!is_finish && !is_read && (
          <div style={{ marginTop: 2 }}>
            <Flex justify="space-between" style={{ marginBottom: 2 }}>
              <Text style={{ fontSize: 9, color: '#94A3B8' }}>SLA</Text>
              <Text style={{ fontSize: 9, color: slaBarColor, fontWeight: 500 }}>
                {horasSinRespuesta}h / 48h
              </Text>
            </Flex>
            <div style={{ height: 3, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${slaProgress}%`, height: '100%', background: slaBarColor, borderRadius: 2, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* Tags */}
        <Flex gap={6} wrap="wrap" style={{ marginTop: 2 }}>
          <Tag
            size="small"
            style={{
              fontSize: 10, margin: 0,
              color: variableCfg.color, background: variableCfg.bg,
              borderColor: `${variableCfg.color}30`, borderRadius: 4, fontWeight: 500,
            }}
          >
            {variableCfg.label}
          </Tag>
          {category && (
            <Tag
              size="small"
              style={{
                fontSize: 10, margin: 0,
                color: category === 'back' ? '#3B82F6' : '#F59E0B',
                background: category === 'back' ? '#EFF6FF' : '#FFFBEB',
                borderColor: category === 'back' ? '#BFDBFE' : '#FDE68A',
                borderRadius: 4, fontWeight: 500,
              }}
            >
              {category === 'back' ? 'Software' : 'Hardware'}
            </Tag>
          )}
          {source === 'client' && (
            <Tag
              size="small"
              style={{
                fontSize: 10, margin: 0,
                color: '#0F172A',
                background: '#F1F5F9',
                borderColor: '#E2E8F0',
                borderRadius: 4, fontWeight: 500,
              }}
            >
              Cliente
            </Tag>
          )}
          {slaBreached && (
            <Tag size="small" style={{ fontSize: 10, margin: 0, color: '#EF4444', background: '#FEF2F2', borderColor: '#FECACA', borderRadius: 4, fontWeight: 500 }}>
              SLA &gt;48h
            </Tag>
          )}
          {slaUrgente && !slaBreached && (
            <Tag size="small" style={{ fontSize: 10, margin: 0, color: '#D97706', background: '#FFFBEB', borderColor: '#FDE68A', borderRadius: 4, fontWeight: 500 }}>
              SLA urgente
            </Tag>
          )}
        </Flex>

        {/* Footer: Punto + Asignado + Comentarios */}
        <Flex justify="space-between" align="center" style={{ marginTop: 2 }}>
          <Flex align="center" gap={8}>
            <Text type="secondary" style={{ fontSize: 10, color: '#94A3B8' }}>
              <EnvironmentOutlined style={{ marginRight: 2, fontSize: 10 }} />
              {point_title || '—'}
            </Text>
            {assigned_to && (
              <Tooltip title={`Asignado a: ${assigned_to.username || assigned_to}`}>
                <Avatar size={16} style={{ background: '#3B82F6', fontSize: 9, width: 16, height: 16, lineHeight: '16px' }}>
                  {(assigned_to.username || assigned_to)?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </Tooltip>
            )}
          </Flex>
          {(response_count || (responses && responses.length > 0)) && (
            <Flex align="center" gap={4}>
              <MessageOutlined style={{ fontSize: 10, color: '#3B82F6' }} />
              <Text style={{ fontSize: 10, color: '#3B82F6', fontWeight: 500 }}>
                {response_count || responses.length}
              </Text>
            </Flex>
          )}
        </Flex>

        {/* Cliente/Proyecto */}
        {(client || project) && (
          <Text type="secondary" style={{ fontSize: 10, color: '#CBD5E1' }}>
            {client}{project ? ` · ${project}` : ''}
          </Text>
        )}
      </Flex>
    </Card>
  );
});

TicketCard.displayName = 'TicketCard';

export default TicketCard;
