import {
  POST_LOGIN,
  GET,
  DOWNLOAD,
  DELETE,
  POST,
  PATCH,
  Axios,
} from "./config";

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
    `interaction_detail_override/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}`,
  );
  return rq.data;
};

const getDataMonth = async (id_profile, initialDate, finishDate) => {
  const rq = await GET(
    `interaction_detail_override_month/?catchment_point=${id_profile}&date_time_medition__month=${initialDate.slice(
      5,
      7,
    )}&date_time_medition__year=${initialDate.slice(0, 4)}`,
  );
  return rq.data;
};

const downloadDataMonthToExcel = async (
  id_profile,
  initialDate,
  finishDate,
) => {
  await DOWNLOAD(
    `interaction_detail_override_month_xlsx/?catchment_point=${id_profile}&date_time_medition__month=${initialDate.slice(
      5,
      7,
    )}&date_time_medition__year=${initialDate.slice(0, 4)}`,
    `data.xlsx`,
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
        "No se pudo obtener el nombre de usuario. Por favor, inicia sesión nuevamente.",
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
  await DOWNLOAD(
    `interaction_detail/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&type=xlsx`,
    `${title}.xlsx`,
  );
};

const downloadFileDga = async (id_profile, initialDate, finishDate, title) => {
  await DOWNLOAD(
    `interaction_detail_dga/?point_catchment=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&type=xlsx`,
    `${title}.xlsx`,
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
    `interaction_detail_json/?catchment_point=${id_profile}&hour=0`,
  );
  return rq.data;
};
const getDataApiShRangeDate = async (
  id_profile,
  initialDate,
  finishDate,
  page,
) => {
  const rq = await GET(
    `interaction_detail_json/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&page=${page}`,
  );
  return rq.data;
};

const getDataApiShRangeDateToExcel = async (
  id_profile,
  initialDate,
  finishDate,
  page,
) => {
  const rq = await GET(
    `interaction_detail/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&page=${page}`,
  );
  return rq.data;
};

const getDataApiShRangeDateAndHour = async (
  id_profile,
  initialDate,
  finishDate,
  page,
) => {
  const rq = await GET(
    `interaction_detail_json/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&page=${page}&date_time_medition__hour=00`,
  );
  return rq.data;
};

const getDataApiShRangeDateGraphic = async (
  id_profile,
  initialDate,
  finishDate,
) => {
  const rq = await GET(
    `interaction_detail_json/?catchment_point=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}`,
  );
  return rq.data;
};

const getDataApiShDgaSend = async (id_profile, page) => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const rq = await GET(
    `interaction_detail_json/?profile_client=${id_profile.id}&page=${page}&date_time_medition__month=${month}&date_time_medition__year=${year}${
      id_profile.standard === "MEDIO" ? "&date_time_medition__hour=9" : ""
    }`,
  );

  return rq.data;
};

