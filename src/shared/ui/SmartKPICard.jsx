import React from "react";
import { Flex, Typography, Skeleton } from "antd";
import { useIkoluToken } from "../../hooks/useIkoluToken";

const { Text } = Typography;

const SmartKPICard = ({
  icon,
  label,
  value,
  suffix,
  gradient = "linear-gradient(-45deg, #203562, #3A68AA, #4D7FBD, #85A2D1)",
  variant = "ocean",
  onClick,
  style = {},
  valueStyle = {},
  labelStyle = {},
  wave = false,
  loading = false,
  compact = false,
  layout = "vertical",
}) => {
  const token = useIkoluToken();
  const isVoid = variant === "void";
  const horizontal = layout === "horizontal";

  const iconSize = compact ? (horizontal ? 22 : 24) : 40;
  const labelFontSize = compact ? 9 : 11;
  const valueFontSize = compact ? (horizontal ? 16 : 18) : 26;

  return (
    <div
      onClick={onClick}
      className="ocean-card"
      style={{
        background: isVoid ? token.voidSurface : gradient,
        backgroundSize: isVoid ? undefined : "400% 400%",
        animation: isVoid ? undefined : "gradient-flow 8s ease infinite",
        borderRadius: isVoid ? token.voidRadius : 24,
        padding: compact ? (horizontal ? "6px 10px" : "8px 10px") : "20px 16px 16px 16px",
        textAlign: horizontal ? "left" : "center",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: compact ? (horizontal ? 36 : 48) : 88,
        display: "flex",
        flexDirection: "column",
        alignItems: horizontal ? "stretch" : "center",
        justifyContent: "center",
        gap: compact ? (horizontal ? 0 : 2) : 8,
        border: isVoid ? `1px solid ${token.voidBorder}` : "1px solid rgba(58, 104, 170, 0.15)",
        boxShadow: isVoid ? token.voidShadow : "0 4px 16px rgba(32, 53, 98, 0.12)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = isVoid
            ? "0 8px 32px rgba(0,0,0,0.45)"
            : "0 8px 32px rgba(32, 53, 98, 0.25)";
          e.currentTarget.style.borderColor = isVoid
            ? token.voidBorderStrong
            : "rgba(58, 104, 170, 0.3)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isVoid
          ? token.voidShadow
          : "0 4px 16px rgba(32, 53, 98, 0.12)";
        e.currentTarget.style.borderColor = isVoid
          ? token.voidBorder
          : "rgba(58, 104, 170, 0.15)";
      }}
    >
      {!isVoid && wave && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            background:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.12' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\") no-repeat bottom",
            backgroundSize: "100% auto",
            transformOrigin: "bottom center",
            animation: "wave-scale 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <Flex
        vertical={!horizontal}
        align={horizontal ? "center" : "center"}
        gap={horizontal ? 8 : compact ? 2 : 8}
        style={{ position: "relative", zIndex: 1, width: "100%" }}
      >
        {icon && (
          <div
            style={{
              width: iconSize,
              height: iconSize,
              borderRadius: "50%",
              background: isVoid ? "rgba(255,255,255,0.07)" : "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: horizontal ? 0 : compact ? 0 : 4,
              marginBottom: horizontal ? 0 : compact ? 0 : 8,
              boxShadow: isVoid ? "none" : "0 0 20px rgba(204, 207, 7, 0.2)",
              border: isVoid ? `1px solid ${token.voidBorder}` : "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {icon}
          </div>
        )}
        <Flex
          vertical
          align={horizontal ? "flex-start" : "center"}
          gap={horizontal ? 0 : compact ? 2 : 8}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Text
            style={{
              fontSize: labelFontSize,
              color: isVoid ? token.voidTextMuted : "rgba(255, 255, 255, 0.7)",
              fontFamily: isVoid ? token.voidMono : "'Roboto', sans-serif",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              lineHeight: 1.2,
              marginBottom: 0,
              ...labelStyle,
            }}
          >
            {label}
          </Text>
          <Flex align="baseline" gap={2}>
            {loading ? (
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: compact ? (horizontal ? 24 : 28) : 40,
                  height: compact ? (horizontal ? 14 : 18) : 28,
                }}
              />
            ) : (
              <Text
                style={{
                  fontSize: valueFontSize,
                  color: isVoid ? token.voidTextHeading : "#fff",
                  fontFamily: isVoid ? token.voidMono : "'Lato', sans-serif",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  textShadow: isVoid ? "none" : "0 0 20px rgba(32, 53, 98, 0.5)",
                  ...valueStyle,
                }}
              >
                {value}
              </Text>
            )}
            {suffix && !loading && (
              <Text
                style={{
                  fontSize: 12,
                  color: isVoid ? token.voidTextMuted : "rgba(255, 255, 255, 0.6)",
                  fontFamily: isVoid ? token.voidMono : "'Roboto', sans-serif",
                }}
              >
                {suffix}
              </Text>
            )}
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default SmartKPICard;
