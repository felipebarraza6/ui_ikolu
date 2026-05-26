import React from "react";
import { Card, Flex, Tooltip, Skeleton, Typography } from "antd";
import {
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { ikoluTokens } from "../../theme";

const { Text } = Typography;

const MetricCard = ({
  title,
  value,
  unit,
  icon,
  loading = false,
  extraInfo,
  helpText,
  syncStatus,
  variation,
  variationUnit,
  variationDecimals = 1,
  footer,
}) => {
  return (
    <Card
      hoverable
      className="metric-card-hover"
      style={{
        marginBottom: "6px",
        borderRadius: ikoluTokens.radiusXL,
        boxShadow: "0 4px 20px rgba(0, 50, 150, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        overflow: "hidden",
        position: "relative",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
      }}
      bodyStyle={{ padding: "10px 14px", zIndex: 1, position: "relative" }}
      aria-label={`Metrica ${title}: ${value} ${unit}`}
    >
      <Flex align="center" gap="small" style={{ marginBottom: 8 }}>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
            padding: 6,
            borderRadius: ikoluTokens.borderRadius,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, {
            style: { fontSize: 15, color: "#1890ff" },
          })}
        </div>
        <Flex
          vertical
          gap={2}
          style={{ flex: 1, position: "relative", zIndex: 2 }}
        >
          <Flex align="center" gap={4}>
            <Text
              strong
              style={{
                fontSize: 10,
                color: ikoluTokens.colorCorporateBlue,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Text>
            {helpText && (
              <Tooltip title={helpText}>
                <InfoCircleOutlined
                  style={{ fontSize: 10, color: "#999", cursor: "help" }}
                />
              </Tooltip>
            )}
          </Flex>
          {variation !== undefined &&
            variation !== null &&
            Math.abs(variation) > 0.1 && (
            <Flex align="center" gap={3}>
                {variation > 0 ? (
                  <RiseOutlined style={{ color: ikoluTokens.colorSuccess, fontSize: 10 }} />
                ) : (
                <FallOutlined style={{ color: ikoluTokens.colorError, fontSize: 10 }} />
                )}
              <Text
                style={{
                  fontWeight: 700,
                  fontSize: 9,
                  color: variation > 0 ? "#52c41a" : "#ff4d4f",
                }}
              >
                  {variation > 0 ? "+" : ""}
                  {variationUnit
                    ? `${Math.abs(variation).toFixed(variationDecimals)} ${variationUnit}`
                    : `${variation.toFixed(variationDecimals)}%`}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>

      {loading ? (
        <div style={{ padding: "4px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div className="ikolu-shimmer-circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="ikolu-shimmer" style={{ width: "45%", height: 10, marginBottom: 6 }} />
              <div className="ikolu-shimmer" style={{ width: "65%", height: 18 }} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 2 }}>
          <Flex align="baseline" gap={4} style={{ marginBottom: 6 }} justify="space-between">
            <div
              style={{
                fontSize: ikoluTokens.fontSizeXL,
                fontWeight: 900,
                color: ikoluTokens.colorCorporateBlue,
                lineHeight: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#597ef7" }}>
              {unit}
            </div>
          </Flex>

          {extraInfo && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: ikoluTokens.colorGreyText,
                marginTop: 8,
                fontStyle: "italic",
                opacity: 0.8,
              }}
            >
              {extraInfo}
            </div>
          )}
          {syncStatus && (
            <div style={{ marginTop: 8 }}>
              <Tooltip title={syncStatus.status}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "2px 6px",
                    borderRadius: "20px",
                    backgroundColor: `${syncStatus.color}15`,
                    border: `1px solid ${syncStatus.color}40`,
                    boxShadow: `0 2px 4px ${syncStatus.color}10`,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      backgroundColor: syncStatus.color,
                      boxShadow: `0 0 5px ${syncStatus.color}`,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: syncStatus.color,
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    {syncStatus.status}
                  </Text>
                </div>
              </Tooltip>
            </div>
          )}
          {footer && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${ikoluTokens.colorBorderLight}` }}>
              {footer}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default React.memo(MetricCard);
