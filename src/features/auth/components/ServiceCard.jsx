import React from "react";
import { Card, Typography } from "antd";
import {
  ClusterOutlined,
  CloudOutlined,
  DashboardOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  ApiOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ICONS = {
  ClusterOutlined: <ClusterOutlined />,
  CloudOutlined: <CloudOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  ApiOutlined: <ApiOutlined />,
};

const ServiceCard = ({ title, description, icon }) => (
  <Card
    bordered={false}
    style={{
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: 16,
      backdropFilter: "blur(8px)",
      transition: "transform 0.2s ease, background 0.2s ease",
    }}
    bodyStyle={{ padding: 18 }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(255, 255, 255, 0.09)";
      e.currentTarget.style.transform = "translateY(-3px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: "linear-gradient(135deg, #3a89d2 0%, #203562 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        color: "#f2f5fa",
        fontSize: 18,
        boxShadow: "0 6px 16px rgba(32,53,98,0.35)",
      }}
    >
      {ICONS[icon] || <DashboardOutlined />}
    </div>
    <Text
      strong
      style={{
        color: "#f2f5fa",
        display: "block",
        marginBottom: 6,
        fontSize: 14,
      }}
    >
      {title}
    </Text>
    <Text style={{ color: "rgba(200, 214, 240, 0.65)", fontSize: 12, lineHeight: 1.5 }}>
      {description}
    </Text>
  </Card>
);

export default ServiceCard;
