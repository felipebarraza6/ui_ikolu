import React from "react";
import { Card } from "antd";
import { smarthydro } from "../../theme/smarthydro.tokens";

const variantStyles = {
  default: {
    background: "#fff",
    border: `1px solid ${smarthydro.colors.neutral[200]}`,
    boxShadow: smarthydro.shadows.md,
  },
  elevated: {
    background: "#fff",
    border: "none",
    boxShadow: smarthydro.shadows.lg,
  },
  bordered: {
    background: "#fff",
    border: `2px solid ${smarthydro.colors.primary[500]}`,
    boxShadow: "none",
  },
  subtle: {
    background: smarthydro.colors.secondary,
    border: "none",
    boxShadow: "none",
  },
};

const SmartCard = ({
  variant = "default",
  children,
  style = {},
  hover = false,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const variantStyle = variantStyles[variant] || variantStyles.default;

  const hoverStyle = hover && isHovered ? {
    boxShadow: smarthydro.shadows.xl,
    transform: "translateY(-2px)",
    transition: smarthydro.transitions.slow,
  } : {};

  return (
    <Card
      style={{
        ...variantStyle,
        ...hoverStyle,
        borderRadius: smarthydro.radii.lg,
        fontFamily: smarthydro.typography.body,
        transition: hover ? smarthydro.transitions.slow : "none",
        ...style,
      }}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      {...props}
    >
      {children}
    </Card>
  );
};

export default SmartCard;
