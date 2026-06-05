/**
 * API Orchestrator — Orquestación centralizada de llamadas a API
 *
 * Problemas que resuelve:
 * 1. Evita llamadas duplicadas desde múltiples componentes
 * 2. Usa endpoints BATCH nativos del backend (/api/ik/batch/*)
 * 3. Cancela requests obsoletos con AbortController
 * 4. Prioriza requests críticos vs secundarios
 * 5. Throttlea refrescos automáticos para no saturar
 *
 * Patrón: Singleton con cola de prioridad
 */

import sh from './sh/endpoints';
import { dataCache, CacheKeys } from '../utils/dataCache';
import { deduplicateRequest, DedupKeys } from '../utils/requestDeduplication';

// ──────────────────────────────────────────
// Configuración
// ──────────────────────────────────────────
const CONFIG = {
  // TTL de caché por tipo de dato (ms)
  CACHE_TTL: {
    telemetry: 30 * 1000,      // 30s — datos en "tiempo real"
    profile: 2 * 60 * 1000,    // 2min — perfil de usuario
    pointsList: 60 * 1000,     // 1min — lista de puntos
    stats: 60 * 1000,          // 1min — estadísticas
    batch: 30 * 1000,          // 30s — batch telemetry
    notifications: 2 * 60 * 1000, // 2min
    dayData: 5 * 60 * 1000,    // 5min — histórico
    monthData: 10 * 60 * 1000, // 10min — mensual
  },
  // Intervalo mínimo entre refrescos automáticos (ms)
  MIN_REFRESH_INTERVAL: 30 * 1000,
  // Máximo de puntos por batch request
  MAX_BATCH_SIZE: 50,
};

// ──────────────────────────────────────────
// AbortController registry — para cancelar requests obsoletos
// ──────────────────────────────────────────
const abortControllers = new Map();

const getAbortController = (key) => {
  // Cancelar request anterior si existe
  if (abortControllers.has(key)) {
    abortControllers.get(key).abort();
  }
  const ctrl = new AbortController();
  abortControllers.set(key, ctrl);
  return ctrl;
};

const cleanupAbortController = (key) => {
  abortControllers.delete(key);
};

// ──────────────────────────────────────────
// Priority Queue para requests (concurrente)
// ──────────────────────────────────────────
const PRIORITY = {
  CRITICAL: 0,   // Login, logout, acciones de usuario
  HIGH: 1,       // Datos de perfil, telemetría actual
  NORMAL: 2,     // Listas, estadísticas
  LOW: 3,        // Históricos, exports
};

const MAX_CONCURRENT = 6;
let activeCount = 0;
const pendingByPriority = {
  [PRIORITY.CRITICAL]: [],
  [PRIORITY.HIGH]: [],
  [PRIORITY.NORMAL]: [],
  [PRIORITY.LOW]: [],
};

const enqueueRequest = (fn, priority = PRIORITY.NORMAL) => {
  pendingByPriority[priority].push(fn);
  processQueue();
};

const processQueue = () => {
  while (activeCount < MAX_CONCURRENT) {
    let fn = null;
    for (const prio of [PRIORITY.CRITICAL, PRIORITY.HIGH, PRIORITY.NORMAL, PRIORITY.LOW]) {
      if (pendingByPriority[prio].length > 0) {
        fn = pendingByPriority[prio].shift();
        break;
      }
    }
    if (!fn) break;

    activeCount++;
    fn()
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('[Orchestrator] Request error:', err);
        }
      })
      .finally(() => {
        activeCount--;
        processQueue();
      });
  }
};

// ──────────────────────────────────────────
// Helpers de caché con TTL
// ──────────────────────────────────────────
const getCached = (key) => {
  const cached = dataCache.get(key);
  if (cached !== null) {
    return cached;
  }
  return null;
};

const setCached = (key, data, ttl) => {
  dataCache.set(key, data, ttl);
};

// ──────────────────────────────────────────
// Orchestrator API
// ──────────────────────────────────────────

/**
 * Obtiene datos de telemetría para múltiples puntos usando BATCH nativo
 * Más eficiente que N llamadas individuales
 */
