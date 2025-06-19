import React from "react";
import { presets, makeResponsive } from "../../utils/responsiveMigration";

// Importar componentes originales
import Alerts from "./Alerts";
import FormAlert from "./FormAlert";
import TableAlerts from "./TableAlerts";

/**
 * Versiones responsivas de todos los componentes de Alerts
 * Mantienen funcionalidad original + mejoras móvil
 */

// Componente principal de alertas con mejoras completas
export const ResponsiveAlerts = presets.fullPage(Alerts);

// Formulario de alertas con mejoras específicas
export const ResponsiveFormAlert = presets.formHeavy(FormAlert);

// Tabla de alertas con mejoras específicas
export const ResponsiveTableAlerts = presets.tableHeavy(TableAlerts);

/**
 * Exportación por defecto con todos los componentes mejorados
 */
export default {
  Alerts: ResponsiveAlerts,
  FormAlert: ResponsiveFormAlert,
  TableAlerts: ResponsiveTableAlerts,
};

/**
 * Hook para obtener componentes de alertas según el contexto
 */
export const useResponsiveAlertsComponents = (forceResponsive = false) => {
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
    Alerts: isResponsive ? ResponsiveAlerts : Alerts,
    FormAlert: isResponsive ? ResponsiveFormAlert : FormAlert,
    TableAlerts: isResponsive ? ResponsiveTableAlerts : TableAlerts,
    isResponsive,
  };
};
