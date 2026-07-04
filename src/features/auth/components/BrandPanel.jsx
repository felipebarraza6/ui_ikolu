import React from "react";
import { Typography, Spin, Tag, Flex, Button } from "antd";
import {
  TeamOutlined,
  DeploymentUnitOutlined,
  DashboardOutlined,
  AimOutlined,
  WifiOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import logoBlanco from "../../../assets/images/logo-blanco.png";
import WaterBackground from "./WaterBackground";

const { Text } = Typography;

const ICONS = {
  TeamOutlined: <TeamOutlined />,
  DeploymentUnitOutlined: <DeploymentUnitOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  AimOutlined: <AimOutlined />,
  WifiOutlined: <WifiOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
};

const BrandPanel = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="login-brand">
        <WaterBackground />
        <Flex
          align="center"
          justify="center"
          style={{ height: "100%", position: "relative", zIndex: 1 }}
        >
          <Spin size="large" style={{ color: "#c9d936" }} />
        </Flex>
      </div>
    );
  }

  const { company } = data;
  const { dga, sma, social, services, stats, sectors } = company;

  return (
    <div className="login-brand">
      <WaterBackground />

      <div className="login-brand-content">
        <Flex
          justify="space-between"
          align="center"
          wrap
          gap="16px"
          style={{ marginBottom: 22 }}
        >
          <img
            src={logoBlanco}
            alt={company.name}
            style={{
              maxWidth: 190,
              width: "100%",
              height: "auto",
              filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.35))",
            }}
          />

          <Flex gap="10px" align="center" wrap>
            <Button
              type="link"
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              icon={<GlobalOutlined />}
              style={{
                padding: "6px 12px",
                height: "auto",
                color: "rgba(240,244,250,0.8)",
                fontSize: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(240,244,250,0.8)";
              }}
            >
              smarthydro.cl
            </Button>

            <a
              href={social.facebook}
              aria-label="Facebook"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(240,244,250,0.8)",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(240,244,250,0.8)";
              }}
            >
              <FacebookOutlined />
            </a>
            <a
              href={social.instagram}
              aria-label="Instagram"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(240,244,250,0.8)",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(240,244,250,0.8)";
              }}
            >
              <InstagramOutlined />
            </a>
          </Flex>
        </Flex>

        <div style={{ marginBottom: 14 }}>
          <Text
            style={{
              color: "#f2f5fa",
              fontSize: "clamp(1.3rem, 2vw, 1.7rem)",
              fontWeight: 700,
              display: "block",
              lineHeight: 1.2,
              marginBottom: 6,
            }}
          >
            Gestión Inteligente de Aguas Subterráneas
          </Text>
          <Text
            style={{
              color: "rgba(200, 214, 240, 0.85)",
              fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
              display: "block",
              lineHeight: 1.4,
              marginBottom: 8,
            }}
          >
            Monitoreo Avanzado y Cumplimiento Normativo en Tiempo Real
          </Text>
          <Text
            style={{
              color: "rgba(200, 214, 240, 0.6)",
              fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)",
              display: "block",
              maxWidth: 500,
              lineHeight: 1.55,
            }}
          >
            Descubre cómo nuestra tecnología de vanguardia puede transformar la
            operación hídrica de tu empresa y asegurar el cumplimiento normativo
            DGA/SMA.
          </Text>
        </div>

        {/* Badges DGA + SMA */}
        <Flex wrap gap="10px" style={{ marginBottom: 18 }}>
          <a
            href={dga.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(201, 217, 54, 0.12)",
              border: "1px solid rgba(201, 217, 54, 0.3)",
              borderRadius: 12,
              padding: "8px 12px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201, 217, 54, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(201, 217, 54, 0.12)";
            }}
          >
            <SafetyCertificateOutlined style={{ color: "#c9d936", fontSize: 16 }} />
            <Text
              style={{
                color: "#eef3b3",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                lineHeight: 1,
              }}
            >
              {dga.badge}
            </Text>
          </a>

          <a
            href={sma.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(58, 137, 210, 0.12)",
              border: "1px solid rgba(58, 137, 210, 0.3)",
              borderRadius: 12,
              padding: "8px 12px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(58, 137, 210, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(58, 137, 210, 0.12)";
            }}
          >
            <CheckCircleOutlined style={{ color: "#3a89d2", fontSize: 16 }} />
            <Text
              style={{
                color: "#d6e8fb",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                lineHeight: 1,
              }}
            >
              {sma.badge}
            </Text>
          </a>
        </Flex>

        <Flex wrap gap="8px" style={{ marginBottom: 22 }}>
          {sectors.map((sector) => (
            <Tag
              key={sector}
              style={{
                background: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.12)",
                color: "rgba(240,244,250,0.75)",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                padding: "3px 12px",
              }}
            >
              {sector}
            </Tag>
          ))}
        </Flex>

        {/* Servicios */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 22,
            maxWidth: 520,
          }}
        >
          {services.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 14,
                padding: "14px 12px",
                minHeight: 72,
                display: "flex",
                flexDirection: "column",
                backdropFilter: "blur(10px)",
                transition: "transform 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "linear-gradient(135deg, #c9d936 0%, #3a89d2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                  color: "#041126",
                  fontSize: 15,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
                }}
              >
                {ICONS[item.icon] || <CheckCircleOutlined />}
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
                {item.title}
              </Text>
              <Text
                style={{
                  color: "rgba(200, 214, 240, 0.55)",
                  fontSize: 10,
                  lineHeight: 1.4,
                  display: "block",
                }}
              >
                {item.description.length > 60
                  ? `${item.description.slice(0, 60)}...`
                  : item.description}
              </Text>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
            maxWidth: 420,
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 72,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.key === "points" ? "#3a89d2" : "#c9d936",
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {ICONS[stat.icon] || <CheckCircleOutlined />}
              </div>
              <div style={{ minWidth: 0 }}>
                <Text
                  style={{
                    color: "#f2f5fa",
                    fontSize: 18,
                    fontWeight: 800,
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    color: "rgba(200,214,240,0.5)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {stat.label}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandPanel;
