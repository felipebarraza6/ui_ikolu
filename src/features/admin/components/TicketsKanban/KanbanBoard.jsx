import React, { useMemo, useCallback, useState } from "react";
import { Row, Col, Spin, Select, Flex, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import KanbanColumn from "./KanbanColumn";
import { useResponsive } from "../../../../hooks/useResponsive";
import {
  getTicketColumn,
  KANBAN_COLUMNS,
  getColumnDropStatus,
} from "../../constants/tickets";

const { Text } = Typography;

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
    <div style={{ height: "100%", position: "relative" }}>
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.25)", borderRadius: 8,
        }}>
          <Spin indicator={<LoadingOutlined spin />} size="large">
            <Text style={{ color: "#fff" }}>Cargando tickets...</Text>
          </Spin>
        </div>
      )}
      <Row
        gutter={[16, 16]}
        style={{
          height: "100%",
          flexWrap: "nowrap",
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {KANBAN_COLUMNS.map((column) => (
          <Col
            key={column.key}
            flex="1 1 0"
            style={{ minWidth: 260, height: "100%" }}
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
    </div>
  );
};

export default KanbanBoard;
