import React from 'react';
import { Card, Typography, Divider } from 'antd';
import SlaMetrics from './SlaMetrics';
import KanbanBoard from './KanbanBoard';
import { useSlaTickets } from './useSlaTickets';

const { Title } = Typography;

/**
 * SlaDashboard — Tablero completo de gestión SLA con Kanban
 *
 * Visible solo para usuarios staff en el panel de admin.
 */
const SlaDashboard = () => {
  const {
    columns,
    metrics,
    loading,
    refresh,
    updateTicketStatus,
    addComment,
    convertAlertToTicket,
    deleteTicket,
  } = useSlaTickets({
    autoRefresh: false, // Manual refresh para no saturar
  });

  return (
    <Card
      style={{
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
      bodyStyle={{ padding: 24 }}
    >
      <Title level={4} style={{ marginBottom: 4 }}>
        Gestión SLA de Tickets de Soporte
      </Title>
      <Divider style={{ margin: '12px 0 16px' }} />

      {/* Métricas */}
      <SlaMetrics metrics={metrics} />

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
    </Card>
  );
};

export default SlaDashboard;
