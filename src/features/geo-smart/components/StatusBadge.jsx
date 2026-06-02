import React from "react";
import { Flex, Typography, Tooltip } from "antd";
import { FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import { smarthydro } from "../../../theme/smarthydro.tokens";

const { Text } = Typography;

const levelConfig = {
  safe: {
    color: smarthydro.colors.semantic.success,
    bg: smarthydro.colors.semantic.successBg,
    border: smarthydro.colors.semantic.successBorder,
    label: "Dentro de límites",
    icon: FaCheckCircle,
    shortLabel: "OK",
  },
  warning: {
    color: smarthydro.colors.semantic.warning,
    bg: smarthydro.colors.semantic.warningBg,
    border: smarthydro.colors.semantic.warningBorder,
    label: "Cerca de superar límite",
    icon: FaExclamationTriangle,
    shortLabel: "Alerta",
  },
  critical: {
    color: smarthydro.colors.semantic.error,
    bg: smarthydro.colors.semantic.errorBg,
    border: smarthydro.colors.semantic.errorBorder,
    label: "Incumplimiento detectado",
    icon: FaExclamationTriangle,
    shortLabel: "Crítico",
  },
  unknown: {
    color: smarthydro.colors.neutral[500],
    bg: smarthydro.colors.neutral[100],
    border: smarthydro.colors.neutral[300],
    label: "Sin límites configurados",
    icon: FaShieldAlt,
    shortLabel: "N/A",
  },
};

const StatusBadge = ({ record, onViewComplianceDetail }) => {
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
          borderRadius: smarthydro.radii.sm,
          padding: "3px 8px",
          border: `1px solid ${cfg.border}`,
          cursor: "pointer",
          transition: smarthydro.transitions.base,
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
            fontWeight: smarthydro.typography.weights.semibold,
            fontFamily: smarthydro.typography.body,
          }}
        >
          {cfg.shortLabel}
        </Text>
      </div>
    </Tooltip>
  );
};

export { levelConfig };
export default StatusBadge;
