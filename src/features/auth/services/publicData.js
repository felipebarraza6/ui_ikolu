/**
 * Servicio de datos públicos de Smart Hydro / Ikolu Void.
 *
 * En producción puede reemplazarse por un endpoint libre como
 * GET /api/public/info. Por ahora se entrega como mock con
 * información real de la empresa y funciones del producto.
 */

const PUBLIC_DATA = {
  company: {
    name: "Smart Hydro",
    tagline: "Startup de innovación socio-ambiental",
    certification: "Empresa B Certificada",
    website: "https://smarthydro.cl",
    contact: {
      phone: "+56 9 3958 1688",
      email: "christian.fernandez@smarthydro.cl",
    },
    mission:
      "Garantizar el uso sostenible del recurso hídrico mediante la implementación de tecnologías de impacto, en armonía con el medio ambiente y el cumplimiento normativo vigente.",
    summary:
      "Gestión Inteligente de Aguas Subterráneas. Monitoreo Avanzado y Cumplimiento Normativo en Tiempo Real. Descubre cómo nuestra tecnología de vanguardia puede transformar la operación hídrica de tu empresa y asegurar el cumplimiento normativo DGA/SMA.",
    dga: {
      title: "Cumplimiento DGA",
      badge: "Resolución 1238 DGA",
      url: "https://dga.mop.gob.cl/",
      description:
        "Sistemas certificados para el Monitoreo de Extracciones Efectivas (MEE) de aguas subterráneas, exigido por la Dirección General de Aguas.",
      points: [
        "Caudalímetros y sensores de nivel certificados.",
        "Dataloggers con transmisión online vía 4G / LoRaWAN.",
        "Reportes automáticos al software MEE de la DGA.",
        "Plazos adaptados a estándares Mayor, Medio, Menor y Muy pequeño.",
      ],
    },
    sma: {
      title: "Cumplimiento SMA",
      badge: "SMA CEMS",
      url: "https://portal.sma.gob.cl/",
      description:
        "También damos cumplimiento a los requerimientos de la Superintendencia del Medio Ambiente para reportes en línea.",
    },
    social: {
      facebook: "#",
      instagram: "#",
    },
    services: [
      {
        id: "sensors",
        title: "Sensores y telemetría",
        description:
          "Medición de nivel freático, caudal, presión, temperatura y conductividad en pozos y matrices.",
        icon: "AimOutlined",
      },
      {
        id: "telemetry",
        title: "Telemetría IoT",
        description:
          "Transmisión de datos vía 4G y redes LoRaWAN de largo alcance para zonas rurales.",
        icon: "WifiOutlined",
      },
      {
        id: "platform",
        title: "Plataforma web",
        description:
          "Dashboards, tendencias de consumo, alarmas críticas y control remoto de bombas y válvulas.",
        icon: "LineChartOutlined",
      },
    ],
    stats: [
      { key: "clients", value: "50+", label: "Clientes", icon: "TeamOutlined" },
      { key: "dataloggers", value: "120+", label: "Dataloggers instalados", icon: "DeploymentUnitOutlined" },
      { key: "points", value: "220", label: "Puntos DGA/SMA", icon: "SafetyCertificateOutlined" },
      { key: "flow", value: "7.200", label: "Litros por segundo", icon: "DashboardOutlined" },
    ],
    sectors: [
      "Sanitarias",
      "Industrial",
      "Agrícola",
      "Energía",
      "Ciencia",
    ],
  },
  platform: {
    name: "Ikolu Void",
    tagline: "Toma la forma de tu operación hídrica",
    description:
      "La nueva generación de la plataforma Smart Hydro: más flexible, más rápida y pensada para adaptarse a cada cliente, proyecto y normativa.",
    features: [
      {
        id: "telemetry",
        title: "Centro de Control",
        description: "Telemetría y cumplimiento DGA en tiempo real con vistas por proyecto y fecha.",
        icon: "ControlOutlined",
      },
      {
        id: "performance",
        title: "Rendimiento y operación",
        description: "Dashboards de rendimiento, operacional y cumplimiento para la toma de decisiones.",
        icon: "BarChartOutlined",
      },
      {
        id: "support",
        title: "Soporte SLA",
        description: "Tickets, kanban e indicadores de atención integrados en la plataforma.",
        icon: "CustomerServiceOutlined",
      },
      {
        id: "admin",
        title: "Gestión administrativa",
        description: "Clientes, proyectos, puntos, usuarios, esquemas, variables y proveedores de telemetría.",
        icon: "SettingOutlined",
      },
      {
        id: "alerts",
        title: "Alertas inteligentes",
        description: "Reglas, canales, disparos y notificaciones para mantener el control del recurso hídrico.",
        icon: "AlertOutlined",
      },
      {
        id: "ai",
        title: "Asistente IA",
        description: "Chat integrado para consultar datos, alertas y reportes de forma conversacional.",
        icon: "RobotOutlined",
      },
    ],
  },
};

/**
 * Obtiene los datos públicos de la mini-landing.
 *
 * En producción puede reemplazarse por un endpoint libre como
 * GET /api/public/info. Por ahora resuelve el mock inmediatamente
 * para no retrasar la carga del login.
 * @returns {Promise<Object>} Datos públicos de Smart Hydro.
 */
export const fetchPublicData = () => Promise.resolve(PUBLIC_DATA);

export default PUBLIC_DATA;
