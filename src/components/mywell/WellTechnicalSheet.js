import React from "react";
import { Card, Flex, Typography, Tag } from "antd";
import {
  DatabaseOutlined,
  IdcardOutlined,
  ArrowDownOutlined,
  ToolOutlined,
  AimOutlined,
  ExpandOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

/**
 * 🏗️ COMPONENTE WELL TECHNICAL SHEET
 *
 * Muestra la ficha técnica del punto de captación con información
 * detallada sobre configuración, DGA y especificaciones técnicas.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.profile - Perfil del punto de captación
 * @param {boolean} props.loading - Estado de carga
 */
const WellTechnicalSheet = ({ profile, loading = false }) => {
  // Usamos optional chaining para acceder a los datos de forma segura
  const config_data = profile?.config_data ?? {};
  const dga = profile?.dga ?? {};
  const title = profile?.title ?? "N/A";

  if (!profile) return null;

  // Componente para filas de información técnica
  const TechInfoRow = ({ icon, label, value, loading = false }) => (
    <Flex
      justify="space-between"
      align="center"
      style={{ padding: "4px 2px", borderBottom: "1px solid #f0f0f0" }}
    >
      <Flex align="center" gap="small">
        {icon}
        <Text type="secondary" style={{ fontSize: 11 }}>
          {label}
        </Text>
      </Flex>
      {loading ? (
        <div
          style={{
            width: "60px",
            height: "14px",
            background:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
            borderRadius: "3px",
          }}
        />
      ) : (
        <Text strong style={{ fontSize: 12 }}>
          {value}
        </Text>
      )}
    </Flex>
  );

  // Componente para títulos de sección
  const SectionTitle = ({ children }) => (
    <Text
      style={{
        display: "block",
        color: "#8c8c8c",
        fontWeight: 500,
        marginTop: "6px",
        marginBottom: "2px",
        paddingLeft: "2px",
        fontSize: 10,
      }}
    >
      {children}
    </Text>
  );

  // Formateador de números con puntos como separador de miles
  const numberForMiles = new Intl.NumberFormat("de-DE");

  return (
    <Card
      title={
        <Flex align="center" gap="small">
          <DatabaseOutlined /> Ficha Técnica
        </Flex>
      }
      style={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        height: "100%",
      }}
    >
      <div style={{ padding: "0 4px" }}>
        <TechInfoRow
          icon={<IdcardOutlined />}
          label="DGA"
          value={<Text copyable>{dga.code_dga || "N/A"}</Text>}
          loading={loading}
        />
        <TechInfoRow
          icon={<IdcardOutlined />}
          label="Nombre"
          value={title}
          loading={loading}
        />
        <TechInfoRow
          icon={<ArrowDownOutlined />}
          label="Profundidad"
          value={`${parseFloat(config_data.d1 || 0).toFixed(2)} m`}
          loading={loading}
        />

        <SectionTitle>Posicionamientos</SectionTitle>
        <TechInfoRow
          icon={<ToolOutlined />}
          label="Bomba"
          value={`${parseFloat(config_data.d2 || 0).toFixed(2)} m`}
          loading={loading}
        />
        <TechInfoRow
          icon={<AimOutlined />}
          label="Nivel"
          value={`${parseFloat(config_data.d3 || 0).toFixed(2)} m`}
          loading={loading}
        />

        <SectionTitle>Diámetros</SectionTitle>
        <TechInfoRow
          icon={<ExpandOutlined />}
          label="Ducto"
          value={`${parseFloat(config_data.d4 || 0).toFixed(2)} pulg`}
          loading={loading}
        />
        <TechInfoRow
          icon={<ExpandOutlined />}
          label="Flujómetro"
          value={`${parseFloat(config_data.d5 || 0).toFixed(2)} pulg`}
          loading={loading}
        />

        <SectionTitle>Totalizador</SectionTitle>
        <TechInfoRow
          icon={<CalculatorOutlined />}
          label="m³ Iniciales"
          value={`${numberForMiles.format(config_data.d6 || 0)}`}
          loading={loading}
        />

        {/* Información adicional del perfil */}
        <SectionTitle>Configuración</SectionTitle>
        <TechInfoRow
          icon={<DatabaseOutlined />}
          label="Tipo DGA"
          value={
            <Tag color={dga.type_dga === "SUBTERRANEO" ? "blue" : "green"}>
              {dga.type_dga || "N/A"}
            </Tag>
          }
          loading={loading}
        />
        <TechInfoRow
          icon={<DatabaseOutlined />}
          label="Estándar"
          value={<Tag color="orange">{dga.standard || "N/A"}</Tag>}
          loading={loading}
        />
      </div>
    </Card>
  );
};

export default WellTechnicalSheet;
