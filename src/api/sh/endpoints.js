import { POST_LOGIN, GET, DOWNLOAD } from "./config";

const login = async (data) => {
  const request = await POST_LOGIN("users/login/", {
    email: data.email,
    password: data.password,
  });

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

const get_profile = async () => {
  const user = JSON.parse(localStorage.getItem("user") || null);
  const rq = await GET(`users/${user.username}/`);
  return rq.data;
};

const downloadFile = async (id_profile, initialDate, finishDate, title) => {
  const now_date = new Date();
  const rq = await DOWNLOAD(
    `interaction_detail/?profile_client=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}`,
    `${title}.xlsx`
  );
};

const getDataApiSh = async (id_profile) => {
  const rq = await GET(
    `interaction_detail_json/?profile_client=${id_profile}&hour=0`
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
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&page=${page}`
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
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}&page=${page}&date_time_medition__hour=00`
  );
  return rq.data;
};

const getDataApiShRangeDateGraphic = async (
  id_profile,
  initialDate,
  finishDate
) => {
  const rq = await GET(
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__date__range=${initialDate},${finishDate}`
  );
  return rq.data;
};

const getDataApiShDgaSend = async (id_profile, page) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = yesterday.getMonth() + 1;
  const day = yesterday.getDate();
  const rq = await GET(
    `interaction_detail_json/?profile_client=${id_profile}&is_send_dga=true&date_time_medition__day=${day}&date_time_medition__month=${month}&date_time_medition__year=${year}&page=${page}`
  );
  return rq.data;
};

const getDataApiShStructural24h = async (id_profile, year, month, day) => {
  var totalCount = 0;
  var listFormat = {};
  const rq1 = await GET(
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__day=${day}`
  ).then((r) => {
    console.log(r);
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
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__hour=00&date_time_medition__day__range=01,31`
  );
  const rq2 = await GET(
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__hour=00&page=2&date_time_medition__day__range=01,31`
  );
  const rq3 = await GET(
    `interaction_detail_json/?profile_client=${id_profile}&date_time_medition__year=${year}&date_time_medition__month=${month}&date_time_medition__hour=00&page=3&date_time_medition__day__range=01,31`
  );
  var listFormat = {
    ...rq1.data,
    results: [...rq1.data.results, ...rq2.data.results, ...rq3.data.results],
  };

  for (let i = 0; i < listFormat.results.length - 1; i++) {
    const current = listFormat.results[i];
    const next = listFormat.results[i + 1];
    const total = current.total - next.total;

    current.total_hora = total;
  }

  return listFormat;
};

const sh = {
  authenticated: login,
  billing_data: get_history_data,
  billing_data_admin: get_history_data_admin,
  get_profile: get_profile,
  downloadFile: downloadFile,
  get_data_sh: getDataApiSh,
  get_data_sh_range: getDataApiShRangeDate,
  get_data_sh_range_hour: getDataApiShRangeDateAndHour,
  get_data_send_dga: getDataApiShDgaSend,
  get_data_sh_range_graphic: getDataApiShRangeDateGraphic,
  get_data_structural: getDataApiShStructural24h,
  get_data_structural_month: getDataApiShStructuralMonth,
};

export default sh;
