import React from "react";
import { useResponsive } from "../../hooks/useResponsive";

/**
 * 🔧 SOLUCIÓN ESPECÍFICA AL PROBLEMA DEL SIDEBAR
 *
 * Este componente fuerza que el contenido use toda la pantalla en móvil
 * sin importar si hay un sidebar activo o no
 */
const MobileFullscreenFix = ({ children, ...props }) => {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    // En desktop, renderizar normal
    return children;
  }

  // En móvil, FORZAR pantalla completa
  return (
    <div
      style={{
        // CRÍTICO: Estas propiedades anulan cualquier layout problemático
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
        zIndex: 1000, // Por encima de cualquier sidebar
        background: "#fff",

        // Anular cualquier margen/padding del sidebar
        marginLeft: "0 !important",
        paddingLeft: "0 !important",
        transform: "translateX(0) !important",
      }}
      {...props}
    >
      {/* Container interno para el contenido */}
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: 0,
          margin: 0,
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 🚀 HOC para aplicar la solución a cualquier componente
 */
export const withFullscreenMobile = (Component, displayName) => {
  const FullscreenComponent = (props) => (
    <MobileFullscreenFix>
      <Component {...props} />
    </MobileFullscreenFix>
  );

  FullscreenComponent.displayName =
    displayName ||
    `FullscreenMobile(${Component.displayName || Component.name})`;

  return FullscreenComponent;
};

/**
 * 🔧 Wrapper para páginas existentes que tienen problemas
 */
export const FixPageLayout = ({ children }) => {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return children;
  }

  // CSS crítico para móvil
  const mobileCSS = `
    /* Anular cualquier estilo de sidebar en móvil */
    @media (max-width: 768px) {
      .ant-layout-sider {
        display: none !important;
        width: 0 !important;
        max-width: 0 !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .ant-layout-content {
        margin-left: 0 !important;
        padding-left: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      
      .ant-layout {
        margin-left: 0 !important;
        padding-left: 0 !important;
      }
      
      /* Forzar que el contenido use toda la pantalla */
      body, html, #root {
        overflow-x: hidden !important;
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  `;

  return (
    <>
      {/* Inyectar CSS crítico */}
      <style dangerouslySetInnerHTML={{ __html: mobileCSS }} />

      {/* Wrapper de contenido */}
      <MobileFullscreenFix>{children}</MobileFullscreenFix>
    </>
  );
};

/**
 * 📱 Versión específica para el problema de tu captura
 */
export const FixSidebarProblem = ({ children }) => {
  const { isMobile } = useResponsive();

  React.useEffect(() => {
    if (isMobile) {
      // Aplicar estilos críticos al body
      document.body.style.overflow = "hidden";
      document.body.style.position = "relative";
      document.documentElement.style.overflow = "hidden";

      return () => {
        // Limpiar al desmontar
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.documentElement.style.overflow = "";
      };
    }
  }, [isMobile]);

  if (!isMobile) {
    return children;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        background: "#f0f2f5",
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
};

export default MobileFullscreenFix;
