import { toast } from "sonner";
import { api, ik } from "./client";
import { UnavailableError } from "./errors";
import {
  catchmentPointPath,
  interactionDetailJsonPath,
  monthOverridePath,
  monthXlsxPath,
} from "./paths";
import { DOCUMENTS_ENABLED } from "@/utils/userFlags";

/** Accept de planilla. El backend distingue el XLSX por este header, no por el host. */
export const XLSX_ACCEPT =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type Query = Record<string, string | number | boolean | null | undefined>;

function withQuery(path: string, params: Query = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

async function get(endpoint: string, token?: string | null) {
  const headers = token ? { Authorization: `Token ${token}` } : undefined;
  return api.get(endpoint, { headers });
}

async function download(endpoint: string, nameFile: string) {
  const response = await api.get(endpoint, {
    responseType: "blob",
    headers: { Accept: XLSX_ACCEPT },
  });
  const blob = new Blob([response.data], { type: XLSX_ACCEPT });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", nameFile);
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
  toast.success("Archivo descargado exitosamente", { description: nameFile });
  return response;
}

function requireDocuments() {
  if (!DOCUMENTS_ENABLED) throw new UnavailableError();
}

const login = async (data: { email: string; password: string }) => {
  const request = await api.post(
    ik.login,
    { email: data.email, password: data.password },
    { skipAuthHandler: true, skipAuthHeader: true }
  );
  if (!request?.data) throw new Error("Respuesta inválida del servidor");
  if (!request.data.user) {
    throw new Error(request.data.error || request.data.message || "Usuario no encontrado en la respuesta");
  }
  if (!request.data.access_token) {
    throw new Error(request.data.error || request.data.message || "Token de acceso no encontrado");
  }
  if (Array.isArray(request.data.user.catchment_points)) {
    request.data.user.catchment_points.sort(
      (a: { is_monitoring?: boolean }, b: { is_monitoring?: boolean }) =>
        Number(b.is_monitoring) - Number(a.is_monitoring)
    );
  }
  return request.data;
};

const getDataDay = async (idProfile: string | number, initialDate: string, finishDate: string) => {
  const response = await get(
    withQuery("ik/interaction_detail_override/", {
      catchment_point: idProfile,
      date_time_medition__date__range: `${initialDate},${finishDate}`,
    })
  );
  return response.data;
};

const getDataMonth = async (idProfile: string | number, initialDate: string, _finishDate?: string) => {
  const response = await get(monthOverridePath(idProfile, initialDate));
  return response.data;
};

const getDataMonthDga = async (idProfile: string | number, initialDate: string, finishDate?: string) =>
  getDataMonth(idProfile, initialDate, finishDate || initialDate);

const downloadDataMonthToExcel = async (idProfile: string | number, initialDate: string) => {
  await download(monthXlsxPath(idProfile, initialDate), "data.xlsx");
};

const getProfile = async (username: string | null = null, token: string | null = null) => {
  let userUsername = username;
  if (!userUsername) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.username) userUsername = user.username;
    else throw new Error("No se pudo obtener el nombre de usuario. Por favor, inicia sesión nuevamente.");
  }
  const response = await get(`ik/users/${userUsername}/`, token);
  if (response.data?.user?.catchment_points) {
    response.data.user.catchment_points.forEach((item: { key?: number }, index: number) => {
      item.key = index;
    });
  }
  return response.data;
};

const deleteFile = async (id: string | number) => {
  requireDocuments();
  const response = await api.delete(`ik/file_catchment/${id}/`);
  return response.data;
};

const getFiles = async (pointCatchment: string | number) => {
  requireDocuments();
  const response = await get(withQuery("ik/file_catchment/", { point_catchment: pointCatchment }));
  return response.data;
};

const formUploadFile = async (values: {
  file: { originFileObj: Blob };
  point_catchment: string | number;
  name: string;
  description: string;
  type_file: string | number;
}) => {
  requireDocuments();
  const formData = new FormData();
  formData.append("file", values.file.originFileObj);
  formData.append("point_catchment", String(values.point_catchment));
  formData.append("name", values.name);
  formData.append("description", values.description);
  formData.append("type_file", String(values.type_file));
  const response = await api.post("ik/file_catchment/", formData);
  return response.data;
};

const downloadFile = async (
  idProfile: string | number,
  initialDate: string,
  finishDate: string,
  title: string
) =>
  download(
    withQuery("ik/interaction_detail/", {
      catchment_point: idProfile,
      date_time_medition__date__range: `${initialDate},${finishDate}`,
      type: "xlsx",
    }),
    `${title}.xlsx`
  );

const downloadFileDga = async (
  idProfile: string | number,
  initialDate: string,
  finishDate: string,
  title: string
) =>
  download(
    withQuery("ik/interaction_detail_dga/", {
      point_catchment: idProfile,
      date_time_medition__date__range: `${initialDate},${finishDate}`,
      type: "xlsx",
    }),
    `${title}.xlsx`
  );

