import React from "react";
import { Card, Row, Col, Typography, Divider } from "antd";
import { useResponsive } from "../../hooks/useResponsive";
import {
  formatVolume,
  formatFlow,
  formatLevel,
} from "../../utils/numberFormatter";

const { Text, Title } = Typography;

/**
 * Componente optimizado para mostrar cards de datos como las de tu captura
 * Mejora específicamente el layout de información de sensores/módulos
 */
const MobileDataCards = ({
  data = [],
  moduleTitle = "MÓDULO",
  showTime = true,
  cardStyle = {},
  ...props
}) => {
  const { isMobile, isTablet, getSpacing } = useResponsive();

  // Estilos optimizados según la captura
  const containerStyle = {
    padding: isMobile ? 12 : 16,
    background: "#f0f2f5",
    minHeight: "100vh",
  };

  const headerStyle = {
    background: "#1f3461",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px 8px 0 0",
    marginBottom: 0,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: isMobile ? 16 : 18,
  };

  const dataCardStyle = {
    marginBottom: 16,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "none",
    overflow: "hidden",
    ...cardStyle,
  };

  const valueStyle = {
    fontSize: isMobile ? 24 : 28,
    fontWeight: "bold",
    color: "#1f3461",
    margin: 0,
  };

  const labelStyle = {
    fontSize: isMobile ? 14 : 16,
    color: "#666",
    marginBottom: 8,
    fontWeight: 500,
  };

  const unitStyle = {
    fontSize: isMobile ? 16 : 18,
    color: "#1f3461",
    fontWeight: 600,
  };

  const timeStyle = {
    fontSize: isMobile ? 12 : 14,
    color: "#999",
    marginTop: 4,
  };

  // Función para renderizar cada card de dato
  const renderDataCard = (item, index) => {
    const { icon, label, value, unit, time, type } = item;

    // Formatear valor según el tipo
    let formattedValue = value;
    if (type === "volume") formattedValue = formatVolume(value);
    else if (type === "flow") formattedValue = formatFlow(value);
    else if (type === "level") formattedValue = formatLevel(value);

    return (
      <Card
        key={index}
        style={dataCardStyle}
        bodyStyle={{
          padding: isMobile ? 16 : 20,
          textAlign: "center",
        }}
      >
        {/* Icono */}
        {icon && (
          <div
            style={{
              fontSize: isMobile ? 32 : 40,
              marginBottom: 12,
              color: "#1f3461",
            }}
          >
            {typeof icon === "string" ? <span>{icon}</span> : icon}
          </div>
        )}

        {/* Label */}
        {label && <div style={labelStyle}>{label}</div>}

        {/* Valor principal */}
        <div style={valueStyle}>
          {formattedValue}
          {unit && <span style={unitStyle}> {unit}</span>}
        </div>

        {/* Tiempo */}
        {showTime && time && <div style={timeStyle}>{time}</div>}
      </Card>
    );
  };

  // Configuración de columnas según dispositivo
  const getColSpan = () => {
    if (isMobile) return { xs: 24, sm: 24 }; // 1 columna en móvil
    if (isTablet) return { xs: 24, sm: 12, md: 12 }; // 2 columnas en tablet
    return { xs: 24, sm: 12, md: 8, lg: 6 }; // Hasta 4 columnas en desktop
  };

  return (
    <div style={containerStyle} {...props}>
      {/* Header del módulo */}
      {moduleTitle && <div style={headerStyle}>{moduleTitle}</div>}

      {/* Cards de datos */}
      <div
        style={{
          padding: isMobile ? 8 : 16,
          background: "white",
          borderRadius: "0 0 8px 8px",
          marginBottom: 16,
        }}
      >
        <Row gutter={[16, 16]}>
          {data.map((item, index) => (
            <Col key={index} {...getColSpan()}>
              {renderDataCard(item, index)}
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

/**
 * Componente de ejemplo con datos como los de tu captura
 */
export const EjemploDataCards = () => {
  const datosEjemplo = [
    {
      icon: "🕐",
      label: "Última Medición",
      value: "86",
      unit: "(m³)",
      time: "13:00 hrs",
      type: "volume",
    },
    {
      icon: "⚡",
      label: "Caudal",
      value: "0.00",
      unit: "(L/s)",
      type: "flow",
    },
    {
      icon: "🌊",
      label: "Nivel Freático",
      value: "20.9",
      unit: "(m)",
      type: "level",
    },
    {
      icon: "💧",
      label: "Acumulado",
      value: "351566",
      unit: "(m³)",
      type: "volume",
    },
  ];

  return (
    <MobileDataCards
      data={datosEjemplo}
      moduleTitle="MÓDULO B"
      showTime={true}
    />
  );
};

export default MobileDataCards;
