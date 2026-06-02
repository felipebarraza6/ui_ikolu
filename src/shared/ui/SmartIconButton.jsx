import React from "react";
import { Tooltip } from "antd";
import { smarthydro } from "../../theme/smarthydro.tokens";

const variantStyles = {
  primary: {
    background: `${smarthydro.colors.primary[500]}10`,
    color: smarthydro.colors.primary[500],
    border: `1px solid ${smarthydro.colors.primary[500]}30`,
  },
  accent: {
    background: `${smarthydro.colors.accent[400]}15`,
    color: smarthydro.colors.accent[400],
    border: `1px solid ${smarthydro.colors.accent[400]}40`,
  },
  ghost: {
    background: "transparent",
    color: smarthydro.colors.neutral[500],
    border: `1px solid ${smarthydro.colors.neutral[300]}`,
  },
  danger: {
    background: `${smarthydro.colors.semantic.error}10`,
    color: smarthydro.colors.semantic.error,
    border: `1px solid ${smarthydro.colors.semantic.error}30`,
  },
};

const sizeMap = {
  sm: { width: 24, height: 24, fontSize: 10 },
  md: { width: 32, height: 32, fontSize: 12 },
  lg: { width: 40, height: 40, fontSize: 14 },
};

const SmartIconButton = ({
  variant = "primary",
  size = "md",
  icon,
  tooltip,
  onClick,
  style = {},
  disabled = false,
  ...props
}) => {
  const variantStyle = variantStyles[variant] || variantStyles.primary;
  const sizeStyle = sizeMap[size] || sizeMap.md;

  const button = (
    <div
      role="button"
      tabIndex={0}
      aria-label={tooltip}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: smarthydro.radii.full,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: smarthydro.transitions.base,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.opacity = 0.85;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.opacity = disabled ? 0.5 : 1;
      }}
      {...props}
    >
      {icon}
    </div>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{button}</Tooltip>;
  }

  return button;
};

export default SmartIconButton;
