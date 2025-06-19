import React from "react";
import { presets, makeResponsive } from "../../utils/responsiveMigration";

// Importar componentes originales
import GraphicLine from "./GraphicLine";
import MyGraphics from "./MyGraphics";
import Stats from "./Stats";

/**
 * Versiones responsivas de todos los componentes de Graphics
 * Mantienen funcionalidad original + mejoras móvil
 */

// Gráfico de línea con mejoras visuales específicas para móvil
export const ResponsiveGraphicLine = makeResponsive(GraphicLine, {
  enhanceTables: false,
  enhanceForms: false,
});

// Mis gráficos con mejoras completas
export const ResponsiveMyGraphics = presets.fullPage(MyGraphics);

// Estadísticas con mejoras visuales
export const ResponsiveStats = presets.visualOnly(Stats);

/**
 * Exportación por defecto con todos los componentes mejorados
 */
export default {
  GraphicLine: ResponsiveGraphicLine,
  MyGraphics: ResponsiveMyGraphics,
  Stats: ResponsiveStats,
};

/**
 * Hook para obtener componentes de gráficos según el contexto
 */
export const useResponsiveGraphicsComponents = (forceResponsive = false) => {
  const [isResponsive, setIsResponsive] = React.useState(forceResponsive);

  // Auto-detectar si necesita componentes responsivos
  React.useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      setIsResponsive(width <= 768 || forceResponsive);
    };

    checkResponsive();
    window.addEventListener("resize", checkResponsive);

    return () => window.removeEventListener("resize", checkResponsive);
  }, [forceResponsive]);

  return {
    GraphicLine: isResponsive ? ResponsiveGraphicLine : GraphicLine,
    MyGraphics: isResponsive ? ResponsiveMyGraphics : MyGraphics,
    Stats: isResponsive ? ResponsiveStats : Stats,
    isResponsive,
  };
};
