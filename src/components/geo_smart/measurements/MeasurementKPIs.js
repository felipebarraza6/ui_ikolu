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
  <div className="ocean-stat-pill" style={{ border: `1px solid ${color}30` }}>
    {typeof label === 'string' ? (
      <Text className="ocean-text-xs ocean-text-muted ocean-uppercase ocean-letter-spacing" style={{ display: "block", lineHeight: 1.2, marginBottom: 2, fontWeight: 500 }}>{label}</Text>
    ) : label}
    <Text strong style={{ fontSize: 15, color: valueColor || color, display: "block", lineHeight: 1.2 }}>{value}</Text>
    {sub && <Text style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.4)", lineHeight: 1.2, marginTop: 2, fontWeight: sub === 'TOTAL' ? 700 : 400, textTransform: sub === 'TOTAL' ? 'uppercase' : 'none' }}>{sub}</Text>}
  </div>
);

export const MetricCard = ({ title, icon, kpis, children }) => {
  const { token } = useToken();
  return (
    <div className="ocean-metric-card">
      <div className="ocean-metric-header">
        <Flex align="center" gap={8}>
          {icon}
          <Text className="ocean-text-base ocean-text-primary ocean-font-semibold">{title}</Text>
        </Flex>
      </div>
      {kpis && (
        <div className="ocean-metric-kpis">
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
