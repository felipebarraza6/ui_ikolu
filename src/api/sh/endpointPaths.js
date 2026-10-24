/**
 * Constructores de paths de API (sin I/O). Facilita tests y evita URLs hardcodeadas.
 */

export const catchmentPointPath = (id) => `catchment_point/${id}/`;

export const interactionDetailJsonPath = (id) => `interaction_detail_json/${id}/`;

export const monthXlsxPath = (id_profile, initialDate) => {
  const month = initialDate.slice(5, 7);
  const year = initialDate.slice(0, 4);
  return `interaction_detail_override_month_xlsx/?catchment_point=${id_profile}&date_time_medition__month=${month}&date_time_medition__year=${year}`;
};

export const monthOverridePath = (id_profile, initialDate) => {
  const month = initialDate.slice(5, 7);
  const year = initialDate.slice(0, 4);
  return `interaction_detail_override_month/?catchment_point=${id_profile}&date_time_medition__month=${month}&date_time_medition__year=${year}`;
};