export const getBatchTelemetry = async (pointIds, options = {}) => {
  const { hours = 1, useCache = true } = options;

  if (!pointIds || pointIds.length === 0) {
    return { data: {}, meta: { requested: 0, returned: 0 } };
  }

  const cacheKey = CacheKeys.batchTelemetry(pointIds.join(','), hours);

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const key = DedupKeys.batchTelemetry(pointIds.join(','), hours);

  return deduplicateRequest(key, async () => {
    try {
      // Usar endpoint batch nativo del backend
      const response = await sh.batch.telemetry(pointIds.slice(0, CONFIG.MAX_BATCH_SIZE), hours);
      if (useCache) setCached(cacheKey, response, CONFIG.CACHE_TTL.batch);
      return response;
    } catch (err) {
      // Fallback: llamadas individuales en paralelo
      console.warn('[Orchestrator] Batch telemetry failed, falling back to individual calls:', err.message);
      const promises = pointIds.map(id =>
        sh.get_data_sh(id).catch(() => null)
      );
      const results = await Promise.all(promises);
      const data = pointIds.reduce((acc, id, idx) => {
        if (results[idx]) acc[id] = { latest: results[idx]?.results?.[0] || results[idx] };
        return acc;
      }, {});
      const fallback = { data, meta: { requested: pointIds.length, returned: Object.keys(data).length } };
      if (useCache) setCached(cacheKey, fallback, CONFIG.CACHE_TTL.batch);
      return fallback;
    }
  });
};

/**
 * Obtiene estadísticas agregadas para múltiples puntos
 */
export const getBatchStats = async (pointIds, options = {}) => {
  const { days = 30, useCache = true } = options;

  if (!pointIds || pointIds.length === 0) {
    return { data: {}, meta: { requested: 0, returned: 0 } };
  }

  const cacheKey = CacheKeys.batchStats(pointIds.join(','), days);

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const key = DedupKeys.batchStats(pointIds.join(','), days);

  return deduplicateRequest(key, async () => {
    try {
      const response = await sh.batch.stats(pointIds.slice(0, CONFIG.MAX_BATCH_SIZE), days);
      if (useCache) setCached(cacheKey, response, CONFIG.CACHE_TTL.stats);
      return response;
    } catch (err) {
      console.warn('[Orchestrator] Batch stats failed:', err.message);
      return { data: {}, meta: { requested: pointIds.length, returned: 0, error: err.message } };
    }
  });
};

/**
 * Obtiene resumen de puntos con última telemetría (batch nativo)
 */
export const getBatchSummary = async (pointIds, options = {}) => {
  const { useCache = true } = options;

  if (!pointIds || pointIds.length === 0) return { data: {} };

  const cacheKey = `batch_summary_${pointIds.join(',')}`;

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      const response = await sh.batch.summary(pointIds.slice(0, CONFIG.MAX_BATCH_SIZE));
      if (useCache) setCached(cacheKey, response, CONFIG.CACHE_TTL.batch);
      return response;
    } catch (err) {
      console.warn('[Orchestrator] Batch summary failed:', err.message);
      return { data: {} };
    }
  });
};

/**
 * Obtiene el perfil del usuario con caché
 */
export const getProfileOrchestrated = async (options = {}) => {
  const { useCache = true, username = null } = options;
  const cacheKey = CacheKeys.profile(username || 'current');

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const key = DedupKeys.profile(username);

  return deduplicateRequest(key, async () => {
    const data = await sh.get_profile(username);
    if (useCache) setCached(cacheKey, data, CONFIG.CACHE_TTL.profile);
    return data;
  });
};

/**
 * Obtiene lista de puntos del usuario (optimizada)
 */
export const getPointsListOrchestrated = async (options = {}) => {
  const { useCache = true, isAdmin = false } = options;
  const cacheKey = `points_list_${isAdmin ? 'admin' : 'user'}`;

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  return deduplicateRequest(cacheKey, async () => {
    let points;
    if (isAdmin) {
      const response = await sh.getPointsAll();
      points = response.results || response || [];
    } else {
      const response = await sh.getMyPoints();
      points = Array.isArray(response) ? response : (response.points || response.results || []);
    }
    if (useCache) setCached(cacheKey, points, CONFIG.CACHE_TTL.pointsList);
    return points;
  });
};

/**
 * Obtiene datos de un día específico con caché
 */
export const getDayDataOrchestrated = async (profileId, initialDate, finishDate, options = {}) => {
  const { useCache = true } = options;
  const cacheKey = CacheKeys.dayData(profileId, `${initialDate}_${finishDate}`);

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const key = DedupKeys.dayData(profileId, `${initialDate}_${finishDate}`);

  return deduplicateRequest(key, async () => {
    const data = await sh.get_data_day(profileId, initialDate, finishDate);
    if (useCache) setCached(cacheKey, data, CONFIG.CACHE_TTL.dayData);
    return data;
  });
};

/**
 * Obtiene datos mensuales con caché
 */
export const getMonthDataOrchestrated = async (profileId, initialDate, finishDate, options = {}) => {
  const { useCache = true } = options;
  const yearMonth = initialDate.slice(0, 7);
  const cacheKey = CacheKeys.monthData(profileId, yearMonth);

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const key = DedupKeys.monthData(profileId, yearMonth);

  return deduplicateRequest(key, async () => {
    const data = await sh.get_data_month(profileId, initialDate, finishDate);
    if (useCache) setCached(cacheKey, data, CONFIG.CACHE_TTL.monthData);
    return data;
  });
};

