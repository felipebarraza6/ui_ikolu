import React, { useMemo } from "react";
import { Flex, Typography, Tooltip, theme } from "antd";
import { FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";

const { Text } = Typography;
const { useToken } = theme;

export const createLevelConfig = (token) => ({
  safe: {
    color: token.colorSuccess,
    bg: 'rgba(42, 157, 143, 0.15)',
    border: 'rgba(42, 157, 143, 0.3)',
    label: "Dentro de límites",
    icon: FaCheckCircle,
    shortLabel: "OK",
  },
  warning: {
    color: token.colorWarning,
    bg: 'rgba(244, 162, 97, 0.15)',
    border: 'rgba(244, 162, 97, 0.3)',
    label: "Cerca de superar límite",
    icon: FaExclamationTriangle,
    shortLabel: "Alerta",
  },
  critical: {
    color: token.colorError,
    bg: 'rgba(231, 111, 81, 0.15)',
    border: 'rgba(231, 111, 81, 0.3)',
    label: "Incumplimiento detectado",
    icon: FaExclamationTriangle,
    shortLabel: "Crítico",
  },
  unknown: {
    color: token.colorTextDisabled,
    bg: '#E9ECEF',
    border: '#CED4DA',
    label: "Sin límites configurados",
    icon: FaShieldAlt,
    shortLabel: "N/A",
  },
});

const StatusBadge = ({ record, onViewComplianceDetail }) => {
  const { token } = useToken();

  const levelConfig = useMemo(() => createLevelConfig(token), [token]);

  const level = record.compliance_warning?.level || "safe";
  const status = record.compliance_warning?.status || levelConfig[level]?.label || "—";
  const cfg = levelConfig[level] || levelConfig.safe;
  const Icon = cfg.icon;

  return (
    <Tooltip title={status}>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Ver detalle de cumplimiento de ${record.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onViewComplianceDetail?.(record, "detail");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onViewComplianceDetail?.(record, "detail");
          }
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: cfg.bg,
          borderRadius: token.borderRadius,
          padding: "3px 8px",
          border: `1px solid ${cfg.border}`,
          cursor: "pointer",
          transition: "200ms ease",
          minWidth: 80,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = 0.85;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = 1;
        }}
      >
        <Icon style={{ fontSize: 10, color: cfg.color }} />
        <Text
          style={{
            fontSize: 10,
            color: cfg.color,
            fontWeight: 600,
            fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {cfg.shortLabel}
        </Text>
      </div>
    </Tooltip>
  );
};

export default StatusBadge;
