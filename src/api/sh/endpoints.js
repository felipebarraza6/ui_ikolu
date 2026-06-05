import axios from "axios";
import { POST_LOGIN, GET, DOWNLOAD, DELETE, POST, PATCH, Axios } from "./config";

const requestPasswordReset = async (email) => {
  const request = await Axios.post("ik/auth/password-reset/", { email });
  return request.data;
};

const confirmPasswordReset = async (token, newPassword) => {
  const request = await Axios.post("ik/auth/password-reset/confirm/", {
    token,
    password: newPassword,
  });
  return request.data;
};

const getPublicAnnouncements = async (limit = 20) => {
  const request = await Axios.get(`ik/announcements/public/?limit=${limit}`);
  return request.data;
};

const login = async (data) => {
  const request = await POST_LOGIN("ik/login/", {
    email: data.email,
    password: data.password,
  });

  // Validar que la respuesta tenga la estructura esperada
  if (!request || !request.data) {
    throw new Error("Respuesta inválida del servidor");
  }

  // Validar que tenga los datos del usuario (esto indica éxito)
  if (!request.data.user) {
    // Si no tiene user pero tiene error, mostrar ese error
    const errorMessage =
      request.data.error ||
      request.data.message ||
      "Usuario no encontrado en la respuesta";
    throw new Error(errorMessage);
  }

  // Validar que tenga access_token (esto indica éxito)
  if (!request.data.access_token) {
    // Si no tiene token pero tiene error, mostrar ese error
    const errorMessage =
      request.data.error ||
      request.data.message ||
      "Token de acceso no encontrado";
    throw new Error(errorMessage);
  }

  // Si llegamos aquí, el login fue exitoso (tiene user y access_token)

  // 🚀 Login optimizado: no procesar catchment_points aquí.
  // Si el backend aún los envía, se ignoran para forzar lazy-loading.
  if (request.data.user.catchment_points) {
    delete request.data.user.catchment_points;
  }

  return request.data;
};

const get_history_data = async (profile) => {
  const request = await GET(`history_data/?profile=${profile}`);
  return request.data;
};

const get_history_data_admin = async () => {
  const request = await GET(`history_data/`);
  return request.data;
};

const getDataDay = async (id_profile, initialDate, finishDate) => {
  const rq = await GET(
    `interaction_detail_override/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}`
  );
  return rq.data;
};

const getDataMonth = async (id_profile, initialDate, finishDate) => {
  const rq = await GET(
    `interaction_detail_override_month/?catchment_point=${id_profile}&date_time_medition__month=${initialDate.slice(
      5,
      7
    )}&date_time_medition__year=${initialDate.slice(0, 4)}`
  );
  return rq.data;
};

const downloadDataMonthToExcel = async (
  id_profile,
  initialDate,
  finishDate
) => {
  const rq = await DOWNLOAD(
    `https://api.smarthydro.app/api/interaction_detail_override_month_xlsx/?catchment_point=${id_profile}&date_time_medition__month=${initialDate.slice(
      5,
      7
    )}&date_time_medition__year=${initialDate.slice(0, 4)}`,
    `data.xlsx`
  );
};
/**
 * @deprecated Usar getPointsSummary, getMyPoints o batch.summary en su lugar.
 * Este endpoint carga el perfil completo del usuario con TODOS los catchment_points,
 * lo que genera respuestas de varios megabytes.
 */
const get_profile = async (username = null, token = null) => {
  // Si se proporciona username, usarlo; si no, intentar obtenerlo de localStorage
  let userUsername = username;

  if (!userUsername) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.username) {
      userUsername = user.username;
    } else {
      throw new Error(
        "No se pudo obtener el nombre de usuario. Por favor, inicia sesión nuevamente."
      );
    }
  }

  // Pasar el token a GET para evitar problemas de timing con localStorage
  const rq = await GET(`users/${userUsername}/`, token);

  if (rq.data && rq.data.user && rq.data.user.catchment_points) {
    rq.data.user.catchment_points.forEach((item, index) => {
      item.key = index;
    });
  }

  return rq.data;
};

