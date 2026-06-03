import React from "react";
import { Flex, Typography } from "antd";

const { Text } = Typography;

const SmartKPICard = ({
  icon,
  label,
  value,
  suffix,
  gradient = "linear-gradient(-45deg, #0A2540, #0077B6, #00B4D8, #90E0EF)",
  onClick,
  style = {},
}) => {
  return (
    <div
      onClick={onClick}
      className="ocean-card"
      style={{
        background: gradient,
        backgroundSize: "400% 400%",
        animation: "gradient-flow 8s ease infinite",
        borderRadius: 24,
        padding: "20px 16px 16px 16px",
        textAlign: "center",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: 88,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        border: "1px solid rgba(0, 180, 216, 0.15)",
        boxShadow: "0 4px 16px rgba(0, 180, 216, 0.12)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 180, 216, 0.25)";
          e.currentTarget.style.borderColor = "rgba(0, 180, 216, 0.3)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 180, 216, 0.12)";
        e.currentTarget.style.borderColor = "rgba(0, 180, 216, 0.15)";
      }}
    >
      {/* Wave decoration at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%2300B4D8' fill-opacity='0.15' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\") no-repeat bottom",
          backgroundSize: "cover",
          opacity: 0.6,
          animation: "wave 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <Flex vertical align="center" gap={8} style={{ position: "relative", zIndex: 1 }}>
        {icon && (
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
            marginBottom: 8,
            boxShadow: "0 0 20px rgba(0, 180, 216, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}>
            {icon}
          </div>
        )}
        <Text
          style={{
            fontSize: 12,
            color: "rgba(255, 255, 255, 0.7)",
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Flex align="baseline" gap={2}>
          <Text
            style={{
              fontSize: 28,
              color: "#fff",
              fontFamily: "'Lato', sans-serif",
              fontWeight: 800,
              lineHeight: 1.1,
              textShadow: "0 0 20px rgba(0, 180, 216, 0.5)",
            }}
          >
            {value}
          </Text>
          {suffix && (
            <Text
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.6)",
                fontFamily: "'Roboto', sans-serif",
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
