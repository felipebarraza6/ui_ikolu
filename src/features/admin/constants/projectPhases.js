/**
 * Fases de instalación para la vista de Proyectos de Operaciones.
 *
 * Cada ticket con origin=OPERACIONES representa una instalación nueva
 * (proyecto). La fase se deriva del estado backend del ticket para
 * mostrar el avance de la instalación en la vista de proyectos.
 */

import {
  SearchOutlined,
  FileDoneOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

export const PROJECT_PHASES = [
  {
    key: "levantamiento",
    label: "Levantamiento",
    description: "Visita y relevamiento del punto",
    statuses: ["ABIERTO"],
    progress: 20,
    color: "#5B8DEF",
    icon: SearchOutlined,
  },
  {
    key: "diseno",
    label: "Diseño",
    description: "Planificación de la instalación",
    statuses: ["EN_ANALISIS"],
    progress: 40,
    color: "#8E7CC3",
    icon: FileDoneOutlined,
  },
  {
    key: "ejecucion",
    label: "Ejecución",
    description: "Instalación y configuración en terreno",
    statuses: ["EN_ORDEN_TRABAJO"],
    progress: 60,
    color: "#F4A261",
    icon: ToolOutlined,
  },
  {
    key: "espera",
    label: "En espera",
    description: "Esperando cliente o proveedor",
    statuses: ["ESPERA_CLIENTE", "ESPERA_PROVEEDOR"],
    progress: 70,
    color: "#F4A261",
    icon: ClockCircleOutlined,
  },
  {
    key: "puesta_marcha",
    label: "Puesta en marcha",
    description: "Pruebas y validación final",
    statuses: ["RESUELTO"],
    progress: 90,
    color: "#2A9D8F",
    icon: RocketOutlined,
  },
  {
    key: "entregado",
    label: "Entregado",
    description: "Instalación entregada y cerrada",
    statuses: ["CERRADO"],
    progress: 100,
    color: "#2A9D8F",
    icon: CheckCircleOutlined,
  },
  {
    key: "cancelado",
    label: "Cancelado",
    description: "Instalación cancelada",
    statuses: ["CANCELADO"],
    progress: 0,
    color: "#E63946",
    icon: CloseCircleOutlined,
  },
];

/**
 * Resuelve la fase de un proyecto a partir del estado del ticket.
 * Devuelve null si el estado no corresponde a ninguna fase conocida.
 */
export const getProjectPhase = (status) => {
  if (!status) return PROJECT_PHASES[0];
  const upper = String(status).toUpperCase();
  return PROJECT_PHASES.find((p) => p.statuses.includes(upper)) || null;
};

/**
 * Resuelve el avance (%) de un proyecto según su fase actual.
 */
export const getProjectProgress = (status) => {
  const phase = getProjectPhase(status);
  return phase ? phase.progress : 0;
};

/**
 * Índice de la fase actual dentro de PROJECT_PHASES (0-based).
 * Usado para pintar el stepper. Devuelve -1 si no se encontró.
 */
export const getProjectPhaseIndex = (status) => {
  const phase = getProjectPhase(status);
  if (!phase) return -1;
  return PROJECT_PHASES.findIndex((p) => p.key === phase.key);
};

/**
 * Opciones de filtro por fase para los Select de Ant Design.
 * Excluye "cancelado" del filtro rápido (se muestra aparte).
 */
export const PROJECT_PHASE_FILTER_OPTIONS = PROJECT_PHASES
  .filter((p) => p.key !== "cancelado")
  .map((p) => ({ value: p.key, label: p.label }));
