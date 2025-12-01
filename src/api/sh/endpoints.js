import { upload } from "@testing-library/user-event/dist/upload";
import { POST_LOGIN, GET, DOWNLOAD, DELETE, POST } from "./config";

const login = async (data) => {
  const request = await POST_LOGIN("users/login/", {
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

  // Validar y ordenar catchment_points si existen
  if (
    request.data.user.catchment_points &&
    Array.isArray(request.data.user.catchment_points)
  ) {
    request.data.user.catchment_points.sort(
      (a, b) => b.is_monitoring - a.is_monitoring
    );
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

const deleteNotification = async (id) => {
  const rq = await DELETE(`notifications_catchment/${id}/`);
  return rq.data;
};

const updateNotification = async (id, data) => {
  const rq = await POST(`notifications_catchment/${id}/`, data);
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

const sh = {
  authenticated: login,
  billing_data: get_history_data,
  billing_data_admin: get_history_data_admin,
  get_profile: get_profile,
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
    delete: deleteNotification,
    update: updateNotification,
    responses: {
      get: getNotificationsResponse,
      create: createNotificationResponse,
    },
  },
};

export default sh;
