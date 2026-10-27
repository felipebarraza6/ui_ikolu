import { api, ik } from "./client";
import { asRecord } from "./normalize";

export type PortalFlags = {
  show_availability: boolean;
  show_dga_queue: boolean;
  show_sla: boolean;
  show_device_health: boolean;
  show_events: boolean;
  show_internal_tickets: boolean;
  stale_hours: number;
};

function flag(source: Record<string, unknown>, key: string) {
  return source[key] === true || source[key] === 1 || source[key] === "true";
}

export function readPortalConfig(payload: unknown): PortalFlags {
  const root = asRecord(payload) || {};
  const nested = asRecord(root.portal_config) || asRecord(root.config) || asRecord(root.flags);
  const source = nested || root;
  const hours = Number(source.stale_hours ?? source.stale_data_hours ?? source.offline_hours ?? 2);
  return {
    show_availability: flag(source, "show_availability"),
    show_dga_queue: flag(source, "show_dga_queue"),
    show_sla: flag(source, "show_sla"),
    show_device_health: flag(source, "show_device_health"),
    show_events: flag(source, "show_events"),
    show_internal_tickets: flag(source, "show_internal_tickets"),
    stale_hours: Number.isFinite(hours) && hours > 0 ? hours : 2,
  };
}

export type DgaFilters = {
  point?: string;
  status?: string;
  from?: string;
  to?: string;
};

export async function fetchPortalConfig() {
  const response = await api.get(ik.portalConfig);
  return readPortalConfig(response.data);
}

export async function fetchServiceStatus() {
  const response = await api.get(ik.serviceStatus);
  return response.data as unknown;
}

export async function fetchUptime(days: number) {
  const response = await api.get(ik.serviceUptime, { params: { days } });
  return response.data as unknown;
}

export async function fetchDgaSummary() {
  const response = await api.get(ik.dgaQueueSummary);
  return response.data as unknown;
}

export async function fetchDgaQueue(filters: DgaFilters) {
  const response = await api.get(ik.dgaQueue, {
    params: {
      point: filters.point || undefined,
      status: filters.status || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    },
  });
  return response.data as unknown;
}

export async function fetchSlaSummary() {
  const response = await api.get(ik.slaSummary);
  return response.data as unknown;
}

export async function fetchSlaTickets() {
  const response = await api.get(ik.slaTickets);
  return response.data as unknown;
}

export async function fetchPointHealth(pointId: string | number) {
  const response = await api.get(ik.pointHealth(pointId));
  return response.data as unknown;
}

export async function fetchIncidents() {
  const response = await api.get(ik.incidents);
  return response.data as unknown;
}