const deleteDataApiSh = async (id: string | number) => {
  const response = await api.delete(interactionDetailJsonPath(id));
  return response.data;
};

const createDataApiSh = async (data: unknown) => {
  const response = await api.post("ik/interaction_detail_json/", data);
  return response.data;
};

const getDataApiSh = async (idProfile: string | number) => {
  const response = await get(
    withQuery("ik/interaction_detail_json/", { catchment_point: idProfile, hour: 0 })
  );
  return response.data;
};

const getDataApiShRangeDate = async (
  idProfile: string | number,
  initialDate: string,
  finishDate: string,
  page: number | string
) => {
  const response = await get(
    withQuery("ik/interaction_detail_json/", {
      catchment_point: idProfile,
      date_time_medition__date__range: `${initialDate},${finishDate}`,
      page,
    })
  );
  return response.data;
};

const getDataApiShRangeDateAndHour = async (
  idProfile: string | number,
  initialDate: string,
  finishDate: string,
  page: number | string
) => {
  const response = await get(
    withQuery("ik/interaction_detail_json/", {
      catchment_point: idProfile,
      date_time_medition__date__range: `${initialDate},${finishDate}`,
      page,
      date_time_medition__hour: "00",
    })
  );
  return response.data;
};

const getDataApiShRangeDateGraphic = async (
  idProfile: string | number,
  initialDate: string,
  finishDate: string
) => {
  const response = await get(
    withQuery("ik/interaction_detail_json/", {
      catchment_point: idProfile,
      date_time_medition__date__range: `${initialDate},${finishDate}`,
    })
  );
  return response.data;
};

const getDataApiShDgaSend = async (
  idProfile: { id: string | number; standard?: string },
  page: number | string
) => {
  const now = new Date();
  const response = await get(
    withQuery("ik/interaction_detail_json/", {
      profile_client: idProfile.id,
      page,
      date_time_medition__month: now.getMonth() + 1,
      date_time_medition__year: now.getFullYear(),
      date_time_medition__hour: idProfile.standard === "MEDIO" ? 9 : undefined,
    })
  );
  return response.data;
};

function applyHourDelta(listFormat: { results: Array<{ total: number; total_hora?: number }> }) {
  for (let i = 0; i < listFormat.results.length - 1; i += 1) {
    const current = listFormat.results[i];
    const next = listFormat.results[i + 1];
    current.total_hora = current.total - next.total;
  }
  return listFormat;
}

const getDataApiShStructural24h = async (
  idProfile: string | number,
  year: string | number,
  month: string | number,
  day: string | number
) => {
  const base = {
    profile_client: idProfile,
    date_time_medition__year: year,
    date_time_medition__month: month,
    date_time_medition__day: day,
  };
  const first = await get(withQuery("ik/interaction_detail_json/", base));
  const totalCount = Number(first.data?.count || 0);
  const listFormat = { ...first.data, results: [...(first.data?.results || [])] };
  if (totalCount / 10 > 1) {
    const second = await get(withQuery("ik/interaction_detail_json/", { ...base, page: 2 }));
    listFormat.results = [...listFormat.results, ...(second.data?.results || [])];
  }
  if (totalCount / 10 > 2) {
    const third = await get(withQuery("ik/interaction_detail_json/", { ...base, page: 3 }));
    listFormat.results = [...listFormat.results, ...(third.data?.results || [])];
  }
  return applyHourDelta(listFormat);
};

const getDataApiShStructuralMonth = async (
  idProfile: string | number,
  year: string | number,
  month: string | number
) => {
  const base = {
    profile_client: idProfile,
    date_time_medition__year: year,
    date_time_medition__month: month,
    date_time_medition__hour: 12,
    date_time_medition__day__range: "01,31",
  };
  const first = await get(withQuery("ik/interaction_detail_json/", base));
  const listFormat = { ...first.data, results: [...(first.data?.results || [])] };
  if (listFormat.results.length > 10) {
    const second = await get(withQuery("ik/interaction_detail_json/", { ...base, page: 2 }));
    listFormat.results.push(...(second.data?.results || []));
  }
  if (listFormat.results.length > 20) {
    const third = await get(withQuery("ik/interaction_detail_json/", { ...base, page: 3 }));
    listFormat.results.push(...(third.data?.results || []));
  }
  return applyHourDelta(listFormat);
};

const createNotification = async (data: unknown) => {
  const response = await api.post("ik/notifications_catchment/", data);
  return response.data;
};

const getNotifications = async (idPoint: string | number, page: number | string, type: string) => {
  const response = await get(
    withQuery("ik/notifications_catchment/", {
      point_catchment: idPoint,
      page,
      type_notification: type,
    })
  );
  return response.data;
};

