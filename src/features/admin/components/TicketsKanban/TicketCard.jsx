import React from "react";
import { Flex, Typography, Avatar, Tooltip, Tag } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { format, parseISO, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { SmartCard, SmartBadge } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import {
  getTicketPriorityConfig,
  getTicketCategoryLabel,
  getTicketCategoryConfig,
  getTicketOtBadgeLabel,
  getTicketSourceLabel,
  getTicketOriginLabel,
  getTicketDateValue,
  getSlaStatus,
  getTicketSourceKind,
  isAutomaticTicket,
} from "../../constants/tickets";

const { Text } = Typography;

const BotIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="15" x2="8" y2="15.01" />
    <line x1="16" y1="15" x2="16" y2="15.01" />
  </svg>
);

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM", { locale: es });
  } catch {
    return value;
  }
};

/**
 * Badge de categoría con color según el tipo.
 */
const CategoryBadge = ({ category }) => {
  const config = getTicketCategoryConfig(category);
  const label = config.label;

  if (config.customColor) {
    return (
      <Tag
        style={{
          color: config.customColor,
          background: config.customBg,
          border: `1px solid ${config.customBorder}`,
          borderRadius: 4,
          fontSize: 10,
          padding: "1px 6px",
          lineHeight: "16px",
          fontWeight: 600,
        }}
      >
        {label}
      </Tag>
    );
  }

  return <SmartBadge size="sm" variant={config.variant}>{label}</SmartBadge>;
};

/**
 * Badge de origen del ticket.
 * Sistema: azul corporativo con icono de bot.
 * Cliente: verde lima suave de la marca.
 */
const SourceBadge = ({ source, origin }) => {
  const token = useIkoluToken();
  const kind = getTicketSourceKind(source, origin);
  const label = getTicketSourceLabel(source) || getTicketOriginLabel(origin) || "Origen";

  if (kind === "system") {
    return (
      <SmartBadge size="sm" variant="info" showIcon={false}>
        <BotIcon />
        {label}
      </SmartBadge>
    );
  }

  return (
    <Tag
      style={{
        color: token.colorAccentText || "#7F8204",
        background: token.colorAccentBg || "#FDFEE6",
        border: `1px solid ${token.colorAccentBorder || "#E3E865"}`,
        borderRadius: 4,
        fontSize: 10,
        padding: "1px 6px",
        lineHeight: "16px",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {label}
    </Tag>
  );
};

/**
 * Tarjeta draggable de ticket para el tablero Kanban.
 */
const TicketCard = ({ ticket, onClick }) => {
  const token = useIkoluToken();
  const config = getTicketPriorityConfig(ticket.priority);
  const otBadgeLabel = getTicketOtBadgeLabel(ticket);
  const assignedLabel = ticket.assigned_to_name || ticket.assigned_to?.full_name || ticket.assigned_to?.username || ticket.assigned_to?.email || (ticket.assigned_to ? `Usuario ${ticket.assigned_to}` : "Sin asignar");

  const createdAt = getTicketDateValue(ticket, "created", "created_at");
  const createdLabel = createdAt ? format(createdAt, "dd MMM", { locale: es }) : "-";

  const responseSla = getSlaStatus(ticket.sla_deadline_response, ticket.sla_responded_at);
  const resolutionSla = getSlaStatus(ticket.sla_deadline_resolution, ticket.sla_resolved_at);
  const slaOverdue = responseSla.overdue || resolutionSla.overdue;
  const isAuto = isAutomaticTicket(ticket.source);

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
      <SmartCard
        hover
        style={{
          marginBottom: 12,
          opacity: isAuto ? 0.75 : 1,
          background: isAuto ? token.colorFillTertiary : undefined,
          borderStyle: isAuto ? "dashed" : "solid",
        }}
      >
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
            <SmartBadge variant={config.variant} size="md">
              {config.label}
            </SmartBadge>
          </Flex>

          <Flex wrap gap={8}>
            {ticket.category && (
              <CategoryBadge category={ticket.category} />
            )}
            {(ticket.source || ticket.origin) && (
              <SourceBadge source={ticket.source} origin={ticket.origin} />
            )}
            {otBadgeLabel && (
              <SmartBadge size="sm" variant="accent" showIcon={false}>
                <CalendarOutlined style={{ fontSize: 10 }} />
                {otBadgeLabel}
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
                {createdLabel}
              </Text>
            </Flex>
          </Flex>

          {(ticket.sla_deadline_response || ticket.sla_deadline_resolution) && (
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
