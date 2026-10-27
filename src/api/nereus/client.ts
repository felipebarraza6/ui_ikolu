import axios from "axios";

const DEFAULT_API_URL = "https://api-ik-nereus.smarthydro.app/api";

/** Sin barra final. Los paths de compatibilidad empiezan en `ik/`. */
export const API_BASE_URL = String(
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

/**
 * Fachada /api/ik/. El host no reescribe /api/* hacia /api/ik/,
 * así que cada path incluye el segmento `ik/`.
 */
export const ik = {
  login: "ik/login/",
  myPoints: "ik/my_points/",
  pointsSummary: "ik/points_summary/",
  dashboardStats: "ik/dashboard_stats/",
  batchTelemetry: "ik/batch/telemetry/",
  pointRecords: (id: string | number) => `ik/point/${id}/records/`,
  pointConfig: (id: string | number) => `ik/point/${id}/config/`,
  pointCalendar: (id: string | number) => `ik/point/${id}/calendar/`,
  pointSummary: (id: string | number) => `ik/point/${id}/summary/`,
  compliance: "ik/compliance/",
  flowHistory: (id: string | number) => `ik/compliance/${id}/flow_history/`,
  nearLimit: (id: string | number) => `ik/compliance/${id}/near_limit/`,
  systemEvents: "ik/control_center/system_events/",
  eventsSummary: "ik/system-events/summary/",
  serviceStatus: "ik/service_status/",
  serviceUptime: "ik/service_status/uptime/",
  dgaQueueSummary: "ik/dga_queue/summary/",
  dgaQueue: "ik/dga_queue/",
  slaSummary: "ik/sla/summary/",
  slaTickets: "ik/sla/tickets/",
  pointHealth: (id: string | number) => `ik/point/${id}/health/`,
  incidents: "ik/incidents/",
  portalConfig: "ik/portal_config/",
} as const;

export const aiAgents = {
  defaultAgent: "ai-agents/agents/default/",
  conversations: "ai-agents/conversations/",
  chat: (id: string | number) => `ai-agents/conversations/${id}/chat/`,
} as const;

function readStoredToken(): string | null {
  const raw = localStorage.getItem("token");
  if (!raw || raw === "undefined" || raw === "null") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "string" && parsed ? parsed : null;
  } catch {
    return raw;
  }
}

/** Solo si el usuario tiene más de una sucursal. */
export function readBranchHeader(): string | null {
  if (localStorage.getItem("branch_multi") !== "1") return null;
  const id = localStorage.getItem("branch_id");
  if (!id || id === "undefined" || id === "null") return null;
  return id;
}

let redirecting = false;

export function forceLogout(): void {
  if (redirecting) return;
  redirecting = true;
  try {
    localStorage.clear();
  } catch {
    /* almacenamiento no disponible */
  }
  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign("/login");
  } else {
    redirecting = false;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  if (!config.skipAuthHeader) {
    const token = readStoredToken();
    if (token && !config.headers.Authorization) {
      config.headers.set("Authorization", `Token ${token}`);
    }
  }
  const branch = readBranchHeader();
  if (branch) {
    config.headers.set("X-Branch-ID", branch);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error.response?.status as number | undefined;

    if (status === 401 && !config.skipAuthHandler) {
      forceLogout();
      return Promise.reject(error);
    }

    const method = String(config.method || "get").toLowerCase();
    const idempotent = method === "get" || method === "head" || method === "options";
    const transient =
      !error.response || status === 502 || status === 503 || status === 504;
    if (idempotent && transient && !config._retried) {
      config._retried = true;
      return api.request(config);
    }

    return Promise.reject(error);
  }
);
