import React, { useState } from "react";
import {
  Layout,
  Space,
  Typography,
  Button,
  Select,
  Avatar,
  Divider,
} from "antd";
import {
  EnvironmentOutlined,
  ReloadOutlined,
  SettingOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useResponsive } from "../../hooks/useResponsive";
import logo from "../../assets/images/logozivo.png";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 🎨 Layout moderno con navegación superior y distribución fluida
 * Indicadores arriba, información del punto de captación abajo, todo responsivo
 */
const ModernAppLayout = ({
  children,
  currentPoint = "Punto Central",
  points = ["Punto Central", "Punto Norte", "Punto Sur"],
  onPointChange,
  indicators = [],
  moduleTitle = "MÓDULO B",
  moduleCode = "UB-030277",
  ...props
}) => {
  const { isMobile } = useResponsive();
  const [selectedPoint, setSelectedPoint] = useState(currentPoint);

  const handlePointChange = (value) => {
    setSelectedPoint(value);
    if (onPointChange) {
      onPointChange(value);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }} {...props}>
      {/* Header/Navegación Superior */}
      <Header
        style={{
          background: "#1f3461",
          padding: 0,
          height: isMobile ? 60 : 70,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "0 12px" : "0 24px",
            height: "100%",
          }}
        >
          {/* Logo y Nombre */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 8 : 12,
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                height: isMobile ? 28 : 32,
                width: "auto",
              }}
            />
            {!isMobile && (
              <div>
                <Title
                  level={4}
                  style={{
                    color: "white",
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  Ikolu App
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                  Smart Hydro Monitoring
                </Text>
              </div>
            )}
          </div>

          {/* Selector de Puntos */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 8 : 16,
              flex: 1,
              justifyContent: "center",
            }}
          >
            <EnvironmentOutlined style={{ color: "white", fontSize: 16 }} />
            <Select
              value={selectedPoint}
              onChange={handlePointChange}
              style={{
                minWidth: isMobile ? 120 : 200,
                maxWidth: isMobile ? 150 : 250,
              }}
              size={isMobile ? "middle" : "large"}
            >
              {points.map((point) => (
                <Option key={point} value={point}>
                  {point}
                </Option>
              ))}
            </Select>
          </div>

          {/* Acciones */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 4 : 8,
            }}
          >
            <Button
              type="text"
              icon={<ReloadOutlined />}
              style={{ color: "white" }}
              size={isMobile ? "small" : "middle"}
            />
            {!isMobile && (
              <Button
                type="text"
                icon={<SettingOutlined />}
                style={{ color: "white" }}
              />
            )}
          </div>
        </div>
      </Header>

      {/* Contenido Principal */}
      <Content
        style={{
          marginTop: isMobile ? 60 : 70,
          padding: 0,
          minHeight: `calc(100vh - ${isMobile ? 60 : 70}px)`,
          background: "#f0f2f5",
        }}
      >
        <div
          style={{
            padding: isMobile ? 12 : 24,
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 16 : 24,
            minHeight: `calc(100vh - ${isMobile ? 84 : 118}px)`,
          }}
        >
          {/* Header del Módulo */}
          <div
            style={{
              background: "#1f3461",
              color: "white",
              padding: isMobile ? "16px 20px" : "20px 24px",
              borderRadius: "12px 12px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Title
                level={3}
                style={{
                  color: "white",
                  margin: 0,
                  fontSize: isMobile ? 18 : 22,
                }}
              >
                {moduleTitle}
              </Title>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "4px 12px",
                borderRadius: 6,
                fontSize: isMobile ? 11 : 12,
                fontWeight: 500,
              }}
            >
              {moduleCode}
            </div>
          </div>

          {/* Sección de Indicadores (Arriba) */}
          <div
            style={{
              background: "white",
              borderRadius: "0 0 12px 12px",
              padding: isMobile ? 16 : 20,
              marginBottom: isMobile ? 16 : 20,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Title
              level={5}
              style={{
                margin: "0 0 16px 0",
                color: "#1f3461",
                fontSize: isMobile ? 14 : 16,
              }}
            >
              📊 Indicadores en Tiempo Real
            </Title>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(auto-fit, minmax(150px, 1fr))"
                  : "repeat(auto-fit, minmax(200px, 1fr))",
                gap: isMobile ? 12 : 16,
              }}
            >
              {indicators.length > 0 ? (
                indicators.map((indicator, index) => (
                  <div
                    key={index}
                    style={{
                      padding: isMobile ? 12 : 16,
                      background: "#f8f9fa",
                      borderRadius: 8,
                      textAlign: "center",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{ fontSize: isMobile ? 20 : 24, marginBottom: 4 }}
                    >
                      {indicator.icon}
                    </div>
                    <Text
                      style={{
                        fontSize: isMobile ? 11 : 12,
                        color: "#6c757d",
                        display: "block",
                      }}
                    >
                      {indicator.label}
                    </Text>
                    <div
                      style={{
                        fontSize: isMobile ? 16 : 18,
                        fontWeight: "bold",
                        color: "#1f3461",
                        marginTop: 4,
                      }}
                    >
                      {indicator.value}{" "}
                      <span
                        style={{
                          fontWeight: "normal",
                          fontSize: isMobile ? 12 : 14,
                        }}
                      >
                        {indicator.unit}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: 20,
                    color: "#6c757d",
                  }}
                >
                  Indicadores se cargarán automáticamente
                </div>
              )}
            </div>
          </div>

          {/* Información del Punto de Captación (Abajo) */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? 16 : 20,
              flex: 1,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Title
              level={5}
              style={{
                margin: "0 0 16px 0",
                color: "#1f3461",
                fontSize: isMobile ? 14 : 16,
              }}
            >
              🏗️ Información del Punto de Captación
            </Title>

            {/* Aquí va el contenido del punto de captación */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 12 : 16,
                flex: 1,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ModernAppLayout;
