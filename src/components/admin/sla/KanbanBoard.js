import React, { useState, useCallback, useEffect } from 'react';
import { Row, Col, Spin, Flex, Button, Select, Input, message, DatePicker } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import KanbanColumn from './KanbanColumn';
import TicketDetailDrawer from './TicketDetailDrawer';
import TicketActivityDrawer from './TicketActivityDrawer';
import WarningsModal from './WarningsModal';

const { Option } = Select;

/**
 * KanbanBoard — Tablero Kanban completo de 4 columnas con drag-and-drop
 *
 * Restricciones de movimiento:
 * - Ticket resuelto (is_finish) NO puede volver a "nuevo"
 * - Solo puede moverse a "revision" o "desarrollo"
 */
const COLUMN_CONFIG = [
  { key: 'nuevos', title: 'Nuevos', color: '#1890FF', dropTarget: 'nuevo', icon: 'file-add' },
  { key: 'revision', title: 'En Revisión', color: '#FAAD14', dropTarget: 'revision', icon: 'eye' },
  { key: 'desarrollo', title: 'En Desarrollo', color: '#722ED1', dropTarget: 'desarrollo', icon: 'tool' },
  { key: 'resueltos', title: 'Resueltos', color: '#52C41A', dropTarget: 'resuelto', icon: 'check-circle' },
];

const KanbanBoard = ({ columns, loading, onRefresh, onStatusChange, onAddComment, onConvertAlert, onDeleteTicket }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filterProject, setFilterProject] = useState(null);
  const [filterClient, setFilterClient] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [draggingTicket, setDraggingTicket] = useState(null);
  const [activityDrawerVisible, setActivityDrawerVisible] = useState(false);
  const [warningsVisible, setWarningsVisible] = useState(false);

  const handleTicketClick = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setDrawerVisible(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
    setSelectedTicket(null);
  }, []);

  const handleOpenActivity = useCallback(() => {
    setActivityDrawerVisible(true);
  }, []);

  const handleCloseActivity = useCallback(() => {
    setActivityDrawerVisible(false);
  }, []);

  const handleOpenWarnings = useCallback(() => {
    setWarningsVisible(true);
  }, []);

  const handleCloseWarnings = useCallback(() => {
    setWarningsVisible(false);
  }, []);

  // Extraer proyectos y clientes únicos para filtros
  const allTickets = [
    ...columns.nuevos,
    ...columns.revision,
    ...columns.desarrollo,
    ...columns.resueltos,
  ];

  const projects = [...new Set(allTickets.map((t) => t.project).filter(Boolean))];
  const clients = [...new Set(allTickets.map((t) => t.client).filter(Boolean))];

  // Filtrar tickets
  const filterTickets = (tickets) => {
    return tickets.filter((t) => {
      const matchesProject = !filterProject || t.project === filterProject;
      const matchesClient = !filterClient || t.client === filterClient;
      const matchesSearch =
        !searchText ||
        t.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.message?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.point_title?.toLowerCase().includes(searchText.toLowerCase()) ||
        `${t.id}`.includes(searchText);
      const matchesDate = !dateRange || !dateRange[0] || !dateRange[1] || (
        dayjs(t.created).isAfter(dayjs(dateRange[0]).startOf('day')) &&
        dayjs(t.created).isBefore(dayjs(dateRange[1]).endOf('day'))
      );
      return matchesProject && matchesClient && matchesSearch && matchesDate;
    });
  };

  // Handlers globales de drag-and-drop (usados por TicketCard via window)
  useEffect(() => {
    window.__kanbanDragStart = (ticket) => setDraggingTicket(ticket);
    window.__kanbanDragEnd = () => setDraggingTicket(null);
    return () => {
      delete window.__kanbanDragStart;
      delete window.__kanbanDragEnd;
    };
  }, []);

  const handleDropTicket = useCallback(async (ticket, targetColumn) => {
    if (!ticket || !targetColumn) return;

    // Validacion: ticket resuelto no puede volver a nuevo
    if (ticket.is_finish && targetColumn === 'nuevo') {
      message.warning('Un ticket resuelto no puede volver a "Nuevos".');
      return;
    }

    // Si ya esta en esa columna, no hacer nada
    const currentStatus = !ticket.is_read
      ? 'nuevo'
      : ticket.is_wait
      ? 'revision'
      : ticket.is_active && !ticket.is_finish
      ? 'desarrollo'
      : 'resuelto';

    if (currentStatus === targetColumn) return;

    try {
      await onStatusChange(ticket.id, targetColumn);
      message.success(`Ticket movido a "${COLUMN_CONFIG.find(c => c.dropTarget === targetColumn)?.title || targetColumn}"`);
    } catch (err) {
      message.error('Error al mover el ticket');
    }
  }, [onStatusChange]);

  return (
    <div>
      {/* Filtros */}
      <Flex
        gap={12}
        wrap="wrap"
        style={{ marginBottom: 16, padding: '0 4px' }}
        align="center"
      >
        <Input
          placeholder="Buscar tickets..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 240 }}
          allowClear
        />
        <Select
          placeholder="Filtrar por proyecto"
          value={filterProject}
          onChange={setFilterProject}
          allowClear
          style={{ width: 180 }}
        >
          {projects.map((p) => (
            <Option key={p} value={p}>{p}</Option>
          ))}
        </Select>
        <Select
          placeholder="Filtrar por cliente"
          value={filterClient}
          onChange={setFilterClient}
          allowClear
          style={{ width: 180 }}
        >
          {clients.map((c) => (
            <Option key={c} value={c}>{c}</Option>
          ))}
        </Select>
        <DatePicker.RangePicker
          value={dateRange}
          onChange={setDateRange}
          format="DD/MM/YYYY"
          placeholder={['Desde', 'Hasta']}
          style={{ width: 240 }}
          allowClear
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
        >
          Refrescar
        </Button>
      </Flex>

      {/* Kanban Grid */}
      {loading && allTickets.length === 0 ? (
        <Flex justify="center" align="center" style={{ minHeight: 400 }}>
          <Spin size="large" tip="Cargando tickets..." />
        </Flex>
      ) : (
        <Row gutter={[16, 16]}>
          {COLUMN_CONFIG.map((col) => (
            <Col xs={24} sm={12} md={12} lg={6} key={col.key}>
              <KanbanColumn
                title={col.title}
                tickets={filterTickets(columns[col.key])}
                color={col.color}
                dropTarget={col.dropTarget}
                icon={col.icon}
                onTicketClick={handleTicketClick}
                onDropTicket={handleDropTicket}
                onOpenWarnings={col.dropTarget === 'nuevo' ? handleOpenWarnings : undefined}
                onDeleteTicket={onDeleteTicket}
                draggingTicket={draggingTicket}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Drawer de detalle */}
      <TicketDetailDrawer
        ticket={selectedTicket}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        onStatusChange={onStatusChange}
        onAddComment={onAddComment}
        onOpenActivity={handleOpenActivity}
      />

      {/* Drawer de actividad (aparte) */}
      <TicketActivityDrawer
        ticket={selectedTicket}
        visible={activityDrawerVisible}
        onClose={handleCloseActivity}
      />

      {/* Modal de warnings */}
      <WarningsModal
        visible={warningsVisible}
        onClose={handleCloseWarnings}
        onConvert={onConvertAlert}
      />
    </div>
  );
};

export default KanbanBoard;
