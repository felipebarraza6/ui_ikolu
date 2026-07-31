import React from "react";
import { Flex, Typography, Tag } from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  CodeOutlined,
  SafetyOutlined,
  CarryOutOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SmartCard } from "../../../../shared/ui";
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

const CategoryIcon = ({ categoryType }) => {
  const upper = String(categoryType || "").toUpperCase();
  if (upper === "HARDWARE") return <ToolOutlined style={{ fontSize: 9 }} />;
  if (upper === "SOFTWARE") return <CodeOutlined style={{ fontSize: 9 }} />;
  if (upper === "COMPLIANCE") return <SafetyOutlined style={{ fontSize: 9 }} />;
  if (upper === "WORK_ORDER") return <CarryOutOutlined style={{ fontSize: 9 }} />;
  return null;
};

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
        borderRadius: 3,
        fontSize: 9,
        padding: "0 5px",
        lineHeight: "14px",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        margin: 0,
      }}
    >
      <CategoryIcon categoryType={config.value} />
      {label}
    </Tag>
  );
};

const PriorityDot = ({ priority }) => {
  const upper = String(priority || "").toUpperCase();
  const colors = { CRITICA: "#E76F51", ALTA: "#F4A261", MEDIA: "var(--ikolu-void-text-heading)", BAJA: "#6C757D" };
  const color = colors[upper] || colors.MEDIA;
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />;
};

const TicketCard = ({ ticket, onClick }) => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const otBadgeLabel = getTicketOtBadgeLabel(ticket);
  const createdAt = getTicketDateValue(ticket, "created", "created_at");
  const createdLabel = createdAt ? format(createdAt, "dd MMM", { locale: es }) : "-";

  const responseSla = getSlaStatus(ticket.sla_deadline_response, ticket.sla_responded_at, ticket.status);
  const resolutionSla = getSlaStatus(ticket.sla_deadline_resolution, ticket.sla_resolved_at, ticket.status);

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
    if (responseSla.done && resolutionSla.done) return "Cumplido";
    if (activeSlaStatuses.some((s) => s.overdue)) return "Vencido";
    if (activeSlaStatuses.some((s) => s.variant === "warning")) {
      const nearest = activeSlaStatuses.find((s) => s.variant === "warning");
      return nearest?.hoursRemaining != null && nearest.hoursRemaining <= 1 ? "Vence pronto" : "Próx. vencer";
    }
    if (activeSlaStatuses.length) return "A tiempo";
    return "N/A";
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
          marginBottom: 6,
          borderLeft: `2px solid ${slaVariant === "error" ? token.colorError : priorityColor}`,
          boxShadow: slaVariant === "error" ? `0 0 0 1px ${token.colorErrorBorder}, 0 2px 8px ${token.colorError}14` : undefined,
          overflow: "hidden",
        }}
        bodyStyle={{ padding: "6px 8px" }}
      >
        <Flex vertical gap={3}>
          <Flex justify="space-between" align="center" gap={6}>
            <Flex align="center" gap={6} style={{ minWidth: 0, flex: 1 }}>
              <PriorityDot priority={ticket.priority} />
              <Text
                strong
                style={{
                  fontSize: 12,
                  lineHeight: 1.25,
                  color: token.voidTextHeading,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ticket.title || `Ticket #${ticket.id}`}
              </Text>
            </Flex>
            {slaAlert && (
              <ExclamationCircleOutlined style={{ fontSize: 12, color: token.colorError, flexShrink: 0 }} />
            )}
          </Flex>

          <Flex wrap gap={4} align="center">
            {ticket.category && <CategoryBadge category={ticket.category} />}
            {otBadgeLabel && (
              <Text type="secondary" style={{ fontSize: 10 }}>
                <CalendarOutlined style={{ fontSize: 9, marginRight: 2 }} />
                {otBadgeLabel}
                {ticket.scheduled_date_confirmed && (
                  <CheckCircleOutlined style={{ fontSize: 9, marginLeft: 3, color: token.colorSuccess }} />
                )}
              </Text>
            )}
          </Flex>

          <Flex justify="space-between" align="center">
            <Flex align="center" gap={4}>
              <ClockCircleOutlined style={{ fontSize: 10, color: token.voidTextMuted }} />
              <Text style={{ fontSize: 10, color: token.voidTextMuted }}>{createdLabel}</Text>
            </Flex>
            <Text style={{
              fontSize: 10,
              fontWeight: 600,
              color: slaVariant === "error" ? token.colorError : slaVariant === "warning" ? "#F4A261" : token.voidTextMuted,
            }}>
              {slaLabel}
            </Text>
          </Flex>
        </Flex>
      </SmartCard>
    </div>
  );
};

export default React.memo(TicketCard);
