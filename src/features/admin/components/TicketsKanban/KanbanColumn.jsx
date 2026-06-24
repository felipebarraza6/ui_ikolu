import React from "react";
import { Flex, Typography, Empty } from "antd";
import TicketCard from "./TicketCard";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";

const { Text } = Typography;

/**
 * Columna del tablero Kanban con soporte nativo de arrastrar y soltar.
 */
const KanbanColumn = ({ column, tickets, onTicketClick, onDropTicket }) => {
  const token = useIkoluToken();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData("text/plain");
    if (ticketId && column.status) {
      onDropTicket?.(ticketId, column.status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        background: token.glassBg,
        border: `1px dashed ${token.glassBorder}`,
        borderRadius: token.borderRadiusLG,
        padding: 12,
        minHeight: 420,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Text strong style={{ color: token.colorTextHeading }}>
          {column.label}
        </Text>
        <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
          {tickets.length}
        </Text>
      </Flex>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {tickets.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin tickets" />
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onClick={onTicketClick} />
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(KanbanColumn);