/**
 * 🆕 NUEVO: Obtener lista de puntos de captación (básica)
 * Endpoint: /api/catchment_point/all/
 */
const get_catchment_points_all = async () => {
  const rq = await GET(`catchment_point/all/`);
  return rq.data;
};

/**
 * 🆕 NUEVO: Obtener detalle completo de UN punto de captación
 * Usa el retrieve del endpoint existente: /api/catchment_point/{id}/
 *
 * @deprecated Preferir getPointSummary() que usa el endpoint optimizado /api/ik/point/{id}/summary/
 */
const get_catchment_point_detail = async (pointId) => {
  const rq = await GET(`catchment_point/${pointId}/`);
  return rq.data;
};

/**
 * 🆕 NUEVO: Resumen de todos los puntos con última telemetría
 * Endpoint: /api/ik/points_summary/
 */
const get_points_summary = async () => {
  const rq = await GET(`ik/points_summary/`);
  return rq.data;
};

/**
 * 🆕 NUEVO: Resumen de un punto específico con última telemetría
 * Endpoint: /api/ik/point/{id}/summary/
 */
const get_point_summary = async (pointId) => {
  const rq = await GET(`ik/point/${pointId}/summary/`);
  return rq.data;
};

/**
 * 🆕 NUEVO: Puntos asignados al usuario autenticado (select/dropdown)
 * Endpoint: /api/ik/my_points/
 */
const get_my_points = async () => {
  const rq = await GET(`ik/my_points/`);
  return rq.data;
};

const deleteFile = async (id) => {
  const rq = await DELETE(`file_catchment/${id}/`);
  return rq.data;
};

const getFiles = async (point_catchment) => {
  const rq = await GET(`file_catchment/?point_catchment=${point_catchment}`);
  return rq.data;
};

const formUploadFile = async (values) => {
  const formData = new FormData();
  formData.append("file", values.file.originFileObj);
  formData.append("point_catchment", values.point_catchment);
  formData.append("name", values.name);
  formData.append("description", values.description);
  formData.append("type_file", values.type_file);

  const rq = await POST("file_catchment/", formData);
  return rq.data;
};

const downloadFile = async (id_profile, initialDate, finishDate, title) => {
  const now_date = new Date();
  // Endpoint con parámetro type=xlsx para forzar respuesta en formato Excel
  const rq = await DOWNLOAD(
    `interaction_detail/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&type=xlsx`,
    `${title}.xlsx`
  );
};

const downloadFileDga = async (id_profile, initialDate, finishDate, title) => {
  const now_date = new Date();
  // Endpoint con parámetro type=xlsx para forzar respuesta en formato Excel
  const rq = await DOWNLOAD(
    `interaction_detail_dga/?point_catchment=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&type=xlsx`,
    `${title}.xlsx`
  );
};

const deleteDataApiSh = async (id) => {
  const rq = await DELETE(`interaction_detail_json/${id}/`);
  return rq.data;
};

const createDataApiSh = async (data) => {
  const rq = await POST(`interaction_detail_json/`, data);
  return rq.data;
};

const getDataApiSh = async (id_profile) => {
  const rq = await GET(
    `interaction_detail_json/?catchment_point=${id_profile}&hour=0`
  );
  return rq.data;
};
const getDataApiShRangeDate = async (
  id_profile,
  initialDate,
  finishDate,
  page
) => {
  const rq = await GET(
    `interaction_detail_json/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&page=${page}`
  );
  return rq.data;
};

const getDataApiShRangeDateToExcel = async (
  id_profile,
  initialDate,
  finishDate,
  page
) => {
  const rq = await GET(
    `interaction_detail/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&page=${page}`
  );
  return rq.data;
};

