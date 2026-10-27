/** Paths relativos a VITE_API_URL (`…/api`). El segmento `ik/` arma `/api/ik/`. */

export const catchmentPointPath = (id: string | number) => `ik/catchment_point/${id}/`;

export const interactionDetailJsonPath = (id: string | number) => `ik/interaction_detail_json/${id}/`;

export const monthXlsxPath = (idProfile: string | number, initialDate: string) => {
  const month = initialDate.slice(5, 7);
  const year = initialDate.slice(0, 4);
  return `ik/interaction_detail_override_month_xlsx/?catchment_point=${idProfile}&date_time_medition__month=${month}&date_time_medition__year=${year}`;
};

export const monthOverridePath = (idProfile: string | number, initialDate: string) => {
  const month = initialDate.slice(5, 7);
  const year = initialDate.slice(0, 4);
  return `ik/interaction_detail_override_month/?catchment_point=${idProfile}&date_time_medition__month=${month}&date_time_medition__year=${year}`;
};
