import React, { useRef, useState } from "react";
import { Flex, Typography, Empty } from "antd";
import TicketCard from "./TicketCard";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import { useResponsive } from "../../../../hooks/useResponsive";

const { Text } = Typography;

/**
 * Columna del tablero Kanban con soporte nativo de arrastrar y soltar.
 */
const KanbanColumn = ({ column, tickets, onTicketClick, onDropTicket }) => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const ticketId = e.dataTransfer.getData("text/plain");
    if (ticketId && column.dropStatus) {
      onDropTicket?.(ticketId, column.dropStatus);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: isDragOver ? token.voidSurface : token.glassBg,
        border: isDragOver
          ? `2px solid ${token.colorAccent}`
          : `1px dashed ${token.glassBorder}`,
        borderRadius: token.voidRadius,
        padding: isMobile ? 10 : 12,
        minHeight: isMobile ? 280 : 420,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "background 150ms ease, border 150ms ease",
        backdropFilter: "blur(10px)",
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Text strong style={{ color: token.voidTextHeading }}>
          {column.label}
        </Text>
        <Text style={{ fontSize: 12, color: token.voidTextMuted }}>
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
