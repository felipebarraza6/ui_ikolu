import React from "react";
import { Tag } from "antd";
import { smarthydro } from "../../theme/smarthydro.tokens";

const variantConfig = {
  success: {
    color: smarthydro.colors.semantic.success,
    bg: smarthydro.colors.semantic.successBg,
    border: smarthydro.colors.semantic.successBorder,
    icon: "✓",
  },
  warning: {
    color: smarthydro.colors.semantic.warning,
    bg: smarthydro.colors.semantic.warningBg,
    border: smarthydro.colors.semantic.warningBorder,
    icon: "⚠",
  },
  error: {
    color: smarthydro.colors.semantic.error,
    bg: smarthydro.colors.semantic.errorBg,
    border: smarthydro.colors.semantic.errorBorder,
    icon: "✕",
  },
  info: {
    color: smarthydro.colors.semantic.info,
    bg: smarthydro.colors.semantic.infoBg,
    border: smarthydro.colors.semantic.infoBorder,
    icon: "ℹ",
  },
  neutral: {
    color: smarthydro.colors.neutral[600],
    bg: smarthydro.colors.neutral[100],
    border: smarthydro.colors.neutral[300],
    icon: null,
  },
  accent: {
    color: smarthydro.colors.primary[700],
    bg: smarthydro.colors.accent[50],
    border: smarthydro.colors.accent[200],
    icon: null,
  },
};

const sizeMap = {
  sm: { fontSize: 10, padding: "1px 6px", lineHeight: "16px" },
  md: { fontSize: 12, padding: "2px 8px", lineHeight: "20px" },
  lg: { fontSize: 14, padding: "4px 12px", lineHeight: "24px" },
};

const SmartBadge = ({
  variant = "neutral",
  size = "md",
  children,
  showIcon = true,
  style = {},
  ...props
}) => {
  const config = variantConfig[variant] || variantConfig.neutral;
  const sizeStyle = sizeMap[size] || sizeMap.md;

  return (
    <Tag
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: smarthydro.radii.sm,
        fontFamily: smarthydro.typography.body,
        fontWeight: smarthydro.typography.weights.semibold,
        ...sizeStyle,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        ...style,
      }}
      {...props}
    >
      {showIcon && config.icon && (
        <span style={{ fontSize: sizeStyle.fontSize * 0.9 }}>{config.icon}</span>
      )}
      {children}
    </Tag>
  );
};

export default SmartBadge;