const getDataApiShStructural24h = async (id_profile, year, month, day) => {
  let totalCount = 0;
  let listFormat = {};
  const rq1 = await GET(
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__day=${day}`,
  ).then((r) => {
    totalCount = r.data.count;
    listFormat = { ...r.data, results: r.data.results };
    return r;
  });

  if (totalCount / 10 > 1) {
    const rq2 = await GET(
      `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__day=${day}&page=2`,
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
      `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__day=${day}&page=3`,
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
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__hour=12&date_time_medition__day__range=01,31`,
  );
  let listFormat = {
    ...rq1.data,
    results: [...rq1.data.results],
  };

  if (listFormat.results.length > 10) {
    const rq2 = await GET(
      `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__hour=12&page=2&date_time_medition__day__range=01,31`,
    );
    listFormat.results.push(...rq2.data.results);
  }

  if (listFormat.results.length > 20) {
    const rq3 = await GET(
      `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__hour=12&page=3&date_time_medition__day__range=01,31`,
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
    `notifications_catchment/?point_catchment=${id_point}&page=${page}&type_notification=${type}`,
  );
  return rq.data;
};

const getNotificationsActives = async (id_point, page, type) => {
  const rq = await GET(
    `notifications_catchment/?point_catchment=${id_point}&page=${page}&type_notification=${type}&is_active=true`,
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
const getNotificationsByPoint = async (
  pointId,
  type,
  page = 1,
  isActive = null,
) => {
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
    `response_notifications_catchment/?notification=${id_notification}&page=${page}`,
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

const deleteUser = async (username) => {
  const rq = await DELETE(`users/${username}/`);
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
  const rq = await GET(
    `management/telemetry_metrics/${query ? "?" + query : ""}`,
  );
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

/**
 * 🆕 CENTRO DE CONTROL: KPIs globales + lista de proyectos para filtro.
 * Endpoint: GET /api/ik/control_center/general_stats/
 * Devuelve overview, status_today, projects[] y chat_quota. Sin last_7 ni lista de puntos.
 */
const get_control_center_general_stats = async (signal) => {
  const rq = await GET(`ik/control_center/general_stats/`, null, signal ? { signal } : {});
  return rq.data;
};

/**
 * 🆕 CENTRO DE CONTROL: resumen diario agregado para armar las cajitas de días.
 * Endpoint: GET /api/ik/control_center/daily_summary/?start_date=&end_date=&project_id=
 */
const get_control_center_daily_summary = async (params = {}, signal) => {
  const query = new URLSearchParams();
  if (params.start_date) query.set("start_date", params.start_date);
  if (params.end_date) query.set("end_date", params.end_date);
  if (params.project_id != null) query.set("project_id", String(params.project_id));
  const qs = query.toString();
  const rq = await GET(`ik/control_center/daily_summary/${qs ? `?${qs}` : ""}`, null, signal ? { signal } : {});
  return rq.data;
};

/**
 * 🆕 CENTRO DE CONTROL: puntos de captación por proyecto.
 * Endpoint: GET /api/ik/control_center/project_points/?project_id=X
 */
const get_control_center_project_points = async (projectId, signal) => {
  const rq = await GET(`ik/control_center/project_points/?project_id=${projectId}`, null, signal ? { signal } : {});
  return rq.data;
};

/**
 * 🆕 CENTRO DE CONTROL: lista paginada de puntos con datos de un día específico.
 * Endpoint: GET /api/ik/control_center/list/?date=YYYY-MM-DD&project_id=&page=&page_size=
 */
const get_control_center_list = async (params = {}, signal) => {
  const query = new URLSearchParams();
  if (params.date) query.set("date", params.date);
  if (params.project_id != null) query.set("project_id", String(params.project_id));
  if (params.page != null) query.set("page", String(params.page));
  if (params.page_size != null) query.set("page_size", String(params.page_size));
  if (params.order_by) query.set("order_by", params.order_by);
  const qs = query.toString();
  const rq = await GET(`ik/control_center/list/${qs ? `?${qs}` : ""}`, null, signal ? { signal } : {});
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
 * 🆕 COMPLIANCE PAGINADO: Lista paginada de puntos con datos de cumplimiento.
 * Usa el mismo endpoint base /api/ik/compliance/ con query params de paginación.
 * El backend puede devolver respuesta plana { points: [...] } o paginada { count, results: [...] }.
 */
const get_compliance_list = async (params = {}, signal) => {
  const query = new URLSearchParams();
  if (params.page != null) query.set("page", String(params.page));
  if (params.page_size != null) query.set("page_size", String(params.page_size));
  if (params.project_id != null) query.set("project_id", String(params.project_id));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.order_by) query.set("order_by", params.order_by);
  if (params.warning_level) query.set("warning_level", params.warning_level);
  const qs = query.toString();
  const rq = await GET(`ik/compliance/${qs ? `?${qs}` : ""}`, null, signal ? { signal } : {});
  return rq.data;
};

/**
 * 🆕 COMPLIANCE TOGGLE: Activar/desactivar cumplimiento normativo de un punto (super admin).
 * Endpoint: POST /api/ik/management/toggle_compliance/
 * Body: { point_id, enabled }
 */
const toggle_compliance = async (pointId, enabled) => {
  const rq = await POST(`ik/management/toggle_compliance/`, {
    point_id: pointId,
    enabled,
  });
  return rq.data;
};

/**
 * 🆕 MEDICIONES POR PUNTO Y DÍA
 * Endpoint: GET /api/ik/point/{id}/records/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&limit=100
 * Devuelve registros detallados de un punto para un rango de fechas.
 */
const get_point_records = async (pointId, startDate, endDate, limit = 100) => {
  const rq = await GET(
    `ik/point/${pointId}/records/?start_date=${startDate}&end_date=${endDate}&limit=${limit}`,
  );
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
const verifyDgaVoucher = async (
  codigoObra,
  numeroComprobante,
  tipoDga = "SUPERFICIAL",
) => {
  try {
    const response = await GET("compliance/dga/verify/", null, {
      params: {
        codigo_obra: codigoObra,
        numero_comprobante: numeroComprobante,
        tipo_dga: tipoDga,
      },
    });
    return { status: response.status, ...response.data };
  } catch (error) {
    if (error.response) {
      return { status: error.response.status, ...error.response.data };
    }
    throw error;
  }
};

// ==========================================
// USUARIOS / AUTH
// ==========================================

const getMe = async () => {
  const rq = await GET(`users/me/`);
  return rq.data;
};

const changePassword = async (currentPassword, newPassword) => {
  const rq = await POST(`users/change-password/`, {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return rq.data;
};

const getUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`users/${query ? "?" + query : ""}`);
  return rq.data;
};

const getUser = async (username) => {
  const rq = await GET(`users/${username}/`);
  return rq.data;
};

const createUser = async (data) => {
  const rq = await POST(`users/`, data);
  return rq.data;
};

const signupUser = async (data) => {
  const rq = await POST(`users/signup/`, data);
  return rq.data;
};

// ==========================================
// VARIABLES / ESQUEMAS / PROVEEDORES
// ==========================================

const getVariables = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`variable/${query ? "?" + query : ""}`);
  return rq.data;
};

const getVariable = async (id) => {
  const rq = await GET(`variable/${id}/`);
  return rq.data;
};

const createVariable = async (data) => {
  const rq = await POST(`variable/`, data);
  return rq.data;
};

const updateVariable = async (id, data) => {
  const rq = await PATCH(`variable/${id}/`, data);
  return rq.data;
};

const deleteVariable = async (id) => {
  const rq = await DELETE(`variable/${id}/`);
  return rq.data;
};

const getSchemes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`schemes_catchment/${query ? "?" + query : ""}`);
  return rq.data;
};

const getScheme = async (id) => {
  const rq = await GET(`schemes_catchment/${id}/`);
  return rq.data;
};

const createScheme = async (data) => {
  const rq = await POST(`schemes_catchment/`, data);
  return rq.data;
};

const updateScheme = async (id, data) => {
  const rq = await PATCH(`schemes_catchment/${id}/`, data);
  return rq.data;
};

const deleteScheme = async (id) => {
  const rq = await DELETE(`schemes_catchment/${id}/`);
  return rq.data;
};

const getTelemetryProviders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`telemetry_providers/${query ? "?" + query : ""}`);
  return rq.data;
};

