import React from "react";
import { Flex, Typography } from "antd";
import { smarthydro } from "../../theme/smarthydro.tokens";

const { Text } = Typography;

const SmartKPICard = ({
  icon,
  label,
  value,
  suffix,
  gradient = smarthydro.gradients.primary,
  onClick,
  style = {},
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: gradient,
        borderRadius: smarthydro.radii.lg,
        padding: `${smarthydro.spacing.lg} ${smarthydro.spacing.xl}`,
        textAlign: "center",
        cursor: onClick ? "pointer" : "default",
        transition: smarthydro.transitions.slow,
        boxShadow: smarthydro.shadows.md,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = smarthydro.shadows.xl;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = smarthydro.shadows.md;
      }}
    >
      <Flex vertical align="center" gap={8}>
        {icon && (
          <div style={{
            width: 40,
            height: 40,
            borderRadius: smarthydro.radii.full,
            background: "rgba(255, 255, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}>
            {icon}
          </div>
        )}
        <Text
          style={{
            fontSize: smarthydro.typography.sizes.sm,
            color: "rgba(255, 255, 255, 0.85)",
            fontFamily: smarthydro.typography.body,
            fontWeight: smarthydro.typography.weights.medium,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Flex align="baseline" gap={2}>
          <Text
            style={{
              fontSize: smarthydro.typography.sizes["3xl"],
              color: "#fff",
              fontFamily: smarthydro.typography.heading,
              fontWeight: smarthydro.typography.weights.extrabold,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Text>
          {suffix && (
            <Text
              style={{
                fontSize: smarthydro.typography.sizes.sm,
                color: "rgba(255, 255, 255, 0.75)",
                fontFamily: smarthydro.typography.body,
              }}
            >
              {suffix}
            </Text>
          )}
        </Flex>
      </Flex>
    </div>
  );
};

export default SmartKPICard;
