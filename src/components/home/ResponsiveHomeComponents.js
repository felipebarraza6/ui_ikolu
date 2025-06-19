import React from "react";
import { presets, makeResponsive } from "../../utils/responsiveMigration";

// Importar componentes originales
import ListWells from "./ListWells";
import HeaderNav from "./HeaderNav";
import SiderLeft from "./SiderLeft";
import SiderRight from "./SiderRight";
import Supp from "./Supp";

/**
 * Versiones responsivas de todos los componentes del Home
 * Mantienen funcionalidad original + mejoras móvil
 */

// Lista de pozos con mejoras de tabla
export const ResponsiveListWells = presets.tableHeavy(ListWells);

// Header de navegación con mejoras mínimas
export const ResponsiveHeaderNav = presets.minimal(HeaderNav);

// Sidebar izquierdo con mejoras completas
export const ResponsiveSiderLeft = presets.fullPage(SiderLeft);

// Sidebar derecho con mejoras completas
export const ResponsiveSiderRight = presets.fullPage(SiderRight);

// Componente de soporte con mejoras de formulario
export const ResponsiveSupp = presets.formHeavy(Supp);

/**
 * Exportación por defecto con todos los componentes mejorados
 */
export default {
  ListWells: ResponsiveListWells,
  HeaderNav: ResponsiveHeaderNav,
  SiderLeft: ResponsiveSiderLeft,
  SiderRight: ResponsiveSiderRight,
  Supp: ResponsiveSupp,
};

/**
 * Hook para obtener componentes responsivos según el contexto
 */
export const useResponsiveHomeComponents = (forceResponsive = false) => {
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
    ListWells: isResponsive ? ResponsiveListWells : ListWells,
    HeaderNav: isResponsive ? ResponsiveHeaderNav : HeaderNav,
    SiderLeft: isResponsive ? ResponsiveSiderLeft : SiderLeft,
    SiderRight: isResponsive ? ResponsiveSiderRight : SiderRight,
    Supp: isResponsive ? ResponsiveSupp : Supp,
    isResponsive,
  };
};