const getTelemetryProvider = async (id) => {
  const rq = await GET(`telemetry_providers/${id}/`);
  return rq.data;
};

const getComplianceProviders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`compliance_providers/${query ? "?" + query : ""}`);
  return rq.data;
};

const getComplianceProvider = async (id) => {
  const rq = await GET(`compliance_providers/${id}/`);
  return rq.data;
};

// ==========================================
// TICKETS DE SOPORTE (/api/ik/tickets/)
// ==========================================

const getTickets = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`ik/tickets/${query ? "?" + query : ""}`);
  return rq.data;
};

const getTicket = async (id) => {
  const rq = await GET(`ik/tickets/${id}/`);
  return rq.data;
};

const createTicket = async (data) => {
  const rq = await POST(`ik/tickets/`, data);
  return rq.data;
};

const updateTicket = async (id, data) => {
  const rq = await PATCH(`ik/tickets/${id}/`, data);
  return rq.data;
};

const assignTicket = async (id, assignedTo) => {
  const rq = await POST(`ik/tickets/${id}/assign/`, { assigned_to: assignedTo });
  return rq.data;
};

const changeTicketStatus = async (id, status) => {
  const rq = await POST(`ik/tickets/${id}/status/`, { status });
  return rq.data;
};

const getTicketComments = async (id, page = 1) => {
  const rq = await GET(`ik/tickets/${id}/comments/?page=${page}`);
  return rq.data;
};

