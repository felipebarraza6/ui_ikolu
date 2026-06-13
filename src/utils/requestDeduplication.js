/**
 * Request Deduplication System
 *
 * Evita llamadas API duplicadas cuando múltiples componentes
 * solicitan los mismos datos simultáneamente.
 *
 * Ejemplo:
 * - Componente A pide get_profile()
 * - Componente B pide get_profile() 100ms después
 * - Solo se hace 1 llamada real, ambos reciben el mismo resultado
 */

const pendingRequests = new Map();

/**
 * Deduplica requests basados en una clave única
 * @param {string} key - Identificador único del request
 * @param {Function} fetcher - Función que hace el request real
 * @returns {Promise} - Promesa del request (compartida si ya existe)
 */
export const deduplicateRequest = async (key, fetcher) => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // Crear nueva promesa y limpiarla cuando termine
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};

/**
 * Genera claves consistentes para deduplicación
 */
export const DedupKeys = {
  profile: (username) => `profile_${username || "current"}`,
  telemetry: (profileId) => `telemetry_${profileId}`,
  telemetryRange: (profileId, start, end) =>
    `telemetry_${profileId}_${start}_${end}`,
  dayData: (profileId, date) => `day_${profileId}_${date}`,
  monthData: (profileId, yearMonth) => `month_${profileId}_${yearMonth}`,
  notifications: (profileId, page, type) =>
    `notifications_${profileId}_${page}_${type}`,
  batchTelemetry: (pointIds, hours) => `batch_telemetry_${pointIds}_${hours}`,
  batchStats: (pointIds, days) => `batch_stats_${pointIds}_${days}`,
  batchSummary: (pointIds) => `batch_summary_${pointIds}`,
};

/**
 * Limpia todos los requests pendientes (útil en logout)
 */
export const clearPendingRequests = () => {
  pendingRequests.clear();
};

export default deduplicateRequest;
