import React from "react";
import { Flex, Typography } from "antd";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { extractRecordNum } from "./MeasurementUtils";

const { Text } = Typography;

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
  <div style={{ textAlign: "center", minWidth: 90, flex: "0 0 auto", padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 10, border: `1px solid ${color}30`, backdropFilter: "blur(10px)" }}>
    {typeof label === 'string' ? (
      <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, display: "block", lineHeight: 1.2, marginBottom: 2 }}>{label}</Text>
    ) : label}
    <Text strong style={{ fontSize: 15, display: "block", lineHeight: 1.2, color: valueColor || color }}>{value}</Text>
    {sub && <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.2, marginTop: 2, fontWeight: sub === 'TOTAL' ? 700 : 400, textTransform: sub === 'TOTAL' ? 'uppercase' : 'none' }}>{sub}</Text>}
  </div>
);

export const MetricCard = ({ title, icon, kpis, children }) => {
  const token = useIkoluToken();
  return (
    <div style={{ background: token.glassBg, borderRadius: token.voidRadius, border: `1px solid ${token.glassBorder}`, overflow: "visible", backdropFilter: "blur(10px)", boxShadow: token.voidShadow }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${token.voidBorder}`, background: `linear-gradient(90deg, ${token.voidSurface} 0%, transparent 100%)` }}>
        <Flex align="center" gap={8}>
          {icon}
          <Text style={{ fontSize: 13, color: token.voidTextHeading, fontWeight: 600 }}>{title}</Text>
        </Flex>
      </div>
      {kpis && (
        <div style={{ padding: "10px 8px", borderBottom: `1px solid ${token.voidBorder}`, background: token.voidSurface }}>
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
