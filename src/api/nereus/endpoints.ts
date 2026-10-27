import { aiAgents, api, ik } from "./client";

export async function login(email: string, password: string) {
  const response = await api.post(
    ik.login,
    { email, password },
    { skipAuthHandler: true, skipAuthHeader: true }
  );
  return response.data as unknown;
}

export async function fetchMyPoints() {
  const response = await api.get(ik.myPoints);
  return response.data as unknown;
}

export async function fetchPointsSummary() {
  const response = await api.get(ik.pointsSummary);
  return response.data as unknown;
}

export async function fetchDashboardStats() {
  const response = await api.get(ik.dashboardStats);
  return response.data as unknown;
}

export async function fetchBatchTelemetry(pointIds: Array<string | number>, hours = 24) {
  const response = await api.post(ik.batchTelemetry, {
    point_ids: pointIds.slice(0, 50),
    hours,
  });
  return response.data as unknown;
}

export async function fetchPointRecords(
  pointId: string | number,
  start: string,
  end: string,
  limit = 2000
) {
  const response = await api.get(ik.pointRecords(pointId), {
    params: { start_date: start, end_date: end, limit },
  });
  return response.data as unknown;
}

export async function fetchPointConfig(pointId: string | number) {
  const response = await api.get(ik.pointConfig(pointId));
  return response.data as unknown;
}

export async function fetchPointCalendar(pointId: string | number, days = 30) {
  const response = await api.get(ik.pointCalendar(pointId), { params: { days } });
  return response.data as unknown;
}

export async function fetchPointSummary(pointId: string | number) {
  const response = await api.get(ik.pointSummary(pointId));
  return response.data as unknown;
}

export async function fetchCompliance(pageSize = 500) {
  const response = await api.get(ik.compliance, {
    params: { page: 1, page_size: pageSize, active_only: false },
  });
  return response.data as unknown;
}

export async function fetchFlowHistory(pointId: string | number, days = 30) {
  const response = await api.get(ik.flowHistory(pointId), {
    params: { days, page: 1, page_size: 500 },
  });
  return response.data as unknown;
}

export async function fetchNearLimit(pointId: string | number, days = 30) {
  const response = await api.get(ik.nearLimit(pointId), {
    params: { days, page: 1, page_size: 200 },
  });
  return response.data as unknown;
}

export async function fetchSystemEvents(pageSize = 100) {
  const response = await api.get(ik.systemEvents, {
    params: { page: 1, page_size: pageSize },
  });
  return response.data as unknown;
}

export async function fetchEventsSummary(days = 7) {
  const response = await api.get(ik.eventsSummary, { params: { days } });
  return response.data as unknown;
}

export async function fetchDefaultAgent() {
  const response = await api.get(aiAgents.defaultAgent);
  return response.data as unknown;
}

export async function createAgentConversation(agentId: string | number, title: string) {
  const response = await api.post(aiAgents.conversations, { agent: agentId, title });
  return response.data as unknown;
}

export async function sendAgentChat(conversationId: string | number, message: string) {
  const response = await api.post(aiAgents.chat(conversationId), { message });
  return response.data as unknown;
}