const getDataApiShRangeDateAndHour = async (
  id_profile,
  initialDate,
  finishDate,
  page
) => {
  const rq = await GET(
    `interaction_detail_json/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&page=${page}&date_time_medition__hour=00`
  );
  return rq.data;
};

const getDataApiShRangeDateGraphic = async (
  id_profile,
  initialDate,
  finishDate
) => {
  const rq = await GET(
    `interaction_detail_json/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}`
  );
  return rq.data;
};

const getDataApiShDgaSend = async (id_profile, page) => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  let totalCount = 0;

  const rq = await GET(
    `interaction_detail_json/?profile_client=${id_profile.id}&page=${page}
    &date_time_medition__month=${month}&date_time_medition__year=${year}${
      id_profile.standard === "MEDIO" ? "&date_time_medition__hour=9" : ""
    }`
  ).then((r) => {
    totalCount = r.data.count;
    return r;
  });

  return rq.data;
};

const getDataApiShStructural24h = async (id_profile, year, month, day) => {
  var totalCount = 0;
  var listFormat = {};
  const rq1 = await GET(
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__day=${day}`
  ).then((r) => {
    totalCount = r.data.count;
    listFormat = { ...r.data, results: r.data.results };
    return r;
  });

  if (totalCount / 10 > 1) {
    const rq2 = await GET(
      `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__day=${day}&page=2`
    ).then((r) => {
      listFormat = {
        ...listFormat,
        results: [...listFormat.results, ...r.data.results],
      };
      return r;
    });
  }
  if (totalCount / 10 > 2) {
    const rq3 = await GET(
      `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__day=${day}&page=3`
    ).then((r) => {
      listFormat = {
        ...listFormat,
        results: [...listFormat.results, ...r.data.results],
      };
      return r;
    });
  }

  let total_acumulado = 0;
  for (let i = 0; i < listFormat.results.length - 1; i++) {
    const current = listFormat.results[i];
    const next = listFormat.results[i + 1];
    const total = current.total - next.total;

    current.total_hora = total;
  }

  return listFormat;
};

const getDataApiShStructuralMonth = async (id_profile, year, month) => {
  const rq1 = await GET(
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__hour=12&date_time_medition__day__range=01,31`
  );
  var listFormat = {
    ...rq1.data,
    results: [...rq1.data.results],
  };

  if (listFormat.results.length > 10) {
    const rq2 = await GET(
      `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__hour=12&page=2&date_time_medition__day__range=01,31`
    );
    listFormat.results.push(...rq2.data.results);
  }

  if (listFormat.results.length > 20) {
    const rq3 = await GET(
      `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__hour=12&page=3&date_time_medition__day__range=01,31`
    );
    listFormat.results.push(...rq3.data.results);
  }

  for (let i = 0; i < listFormat.results.length - 1; i++) {
    const current = listFormat.results[i];
    const next = listFormat.results[i + 1];
    const total = current.total - next.total;

    current.total_hora = total;
  }

  return listFormat;
};

const createNotification = async (data) => {
  const rq = await POST(`notifications_catchment/`, data);
  return rq.data;
};

const getNotifications = async (id_point, page, type) => {
  const rq = await GET(
    `notifications_catchment/?point_catchment=${id_point}&page=${page}&type_notification=${type}`
  );
  return rq.data;
};

const getNotificationsActives = async (id_point, page, type) => {
  const rq = await GET(
    `notifications_catchment/?point_catchment=${id_point}&page=${page}&type_notification=${type}&is_active=true`
  );
  return rq.data;
};

/**
 * 🆕 NUEVO: Obtener todas las notificaciones por tipo (sin filtro de punto)
 * Para uso admin — el backend permite filtros opcionales con DjangoFilterBackend
 */
const getAllNotificationsByType = async (type, page = 1, isActive = null) => {
  let url = `notifications_catchment/?type_notification=${type}&page=${page}`;
  if (isActive !== null) {
    url += `&is_active=${isActive}`;
  }
  const rq = await GET(url);
  return rq.data;
};

