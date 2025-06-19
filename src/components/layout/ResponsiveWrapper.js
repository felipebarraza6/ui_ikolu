import React from "react";
import { useResponsive } from "../../hooks/useResponsive";

/**
 * Wrapper que añade responsividad a componentes existentes sin modificarlos
 * Se puede envolver cualquier componente para hacerlo más mobile-friendly
 */
const ResponsiveWrapper = ({
  children,
  enableMobileOptimizations = true,
  mobileStyle = {},
  desktopStyle = {},
  ...props
}) => {
  const { isMobile, getSpacing } = useResponsive();

  // Estilos base responsivos
  const responsiveStyles = {
    // Estilos para móvil
    ...(isMobile && {
      padding: getSpacing(16, 24),
      fontSize: 14,
      ...mobileStyle,
    }),
    // Estilos para desktop (mantener como está)
    ...(!isMobile && {
      ...desktopStyle,
    }),
  };

  // Si las optimizaciones están deshabilitadas, renderizar como está
  if (!enableMobileOptimizations) {
    return children;
  }

  // Clonar el componente hijo aplicando estilos responsivos
  return React.cloneElement(children, {
    ...props,
    style: {
      ...children.props.style,
      ...responsiveStyles,
    },
    // Pasar información de responsividad como props adicionales
    isMobile,
    isResponsive: true,
  });
};

export default ResponsiveWrapper;
