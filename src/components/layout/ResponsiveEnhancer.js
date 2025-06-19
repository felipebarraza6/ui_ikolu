import React from "react";
import { ConfigProvider, Button, Input, Table, Form, Card } from "antd";
import { useResponsive } from "../../hooks/useResponsive";
import MobileOptimizedTable from "./MobileOptimizedTable";

/**
 * Componente que mejora automáticamente todos los componentes Ant Design
 * para móvil sin modificar el código existente
 */
const ResponsiveEnhancer = ({ children, enabled = true }) => {
  const { isMobile, getSpacing, getHeight } = useResponsive();

  // Si está deshabilitado, renderizar sin cambios
  if (!enabled) {
    return children;
  }

  // Configuración automática para móvil
  const mobileTheme = {
    token: {
      // Tamaños de control más grandes para móvil
      controlHeight: isMobile ? 44 : 32,
      fontSize: isMobile ? 16 : 14,
      borderRadius: 8,

      // Espaciado mejorado
      paddingXS: isMobile ? 8 : 4,
      paddingS: isMobile ? 12 : 8,
      padding: isMobile ? 16 : 12,
      paddingLG: isMobile ? 24 : 16,

      // Márgenes
      marginXS: isMobile ? 8 : 4,
      marginS: isMobile ? 12 : 8,
      margin: isMobile ? 16 : 12,
      marginLG: isMobile ? 24 : 16,
    },
    components: {
      // Botones más grandes en móvil
      Button: {
        controlHeight: isMobile ? 44 : 32,
        borderRadius: 8,
        fontWeight: 500,
      },

      // Inputs más grandes en móvil
      Input: {
        controlHeight: isMobile ? 44 : 32,
        borderRadius: 8,
        fontSize: isMobile ? 16 : 14,
      },

      // DatePicker más grande en móvil
      DatePicker: {
        controlHeight: isMobile ? 44 : 32,
        borderRadius: 8,
      },

      // Select más grande en móvil
      Select: {
        controlHeight: isMobile ? 44 : 32,
        borderRadius: 8,
      },

      // Forms con mejor espaciado
      Form: {
        itemMarginBottom: isMobile ? 20 : 16,
        verticalLabelPadding: isMobile ? "0 0 8px" : "0 0 4px",
      },

      // Cards con mejor diseño
      Card: {
        borderRadius: 12,
        paddingLG: isMobile ? 20 : 16,
      },

      // Tables más compactas en móvil
      Table: {
        cellPaddingBlock: isMobile ? 8 : 6,
        cellPaddingInline: isMobile ? 8 : 12,
        fontSize: isMobile ? 14 : 13,
      },
    },
  };

  // Función para mejorar componentes automáticamente
  const enhanceComponent = (element) => {
    if (!React.isValidElement(element)) {
      return element;
    }

    // Mejorar tablas automáticamente
    if (element.type === Table && isMobile) {
      return (
        <MobileOptimizedTable
          {...element.props}
          size="small"
          scroll={{ x: 350, y: 300 }}
          pagination={{
            ...element.props.pagination,
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: false,
            simple: true,
          }}
        />
      );
    }

    // Mejorar formularios automáticamente
    if (element.type === Form && isMobile) {
      return React.cloneElement(element, {
        ...element.props,
        layout: "vertical",
        size: "large",
        scrollToFirstError: true,
      });
    }

    // Mejorar botones automáticamente
    if (element.type === Button && isMobile) {
      return React.cloneElement(element, {
        ...element.props,
        size: "large",
        style: {
          height: 44,
          borderRadius: 8,
          ...element.props.style,
        },
      });
    }

    // Procesar children recursivamente
    if (element.props && element.props.children) {
      const enhancedChildren = React.Children.map(
        element.props.children,
        enhanceComponent
      );

      return React.cloneElement(element, {
        ...element.props,
        children: enhancedChildren,
      });
    }

    return element;
  };

  return (
    <ConfigProvider theme={mobileTheme}>
      <div
        style={{
          // SOLUCIÓN AL PROBLEMA DEL SIDEBAR: Forzar uso completo de pantalla en móvil
          ...(isMobile && {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
            overflow: "auto",
            zIndex: 1,
          }),
          // Para desktop, comportamiento normal
          ...(!isMobile && {
            width: "100%",
            minHeight: "100vh",
          }),
          background: isMobile ? "#f0f2f5" : undefined,
        }}
      >
        <div
          style={{
            // Container interno con padding apropiado
            padding: isMobile ? "0" : "16px", // Sin padding en móvil para usar toda la pantalla
            maxWidth: "100%",
            margin: "0 auto",
            width: "100%",
            minHeight: isMobile ? "100vh" : "auto",
          }}
        >
          {React.Children.map(children, enhanceComponent)}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ResponsiveEnhancer;
