import { useState, useEffect } from "react";

// Breakpoints estándar
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

/**
 * Hook personalizado para manejar responsividad
 * @returns {Object} Objeto con información sobre el tamaño de pantalla
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [breakpoint, setBreakpoint] = useState("lg");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });

      // Determinar breakpoint actual
      if (width >= breakpoints.xxl) {
        setBreakpoint("xxl");
      } else if (width >= breakpoints.xl) {
        setBreakpoint("xl");
      } else if (width >= breakpoints.lg) {
        setBreakpoint("lg");
      } else if (width >= breakpoints.md) {
        setBreakpoint("md");
      } else if (width >= breakpoints.sm) {
        setBreakpoint("sm");
      } else {
        setBreakpoint("xs");
      }
    };

    // Configurar listener
    window.addEventListener("resize", handleResize);

    // Llamar inmediatamente para establecer estado inicial
    handleResize();

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Funciones de utilidad
  const isMobile = screenSize.width < breakpoints.md;
  const isTablet =
    screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg;
  const isDesktop = screenSize.width >= breakpoints.lg;
  const isSmallMobile = screenSize.width < breakpoints.sm;

  return {
    // Información básica
    width: screenSize.width,
    height: screenSize.height,
    breakpoint,

    // Funciones de utilidad
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,

    // Breakpoints específicos
    isXs: breakpoint === "xs",
    isSm: breakpoint === "sm",
    isMd: breakpoint === "md",
    isLg: breakpoint === "lg",
    isXl: breakpoint === "xl",
    isXxl: breakpoint === "xxl",

    // Comparaciones
    isAtLeast: (bp) => screenSize.width >= breakpoints[bp],
    isAtMost: (bp) => screenSize.width <= breakpoints[bp],

    // Orientación
    isPortrait: screenSize.height > screenSize.width,
    isLandscape: screenSize.width > screenSize.height,

    // Utilidades para componentes
    getColSpan: (mobile = 24, tablet = 12, desktop = 8) => {
      if (isMobile) return mobile;
      if (isTablet) return tablet;
      return desktop;
    },

    getSpacing: (mobile = 16, desktop = 24) => {
      return isMobile ? mobile : desktop;
    },

    getFontSize: (mobile = 14, desktop = 16) => {
      return isMobile ? mobile : desktop;
    },

    getHeight: (mobile = 40, desktop = 32) => {
      return isMobile ? mobile : desktop;
    },

    // Configuración para componentes Ant Design
    getAntdSize: () => {
      if (isMobile) return "large";
      if (isTablet) return "middle";
      return "middle";
    },

    getDrawerWidth: () => {
      if (isSmallMobile) return "90%";
      if (isMobile) return 320;
      return 400;
    },

    getTableScroll: () => ({
      x: isMobile ? 350 : true,
      y: isMobile ? 300 : undefined,
    }),
  };
};

/**
 * Hook para detectar solo si es móvil (más simple)
 * @returns {boolean} true si es móvil
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

/**
 * Hook para obtener orientación del dispositivo
 * @returns {string} 'portrait' | 'landscape'
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    window.innerHeight > window.innerWidth ? "portrait" : "landscape"
  );

  useEffect(() => {
    const handleResize = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return orientation;
};

export default useResponsive;
