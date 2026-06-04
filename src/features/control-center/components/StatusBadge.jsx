import React, { useMemo, useState } from "react";
import { Flex, Typography, Tooltip, theme } from "antd";
import { FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import BlinkingDot from "./BlinkingDot";

const { Text } = Typography;
const { useToken } = theme;

export const createLevelConfig = (token) => ({
  safe: {
    color: token.colorSuccess,
    bg: `${token.colorSuccess}15`,
    border: `${token.colorSuccess}30`,
    label: "Dentro de límites",
    icon: FaCheckCircle,
    shortLabel: "OK",
  },
  warning: {
    color: token.colorWarning,
    bg: `${token.colorWarning}15`,
    border: `${token.colorWarning}30`,
    label: "Cerca de superar límite",
    shortLabel: "Alerta",
  },
  critical: {
    color: token.colorError,
    bg: `${token.colorError}15`,
    border: `${token.colorError}30`,
    label: "Incumplimiento detectado",
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

  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const levelConfig = useMemo(() => createLevelConfig(token), [token]);

  const level = record.compliance_warning?.level || "safe";
  const status = record.compliance_warning?.status || levelConfig[level]?.label || "—";
  const cfg = levelConfig[level] || levelConfig.safe;
  const Icon = cfg.icon;
  const isDot = level === 'warning' || level === 'critical';

  const isAlert = isDot && !hasBeenClicked;

  return (
    <Tooltip title={status}>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Ver detalle de cumplimiento de ${record.title}`}
        onClick={(e) => {
          e.stopPropagation();
          setHasBeenClicked(true);
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
        {isDot ? (
          <BlinkingDot
            size={8}
            color={cfg.color}
            variant="warning"
            active={isAlert}
          />
        ) : (
          <Icon style={{ fontSize: 10, color: cfg.color, flexShrink: 0 }} />
        )}
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
