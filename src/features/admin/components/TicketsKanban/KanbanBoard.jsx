import React, { useMemo, useCallback } from "react";
import { Row, Col, Spin } from "antd";
import KanbanColumn from "./KanbanColumn";
import {
  getTicketColumn,
  KANBAN_COLUMNS,
  getColumnDropStatus,
} from "../../constants/tickets";

/**
 * Tablero Kanban de tickets con 5 columnas y drag-and-drop nativo.
 */
const KanbanBoard = ({ tickets, onTicketClick, onStatusChange, loading }) => {
  const columnsTickets = useMemo(() => {
    const map = Object.fromEntries(KANBAN_COLUMNS.map((column) => [column.key, []]));
    for (const ticket of tickets) {
      const col = getTicketColumn(ticket.status);
      if (map[col]) map[col].push(ticket);
    }
    return map;
  }, [tickets]);

  const handleDropTicket = useCallback(
    (ticketId, dropStatus) => {
      const ticket = tickets.find((t) => String(t.id) === String(ticketId));
      const column = KANBAN_COLUMNS.find((c) => c.dropStatus === dropStatus);
      const status = column
        ? getColumnDropStatus(column.key, ticket?.status)
        : dropStatus;
      onStatusChange?.(ticketId, status);
    },
    [tickets, onStatusChange]
  );

  return (
    <Spin spinning={loading} tip="Cargando tickets...">
      <Row
        gutter={[16, 16]}
        style={{
          minHeight: 420,
          flexWrap: "nowrap",
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {KANBAN_COLUMNS.map((column) => (
          <Col
            key={column.key}
            flex="0 0 280px"
            style={{ maxWidth: 280 }}
          >
            <KanbanColumn
              column={column}
              tickets={columnsTickets[column.key] || []}
              onTicketClick={onTicketClick}
              onDropTicket={handleDropTicket}
            />
          </Col>
        ))}
      </Row>
    </Spin>
  );
};

export default KanbanBoard;
