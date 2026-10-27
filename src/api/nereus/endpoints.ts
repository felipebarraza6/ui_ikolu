import { api, ik } from "./client";

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
