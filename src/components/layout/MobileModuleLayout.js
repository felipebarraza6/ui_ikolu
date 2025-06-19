import React from "react";
import { Card, Space, Typography, Divider } from "antd";
import { useResponsive } from "../../hooks/useResponsive";

const { Text, Title } = Typography;

/**
 * Layout específico para módulos de sensores como el que veo en tu captura
 * Optimizado para mostrar datos de pozos/sensores en móvil
 */
const MobileModuleLayout = ({
  children,
  moduleTitle,
  moduleCode,
  headerColor = "#1f3461",
  backgroundColor = "#f0f2f5",
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();

  // Estilos optimizados basados en tu captura
  const containerStyle = {
    width: "100%",
    minHeight: "100vh",
    background: backgroundColor,
    margin: 0,
    padding: 0,
  };

  const headerStyle = {
    background: headerColor,
    color: "white",
    padding: isMobile ? "16px 12px" : "20px 16px",
    margin: 0,
    textAlign: "center",
    position: "relative",
    borderRadius: 0, // Sin bordes redondeados para usar toda la pantalla
  };

  const moduleCodeStyle = {
    position: "absolute",
    top: isMobile ? 8 : 12,
    right: isMobile ? 12 : 16,
    background: "rgba(255,255,255,0.2)",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: isMobile ? 10 : 12,
    fontWeight: "normal",
  };

  const moduleTitleStyle = {
    margin: 0,
    fontSize: isMobile ? 18 : 22,
    fontWeight: "bold",
  };

  const contentStyle = {
    padding: isMobile ? 12 : 16,
    background: "white",
    minHeight: "calc(100vh - 60px)", // Restar altura del header
  };

  const cardWrapperStyle = {
    marginBottom: isMobile ? 12 : 16,
  };

  // Función para mejorar cards automáticamente
  const enhanceCards = (element) => {
    if (!React.isValidElement(element)) {
      return element;
    }

    // Si es un Card, aplicar estilos móvil optimizados
    if (element.type === Card) {
      const enhancedProps = {
        ...element.props,
        style: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #f0f0f0",
          marginBottom: isMobile ? 12 : 16,
          ...element.props.style,
        },
        bodyStyle: {
          padding: isMobile ? 16 : 20,
          ...element.props.bodyStyle,
        },
      };

      return React.cloneElement(element, enhancedProps);
    }

    // Procesar children recursivamente
    if (element.props && element.props.children) {
      const enhancedChildren = React.Children.map(
        element.props.children,
        enhanceCards
      );

      return React.cloneElement(element, {
        ...element.props,
        children: enhancedChildren,
      });
    }

    return element;
  };

  return (
    <div style={containerStyle} {...props}>
      {/* Header del módulo */}
      <div style={headerStyle}>
        {moduleCode && <div style={moduleCodeStyle}>{moduleCode}</div>}

        {moduleTitle && (
          <Title level={3} style={moduleTitleStyle}>
            {moduleTitle}
          </Title>
        )}
      </div>

      {/* Contenido principal */}
      <div style={contentStyle}>
        <Space
          direction="vertical"
          size={isMobile ? 12 : 16}
          style={{ width: "100%" }}
        >
          {React.Children.map(children, enhanceCards)}
        </Space>
      </div>
    </div>
  );
};

/**
 * Variante específica para datos de sensores
 */
export const SensorModuleLayout = ({
  sensorData = [],
  moduleTitle,
  moduleCode,
  ...props
}) => {
  const { isMobile } = useResponsive();

  const renderSensorCard = (sensor, index) => {
    const { icon, label, value, unit, time, color = "#1f3461" } = sensor;

    return (
      <Card
        key={index}
        style={{
          textAlign: "center",
          borderLeft: `4px solid ${color}`,
        }}
      >
        {/* Icono del sensor */}
        {icon && (
          <div
            style={{
              fontSize: isMobile ? 28 : 32,
              marginBottom: 8,
              color: color,
            }}
          >
            {icon}
          </div>
        )}

        {/* Label del sensor */}
        {label && (
          <Text
            style={{
              display: "block",
              fontSize: isMobile ? 12 : 14,
              color: "#666",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            {label}
          </Text>
        )}

        {/* Valor principal */}
        <div
          style={{
            fontSize: isMobile ? 20 : 24,
            fontWeight: "bold",
            color: color,
            marginBottom: 4,
          }}
        >
          {value}
          {unit && (
            <span
              style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: "normal",
                marginLeft: 4,
              }}
            >
              {unit}
            </span>
          )}
        </div>

        {/* Tiempo */}
        {time && (
          <Text
            style={{
              fontSize: isMobile ? 11 : 12,
              color: "#999",
            }}
          >
            {time}
          </Text>
        )}
      </Card>
    );
  };

  return (
    <MobileModuleLayout
      moduleTitle={moduleTitle}
      moduleCode={moduleCode}
      {...props}
    >
      {sensorData.map(renderSensorCard)}
    </MobileModuleLayout>
  );
};

export default MobileModuleLayout;