/**
 * 🆕 NUEVO: Obtener notificaciones de un punto específico por tipo
 * Wrapper más flexible que getNotifications
 */
const getNotificationsByPoint = async (pointId, type, page = 1, isActive = null) => {
  let url = `notifications_catchment/?point_catchment=${pointId}&type_notification=${type}&page=${page}`;
  if (isActive !== null) {
    url += `&is_active=${isActive}`;
  }
  const rq = await GET(url);
  return rq.data;
};

const deleteNotification = async (id) => {
  const rq = await DELETE(`notifications_catchment/${id}/`);
  return rq.data;
};

const getNotificationById = async (id) => {
  const rq = await GET(`notifications_catchment/${id}/`);
  return rq.data;
};

const updateNotification = async (id, data) => {
  const rq = await PATCH(`notifications_catchment/${id}/`, data);
  return rq.data;
};
//response_notifications_catchment

const getNotificationsResponse = async (id_notification, page) => {
  const rq = await GET(
    `response_notifications_catchment/?notification=${id_notification}&page=${page}`
  );
  return rq.data;
};

const createNotificationResponse = async (data) => {
  const rq = await POST(`response_notifications_catchment/`, data);
  return rq.data;
};

// ==========================================
// USUARIOS
// ==========================================

const updateUser = async (username, data) => {
  const rq = await PATCH(`users/${username}/`, data);
  return rq.data;
};

// ==========================================
// TELEMETRÍA — Edición
// ==========================================

const updateDataApiSh = async (id, data) => {
  const rq = await PATCH(`interaction_detail_json/${id}/`, data);
  return rq.data;
};

// ==========================================
// MANAGEMENT / ADMIN
// ==========================================

const getSystemStatus = async () => {
  const rq = await GET(`management/system_status/`);
  return rq.data;
};

const getSystemMap = async () => {
  const rq = await GET(`management/system_map/`);
  return rq.data;
};

const getResourcesStatus = async () => {
  const rq = await GET(`management/resources_status/`);
  return rq.data;
};

const getPointsStatus = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`management/points_status/${query ? "?" + query : ""}`);
  return rq.data;
};

const getTelemetryMetrics = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`management/telemetry_metrics/${query ? "?" + query : ""}`);
  return rq.data;
};

const toggleTelemetry = async (pointId, enabled) => {
  const rq = await POST(`management/toggle_telemetry/`, {
    point_id: pointId,
    enabled,
  });
  return rq.data;
};

const getDgaQueueStatus = async () => {
  const rq = await GET(`management/dga_queue_status/`);
  return rq.data;
};

const clearDgaQueue = async (payload = {}) => {
  const rq = await POST(`management/clear_dga_queue/`, payload);
  return rq.data;
};

const requeueDga = async (payload = {}) => {
  const rq = await POST(`management/requeue_dga/`, payload);
  return rq.data;
};

const updatePointFrequency = async (pointId, frequency) => {
  const rq = await POST(`management/update_point_frequency/`, {
    point_id: pointId,
    frequency,
  });
  return rq.data;
};

const getNotificationsSummary = async (days = 7) => {
  const rq = await GET(`management/notifications_summary/?days=${days}`);
  return rq.data;
};

// ==========================================
// API OPTIMIZADA — /api/ik/ (Batch nativos)
// ==========================================

/**
 * 🆕 BATCH NATIVO: Telemetría multi-punto en una sola llamada
 * Endpoint: POST /api/ik/batch/telemetry/
 * Máximo 50 puntos por request
 */
const batchTelemetryNative = async (pointIds, hours = 1) => {
  const rq = await POST(`ik/batch/telemetry/`, {
    point_ids: pointIds,
    hours: hours,
  });
  return rq.data;
};

