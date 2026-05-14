/**
 * Configuración centralizada de tours/capacitación por módulo.
 *
 * Cada tour tiene:
 * - key: identificador único (se guarda en localStorage)
 * - steps: array de pasos compatibles con Ant Design Tour
 * - requiresPoint: boolean, si el tour solo tiene sentido con punto seleccionado
 */

import React from "react";
import {
  GlobalOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  BarChartOutlined,
  FileTextOutlined,
  DownloadOutlined,
  DashboardOutlined,
  ColumnHeightOutlined,
  SettingOutlined,
  TableOutlined,
  BellOutlined,
  UserOutlined,
  CompassOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  ArrowDownOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { Flex } from "antd";

// ── Helpers visuales ──
const stepTitle = (icon, color, text) => (
  <Flex align="center" gap={10}>
    <span style={{ color, fontSize: 18, lineHeight: 1 }}>{icon}</span>
    <span style={{ fontWeight: 700, fontSize: 16, color: "#1f3461" }}>{text}</span>
  </Flex>
);

// ═══════════════════════════════════════════════════════
// 1. TOUR GENERAL DE BIENVENIDA (Layout)
// ═══════════════════════════════════════════════════════
export const generalTour = {
  key: "tour-general",
  requiresPoint: false,
  steps: [
    {
      title: stepTitle(<CompassOutlined />, "#1F3461", "Bienvenido a Ikolu App"),
      description:
        "Esta es tu plataforma de monitoreo hídrico. Te guiaremos por los elementos principales de la interfaz para que aproveches al máximo cada módulo.",
      target: null, // Modal centrado
      placement: "center",
    },
    {
      title: stepTitle(<GlobalOutlined />, "#1890ff", "Menú de Navegación"),
      description:
        "Desde aquí accedes a todos los módulos: Centro de Control, GEO Smart, Telemetría, Análisis, DGA, Descargas, Alertas y Soporte.",
      target: () => document.getElementById("app-sider"),
      placement: "right",
    },
    {
      title: stepTitle(<SettingOutlined />, "#52c41a", "Selector de Punto"),
      description:
        "Elige el punto de captación que quieres monitorear. Algunos módulos como Telemetría y Análisis requieren que selecciones un punto primero.",
      target: () => document.getElementById("point-selector"),
      placement: "right",
    },
    {
      title: stepTitle(<BellOutlined />, "#faad14", "Header y Alertas"),
      description:
        "Acá ves el breadcrumb de navegación, alertas activas del punto seleccionado, y el acceso a tu perfil y configuración.",
      target: () => document.getElementById("app-header"),
      placement: "bottom",
    },
    {
      title: stepTitle(<DashboardOutlined />, "#722ed1", "Área de Contenido"),
      description:
        "Cada módulo muestra su información aquí. Al ingresar a un módulo por primera vez, te ofreceremos una guía específica de esa pantalla.",
      target: () => document.getElementById("app-content"),
      placement: "top",
    },
  ],
};

// ═══════════════════════════════════════════════════════
// 2. TOUR CENTRO DE CONTROL
// ═══════════════════════════════════════════════════════
export const centroControlTour = {
  key: "tour-centro-control",
  requiresPoint: false,
  steps: [
    {
      title: stepTitle(<GlobalOutlined />, "#1F3461", "Centro de Control"),
      description:
        "Esta es tu vista general. Acá tienes un resumen consolidado del estado de tus puntos de captación, consumos y alertas recientes.",
      target: null,
      placement: "center",
    },
    {
      title: stepTitle(<DashboardOutlined />, "#1890ff", "Indicadores Clave"),
      description:
        "Estas tarjetas muestran métricas resumidas: caudal total, consumo del día, alertas activas y estado general del sistema.",
      target: () => document.getElementById("cc-kpi-cards"),
      placement: "bottom",
    },
    {
      title: stepTitle(<EnvironmentOutlined />, "#52c41a", "Estado de Puntos"),
      description:
        "Visualiza el estado de telemetría de todos tus puntos de captación. Los colores indican si están activos, inactivos o desconectados.",
      target: () => document.getElementById("cc-geo-map"),
      placement: "top",
    },
    {
      title: stepTitle(<BarChartOutlined />, "#faad14", "Gráfico de Consumo"),
      description:
        "Este gráfico muestra la evolución del consumo de agua en el período seleccionado. Puedes filtrar por día, semana o mes.",
      target: () => document.getElementById("cc-consumption-chart"),
      placement: "top",
    },
  ],
};

// ═══════════════════════════════════════════════════════
// 3. TOUR TELEMETRÍA (Pozo Subterráneo)
// ═══════════════════════════════════════════════════════
export const telemetryTourBase = {
  key: "tour-telemetry",
  requiresPoint: true,
};

export const getTelemetryTour = (vars = []) => {
  const hasCaudal = vars.some((v) => v.type_variable?.includes("CAUDAL"));
  const hasNivel = vars.some((v) => v.type_variable?.includes("NIVEL"));
  const hasTotalizado = vars.some((v) => v.type_variable?.includes("TOTALIZADO"));
  const hasConsumo = vars.some((v) => v.type_variable === "CONSUMO");

  const steps = [
    {
      title: stepTitle(<DashboardOutlined />, "#1F3461", "Métricas del Pozo"),
      description:
        "Aquí ves las mediciones clave: Último Registro, Caudal en litros por segundo, Nivel de Agua, Nivel Freático y el Acumulado Total en metros cúbicos.",
      target: () => document.getElementById("well-metrics"),
      placement: "right",
    },
    {
      title: stepTitle(<ColumnHeightOutlined />, "#1890ff", "Visualización del Pozo"),
      description:
        "Representación gráfica del pozo con el nivel freático y la columna de agua en tiempo real.",
      target: () => document.getElementById("well-visualization"),
      placement: "bottom",
    },
    {
      title: stepTitle(<WifiOutlined />, "#52c41a", "Sincronización"),
      description:
        "Este contador muestra el tiempo restante hasta la próxima medición automática del datalogger.",
      target: () => document.getElementById("well-sync-countdown"),
      placement: "bottom",
    },
    {
      title: stepTitle(<BarChartOutlined />, "#faad14", "Mediciones del Día"),
      description:
        "Este botón abre el historial completo de registros del día. Presiona Siguiente para ver la tabla con cada medición.",
      target: () => document.getElementById("well-measurements-btn"),
      placement: "bottom",
    },
    {
      title: stepTitle(<TableOutlined />, "#1890ff", "Total Registros"),
      description:
        "Esta tarjeta muestra cuántas mediciones ha enviado el datalogger hoy. Cada registro es una foto instantánea del estado del pozo en un momento específico.",
      target: () => document.getElementById("drawer-stat-total"),
      placement: "bottom",
      drawerStep: true,
      opensDrawer: true,
    },
    {
      title: stepTitle(<BarChartOutlined />, "#52c41a", "Consumo Acumulado"),
      description:
        "El consumo acumulado del día se calcula restando el acumulado del primer registro al último. Te dice exactamente cuántos metros cúbicos se han extraído desde la primera medición.",
      target: () => document.getElementById("drawer-stat-consumo"),
      placement: "bottom",
      drawerStep: true,
    },
    {
      title: stepTitle(<ClockCircleOutlined />, "#722ed1", "Primer Registro"),
      description:
        "La hora del primer registro del día indica cuándo comenzó la telemetría hoy. Útil para calcular el período total de monitoreo.",
      target: () => document.getElementById("drawer-stat-primero"),
      placement: "bottom",
      drawerStep: true,
    },
    {
      title: stepTitle(<ClockCircleOutlined />, "#eb2f96", "Último Registro"),
      description:
        "La hora del último registro muestra cuándo fue la medición más reciente. Si coincide con la hora actual, significa que el datalogger está transmitiendo en tiempo real.",
      target: () => document.getElementById("drawer-stat-ultimo"),
      placement: "bottom",
      drawerStep: true,
    },
  ];

  // Columna Hora: siempre presente
  steps.push({
    title: stepTitle(<ClockCircleOutlined />, "#1F3461", "Hora"),
    description:
      "Momento exacto en que el datalogger tomó la medición. La tabla está ordenada de la más reciente (arriba) a la más antigua (abajo).",
    target: () => document.getElementById("drawer-col-hora"),
    placement: "bottom",
    drawerStep: true,
  });

  // Columna Acumulado: solo si hay TOTALIZADO
  if (hasTotalizado) {
    steps.push({
      title: stepTitle(<DatabaseOutlined />, "#1890ff", "Acumulado"),
      description:
        "Total acumulado en metros cúbicos hasta esa hora. Debajo del valor principal ves el consumo respecto a la medición anterior.",
      target: () => document.getElementById("drawer-col-acumulado"),
      placement: "bottom",
      drawerStep: true,
    });
  }

  // Columna Caudal: solo si hay CAUDAL
  if (hasCaudal) {
    steps.push({
      title: stepTitle(<DashboardOutlined />, "#52c41a", "Caudal"),
      description:
        "Flujo instantáneo de agua en litros por segundo. La flecha verde indica que subió respecto a la medición siguiente; la roja indica que bajó.",
      target: () => document.getElementById("drawer-col-caudal"),
      placement: "bottom",
      drawerStep: true,
    });
  }

  // Columnas Nivel: solo si hay NIVEL
  if (hasNivel) {
    steps.push({
      title: stepTitle(<ColumnHeightOutlined />, "#faad14", "Nivel de Agua"),
      description:
        "Altura de la columna de agua dentro del pozo, medida en metros. La flecha indica la variación respecto a la medición siguiente.",
      target: () => document.getElementById("drawer-col-nivel-agua"),
      placement: "bottom",
      drawerStep: true,
    });
    steps.push({
      title: stepTitle(<ArrowDownOutlined />, "#722ed1", "Nivel Freático"),
      description:
        "Profundidad del nivel freático respecto a la superficie, en metros. La flecha indica si subió o bajó respecto a la medición siguiente.",
      target: () => document.getElementById("drawer-col-nivel-freatico"),
      placement: "bottom",
      drawerStep: true,
    });
  }

  // Columna Consumo: solo si hay TOTALIZADO y no CONSUMO explícito
  if (hasTotalizado && !hasConsumo) {
    steps.push({
      title: stepTitle(<ExperimentOutlined />, "#eb2f96", "Consumo"),
      description:
        "Diferencia de acumulado entre esta medición y la siguiente. Representa cuántos metros cúbicos se extrajeron en ese intervalo de tiempo.",
      target: () => document.getElementById("drawer-col-consumo"),
      placement: "bottom",
      drawerStep: true,
    });
  }

  // Pasos finales
  steps.push(
    {
      title: stepTitle(<FileTextOutlined />, "#722ed1", "Ficha Técnica"),
      description:
        "Acá tienes los datos técnicos del pozo: código DGA, profundidad total, posicionamiento de bomba y sensor, diámetros de ducto y flujómetro, metros cúbicos iniciales y estado del datalogger.",
      target: () => document.getElementById("well-techsheet"),
      placement: "left",
      closesDrawer: true,
    },
    {
      title: stepTitle(<SettingOutlined />, "#eb2f96", "Variables Configuradas"),
      description:
        "Listado de todas las variables que el sistema está monitoreando para este pozo: caudal, nivel, totalizador y sus parámetros de configuración.",
      target: () => document.getElementById("well-variables"),
      placement: "left",
    }
  );

  return {
    ...telemetryTourBase,
    steps,
  };
};

// ═══════════════════════════════════════════════════════
// 4. TOUR ANÁLISIS (Smart Analysis)
// ═══════════════════════════════════════════════════════
export const analysisTour = {
  key: "tour-analysis",
  requiresPoint: true,
  steps: [
    {
      title: stepTitle(<BarChartOutlined />, "#1F3461", "Smart Análisis"),
      description:
        "Este módulo te permite analizar en profundidad el comportamiento histórico de tus puntos de captación.",
      target: null,
      placement: "center",
    },
    {
      title: stepTitle(<SettingOutlined />, "#1890ff", "Selector de Análisis"),
      description:
        "Elige entre análisis diario o mensual, selecciona la fecha de interés y el sistema cargará los datos automáticamente.",
      target: () => document.getElementById("analysis-selector"),
      placement: "bottom",
    },
    {
      title: stepTitle(<DashboardOutlined />, "#52c41a", "Gráficos y Tablas"),
      description:
        "Visualiza el consumo de agua en diferentes períodos, compara caudales y niveles, y exporta los resultados en PDF o Excel.",
      target: () => document.getElementById("analysis-charts"),
      placement: "top",
    },
  ],
};

// ═══════════════════════════════════════════════════════
// 5. TOUR DGA - MEE
// ═══════════════════════════════════════════════════════
export const dgaTour = {
  key: "tour-dga",
  requiresPoint: true,
  steps: [
    {
      title: stepTitle(<FileTextOutlined />, "#1F3461", "DGA - MEE"),
      description:
        "Este módulo gestiona la información relacionada con la Dirección General de Aguas y el Medio Ambiente.",
      target: null,
      placement: "center",
    },
    {
      title: stepTitle(<FileTextOutlined />, "#1890ff", "Ficha DGA"),
      description:
        "Visualiza los datos de registro DGA del punto: código de resolución, caudal autorizado, uso y estado de cumplimiento.",
      target: () => document.getElementById("dga-ficha"),
      placement: "bottom",
    },
    {
      title: stepTitle(<DashboardOutlined />, "#52c41a", "Certificado QR"),
      description:
        "Genera el certificado de cumplimiento con código QR para presentaciones ante la DGA o terceros.",
      target: () => document.getElementById("dga-qr"),
      placement: "top",
    },
    {
      title: stepTitle(<BarChartOutlined />, "#faad14", "Registros DGA"),
      description:
        "Revisa el historial de registros y mediciones enviadas o disponibles para la DGA.",
      target: () => document.getElementById("dga-registers"),
      placement: "top",
    },
  ],
};

// ═══════════════════════════════════════════════════════
// 6. TOUR DESCARGAS (Reports)
// ═══════════════════════════════════════════════════════
export const downloadTour = {
  key: "tour-download",
  requiresPoint: true,
  steps: [
    {
      title: stepTitle(<DownloadOutlined />, "#1F3461", "Descarga de Reportes"),
      description:
        "Desde aquí puedes descargar reportes históricos de telemetría, consumos y eventos en múltiples formatos.",
      target: null,
      placement: "center",
    },
    {
      title: stepTitle(<SettingOutlined />, "#1890ff", "Filtros de Búsqueda"),
      description:
        "Selecciona el rango de fechas, las variables que quieres incluir y el formato de salida (Excel, CSV, PDF).",
      target: () => document.getElementById("download-filters"),
      placement: "bottom",
    },
    {
      title: stepTitle(<DownloadOutlined />, "#52c41a", "Generar y Descargar"),
      description:
        "Una vez configurados los filtros, haz clic en Generar Reporte. El archivo se descargará automáticamente.",
      target: () => document.getElementById("download-action"),
      placement: "top",
    },
  ],
};

// ═══════════════════════════════════════════════════════
// Mapa de tours por ruta (para auto-detección)
// ═══════════════════════════════════════════════════════
export const TOURS_BY_ROUTE = {
  "/": centroControlTour,
  "/telemetry": telemetryTourBase,
  "/analysis": analysisTour,
  "/dga": dgaTour,
  "/download": downloadTour,
  "/extraction-data": downloadTour,
};

// Lista completa de tour keys (para reset)
export const ALL_TOUR_KEYS = [
  generalTour.key,
  centroControlTour.key,
  telemetryTourBase.key,
  analysisTour.key,
  dgaTour.key,
  downloadTour.key,
];
