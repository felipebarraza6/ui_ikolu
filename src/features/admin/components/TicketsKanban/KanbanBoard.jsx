import React, { useMemo } from "react";
import { Row, Col, Spin } from "antd";
import KanbanColumn from "./KanbanColumn";

const COLUMNS = [
  { key: "new", label: "Nuevo", status: "open" },
  { key: "review", label: "En Revisión", status: "in_review" },
  { key: "progress", label: "En Desarrollo", status: "in_progress" },
  { key: "resolved", label: "Resuelto", status: "resolved" },
];

/**
 * Determina a qué columna Kanban pertenece un ticket según su status.
 * Se ajusta dinámicamente a los estados que devuelva el backend.
 */
const resolveTicketColumn = (ticket) => {
  const status = ticket.status?.toLowerCase?.() || "";
  if (["closed", "resolved"].includes(status)) return "resolved";
  if (status === "in_progress") return "progress";
  if (status === "in_review") return "review";
  return "new";
};

/**
 * Tablero Kanban de tickets con 4 columnas y drag-and-drop nativo.
 */
const KanbanBoard = ({ tickets, onTicketClick, onStatusChange, loading }) => {
  const columnsTickets = useMemo(() => {
    const map = { new: [], review: [], progress: [], resolved: [] };
    for (const ticket of tickets) {
      const col = resolveTicketColumn(ticket);
      if (map[col]) map[col].push(ticket);
    }
    return map;
  }, [tickets]);

  return (
    <Spin spinning={loading} tip="Cargando tickets...">
      <Row gutter={[16, 16]} style={{ minHeight: 420 }}>
        {COLUMNS.map((column) => (
          <Col key={column.key} xs={24} sm={12} md={12} lg={6} xl={6}>
            <KanbanColumn
              column={column}
              tickets={columnsTickets[column.key] || []}
              onTicketClick={onTicketClick}
              onDropTicket={onStatusChange}
            />
          </Col>
        ))}
      </Row>
    </Spin>
  );
};

export default KanbanBoard;
