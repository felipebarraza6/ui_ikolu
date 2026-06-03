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
    <span style={{ fontSize: 9, marginLeft: 4, color: up ? "#00B4D8" : "#2A9D8F" }}>
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
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    border: `1px solid ${color}30`,
    backdropFilter: 'blur(10px)',
  }}>
    {typeof label === 'string' ? (
      <Text style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.5)", display: "block", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, fontWeight: 500 }}>{label}</Text>
    ) : label}
    <Text strong style={{ fontSize: 15, color: valueColor || color, display: "block", lineHeight: 1.2 }}>{value}</Text>
    {sub && <Text style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", lineHeight: 1.2, marginTop: 2, fontWeight: sub === 'TOTAL' ? 700 : 400, textTransform: sub === 'TOTAL' ? 'uppercase' : 'none' }}>{sub}</Text>}
  </div>
);

export const MetricCard = ({ title, icon, kpis, children }) => {
  const { token } = useToken();
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 16,
      border: '1px solid rgba(0, 180, 216, 0.15)',
      overflow: "visible",
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
    }}>
      <div style={{
        padding: "12px 16px",
        borderBottom: '1px solid rgba(0, 180, 216, 0.1)',
        background: 'linear-gradient(90deg, rgba(0, 180, 216, 0.08) 0%, transparent 100%)',
      }}>
        <Flex align="center" gap={8}>
          {icon}
          <Text strong style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.9)' }}>{title}</Text>
        </Flex>
      </div>
      {kpis && (
        <div style={{ padding: "10px 8px", borderBottom: '1px solid rgba(0, 180, 216, 0.1)', background: 'rgba(0, 180, 216, 0.03)' }}>
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
