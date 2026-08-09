import React from "react";
import { Card, theme } from "antd";
import { smarthydro } from "../../theme/smarthydro.tokens";

const SmartCard = ({
  variant = "default",
  children,
  style = {},
  hover = false,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { token } = theme.useToken();

  const variantStyles = {
    default: {
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorder}`,
      boxShadow: smarthydro.shadows.md,
    },
    elevated: {
      background: token.colorBgElevated,
      border: "none",
      boxShadow: smarthydro.shadows.lg,
    },
    bordered: {
      background: token.colorBgContainer,
      border: `2px solid ${token.colorPrimary}`,
      boxShadow: "none",
    },
    subtle: {
      background: token.colorFillSecondary,
      border: "none",
      boxShadow: "none",
    },
    void: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      backdropFilter: "blur(10px)",
    },
  };

  const variantStyle = variantStyles[variant] || variantStyles.default;

  const hoverStyle = hover && isHovered ? {
    boxShadow: smarthydro.shadows.xl,
    transform: "scale(1.015)",
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
