import { Flex, Typography, Button, Tag } from "antd";
import React from "react";
import { useLocation } from "react-router-dom";
import { useUserProfiles } from "../../hooks/useUserProfiles";
import { useTelemetryData } from "../../hooks/useTelemetryData";
import { ReloadOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * 🧭 COMPONENTE PAGE HEADER
 *
 * Muestra la información del punto de captación y navegación
 * Se usa en el contenido principal de cada página
 */
const PageHeader = ({ title, showRefresh = true, onRefresh }) => {
  const location = useLocation();
  const { selectedProfile } = useUserProfiles();
  const { frecuency, nextMeasurement } = useTelemetryData(selectedProfile?.id);

  // Función para obtener el nombre del módulo actual
  const getModuleName = () => {
    if (location.pathname === "/") return "Centro de Control";
    if (location.pathname === "/geo") return "GEO Smart";
    if (location.pathname === "/telemetria") return "Telemetría";
    if (location.pathname === "/analisis") return "Smart Análisis";
    if (location.pathname === "/dga") return "DGA - MEE";
    if (location.pathname === "/dga_analisis") return "DGA Análisis";
    if (location.pathname === "/descarga") return "Descarga";
    if (location.pathname === "/documentos") return "Documentos";
    if (location.pathname === "/alertas") return "Alertas";
    if (location.pathname === "/soporte") return "Soporte";
    return "Módulo";
  };

  // Función para formatear el tiempo restante
  const formatTimeRemaining = () => {
    if (!nextMeasurement) return "Cargando...";

    const now = new Date();
    const next = new Date(nextMeasurement);
    const diff = next - now;

    if (diff <= 0) return "Ahora";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "24px",
        border: "1px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        style={{ marginBottom: "16px" }}
      >
        {/* Título y breadcrumb */}
        <Flex vertical gap="8px">
          <Title level={3} style={{ margin: 0, color: "#1F3461" }}>
            {title || getModuleName()}
          </Title>

          {/* Breadcrumb */}
          <Flex align="center" gap="8px">
            <Text style={{ color: "#666", fontSize: "14px" }}>
              {selectedProfile?.title || "Punto de Captación"}
            </Text>
            <Text style={{ color: "#ccc" }}>{">"}</Text>
            <Text style={{ color: "#1F3461", fontWeight: "500" }}>
              {getModuleName()}
            </Text>
          </Flex>
        </Flex>

        {/* Información de frecuencia y botón de actualizar */}
        <Flex align="center" gap="16px">
          {/* Frecuencia de medición */}
          <Flex align="center" gap="8px">
            <ClockCircleOutlined style={{ color: "#666" }} />
            <Text style={{ color: "#666", fontSize: "14px" }}>
              Frecuencia: {frecuency || "N/A"} min
            </Text>
          </Flex>

          {/* Próxima medición */}
          <Tag color="blue" style={{ fontSize: "12px" }}>
            Próxima: {formatTimeRemaining()}
          </Tag>

          {/* Botón de actualizar */}
          {showRefresh && (
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              style={{
                background: "#1F3461",
                borderColor: "#1F3461",
                borderRadius: "8px",
              }}
            >
              Actualizar Datos
            </Button>
          )}
        </Flex>
      </Flex>
    </div>
  );
};

export default PageHeader;
