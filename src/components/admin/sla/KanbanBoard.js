import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Row, Col, Spin, Flex, message } from 'antd';
import dayjs from 'dayjs';
import KanbanColumn from './KanbanColumn';
import TicketDetailDrawer from './TicketDetailDrawer';
import TicketActivityDrawer from './TicketActivityDrawer';
import WarningsModal from './WarningsModal';
import SlaFiltersBar from './SlaFiltersBar';

const COLUMN_CONFIG = [
  { key: 'nuevos', title: 'Nuevos', color: '#0EA5E9', dropTarget: 'nuevo', icon: 'file-add' },
  { key: 'revision', title: 'En Revisión', color: '#F59E0B', dropTarget: 'revision', icon: 'eye' },
  { key: 'desarrollo', title: 'En Desarrollo', color: '#8B5CF6', dropTarget: 'desarrollo', icon: 'tool' },
  { key: 'resueltos', title: 'Resueltos', color: '#10B981', dropTarget: 'resuelto', icon: 'check-circle' },
];

/**
 * KanbanBoard — Tablero Kanban con filtros avanzados y drag-and-drop
 */
const KanbanBoard = ({ columns, loading, onRefresh, onStatusChange, onAddComment, onConvertAlert, onDeleteTicket }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filterProject, setFilterProject] = useState(null);
  const [filterClient, setFilterClient] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterVariable, setFilterVariable] = useState(null);
  const [filterPriority, setFilterPriority] = useState(null);
  const [filterSlaStatus, setFilterSlaStatus] = useState(null);
  const [filterAssignedTo, setFilterAssignedTo] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
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

  const allTickets = useMemo(() => [
    ...columns.nuevos,
    ...columns.revision,
    ...columns.desarrollo,
    ...columns.resueltos,
  ], [columns]);

  const projects = useMemo(() => [...new Set(allTickets.map((t) => t.project).filter(Boolean))], [allTickets]);
  const clients = useMemo(() => [...new Set(allTickets.map((t) => t.client).filter(Boolean))], [allTickets]);
  const assignees = useMemo(() => [...new Set(allTickets.map((t) => t.assigned_to?.username || t.assigned_to).filter(Boolean))], [allTickets]);

  const filterTickets = useCallback((tickets) => {
    return tickets.filter((t) => {
      const matchesProject = !filterProject || t.project === filterProject;
      const matchesClient = !filterClient || t.client === filterClient;
      const matchesStatus = !filterStatus || (
        (filterStatus === 'nuevo' && !t.is_read) ||
        (filterStatus === 'revision' && t.is_read && t.is_wait) ||
        (filterStatus === 'desarrollo' && t.is_read && !t.is_wait && t.is_active) ||
        (filterStatus === 'resuelto' && (!t.is_active || t.is_finish))
      );
      const matchesVariable = !filterVariable || t.type_variable === filterVariable;
      const matchesPriority = !filterPriority || t.priority === filterPriority;
      const matchesAssigned = !filterAssignedTo || (t.assigned_to?.username === filterAssignedTo || t.assigned_to === filterAssignedTo);
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

      // SLA status filter
      let matchesSla = true;
      if (filterSlaStatus) {
        const horas = dayjs().diff(dayjs(t.created), 'hour');
        const breached = !t.is_read && horas > 48;
        const urgent = !t.is_read && horas > 24 && horas <= 48;
        if (filterSlaStatus === 'breached') matchesSla = breached;
        else if (filterSlaStatus === 'urgent') matchesSla = urgent;
        else if (filterSlaStatus === 'normal') matchesSla = !breached && !urgent;
      }

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
      return matchesProject && matchesClient && matchesStatus && matchesVariable && matchesPriority && matchesSla && matchesAssigned && matchesCategory && matchesSearch && matchesDate;
    });
  }, [filterProject, filterClient, filterStatus, filterVariable, filterPriority, filterSlaStatus, filterAssignedTo, searchText, dateRange]);

  const totalResults = useMemo(() => {
    return COLUMN_CONFIG.reduce((sum, col) => sum + filterTickets(columns[col.key]).length, 0);
  }, [columns, filterTickets]);

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
    if (ticket.is_finish && targetColumn === 'nuevo') {
      message.warning('Un ticket resuelto no puede volver a "Nuevos".');
      return;
    }
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
      <SlaFiltersBar
        searchText={searchText}
        onSearchChange={setSearchText}
        filterProject={filterProject}
        onProjectChange={setFilterProject}
        filterClient={filterClient}
        onClientChange={setFilterClient}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterVariable={filterVariable}
        onVariableChange={setFilterVariable}
        filterPriority={filterPriority}
        onPriorityChange={setFilterPriority}
        filterSlaStatus={filterSlaStatus}
        onSlaStatusChange={setFilterSlaStatus}
        filterAssignedTo={filterAssignedTo}
        onAssignedToChange={setFilterAssignedTo}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        projects={projects}
        clients={clients}
        assignees={assignees}
        loading={loading}
        onRefresh={onRefresh}
        totalResults={totalResults}
      />

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

      <TicketDetailDrawer
        ticket={selectedTicket}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        onStatusChange={onStatusChange}
        onAddComment={onAddComment}
        currentUser="Admin"
      />

      <TicketActivityDrawer
        ticket={selectedTicket}
        visible={activityDrawerVisible}
        onClose={handleCloseActivity}
      />

      <WarningsModal
        visible={warningsVisible}
        onClose={handleCloseWarnings}
        onConvert={onConvertAlert}
      />
    </div>
  );
};

export default KanbanBoard;