const createTicketComment = async (id, data) => {
  const rq = await POST(`ik/tickets/${id}/comments/`, data);
  return rq.data;
};

const getTicketAttachments = async (id) => {
  const rq = await GET(`ik/tickets/${id}/attachments/`);
  return rq.data;
};

const uploadTicketAttachment = async (id, formData) => {
  const rq = await Axios.post(`ik/tickets/${id}/attachments/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return rq.data;
};

const getTicketStats = async () => {
  const rq = await GET(`ik/tickets/stats/`);
  return rq.data;
};

// ==========================================
// SYSTEM EVENTS / AUDITORÍA
// ==========================================

const getSystemEvents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`system_events/${query ? "?" + query : ""}`);
  return rq.data;
};

const getSystemEventsSummary = async () => {
  const rq = await GET(`ik/system-events/summary/`);
  return rq.data;
};

// ==========================================
// ALERTAS: REGLAS, CANALES, DISPAROS
// ==========================================

const getAlertRules = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`alert_rules/${query ? "?" + query : ""}`);
  return rq.data;
};

const getAlertRule = async (id) => {
  const rq = await GET(`alert_rules/${id}/`);
  return rq.data;
};

const createAlertRule = async (data) => {
  const rq = await POST(`alert_rules/`, data);
  return rq.data;
};

const updateAlertRule = async (id, data) => {
  const rq = await PATCH(`alert_rules/${id}/`, data);
  return rq.data;
};

const deleteAlertRule = async (id) => {
  const rq = await DELETE(`alert_rules/${id}/`);
  return rq.data;
};

const getAlertChannels = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`alert_channels/${query ? "?" + query : ""}`);
  return rq.data;
};

const createAlertChannel = async (data) => {
  const rq = await POST(`alert_channels/`, data);
  return rq.data;
};

const updateAlertChannel = async (id, data) => {
  const rq = await PATCH(`alert_channels/${id}/`, data);
  return rq.data;
};

const deleteAlertChannel = async (id) => {
  const rq = await DELETE(`alert_channels/${id}/`);
  return rq.data;
};

const getAlertTriggers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`alert_triggers/${query ? "?" + query : ""}`);
  return rq.data;
};

const acknowledgeAlertTrigger = async (id) => {
  const rq = await PATCH(`alert_triggers/${id}/`, { is_acknowledged: true });
  return rq.data;
};

// ==========================================
// CRUDS: CLIENTES, PROYECTOS, PUNTOS
// ==========================================

const getClients = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`client/${query ? "?" + query : ""}`);
  return rq.data;
};

const getClientsAll = async () => {
  const rq = await GET(`client/all/`);
  return rq.data;
};

const createClient = async (data) => {
  const rq = await POST(`client/`, data);
  return rq.data;
};

const updateClient = async (id, data) => {
  const rq = await PATCH(`client/${id}/`, data);
  return rq.data;
};

const deleteClient = async (id) => {
  const rq = await DELETE(`client/${id}/`);
  return rq.data;
};

const getProjects = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`project_catchments/${query ? "?" + query : ""}`);
  return rq.data;
};

const getProjectsAll = async () => {
  const rq = await GET(`project_catchments/all/`);
  return rq.data;
};

const createProject = async (data) => {
  const rq = await POST(`project_catchments/`, data);
  return rq.data;
};

const updateProject = async (id, data) => {
  const rq = await PATCH(`project_catchments/${id}/`, data);
  return rq.data;
};

const deleteProject = async (id) => {
  const rq = await DELETE(`project_catchments/${id}/`);
  return rq.data;
};

const getCatchmentPoints = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const rq = await GET(`catchment_point/${query ? "?" + query : ""}`);
  return rq.data;
};

const getCatchmentPoint = async (id) => {
  const rq = await GET(`catchment_point/${id}/`);
  return rq.data;
};

const createCatchmentPoint = async (data) => {
  const rq = await POST(`catchment_point/`, data);
  return rq.data;
};

const updateCatchmentPoint = async (id, data) => {
  const rq = await PATCH(`catchment_point/${id}/`, data);
  return rq.data;
};

const deleteCatchmentPoint = async (id) => {
  const rq = await DELETE(`catchment_point/${id}/`);
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

// ==========================================
// PUNTOS DE CAPTACIÓN UNIFICADOS → /api/points/
// ==========================================

const pointsList = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.project != null) query.set("project", String(params.project));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.page != null) query.set("page", String(params.page));
  if (params.page_size != null) query.set("page_size", String(params.page_size));
  if (params.order_by) query.set("order_by", params.order_by);
  if (params.mine != null) query.set("mine", String(params.mine));
  const qs = query.toString();
  const rq = await GET(`points/${qs ? `?${qs}` : ""}`);
  return rq.data;
};

const pointsGet = async (id) => {
  const rq = await GET(`points/${id}/`);
  return rq.data;
};

const pointsCreate = async (data) => {
  const rq = await POST(`points/`, data);
  return rq.data;
};

const pointsUpdate = async (id, data) => {
  const rq = await PATCH(`points/${id}/`, data);
  return rq.data;
};

const pointsDelete = async (id) => {
  const rq = await DELETE(`points/${id}/`);
  return rq.data;
};

const pointsRecords = async (id, { startDate, endDate, limit = 100, hours } = {}) => {
  const query = new URLSearchParams();
  if (startDate) query.set("start_date", startDate);
  if (endDate) query.set("end_date", endDate);
  if (limit != null) query.set("limit", String(limit));
  if (hours != null) query.set("hours", String(hours));
  const qs = query.toString();
  const rq = await GET(`points/${id}/records/${qs ? `?${qs}` : ""}`);
  return rq.data;
};

const pointsLatest = async (id) => {
  const rq = await GET(`points/${id}/latest/`);
  return rq.data;
};

const pointStatus = async (id, thresholdMinutes) => {
  const qs = thresholdMinutes != null ? `?threshold_minutes=${thresholdMinutes}` : "";
  const rq = await GET(`points/${id}/status/${qs}`);
  return rq.data;
};

const pointsConfig = async (id) => {
  const rq = await GET(`points/${id}/config/`);
  return rq.data;
};

const pointsConfigUpdate = async (id, config) => {
  const rq = await PATCH(`points/${id}/config/`, { config });
  return rq.data;
};

const pointsVariables = async (id) => {
  const rq = await GET(`points/${id}/variables/`);
  return rq.data;
};

const pointsSummary = async (id) => {
  const rq = await GET(`points/${id}/summary/`);
  return rq.data;
};

const pointsBatchStatus = async (ids = []) => {
  if (!ids.length) return { count: 0, statuses: {} };
  const query = new URLSearchParams();
  query.set("ids", ids.join(","));
  const rq = await GET(`points/batch_status/?${query.toString()}`);
  return rq.data;
};

const pointsMine = async (params = {}) => pointsList({ ...params, mine: true });

const sh = {
  authenticated: login,
  requestPasswordReset,
  confirmPasswordReset,
  getPublicAnnouncements,
  billing_data: get_history_data,
  billing_data_admin: get_history_data_admin,
  get_profile: get_profile,
  me: getMe,
  changePassword,
  updateUser,
  deleteUser,
  getUsers,
  getUser,
  createUser,
  signupUser,
  getVariables,
  getVariable,
  createVariable,
  updateVariable,
  deleteVariable,
  getSchemes,
  getScheme,
  createScheme,
  updateScheme,
  deleteScheme,
  getTelemetryProviders,
  getTelemetryProvider,
  getComplianceProviders,
  getComplianceProvider,
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
  systemEvents: {
    get: getSystemEvents,
    summary: getSystemEventsSummary,
  },
  tickets: {
    get: getTickets,
    getById: getTicket,
    create: createTicket,
    update: updateTicket,
    assign: assignTicket,
    changeStatus: changeTicketStatus,
    getComments: getTicketComments,
    createComment: createTicketComment,
    getAttachments: getTicketAttachments,
    uploadAttachment: uploadTicketAttachment,
    stats: getTicketStats,
  },
  alerts: {
    rules: {
      get: getAlertRules,
      getById: getAlertRule,
      create: createAlertRule,
      update: updateAlertRule,
      delete: deleteAlertRule,
    },
    channels: {
      get: getAlertChannels,
      create: createAlertChannel,
      update: updateAlertChannel,
      delete: deleteAlertChannel,
    },
    triggers: {
      get: getAlertTriggers,
      acknowledge: acknowledgeAlertTrigger,
    },
  },
  admin: {
    clients: getClients,
    clientsAll: getClientsAll,
    createClient,
    updateClient,
    deleteClient,
    projects: getProjects,
    projectsAll: getProjectsAll,
    createProject,
    updateProject,
    deleteProject,
    catchmentPoints: getCatchmentPoints,
    getCatchmentPoint,
    createCatchmentPoint,
    updateCatchmentPoint,
    deleteCatchmentPoint,
    clientsWithProjects: getClientsWithProjects,
    pointsByProject: getCatchmentPointsByProject,
    getPointsAll: get_catchment_points_all,
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
  // 🆕 PUNTOS UNIFICADOS: /api/points/
  points: {
    list: pointsList,
    get: pointsGet,
    create: pointsCreate,
    update: pointsUpdate,
    delete: pointsDelete,
    records: pointsRecords,
    latest: pointsLatest,
    status: pointStatus,
    config: pointsConfig,
    configUpdate: pointsConfigUpdate,
    variables: pointsVariables,
    summary: pointsSummary,
    batchStatus: pointsBatchStatus,
    mine: pointsMine,
  },
  // 🆕 CENTRO DE CONTROL: Resumen diario agregado
  dailySummary: get_daily_summary,
  dashboardStats: get_dashboard_stats,
  controlCenterGeneralStats: get_control_center_general_stats,
  controlCenterDailySummary: get_control_center_daily_summary,
  controlCenterProjectPoints: get_control_center_project_points,
  controlCenterList: get_control_center_list,
  chat,
  // 🆕 COMPLIANCE: Datos de cumplimiento con historial de caudal
  compliance: get_compliance,
  complianceList: get_compliance_list,
  toggleCompliance: toggle_compliance,
  // 🆕 MEDICIONES POR PUNTO Y DÍA
  pointRecords: get_point_records,
  // 🆕 CONFIGURACIÓN TÉCNICA DEL PUNTO
  pointConfig: get_point_config,
  // 🆕 VERIFICACIÓN DGA
  verifyDgaVoucher,
};

export default sh;
