import React, { useState } from 'react';
import { Divider } from 'antd';
import SlaMetrics from './SlaMetrics';
import KanbanBoard from './KanbanBoard';
import SlaDashboardHeader from './SlaDashboardHeader';
import TicketCreateDrawer from './TicketCreateDrawer';
import SlaChatbot from './SlaChatbot';
import { useSlaTickets } from './useSlaTickets';

/**
 * SlaDashboard — Tablero completo de gestión SLA con diseño moderno
 */
const SlaDashboard = () => {
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);

  const {
    tickets,
    columns,
    metrics,
    loading,
    lastRefresh,
    refresh,
    updateTicketStatus,
    addComment,
    convertAlertToTicket,
    deleteTicket,
  } = useSlaTickets({
    autoRefresh: false,
  });

  const handleTicketCreated = () => {
    refresh();
  };

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Header moderno */}
      <SlaDashboardHeader
        metrics={metrics}
        loading={loading}
        onRefresh={refresh}
        lastRefresh={lastRefresh}
        onCreateTicket={() => setCreateDrawerVisible(true)}
      />

      {/* Métricas */}
      <SlaMetrics metrics={metrics} tickets={tickets} />

      <Divider style={{ margin: '16px 0 20px', borderColor: '#E2E8F0' }} />

      {/* Kanban */}
      <KanbanBoard
        columns={columns}
        loading={loading}
        onRefresh={refresh}
        onStatusChange={updateTicketStatus}
        onAddComment={addComment}
        onConvertAlert={convertAlertToTicket}
        onDeleteTicket={deleteTicket}
      />

      {/* Drawer para crear ticket */}
      <TicketCreateDrawer
        visible={createDrawerVisible}
        onClose={() => setCreateDrawerVisible(false)}
        onSuccess={handleTicketCreated}
      />

      {/* Agente de chat SLA */}
      <SlaChatbot tickets={tickets} metrics={metrics} />
    </div>
  );
};

export default SlaDashboard;
