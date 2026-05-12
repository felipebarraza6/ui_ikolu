import React, { memo, useState, useCallback } from 'react';
import { Card, Badge, Flex, Typography, Empty, message, Button, Pagination } from 'antd';
import {
  FileAddOutlined,
  EyeOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import TicketCard from './TicketCard';

const { Text } = Typography;

const ICON_MAP = {
  'file-add': <FileAddOutlined />,
  'eye': <EyeOutlined />,
  'tool': <ToolOutlined />,
  'check-circle': <CheckCircleOutlined />,
};

const PAGE_SIZE = 8;

/**
 * KanbanColumn — Columna individual del tablero Kanban con soporte drag-and-drop y paginacion
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

  const columnStyle = {
    nuevo: { bg: '#E6F7FF', border: '#1890FF', headerBg: '#1890FF' },
    revision: { bg: '#FFF7E6', border: '#FAAD14', headerBg: '#FAAD14' },
    desarrollo: { bg: '#F9F0FF', border: '#722ED1', headerBg: '#722ED1' },
    resuelto: { bg: '#F6FFED', border: '#52C41A', headerBg: '#52C41A' },
  };

  const style = columnStyle[dropTarget] || columnStyle.nuevo;
  const columnIcon = ICON_MAP[icon] || null;

  // Paginacion
  const paginatedTickets = tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Validar si el ticket puede soltarse en esta columna
  const canDrop = useCallback((ticket) => {
    if (!ticket) return false;
    if (ticket.is_finish && dropTarget === 'nuevo') {
      return false;
    }
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
          message.warning('Un ticket resuelto no puede volver a "Nuevos". Solo puede ir a "En Revisión" o "En Desarrollo".');
        }
        return;
      }

      if (onDropTicket) {
        onDropTicket(ticket, dropTarget);
      }
    } catch (err) {
      console.error('Error processing drop:', err);
    }
  }, [canDrop, dropTarget, onDropTicket]);

  const dragBorderColor = isDragOver
    ? (isDropAllowed ? style.border : '#FF4D4F')
    : `${style.border}33`;

  const dragBgColor = isDragOver
    ? (isDropAllowed ? style.bg : '#FFF1F0')
    : style.bg;

  const dragBoxShadow = isDragOver && isDropAllowed
    ? `0 0 0 2px ${style.border}66`
    : 'none';

  return (
    <Card
      size="small"
      style={{
        borderRadius: 12,
        background: dragBgColor,
        border: `2px dashed ${dragBorderColor}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
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
          <Flex align="center" gap={8}>
            {columnIcon && (
              <span style={{ color: style.headerBg, fontSize: 14 }}>
                {columnIcon}
              </span>
            )}
            <Text strong style={{ fontSize: 13 }}>{title}</Text>
            <Badge
              count={tickets.length}
              style={{
                backgroundColor: style.headerBg,
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </Flex>
          {isDragOver && !isDropAllowed && (
            <Text type="danger" style={{ fontSize: 11 }}>
              No permitido
            </Text>
          )}
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
              color: '#FAAD14',
              borderColor: '#FAAD14',
            }}
          >
            Ver warnings generados
          </Button>
        )}
        {isDragOver && isDropAllowed && tickets.length === 0 && (
          <Flex
            justify="center"
            align="center"
            style={{
              minHeight: 80,
              border: `2px dashed ${style.border}66`,
              borderRadius: 8,
              background: `${style.border}11`,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Suelta aquí
            </Text>
          </Flex>
        )}
        {tickets.length === 0 && !isDragOver ? (
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

        {/* Paginacion de columna */}
        {tickets.length > PAGE_SIZE && (
          <Flex justify="center" style={{ marginTop: 12 }}>
            <Pagination
              current={page}
              total={tickets.length}
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
