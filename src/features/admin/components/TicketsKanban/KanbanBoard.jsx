import React, { useMemo, useCallback, useState } from "react";
import { Row, Col, Spin, Select, Flex } from "antd";
import KanbanColumn from "./KanbanColumn";
import { useResponsive } from "../../../../hooks/useResponsive";
import {
  getTicketColumn,
  KANBAN_COLUMNS,
  getColumnDropStatus,
} from "../../constants/tickets";

/**
 * Tablero Kanban de tickets con 5 columnas y drag-and-drop nativo.
 *
 * En mobile muestra una sola columna seleccionable para evitar scroll horizontal.
 */
const KanbanBoard = ({ tickets, onTicketClick, onStatusChange, loading }) => {
  const { isMobile } = useResponsive();
  const [activeColumn, setActiveColumn] = useState(KANBAN_COLUMNS[0]?.key);

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

  const columnOptions = useMemo(
    () =>
      KANBAN_COLUMNS.map((column) => ({
        value: column.key,
        label: `${column.label} (${columnsTickets[column.key]?.length || 0})`,
      })),
    [columnsTickets]
  );

  if (isMobile) {
    const active = KANBAN_COLUMNS.find((c) => c.key === activeColumn) || KANBAN_COLUMNS[0];
    return (
      <Spin spinning={loading} tip="Cargando tickets...">
        <Flex vertical gap={12}>
          <Select
            value={activeColumn}
            onChange={setActiveColumn}
            options={columnOptions}
            style={{ width: "100%" }}
          />
          <KanbanColumn
            column={active}
            tickets={columnsTickets[active.key] || []}
            onTicketClick={onTicketClick}
            onDropTicket={handleDropTicket}
          />
        </Flex>
      </Spin>
    );
  }

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
