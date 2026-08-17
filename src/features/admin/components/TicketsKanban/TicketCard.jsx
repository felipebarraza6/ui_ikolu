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
  UserOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link, useLocation } from "react-router-dom";
import { SmartCard } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import {
  getTicketCategoryConfig,
  getTicketOtBadgeLabel,
  getTicketDateValue,
  getSlaStatus,
} from "../../constants/tickets";

const { Text } = Typography;

const tagBaseStyle = {
  fontSize: 9,
  padding: "0 4px",
  lineHeight: "16px",
  height: 16,
  margin: 0,
  display: "inline-flex",
  alignItems: "center",
  verticalAlign: "middle",
  borderRadius: 3,
};

const EntityTag = ({ to, color, icon, children, style = {}, target, rel }) => (
  <Link
    to={to}
    target={target}
    rel={rel}
    onClick={(e) => e.stopPropagation()}
    style={{ textDecoration: "none", display: "inline-flex", verticalAlign: "middle" }}
  >
    <Tag
      color={color}
      icon={icon}
      style={{ ...tagBaseStyle, cursor: "pointer", ...style }}
    >
      {children}
    </Tag>
  </Link>
);

const ReadOnlyTag = ({ color, icon, children }) => (
  <Tag
    color={color}
    icon={icon}
    style={tagBaseStyle}
  >
    {children}
  </Tag>
);

const TicketEntityTags = ({ ticket }) => {
  const tags = [];
  const location = useLocation();
  const makeTo = (path) => ({ pathname: path, state: { from: location.pathname + location.search } });
  const clientId = ticket.client || ticket.client_id;
  const clientName = ticket.client_name;

  if (clientId || clientName) {
    const label = clientName || `Cliente ${clientId}`;
    const tag = clientId ? (
      <EntityTag
        key="client"
        to={makeTo(`/admin/clients/${clientId}`)}
        color="blue"
        icon={<UserOutlined style={{ fontSize: 9 }} />}
      >
        {label}
      </EntityTag>
    ) : (
      <ReadOnlyTag
        key="client"
        color="blue"
        icon={<UserOutlined style={{ fontSize: 9 }} />}
      >
        {label}
      </ReadOnlyTag>
    );
    tags.push(tag);
  }

  const projectId = ticket.project || ticket.project_id;
  const projectName = ticket.project_name;

  if (projectId || projectName) {
    const label = projectName || `Proyecto ${projectId}`;
    const tag = projectId ? (
      <EntityTag
        key="project"
        to={makeTo(`/admin/projects/${projectId}`)}
        color="cyan"
        icon={<ProjectOutlined style={{ fontSize: 9 }} />}
      >
        {label}
      </EntityTag>
    ) : (
      <ReadOnlyTag
        key="project"
        color="cyan"
        icon={<ProjectOutlined style={{ fontSize: 9 }} />}
      >
        {label}
      </ReadOnlyTag>
    );
    tags.push(tag);
  }

  if (ticket.points?.length) {
    ticket.points.forEach((p) => {
      tags.push(
        <EntityTag
          key={`point-${p.id}`}
          to={makeTo(`/admin/points/${p.id}`)}
          target="_blank"
          rel="noopener noreferrer"
          color="processing"
          icon={<EnvironmentOutlined style={{ fontSize: 9 }} />}
        >
          {p.title || `Punto ${p.id}`}
        </EntityTag>
      );
    });
  } else if (ticket.point_catchment) {
    tags.push(
      <EntityTag
        key="point"
        to={makeTo(`/admin/points/${ticket.point_catchment}`)}
        target="_blank"
        rel="noopener noreferrer"
        color="processing"
        icon={<EnvironmentOutlined style={{ fontSize: 9 }} />}
      >
        {ticket.point_title || `Punto ${ticket.point_catchment}`}
      </EntityTag>
    );
  }

  if (tags.length === 0) return null;

  return (
    <Flex wrap gap={4} style={{ marginTop: 4 }}>
      {tags}
    </Flex>
  );
};

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
  const otBadgeLabel = getTicketOtBadgeLabel(ticket);
  const createdAt = getTicketDateValue(ticket, "created", "created_at");
  const createdLabel = createdAt ? format(createdAt, "dd MMM", { locale: es }) : "-";

  const responseSla = getSlaStatus(ticket.sla_deadline_response, ticket.sla_responded_at, ticket.status);
  const resolutionSla = getSlaStatus(ticket.sla_deadline_resolution, ticket.sla_resolved_at, ticket.status);

  const activeSlaStatuses = [responseSla, resolutionSla].filter(
    (s) => s && !s.done && s.variant !== "default"
  );

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

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(ticket.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onClick?.(ticket)}
      style={{ cursor: "grab", width: "100%", minWidth: 0 }}
    >
      <SmartCard variant="void"
        hover
        style={{
          width: "100%",
          marginBottom: 6,
          overflow: "hidden",
        }}
        bodyStyle={{ padding: "6px 8px", minWidth: 0 }}
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

          <Flex wrap gap={4} align="center" style={{ maxWidth: "100%" }}>
            {ticket.category && <CategoryBadge category={ticket.category} />}
            {ticket.work_order_category_detail?.name && (
              <Tag
                style={{
                  color: token.voidTextHeading,
                  background: token.voidSurface,
                  border: `1px solid ${token.voidBorderStrong}`,
                  borderRadius: 3,
                  fontSize: 9,
                  padding: "0 5px",
                  lineHeight: "14px",
                  fontWeight: 600,
                  margin: 0,
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
                icon={<CarryOutOutlined style={{ fontSize: 9 }} />}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", maxWidth: "100%", verticalAlign: "bottom" }}>
                  OT: {ticket.work_order_category_detail.name}
                </span>
              </Tag>
            )}
            {otBadgeLabel && (
              <Text type="secondary" style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                <CalendarOutlined style={{ fontSize: 9, marginRight: 2 }} />
                {otBadgeLabel}
                {ticket.scheduled_date_confirmed && (
                  <CheckCircleOutlined style={{ fontSize: 9, marginLeft: 3, color: token.colorSuccess }} />
                )}
              </Text>
            )}
          </Flex>

          <TicketEntityTags ticket={ticket} />

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
