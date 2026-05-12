import React, { memo, useState, useCallback, useMemo } from 'react';
import { Card, Badge, Flex, Typography, Empty, Button, Pagination, Tooltip, Segmented } from 'antd';
import {
  FileAddOutlined,
  EyeOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import TicketCard from './TicketCard';

const { Text } = Typography;

const ICON_MAP = {
  'file-add': <FileAddOutlined />,
  'eye': <EyeOutlined />,
  'tool': <ToolOutlined />,
  'check-circle': <CheckCircleOutlined />,
};

const PAGE_SIZE = 8;

const COLUMN_STYLES = {
  nuevo: {
    bg: '#F0F9FF',
    border: '#0EA5E9',
    headerBg: '#0EA5E9',
    headerGradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
  },
  revision: {
    bg: '#FFFBEB',
    border: '#F59E0B',
    headerBg: '#F59E0B',
    headerGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  },
  desarrollo: {
    bg: '#F5F3FF',
    border: '#8B5CF6',
    headerBg: '#8B5CF6',
    headerGradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
  },
  resuelto: {
    bg: '#ECFDF5',
    border: '#10B981',
    headerBg: '#10B981',
    headerGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  },
};

/**
 * KanbanColumn — Columna individual del tablero Kanban con diseño moderno
 */
const KanbanColumn = memo(({
  title,
  tickets,
  color,
  icon,
  onTicketClick,
  onDropTicket,
  onOpenWarnings,
  onDeleteTicket,
  dropTarget,
  draggingTicket,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [page, setPage] = useState(1);
  const [devCategory, setDevCategory] = useState('all');

  const style = COLUMN_STYLES[dropTarget] || COLUMN_STYLES.nuevo;
  const columnIcon = ICON_MAP[icon] || null;

  const filteredTickets = useMemo(() => {
    if (dropTarget !== 'desarrollo' || devCategory === 'all') return tickets;
    return tickets.filter((t) => t.category === devCategory);
  }, [tickets, dropTarget, devCategory]);

  const paginatedTickets = filteredTickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const canDrop = useCallback((ticket) => {
    if (!ticket) return false;
    if (ticket.is_finish && dropTarget === 'nuevo') return false;
    return true;
  }, [dropTarget]);

  const isDropAllowed = draggingTicket ? canDrop(draggingTicket) : false;

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = isDropAllowed ? 'move' : 'none';
    setIsDragOver(true);
  }, [isDropAllowed]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = e.dataTransfer.getData('application/json');
      const ticket = JSON.parse(data);
      if (!canDrop(ticket)) {
        if (ticket.is_finish && dropTarget === 'nuevo') {
          // Mensaje ya manejado en KanbanBoard
        }
        return;
      }
      if (onDropTicket) onDropTicket(ticket, dropTarget);
    } catch (err) {
      console.error('Error processing drop:', err);
    }
  }, [canDrop, dropTarget, onDropTicket]);

  const dragBorderColor = isDragOver
    ? (isDropAllowed ? style.border : '#EF4444')
    : `${style.border}40`;

  const dragBgColor = isDragOver
    ? (isDropAllowed ? style.bg : '#FEF2F2')
    : style.bg;

  const dragBoxShadow = isDragOver && isDropAllowed
    ? `0 0 0 3px ${style.border}40`
    : '0 1px 3px rgba(0,0,0,0.04)';

  // Calcular métrica rápida de la columna
  const slaBreachedCount = tickets.filter(t => {
    const horas = dayjs().diff(dayjs(t.created), 'hour');
    return !t.is_read && horas > 48;
  }).length;

  return (
    <Card
      size="small"
      style={{
        borderRadius: 14,
        background: dragBgColor,
        border: `2px dashed ${dragBorderColor}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s ease',
        boxShadow: dragBoxShadow,
      }}
      bodyStyle={{
        padding: 12,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      title={
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={10}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: style.headerGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                boxShadow: `0 2px 6px ${style.headerBg}40`,
              }}
            >
              {columnIcon}
            </div>
            <div>
              <Text strong style={{ fontSize: 13, color: '#0F172A' }}>{title}</Text>
              <div style={{ marginTop: 1 }}>
                <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                  {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                </Text>
              </div>
            </div>
          </Flex>
          <Flex align="center" gap={8}>
            {slaBreachedCount > 0 && (
              <Tooltip title={`${slaBreachedCount} ticket(s) excedieron SLA`}>
                <Badge
                  count={slaBreachedCount}
                  style={{ backgroundColor: '#EF4444', fontSize: 10, fontWeight: 600 }}
                />
              </Tooltip>
            )}
            <Badge
              count={tickets.length}
              style={{
                backgroundColor: style.headerBg,
                fontSize: 11,
                fontWeight: 600,
                boxShadow: `0 2px 4px ${style.headerBg}30`,
              }}
            />
            {isDragOver && !isDropAllowed && (
              <Text type="danger" style={{ fontSize: 11, fontWeight: 500 }}>
                No permitido
              </Text>
            )}
          </Flex>
        </Flex>
      }
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 380px)',
          paddingRight: 4,
          minHeight: 80,
        }}
      >
        {dropTarget === 'nuevo' && onOpenWarnings && (
          <Button
            type="dashed"
            size="small"
            icon={<WarningOutlined />}
            onClick={onOpenWarnings}
            style={{
              width: '100%',
              marginBottom: 12,
              color: '#D97706',
              borderColor: '#FCD34D',
              borderRadius: 8,
              background: '#FFFBEB',
              fontWeight: 500,
            }}
          >
            Ver warnings generados
          </Button>
        )}

        {dropTarget === 'desarrollo' && (
          <Segmented
            value={devCategory}
            onChange={setDevCategory}
            options={[
              { label: <span style={{ fontSize: 11 }}>Todos</span>, value: 'all' },
              { label: <span style={{ fontSize: 11 }}><DesktopOutlined style={{ marginRight: 2, fontSize: 10 }} />Software</span>, value: 'back' },
              { label: <span style={{ fontSize: 11 }}><ToolOutlined style={{ marginRight: 2, fontSize: 10 }} />Hardware</span>, value: 'hard' },
            ]}
            style={{ width: '100%', marginBottom: 10, borderRadius: 6 }}
            size="small"
          />
        )}

        {isDragOver && isDropAllowed && filteredTickets.length === 0 && (
          <Flex
            justify="center"
            align="center"
            style={{
              minHeight: 80,
              border: `2px dashed ${style.border}50`,
              borderRadius: 10,
              background: `${style.border}10`,
            }}
          >
            <Flex vertical align="center" gap={4}>
              <PlusOutlined style={{ color: style.border, fontSize: 18 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Suelta aquí
              </Text>
            </Flex>
          </Flex>
        )}

        {filteredTickets.length === 0 && !isDragOver ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                No hay tickets
              </Text>
            }
            style={{ marginTop: 32 }}
          />
        ) : (
          <Flex vertical gap={8}>
            {paginatedTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={onTicketClick}
                isDragging={draggingTicket?.id === ticket.id}
                onDelete={onDeleteTicket}
                showDelete={dropTarget === 'nuevo'}
              />
            ))}
          </Flex>
        )}

        {/* Paginación */}
        {filteredTickets.length > PAGE_SIZE && (
          <Flex justify="center" style={{ marginTop: 12 }}>
            <Pagination
              current={page}
              total={filteredTickets.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
              size="small"
              showSizeChanger={false}
              showTotal={(t) => `${t} total`}
            />
          </Flex>
        )}
      </div>
    </Card>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;
