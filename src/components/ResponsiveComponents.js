/**
 * 🚀 CENTRO DE COMPONENTES RESPONSIVOS IKOLU
 *
 * Este archivo centraliza TODOS los componentes mejorados para móvil
 * sin modificar los originales. Mantiene compatibilidad total.
 *
 * USO RÁPIDO:
 * import { Home, Reports, MyWell } from '../components/ResponsiveComponents';
 */

// Importar todos los módulos responsivos
import HomeComponents from "./home/ResponsiveHomeComponents";
import MyWellComponents from "./mywell/ResponsiveMyWellComponents";
import AlertsComponents from "./alerts/ResponsiveAlertsComponents";
import GraphicsComponents from "./graphics/ResponsiveGraphicsComponents";
import ResponsiveReports from "./reports/ResponsiveReports";

// Importar utilidades de migración
import {
  presets,
  makeResponsive,
  wrapPage,
  useResponsiveConfig,
} from "../utils/responsiveMigration";

/**
 * 📱 COMPONENTES POR MÓDULO
 */
export const Home = HomeComponents;
export const MyWell = MyWellComponents;
export const Alerts = AlertsComponents;
export const Graphics = GraphicsComponents;
export const Reports = ResponsiveReports;

/**
 * 🔧 UTILIDADES DE MIGRACIÓN
 */
export const ResponsiveUtils = {
  presets,
  makeResponsive,
  wrapPage,
  useResponsiveConfig,
};

/**
 * 🎯 HOOKS ESPECIALIZADOS
 */
export { useResponsiveHomeComponents } from "./home/ResponsiveHomeComponents";
export { useResponsiveMyWellComponents } from "./mywell/ResponsiveMyWellComponents";
export { useResponsiveAlertsComponents } from "./alerts/ResponsiveAlertsComponents";
export { useResponsiveGraphicsComponents } from "./graphics/ResponsiveGraphicsComponents";

/**
 * 📦 EXPORTACIÓN POR DEFECTO
 * Todos los módulos organizados
 */
export default {
  // Módulos principales
  Home,
  MyWell,
  Alerts,
  Graphics,
  Reports,

  // Utilidades
  Utils: ResponsiveUtils,

  // Información del sistema
  version: "1.0.0",
  description: "Sistema de componentes responsivos para Ikolu App",

  // Información de debug
  debugInfo: () => {
    console.group("🔍 Responsive Components Debug");
    console.log("✅ Home components:", Object.keys(Home));
    console.log("✅ MyWell components:", Object.keys(MyWell));
    console.log("✅ Alerts components:", Object.keys(Alerts));
    console.log("✅ Graphics components:", Object.keys(Graphics));
    console.log("✅ Reports component: Ready");
    console.log(
      "🎯 Total responsive components available:",
      Object.keys(Home).length +
        Object.keys(MyWell).length +
        Object.keys(Alerts).length +
        Object.keys(Graphics).length +
        1
    );
    console.groupEnd();
  },
};
