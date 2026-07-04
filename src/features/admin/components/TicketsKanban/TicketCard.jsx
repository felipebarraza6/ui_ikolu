import React from "react";
import { Flex, Typography, Avatar, Tooltip, Tag } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ToolOutlined,
  CodeOutlined,
  SafetyOutlined,
  CarryOutOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SmartCard, SmartBadge } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import { useResponsive } from "../../../../hooks/useResponsive";
import {
  getTicketPriorityConfig,
  getTicketCategoryConfig,
  getTicketOtBadgeLabel,
  getTicketDateValue,
  getSlaStatus,
} from "../../constants/tickets";

const { Text } = Typography;

/**
 * Icono según el tipo de categoría.
 */
const CategoryIcon = ({ categoryType }) => {
  const upper = String(categoryType || "").toUpperCase();
  if (upper === "HARDWARE") return <ToolOutlined style={{ fontSize: 10 }} />;
  if (upper === "SOFTWARE") return <CodeOutlined style={{ fontSize: 10 }} />;
  if (upper === "COMPLIANCE") return <SafetyOutlined style={{ fontSize: 10 }} />;
  if (upper === "WORK_ORDER") return <CarryOutOutlined style={{ fontSize: 10 }} />;
  return null;
};

/**
 * Badge de categoría con color e icono según el tipo.
 */
const CategoryBadge = ({ category }) => {
  const token = useIkoluToken();
  const config = getTicketCategoryConfig(category);
  const label = config.label;
  const color = config.borderColor || "var(--ikolu-void-text-heading)";
  const isVar = typeof color === "string" && color.startsWith("var(");
  const tagColor = isVar ? token.voidTextHeading : color;
  const tagBg = isVar ? token.voidSurface : `${color}12`;
  const tagBorder = isVar ? token.voidBorderStrong : `${color}35`;

  return (
    <Tag
      style={{
        color: tagColor,
        background: tagBg,
        border: `1px solid ${tagBorder}`,
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
      <CategoryIcon categoryType={config.value} />
      {label}
    </Tag>
  );
};

/**
 * Indicador sutil de prioridad en formato píldora.
 */
const PriorityBadge = ({ priority }) => {
  const token = useIkoluToken();
  const config = getTicketPriorityConfig(priority);
  const colors = {
    CRITICA: "#E76F51",
    ALTA: "#F4A261",
    MEDIA: token.voidTextHeading,
    BAJA: "#6C757D",
  };
  const color = colors[String(config.value).toUpperCase()] || colors.MEDIA;

  return (
    <span
      style={{
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 600,
        color,
        background: `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 10,
        padding: "2px 10px",
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
};

/**
 * Tarjeta draggable de ticket para el tablero Kanban.
 */
const TicketCard = ({ ticket, onClick }) => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const otBadgeLabel = getTicketOtBadgeLabel(ticket);
  const assignedLabel = ticket.assigned_to_name || ticket.assigned_to?.full_name || ticket.assigned_to?.username || ticket.assigned_to?.email || (ticket.assigned_to ? `Usuario ${ticket.assigned_to}` : "Sin asignar");

  const createdAt = getTicketDateValue(ticket, "created", "created_at");
  const createdLabel = createdAt ? format(createdAt, "dd MMM", { locale: es }) : "-";

  const responseSla = getSlaStatus(ticket.sla_deadline_response, ticket.sla_responded_at);
  const resolutionSla = getSlaStatus(ticket.sla_deadline_resolution, ticket.sla_resolved_at);

  const activeSlaStatuses = [responseSla, resolutionSla].filter(
    (s) => s && !s.done && s.variant !== "default"
  );
  const hasSla =
    ticket.sla_deadline_response ||
    ticket.sla_deadline_resolution ||
    responseSla.done ||
    resolutionSla.done;

  const slaVariant = activeSlaStatuses.some((s) => s.overdue)
    ? "error"
    : activeSlaStatuses.some((s) => s.variant === "warning")
    ? "warning"
    : activeSlaStatuses.length
    ? "success"
    : "default";

  const slaLabel = (() => {
    if (responseSla.done && resolutionSla.done) return "SLA cumplido";
    if (activeSlaStatuses.some((s) => s.overdue)) return "SLA vencido";
    if (activeSlaStatuses.some((s) => s.variant === "warning")) {
      const nearest = activeSlaStatuses.find((s) => s.variant === "warning");
      return nearest?.hoursRemaining != null && nearest.hoursRemaining <= 1
        ? "Vence pronto"
        : "Próximo a vencer";
    }
    if (activeSlaStatuses.length) return "SLA a tiempo";
    return "No aplica";
  })();

  const slaAlert = slaVariant === "error" || slaVariant === "warning";

  const priorityColor = (() => {
    const upper = String(ticket.priority || "").toUpperCase();
    if (upper === "CRITICA") return "#E76F51";
    if (upper === "ALTA") return "#F4A261";
    if (upper === "MEDIA") return token.voidTextHeading;
    return "#6C757D";
  })();

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
      <SmartCard variant="void"
        hover
        style={{
          marginBottom: isMobile ? 8 : 12,
          borderLeft: `3px solid ${slaVariant === "error" ? token.colorError : priorityColor}`,
          borderColor: slaVariant === "error" ? token.colorError : undefined,
          boxShadow: slaVariant === "error" ? `0 0 0 1px ${token.colorErrorBorder}, 0 4px 12px ${token.colorError}18` : undefined,
          overflow: "hidden",
        }}
        bodyStyle={{ padding: isMobile ? 10 : 12 }}
      >
        <Flex vertical gap={isMobile ? 6 : 8}>
          <Flex justify="space-between" align="flex-start" gap={8}>
            <Text
              strong
              style={{
                fontSize: isMobile ? 13 : 14,
                lineHeight: 1.3,
                color: token.voidTextHeading,
              }}
            >
              {ticket.title || `Ticket #${ticket.id}`}
            </Text>
            <PriorityBadge priority={ticket.priority} />
          </Flex>

          <Flex wrap gap={8}>
            {ticket.category && (
              <CategoryBadge category={ticket.category} />
            )}
            {otBadgeLabel && (
              <SmartBadge size="sm" variant="accent" showIcon={false}>
                <CalendarOutlined style={{ fontSize: 10 }} />
                {otBadgeLabel}
              </SmartBadge>
            )}
            {slaVariant === "error" && (
              <Tag
                style={{
                  color: token.colorError,
                  background: token.colorErrorBg,
                  border: `1px solid ${token.colorErrorBorder}`,
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
                <ExclamationCircleOutlined style={{ fontSize: 10 }} />
                SLA vencido
              </Tag>
            )}
          </Flex>

          <Flex justify="space-between" align="center">
            <Tooltip title={assignedLabel}>
              <Flex align="center" gap={6}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ background: token.voidSurface }}
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
                  color: slaAlert ? token.colorError : token.voidTextMuted,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: slaAlert ? token.colorError : token.voidTextMuted,
                }}
              >
                {createdLabel}
              </Text>
            </Flex>
          </Flex>

          {hasSla && (
            <SmartBadge
              size="sm"
              variant={slaVariant}
              style={{ alignSelf: "flex-start" }}
            >
              {slaLabel}
            </SmartBadge>
          )}
        </Flex>
      </SmartCard>
    </div>
  );
};

export default React.memo(TicketCard);
