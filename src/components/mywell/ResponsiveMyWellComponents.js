import React from "react";
import { presets, makeResponsive } from "../../utils/responsiveMigration";

// Importar componentes originales
import MyWell from "./MyWell";
import Well from "./Well";
import TableStandarVerySmall from "./TableStandarVerySmall";
import MyLastRegisters from "./MyLastRegisters";

/**
 * Versiones responsivas de todos los componentes de MyWell
 * Mantienen funcionalidad original + mejoras móvil
 */

// Componente principal MyWell con mejoras completas
export const ResponsiveMyWell = presets.fullPage(MyWell);

// Well básico con mejoras visuales
export const ResponsiveWell = presets.visualOnly(Well);

// Tabla estándar pequeña con mejoras específicas para tablas
export const ResponsiveTableStandarVerySmall = presets.tableHeavy(
  TableStandarVerySmall
);

// Últimos registros con mejoras de tabla
export const ResponsiveMyLastRegisters = presets.tableHeavy(MyLastRegisters);

/**
 * Exportación por defecto con todos los componentes mejorados
 */
export default {
  MyWell: ResponsiveMyWell,
  Well: ResponsiveWell,
  TableStandarVerySmall: ResponsiveTableStandarVerySmall,
  MyLastRegisters: ResponsiveMyLastRegisters,
};

/**
 * Hook para obtener componentes de MyWell según el contexto
 */
export const useResponsiveMyWellComponents = (forceResponsive = false) => {
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
    MyWell: isResponsive ? ResponsiveMyWell : MyWell,
    Well: isResponsive ? ResponsiveWell : Well,
    TableStandarVerySmall: isResponsive
      ? ResponsiveTableStandarVerySmall
      : TableStandarVerySmall,
    MyLastRegisters: isResponsive ? ResponsiveMyLastRegisters : MyLastRegisters,
    isResponsive,
  };
};
