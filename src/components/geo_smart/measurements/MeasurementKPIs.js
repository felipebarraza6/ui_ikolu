import React from "react";
import { Flex, Typography, theme } from "antd";
import { extractRecordNum } from "./MeasurementUtils";

const { Text } = Typography;
const { useToken } = theme;

export const TrendArrow = ({ current, previous }) => {
  if (previous == null || current == null) return null;
  const cur = extractRecordNum(current);
  const prev = extractRecordNum(previous);
  if (cur == null || prev == null || cur === prev) return null;
  const up = cur > prev;
  return (
    <span style={{ fontSize: 9, marginLeft: 4, color: up ? "#1890ff" : "#52c41a" }}>
      {up ? "▲" : "▼"}
    </span>
  );
};

export const StatPill = ({ label, value, sub, color, valueColor }) => (
  <div style={{
    textAlign: "center",
    minWidth: 90,
    flex: "0 0 auto",
    padding: "8px 12px",
    background: `linear-gradient(180deg, ${color}08 0%, ${color}03 100%)`,
    borderRadius: 8,
    border: `1px solid ${color}20`,
  }}>
    {typeof label === 'string' ? (
      <Text style={{ fontSize: 9, color: "#8c8c8c", display: "block", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, fontWeight: 500 }}>{label}</Text>
    ) : label}
    <Text strong style={{ fontSize: 15, color: valueColor || color, display: "block", lineHeight: 1.2 }}>{value}</Text>
    {sub && <Text style={{ fontSize: 10, color: "#8c8c8c", lineHeight: 1.2, marginTop: 2, fontWeight: sub === 'TOTAL' ? 700 : 400, textTransform: sub === 'TOTAL' ? 'uppercase' : 'none' }}>{sub}</Text>}
  </div>
);

export const MetricCard = ({ title, icon, kpis, children }) => {
  const { token } = useToken();
  return (
    <div style={{
      background: `linear-gradient(180deg, ${token.colorBgContainer} 0%, #f0f7ff 100%)`,
      borderRadius: 12,
      border: `1px solid ${token.colorBorderSecondary}`,
      overflow: "visible",
      boxShadow: `0 2px 8px ${token.colorBorderSecondary}20`,
    }}>
      <div style={{
        padding: "12px 12px",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: `linear-gradient(90deg, ${token.colorPrimary}08 0%, transparent 100%)`,
      }}>
        <Flex align="center" gap={8}>
          {icon}
          <Text strong style={{ fontSize: 13, color: token.colorText }}>{title}</Text>
        </Flex>
      </div>
      {kpis && (
        <div style={{ padding: "10px 8px", borderBottom: `1px solid ${token.colorBorderSecondary}`, background: `${token.colorPrimary}03` }}>
          <Flex gap={8} wrap="nowrap" justify="center">
            {kpis}
          </Flex>
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
};