const getNotificationsActives = async (idPoint: string | number, page: number | string, type: string) => {
  const response = await get(
    withQuery("ik/notifications_catchment/", {
      point_catchment: idPoint,
      page,
      type_notification: type,
      is_active: true,
    })
  );
  return response.data;
};

const deleteNotification = async (id: string | number) => {
  const response = await api.delete(`ik/notifications_catchment/${id}/`);
  return response.data;
};

const getNotificationById = async (id: string | number) => {
  const response = await get(`ik/notifications_catchment/${id}/`);
  return response.data;
};

const updateNotification = async (id: string | number, data: unknown) => {
  const response = await api.patch(`ik/notifications_catchment/${id}/`, data);
  return response.data;
};

const getNotificationsResponse = async (idNotification: string | number, page: number | string) => {
  const response = await get(
    withQuery("ik/response_notifications_catchment/", { notification: idNotification, page })
  );
  return response.data;
};

const createNotificationResponse = async (data: unknown) => {
  const response = await api.post("ik/response_notifications_catchment/", data);
  return response.data;
};

const updateUser = async (username: string, data: unknown) => {
  const response = await api.patch(`ik/users/${username}/`, data);
  return response.data;
};

const updateDataApiSh = async (id: string | number, data: unknown) => {
  const response = await api.patch(interactionDetailJsonPath(id), data);
  return response.data;
};

const updateCatchmentPoint = async (id: string | number, data: unknown) => {
  const response = await api.patch(catchmentPointPath(id), data);
  return response.data;
};

const getSystemStatus = async () => (await get("ik/management/system_status/")).data;

const getPointsStatus = async (params: Query = {}) =>
  (await get(withQuery("ik/management/points_status/", params))).data;

const getTelemetryMetrics = async (params: Query = {}) =>
  (await get(withQuery("ik/management/telemetry_metrics/", params))).data;

const toggleTelemetry = async (pointId: string | number, enabled: boolean) =>
  (await api.post("ik/management/toggle_telemetry/", { point_id: pointId, enabled })).data;

const getDgaQueueStatus = async () => (await get("ik/management/dga_queue_status/")).data;

const clearDgaQueue = async (payload: unknown = {}) =>
  (await api.post("ik/management/clear_dga_queue/", payload)).data;

const requeueDga = async (payload: unknown = {}) =>
  (await api.post("ik/management/requeue_dga/", payload)).data;

const updatePointFrequency = async (pointId: string | number, frequency: string | number) =>
  (await api.post("ik/management/update_point_frequency/", { point_id: pointId, frequency })).data;

const getNotificationsSummary = async (days = 7) =>
  (await get(withQuery("ik/management/notifications_summary/", { days }))).data;

const getClients = async () => (await get("ik/client/")).data;

const getProjects = async () => (await get("ik/project_catchments/")).data;

const getCatchmentPoints = async (params: Query = {}) =>
  (await get(withQuery("ik/catchment_point/", params))).data;

const portal = {
  authenticated: login,
  get_profile: getProfile,
  updateUser,
  downloadFile,
  get_data_sh: getDataApiSh,
  get_data_sh_range: getDataApiShRangeDate,
  get_data_sh_range_to_excel: downloadFile,
  get_data_sh_range_to_excel_dga: downloadFileDga,
  get_data_sh_range_hour: getDataApiShRangeDateAndHour,
  get_data_send_dga: getDataApiShDgaSend,
  get_data_sh_range_graphic: getDataApiShRangeDateGraphic,
  get_data_structural: getDataApiShStructural24h,
  get_data_structural_month: getDataApiShStructuralMonth,
  delete_data_sh: deleteDataApiSh,
  create_data_sh: createDataApiSh,
  update_data_sh: updateDataApiSh,
  update_catchment_point: updateCatchmentPoint,
  get_data_day: getDataDay,
  get_data_month: getDataMonth,
  get_data_month_dga: getDataMonthDga,
  downloadMonth: downloadDataMonthToExcel,
  uploadFile: formUploadFile,
  deleteFile,
  getFiles,
  notifications: {
    create: createNotification,
    get: getNotifications,
    actives: getNotificationsActives,
    getById: getNotificationById,
    delete: deleteNotification,
    update: updateNotification,
    responses: {
      get: getNotificationsResponse,
      create: createNotificationResponse,
    },
  },
  management: {
    systemStatus: getSystemStatus,
    pointsStatus: getPointsStatus,
    telemetryMetrics: getTelemetryMetrics,
    toggleTelemetry,
    dgaQueueStatus: getDgaQueueStatus,
    clearDgaQueue,
    requeueDga,
    updatePointFrequency,
    notificationsSummary: getNotificationsSummary,
  },
  admin: {
    clients: getClients,
    projects: getProjects,
    catchmentPoints: getCatchmentPoints,
  },
};

export default portal;
