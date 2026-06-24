import React from "react";
import { Flex, Typography, Avatar, Tooltip } from "antd";
import { UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { format, parseISO, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { SmartCard, SmartBadge } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";

const { Text } = Typography;

const priorityConfig = {
  critical: { label: "Crítica", variant: "error" },
  urgent: { label: "Urgente", variant: "error" },
  high: { label: "Alta", variant: "warning" },
  medium: { label: "Media", variant: "info" },
  low: { label: "Baja", variant: "success" },
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM", { locale: es });
  } catch {
    return value;
  }
};

/**
 * Tarjeta draggable de ticket para el tablero Kanban.
 */
const TicketCard = ({ ticket, onClick }) => {
  const token = useIkoluToken();
  const priority = ticket.priority?.toLowerCase?.() || "medium";
  const config = priorityConfig[priority] || priorityConfig.medium;
  const assigned = ticket.assigned_to;
  const assignedLabel = assigned
    ? assigned.full_name || assigned.username || assigned.email || "Usuario"
    : "Sin asignar";

  let slaOverdue = false;
  if (ticket.sla_due_at) {
    try {
      slaOverdue = isPast(parseISO(ticket.sla_due_at));
    } catch {
      slaOverdue = false;
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(ticket.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onClick?.(ticket)}
      style={{ cursor: "grab" }}
    >
      <SmartCard hover style={{ marginBottom: 12 }}>
        <Flex vertical gap={8}>
          <Flex justify="space-between" align="flex-start" gap={8}>
            <Text
              strong
              style={{
                fontSize: 14,
                lineHeight: 1.3,
                color: token.colorTextHeading,
              }}
            >
              {ticket.title || `Ticket #${ticket.id}`}
            </Text>
            <SmartBadge variant={config.variant} size="sm">
              {config.label}
            </SmartBadge>
          </Flex>

          <Flex wrap gap={8}>
            {ticket.category && (
              <SmartBadge size="sm" variant="neutral">
                {ticket.category}
              </SmartBadge>
            )}
            {(ticket.source || ticket.origin) && (
              <SmartBadge size="sm" variant="info">
                {ticket.source || ticket.origin}
              </SmartBadge>
            )}
          </Flex>

          <Flex justify="space-between" align="center">
            <Tooltip title={assignedLabel}>
              <Flex align="center" gap={6}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ background: token.colorCorporateBlueLight }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {assignedLabel}
                </Text>
              </Flex>
            </Tooltip>
            <Flex align="center" gap={4}>
              <ClockCircleOutlined
                style={{
                  fontSize: 12,
                  color: slaOverdue ? token.colorError : token.colorTextSecondary,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: slaOverdue ? token.colorError : token.colorTextSecondary,
                }}
              >
                {formatDate(ticket.created_at)}
              </Text>
            </Flex>
          </Flex>

          {ticket.sla_due_at && (
            <SmartBadge
              size="sm"
              variant={slaOverdue ? "error" : "success"}
              style={{ alignSelf: "flex-start" }}
            >
              SLA {slaOverdue ? "vencido" : "ok"}
            </SmartBadge>
          )}
        </Flex>
      </SmartCard>
    </div>
  );
};

export default React.memo(TicketCard);