/**
 * Obtiene notificaciones con caché
 */
export const getNotificationsOrchestrated = async (profileId, page, type, options = {}) => {
  const { useCache = true, activeOnly = false } = options;
  const cacheKey = activeOnly
    ? `${CacheKeys.notifications(profileId, type)}_active`
    : CacheKeys.notifications(profileId, type);

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const key = DedupKeys.notifications(profileId, page, type);

  return deduplicateRequest(key, async () => {
    const data = activeOnly
      ? await sh.notifications.actives(profileId, page, type)
      : await sh.notifications.get(profileId, page, type);
    if (useCache) setCached(cacheKey, data, CONFIG.CACHE_TTL.notifications);
    return data;
  });
};

// ──────────────────────────────────────────
// Hook helper: useAutoRefresh con throttle
// ──────────────────────────────────────────

/**
 * Crea un intervalo de auto-refresh con throttle y cleanup
 * @param {Function} callback - Función a ejecutar
 * @param {number} interval - Intervalo en ms
 * @param {Array} deps - Dependencias para resetear el intervalo
 * @returns {Object} { refresh, cancel }
 */
export const createAutoRefresh = (callback, interval, deps = []) => {
  let lastRefresh = 0;
  let timeoutId = null;

  const throttledCallback = async () => {
    const now = Date.now();
    if (now - lastRefresh < CONFIG.MIN_REFRESH_INTERVAL) {
      return;
    }
    lastRefresh = now;
    try {
      await callback();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[AutoRefresh] Error:', err);
      }
    }
  };

  const start = () => {
    cancel();
    throttledCallback();
    timeoutId = setInterval(throttledCallback, interval);
  };

  const cancel = () => {
    if (timeoutId) {
      clearInterval(timeoutId);
      timeoutId = null;
    }
  };

  const refresh = () => {
    lastRefresh = 0;
    return throttledCallback();
  };

  // Reiniciar intervalo cuando cambian dependencias
  const reset = () => {
    cancel();
    start();
  };

  // Iniciar automáticamente
  start();

  return { refresh, cancel, start, reset };
};

// ──────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────

/**
 * Cancela todos los requests pendientes
 */
export const cancelAllRequests = () => {
  abortControllers.forEach((ctrl) => {
    try { ctrl.abort(); } catch (e) { /* ignore */ }
  });
  abortControllers.clear();
  Object.values(pendingByPriority).forEach((q) => (q.length = 0));
  activeCount = 0;
};

/**
 * Invalida caché relacionada con puntos específicos
 */
export const invalidatePointCache = (pointId) => {
  dataCache.invalidatePattern(`telemetry_${pointId}`);
  dataCache.invalidatePattern(`day_${pointId}`);
  dataCache.invalidatePattern(`month_${pointId}`);
  dataCache.invalidatePattern(`batch_summary`);
  dataCache.invalidatePattern(`batch_telemetry`);
};

/**
 * Estadísticas del orquestador
 */
export const getOrchestratorStats = () => {
  const totalPending = Object.values(pendingByPriority).reduce((sum, q) => sum + q.length, 0);
  return {
    pendingRequests: totalPending,
    activeRequests: activeCount,
    activeAbortControllers: abortControllers.size,
    cacheStats: dataCache.getStats(),
  };
};

// ──────────────────────────────────────────
// Centro de Control — Wrappers directos
// ──────────────────────────────────────────

export const dashboardStats = (signal) => sh.dashboardStats(signal);

export const compliance = (signal) => sh.compliance(signal);

export const chat = (message) => sh.chat(message);

export const verifyDgaVoucher = (codigoObra, numeroComprobante, tipoDga) =>
  sh.verifyDgaVoucher(codigoObra, numeroComprobante, tipoDga);

export const pointRecords = (pointId, startDate, endDate, limit) =>
  sh.pointRecords(pointId, startDate, endDate, limit);

export const pointConfig = (pointId) => sh.pointConfig(pointId);

export const notifications = {
  create: (data) => sh.notifications.create(data),
};

// ──────────────────────────────────────────
// Export default
// ──────────────────────────────────────────
const orchestrator = {
  getBatchTelemetry,
  getBatchStats,
  getBatchSummary,
  getProfile: getProfileOrchestrated,
  getPointsList: getPointsListOrchestrated,
  getDayData: getDayDataOrchestrated,
  getMonthData: getMonthDataOrchestrated,
  getNotifications: getNotificationsOrchestrated,
  createAutoRefresh,
  cancelAllRequests,
  invalidatePointCache,
  getStats: getOrchestratorStats,
  dashboardStats,
  compliance,
  chat,
  verifyDgaVoucher,
  pointRecords,
  pointConfig,
  notifications,
  PRIORITY,
};

export default orchestrator;
