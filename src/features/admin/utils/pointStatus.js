export const STATUS = {
  ACTIVE: "active",
  DISCONNECTED: "disconnected",
  NO_DATA: "no_data",
  DISABLED: "disabled",
  UNKNOWN: "unknown",
};

export const statusColor = {
  [STATUS.ACTIVE]: "success",
  [STATUS.DISCONNECTED]: "error",
  [STATUS.NO_DATA]: "warning",
  [STATUS.DISABLED]: "default",
  [STATUS.UNKNOWN]: "default",
};

export const statusLabel = {
  [STATUS.ACTIVE]: "Activo",
  [STATUS.DISCONNECTED]: "Desconectado",
  [STATUS.NO_DATA]: "Sin datos",
  [STATUS.DISABLED]: "Desactivado",
  [STATUS.UNKNOWN]: "Desconocido",
};

/**
 * Infiere el estado operacional de un punto a partir de los campos reales
 * devueltos por management/points_status/.
 */
export const inferPointStatus = (record) => {
  if (!record) return STATUS.UNKNOWN;
  if (record.telemetry_active === false) return STATUS.DISABLED;
  if (!record.last_interaction) return STATUS.NO_DATA;
  if (record.last_interaction.is_error) return STATUS.DISCONNECTED;
  if (record.last_interaction.days_not_connection > 0) return STATUS.DISCONNECTED;
  return STATUS.ACTIVE;
};

/**
 * Cuenta puntos por estado usando la misma lógica de inferencia.
 */
export const countPointStatuses = (points = []) =>
  points.reduce(
    (acc, p) => {
      const st = inferPointStatus(p);
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    },
    { [STATUS.ACTIVE]: 0, [STATUS.DISCONNECTED]: 0, [STATUS.NO_DATA]: 0, [STATUS.DISABLED]: 0, [STATUS.UNKNOWN]: 0 }
  );
