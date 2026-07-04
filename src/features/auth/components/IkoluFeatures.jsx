import React from "react";
import { Typography, Flex, Button } from "antd";
import {
  ControlOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  AlertOutlined,
  RobotOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import VoidCubeLogo from "./VoidCubeLogo";

const { Title, Text } = Typography;

const IKOLU_COLOR = "#ffffff";

const ICONS = {
  ControlOutlined: <ControlOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  CustomerServiceOutlined: <CustomerServiceOutlined />,
  SettingOutlined: <SettingOutlined />,
  AlertOutlined: <AlertOutlined />,
  RobotOutlined: <RobotOutlined />,
};

const IkoluFeatures = ({ platform, onBack }) => {
  if (!platform) return null;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <VoidCubeLogo size={56} />

      <div style={{ textAlign: "center", marginBottom: 24, marginTop: 14 }}>
        <Title
          level={4}
          style={{
            color: "#f2f5fa",
            margin: 0,
            fontWeight: 700,
            fontSize: "1.4rem",
          }}
        >
          Novedades
        </Title>
        <Text
          style={{
            color: "rgba(200, 214, 240, 0.5)",
            fontSize: 12,
            display: "block",
            marginTop: 4,
          }}
        >
          {platform.tagline}
        </Text>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          width: "100%",
          marginBottom: 20,
        }}
      >
        {platform.features.map((feature) => (
          <div
            key={feature.id}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: "14px 12px",
              transition: "transform 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.09)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg, #ffffff 0%, #9fb3c8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
                color: "#041126",
                fontSize: 14,
              }}
            >
              {ICONS[feature.icon] || <ControlOutlined />}
            </div>
            <Text
              strong
              style={{
                color: "#f2f5fa",
                display: "block",
                fontSize: 12,
                marginBottom: 3,
              }}
            >
              {feature.title}
            </Text>
            <Text
              style={{
                color: "rgba(200, 214, 240, 0.55)",
                fontSize: 10,
                lineHeight: 1.4,
                display: "block",
              }}
            >
              {feature.description}
            </Text>
          </div>
        ))}
      </div>

      <Flex justify="center">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{
            color: "rgba(200,214,240,0.6)",
            fontSize: 13,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = IKOLU_COLOR)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(200,214,240,0.6)")
          }
        >
          Volver al acceso
        </Button>
      </Flex>
    </div>
  );
};

export default IkoluFeatures;