/**
 * 🆕 BATCH NATIVO: Estadísticas agregadas multi-punto
 * Endpoint: POST /api/ik/batch/stats/
 */
const batchStatsNative = async (pointIds, days = 30) => {
  const rq = await POST(`ik/batch/stats/`, {
    point_ids: pointIds,
    days: days,
  });
  return rq.data;
};

/**
 * 🆕 BATCH NATIVO: Resumen optimizado de puntos del usuario
 * Endpoint: POST /api/ik/batch/summary/
 * Devuelve resumen con última telemetría para múltiples puntos
 */
const batchSummaryNative = async (pointIds) => {
  const rq = await POST(`ik/batch/summary/`, {
    point_ids: pointIds,
  });
  return rq.data;
};

/**
 * 🆕 CENTRO DE CONTROL: Resumen diario agregado del usuario
 * Endpoint: GET /api/ik/daily_summary/
 * Devuelve KPIs, consumo, estado de servicio y lista de puntos pre-calculados
 */
const get_daily_summary = async (date) => {
  const params = date ? `?date=${date}` : "";
  const rq = await GET(`ik/daily_summary/${params}`);
  return rq.data;
};

/**
 * 🆕 CENTRO DE CONTROL: KPIs agregados del dashboard
 * Endpoint: GET /api/ik/dashboard_stats/
 * Devuelve contadores y métricas globales del usuario
 */
const get_dashboard_stats = async (signal) => {
  const rq = await GET(`ik/dashboard_stats/`, null, signal ? { signal } : {});
  return rq.data;
};

const chat = async (message) => {
  const rq = await POST(`ik/chat/client/general_stats/`, { message });
  return rq.data;
};

/**
 * 🆕 COMPLIANCE: Datos de cumplimiento con historial de caudal
 * Endpoint: GET /api/ik/compliance/
 * Devuelve stats agregados + puntos con flow_history y compliance_warning
 */
const get_compliance = async (signal) => {
  const rq = await GET(`ik/compliance/`, null, signal ? { signal } : {});
  return rq.data;
};

/**
 * 🆕 MEDICIONES POR PUNTO Y DÍA
 * Endpoint: GET /api/ik/point/{id}/records/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&limit=100
 * Devuelve registros detallados de un punto para un rango de fechas.
 */
const get_point_records = async (pointId, startDate, endDate, limit = 100) => {
  const rq = await GET(`ik/point/${pointId}/records/?start_date=${startDate}&end_date=${endDate}&limit=${limit}`);
  return rq.data;
};

/**
 * 🆕 CONFIGURACIÓN TÉCNICA DEL PUNTO
 * Endpoint: GET /api/ik/point/{id}/config/
 * Devuelve d1-d5: profundidad, posicionamiento bomba, nivel freático, diámetro bomba, diámetro flujómetro
 */
const get_point_config = async (pointId) => {
  const rq = await GET(`ik/point/${pointId}/config/`);
  return rq.data;
};

/**
 * 🆕 VERIFICACIÓN DGA: Validar comprobante en sistema DGA
 * Endpoint: GET /compliance/dga/verify/?codigo_obra=XXX&numero_comprobante=YYY&tipo_dga=ZZZ
 * Auth: Bearer Token o Session
 */
