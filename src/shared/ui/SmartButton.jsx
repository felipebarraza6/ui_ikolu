import React from "react";
import { Button } from "antd";
import { smarthydro } from "../../theme/smarthydro.tokens";

const variantStyles = {
  primary: {
    background: smarthydro.colors.primary[500],
    borderColor: smarthydro.colors.primary[500],
    color: "#fff",
  },
  accent: {
    background: smarthydro.colors.accent[400],
    borderColor: smarthydro.colors.accent[400],
    color: smarthydro.colors.primary[700],
  },
  ghost: {
    background: "transparent",
    borderColor: smarthydro.colors.primary[500],
    color: smarthydro.colors.primary[500],
  },
  danger: {
    background: smarthydro.colors.semantic.error,
    borderColor: smarthydro.colors.semantic.error,
    color: "#fff",
  },
};

const sizeMap = {
  xs: { height: 24, padding: "0 8px", fontSize: 11 },
  sm: { height: 32, padding: "0 12px", fontSize: 12 },
  md: { height: 40, padding: "0 16px", fontSize: 14 },
  lg: { height: 48, padding: "0 20px", fontSize: 16 },
};

const SmartButton = ({
  variant = "primary",
  size = "md",
  children,
  style = {},
  ...props
}) => {
  const variantStyle = variantStyles[variant] || variantStyles.primary;
  const sizeStyle = sizeMap[size] || sizeMap.md;

  return (
    <Button
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: smarthydro.radii.md,
        fontFamily: smarthydro.typography.body,
        fontWeight: smarthydro.typography.weights.semibold,
        transition: smarthydro.transitions.base,
        boxShadow: variant === "primary" ? smarthydro.shadows.sm : "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default SmartButton;
