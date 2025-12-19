/**
 * Optimized API Endpoints
 * 
 * Versiones optimizadas de los endpoints con:
 * - Request deduplication
 * - Caching automático
 * - Llamadas en paralelo donde sea posible
 */

import sh from './endpoints';
import { deduplicateRequest, DedupKeys } from '../../utils/requestDeduplication';
import { withCache, CacheKeys } from '../../utils/dataCache';

/**
 * Get profile con deduplicación y caché
 */
export const getProfileOptimized = async (username = null, token = null) => {
  const key = DedupKeys.profile(username);
  
  return deduplicateRequest(key, () => 
    withCache(
      CacheKeys.profile(username || 'current'),
      () => sh.get_profile(username, token),
      2 * 60 * 1000 // 2 minutos de caché
    )
  );
};

/**
 * Get telemetry data con deduplicación y caché
 */
export const getTelemetryOptimized = async (profileId) => {
  const key = DedupKeys.telemetry(profileId);
  
  return deduplicateRequest(key, () =>
    withCache(
      CacheKeys.telemetry(profileId),
      () => sh.get_data_sh(profileId),
      1 * 60 * 1000 // 1 minuto de caché para datos en tiempo real
    )
  );
};

/**
 * Batch telemetry - Obtiene datos de múltiples perfiles en paralelo
 * (Temporal hasta que el backend tenga endpoint batch)
 */
export const getBatchTelemetryOptimized = async (profileIds) => {
  console.log(`[Batch] Fetching telemetry for ${profileIds.length} profiles in parallel`);
  
  // Hacer todas las llamadas en paralelo en lugar de secuencial
  const promises = profileIds.map(id => getTelemetryOptimized(id));
  const results = await Promise.all(promises);
  
  // Retornar en formato de objeto para fácil acceso
  return profileIds.reduce((acc, id, index) => {
    acc[id] = results[index];
    return acc;
  }, {});
};

/**
 * Get day data con caché
 */
export const getDayDataOptimized = async (profileId, initialDate, finishDate) => {
  const cacheKey = CacheKeys.dayData(profileId, `${initialDate}_${finishDate}`);
  
  return withCache(
    cacheKey,
    () => sh.get_data_day(profileId, initialDate, finishDate),
    5 * 60 * 1000 // 5 minutos - datos históricos cambian menos
  );
};

/**
 * Get month data con caché
 */
export const getMonthDataOptimized = async (profileId, initialDate, finishDate) => {
  const yearMonth = initialDate.slice(0, 7); // YYYY-MM
  const cacheKey = CacheKeys.monthData(profileId, yearMonth);
  
  return withCache(
    cacheKey,
    () => sh.get_data_month(profileId, initialDate, finishDate),
    10 * 60 * 1000 // 10 minutos - datos mensuales son más estables
  );
};

/**
 * Get notifications con caché
 */
export const getNotificationsOptimized = async (profileId, page, type) => {
  const cacheKey = CacheKeys.notifications(profileId, type);
  
  return withCache(
    cacheKey,
    () => sh.notifications.get(profileId, page, type),
    2 * 60 * 1000 // 2 minutos
  );
};

/**
 * Get active notifications con caché
 */
export const getActiveNotificationsOptimized = async (profileId, page, type) => {
  const cacheKey = `${CacheKeys.notifications(profileId, type)}_active`;
  
  return withCache(
    cacheKey,
    () => sh.notifications.actives(profileId, page, type),
    1 * 60 * 1000 // 1 minuto - alertas activas necesitan estar frescas
  );
};

// Exportar objeto con todos los métodos optimizados
const optimizedSh = {
  get_profile: getProfileOptimized,
  get_data_sh: getTelemetryOptimized,
  get_batch_telemetry: getBatchTelemetryOptimized,
  get_data_day: getDayDataOptimized,
  get_data_month: getMonthDataOptimized,
  notifications: {
    get: getNotificationsOptimized,
    actives: getActiveNotificationsOptimized,
  },
  // Mantener acceso a métodos originales para casos especiales
  _original: sh,
};

export default optimizedSh;