const verifyDgaVoucher = async (codigoObra, numeroComprobante, tipoDga = 'SUPERFICIAL') => {
  const token = JSON.parse(localStorage.getItem("token") || "null");
  if (!token) {
    throw new Error("No se encontró token de autenticación.");
  }
  
  // Crear instancia de axios sin baseURL para endpoint externo
  const dgaClient = axios.create({
    baseURL: 'https://api.smarthydro.app',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  // Interceptor para agregar el token a cada request
  dgaClient.interceptors.request.use((config) => {
    const authToken = JSON.parse(localStorage.getItem("token") || "null");
    if (authToken) {
      config.headers['Authorization'] = `Token ${authToken}`;
    }
    return config;
  });
  
  try {
    const response = await dgaClient.get('/compliance/dga/verify/', {
      params: {
        codigo_obra: codigoObra,
        numero_comprobante: numeroComprobante,
        tipo_dga: tipoDga
      }
    });
    
    return {
      status: response.status,
      ...response.data
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        ...error.response.data
      };
    }
    throw error;
  }
};

// ==========================================
// ADMIN: CLIENTES, PROYECTOS, PUNTOS
// ==========================================

const getClients = async () => {
  const rq = await GET(`client/`);
  return rq.data;
};

const getProjects = async () => {
  const rq = await GET(`project_catchments/`);
  return rq.data;
};

const getCatchmentPoints = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`catchment_point/${query ? "?" + query : ""}`);
  return rq.data;
};

/**
 * 🆕 NUEVO: Obtener clientes con sus proyectos (para admin)
 * Endpoint optimizado que devuelve el árbol cliente → proyecto
 */
const getClientsWithProjects = async () => {
  const rq = await GET(`client/with-projects/`);
  return rq.data;
};

/**
 * 🆕 NUEVO: Obtener puntos de captación por proyecto (para admin)
 * Solo devuelve los puntos del proyecto seleccionado
 */
const getCatchmentPointsByProject = async (projectId) => {
  const rq = await GET(`catchment_point/all/?project=${projectId}`);
  return rq.data;
};

const sh = {
  authenticated: login,
  requestPasswordReset,
  confirmPasswordReset,
  getPublicAnnouncements,
  billing_data: get_history_data,
  billing_data_admin: get_history_data_admin,
  get_profile: get_profile,
  updateUser,
  downloadFile: downloadFile,
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
  get_data_day: getDataDay,
  get_data_month: getDataMonth,
  downloadMonth: downloadDataMonthToExcel,
  uploadFile: formUploadFile,
  deleteFile: deleteFile,
  getFiles: getFiles,
  notifications: {
    create: createNotification,
    get: getNotifications,
    actives: getNotificationsActives,
    getById: getNotificationById,
    delete: deleteNotification,
    update: updateNotification,
    // 🆕 NUEVO: Endpoints sin filtro de punto (para admin)
    getAllByType: getAllNotificationsByType,
    getByPoint: getNotificationsByPoint,
    responses: {
      get: getNotificationsResponse,
      create: createNotificationResponse,
    },
  },
  management: {
    systemStatus: getSystemStatus,
    systemMap: getSystemMap,
    resourcesStatus: getResourcesStatus,
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
    clientsWithProjects: getClientsWithProjects,
    pointsByProject: getCatchmentPointsByProject,
  },
  // 🆕 NUEVO: Endpoints para lazy loading de puntos
  getPointsAll: get_catchment_points_all,
  getPointDetail: get_catchment_point_detail,
  // 🆕 NUEVO: Endpoints optimizados con última telemetría
  getPointsSummary: get_points_summary,
  getPointSummary: get_point_summary,
  // 🆕 NUEVO: Puntos del usuario autenticado
  getMyPoints: get_my_points,
  // 🆕 BATCH NATIVO: Endpoints optimizados del backend
  batch: {
    telemetry: batchTelemetryNative,
    stats: batchStatsNative,
    summary: batchSummaryNative,
  },
  // 🆕 CENTRO DE CONTROL: Resumen diario agregado
  dailySummary: get_daily_summary,
  dashboardStats: get_dashboard_stats,
  chat,
  // 🆕 COMPLIANCE: Datos de cumplimiento con historial de caudal
  compliance: get_compliance,
  // 🆕 MEDICIONES POR PUNTO Y DÍA
  pointRecords: get_point_records,
  // 🆕 CONFIGURACIÓN TÉCNICA DEL PUNTO
  pointConfig: get_point_config,
  // 🆕 VERIFICACIÓN DGA
  verifyDgaVoucher,
};

export default sh;
