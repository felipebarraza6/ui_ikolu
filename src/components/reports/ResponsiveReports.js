import React from "react";
import { presets } from "../../utils/responsiveMigration";
import Reports from "./Reports"; // Importar el componente original

/**
 * Versión responsiva del componente Reports
 * Mantiene toda la funcionalidad original y añade mejoras para móvil
 */
const ResponsiveReports = presets.tableHeavy(Reports);

// También exportar con nombre específico para claridad
export const EnhancedReports = ResponsiveReports;

export default ResponsiveReports;
