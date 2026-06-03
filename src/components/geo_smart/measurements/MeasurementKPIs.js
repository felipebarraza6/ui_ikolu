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
    <span className={up ? "ocean-trend-up" : "ocean-trend-down"}>
      {up ? "▲" : "▼"}
    </span>
  );
};

export const StatPill = ({ label, value, sub, color, valueColor }) => (
  <div className="ocean-stat-pill" style={{ border: `1px solid ${color}30` }}>
    {typeof label === 'string' ? (
      <Text className="ocean-text-xs ocean-text-muted ocean-uppercase ocean-letter-spacing ocean-stat-label">{label}</Text>
    ) : label}
    <Text strong className="ocean-stat-value" style={{ color: valueColor || color }}>{value}</Text>
    {sub && <Text className="ocean-stat-sub" style={{ fontWeight: sub === 'TOTAL' ? 700 : 400, textTransform: sub === 'TOTAL' ? 'uppercase' : 'none' }}>{sub}</Text>}
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
