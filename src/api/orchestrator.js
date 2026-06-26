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
    dayData: 60 * 1000,        // 1min — resumen diario (CC)
    monthData: 10 * 60 * 1000, // 10min — mensual
    controlCenter: 30 * 1000,  // 30s — datos volátiles del Centro de Control
    generalStats: 60 * 60 * 1000, // 1h — KPIs generales cambian poco
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

// eslint-disable-next-line no-unused-vars
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
      // eslint-disable-next-line no-loop-func
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
  const { useCache = true, isAdmin = false, params = {} } = options;
  const cacheKey = `points_list_${isAdmin ? 'admin' : 'user'}_${JSON.stringify(params)}`;

  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  return deduplicateRequest(cacheKey, async () => {
    let response;
    if (isAdmin) {
      response = await sh.points.list({ ...params, page_size: params.page_size || 1000 });
    } else {
      response = await sh.points.mine(params);
    }
    const points = Array.isArray(response) ? response : (response.results || response.points || []);
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
 * @param {Object} options - Opciones
 * @param {boolean} options.immediate - Ejecutar callback al inicio (default: true)
 * @returns {Object} { refresh, cancel, start, reset }
 */
export const createAutoRefresh = (callback, interval, options = {}) => {
  const { immediate = true } = options;
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
    if (immediate) {
      throttledCallback();
    }
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
// Centro de Control — Wrappers orchestrated
// ──────────────────────────────────────────

const paramsKey = (params) => {
  try {
    return JSON.stringify(params || {});
  } catch {
    return String(params);
  }
};

export const dashboardStats = (signal) => {
  const cacheKey = 'cc_dashboard_stats';
  return deduplicateRequest('cc_dashboard_stats', async () => {
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;
    const data = await sh.dashboardStats(signal);
    dataCache.set(cacheKey, data, CONFIG.CACHE_TTL.controlCenter);
    return data;
  });
};

export const controlCenterGeneralStats = (signal) => {
  const cacheKey = 'cc_general_stats';
  return deduplicateRequest('cc_general_stats', async () => {
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;
    const data = await sh.controlCenterGeneralStats(signal);
    dataCache.set(cacheKey, data, CONFIG.CACHE_TTL.generalStats);
    return data;
  });
};

export const controlCenterDailySummary = (params = {}, signal) => {
  const cacheKey = `cc_daily_summary_${paramsKey(params)}`;
  return deduplicateRequest(cacheKey, async () => {
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;
    const data = await sh.controlCenterDailySummary(params, signal);
    dataCache.set(cacheKey, data, CONFIG.CACHE_TTL.dayData); // 1 min
    return data;
  });
};

export const controlCenterProjectPoints = (projectId, signal) => {
  if (projectId == null) return Promise.resolve({ data: [] });
  const cacheKey = `cc_project_points_${projectId}`;
  return deduplicateRequest(cacheKey, async () => {
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;
    const data = await sh.controlCenterProjectPoints(projectId, signal);
    dataCache.set(cacheKey, data, CONFIG.CACHE_TTL.pointsList);
    return data;
  });
};

export const controlCenterList = (params = {}, signal) => {
  const cacheKey = `cc_list_${paramsKey(params)}`;
  return deduplicateRequest(cacheKey, async () => {
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;
    const data = await sh.controlCenterList(params, signal);
    dataCache.set(cacheKey, data, CONFIG.CACHE_TTL.pointsList);
    return data;
  });
};

export const getSystemEvents = (params = {}, signal) => sh.controlCenterSystemEvents(params, signal);

export const getSystemEventsByPoint = (pointId, params = {}, signal) =>
  sh.controlCenterSystemEventsByPoint(pointId, params, signal);

export const compliance = (signal) => {
  const cacheKey = 'cc_compliance';
  return deduplicateRequest('cc_compliance', async () => {
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;
    const data = await sh.compliance(signal);
    dataCache.set(cacheKey, data, CONFIG.CACHE_TTL.controlCenter);
    return data;
  });
};

export const complianceList = (params = {}, signal) => {
  const cacheKey = `cc_compliance_list_${paramsKey(params)}`;
  return deduplicateRequest(cacheKey, async () => {
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;
    const data = await sh.complianceList(params, signal);
    dataCache.set(cacheKey, data, CONFIG.CACHE_TTL.pointsList);
    return data;
  });
};

export const toggleCompliance = (pointId, enabled) => sh.toggleCompliance(pointId, enabled);

export const chat = (message) => sh.chat(message);

export const verifyDgaVoucher = (codigoObra, numeroComprobante, tipoDga) =>
  sh.verifyDgaVoucher(codigoObra, numeroComprobante, tipoDga);

export const pointRecords = (pointId, startDate, endDate, limit) =>
  sh.pointRecords(pointId, startDate, endDate, limit);

export const pointConfig = (pointId) => sh.pointConfig(pointId);
export const pointsConfig = (pointId) => sh.pointConfig(pointId);
export const pointsConfigUpdate = (pointId, config) => sh.points.configUpdate(pointId, config);

export const flowHistory = (pointId, params) => sh.flowHistory(pointId, params);
export const nearLimitHistory = (pointId, params) => sh.nearLimitHistory(pointId, params);

// ── Puntos unificados modernos ──
export const pointsList = (params, signal) => sh.points.list(params);
export const pointsGet = (id) => sh.points.get(id);
export const pointsCreate = (data) => sh.points.create(data);
export const pointsUpdate = (id, data) => sh.points.update(id, data);
export const pointsDelete = (id) => sh.points.delete(id);
export const pointsRecords = (id, options) => sh.points.records(id, options);
export const pointsLatest = (id) => sh.points.latest(id);
export const pointStatus = (id, thresholdMinutes) => sh.points.status(id, thresholdMinutes);
export const pointsVariables = (id) => sh.points.variables(id);
export const pointsSummary = (id) => sh.points.summary(id);
export const pointsBatchStatus = (ids) => sh.points.batchStatus(ids);

export const notifications = {
  create: (data) => sh.notifications.create(data),
};

// ──────────────────────────────────────────
// Admin / Management wrappers
// ──────────────────────────────────────────

export const systemStatus = (signal) => sh.management.systemStatus();

export const resourcesStatus = (signal) => sh.management.resourcesStatus();

export const pointsStatus = (params, signal) => sh.management.pointsStatus(params);

export const telemetryMetrics = (params, signal) => sh.management.telemetryMetrics(params);

export const toggleTelemetry = (pointId, enabled) => sh.management.toggleTelemetry(pointId, enabled);

export const dgaQueueStatus = (signal) => sh.management.dgaQueueStatus();

export const systemEvents = {
  get: (params) => sh.systemEvents.get(params),
  summary: () => sh.systemEvents.summary(),
};

export const tickets = {
  get: (params) => sh.tickets.get(params),
  getById: (id) => sh.tickets.getById(id),
  create: (data) => sh.tickets.create(data),
  update: (id, data) => sh.tickets.update(id, data),
  assign: (id, assignedTo) => sh.tickets.assign(id, assignedTo),
  changeStatus: (id, status) => sh.tickets.changeStatus(id, status),
  getComments: (id, page) => sh.tickets.getComments(id, page),
  createComment: (id, data) => sh.tickets.createComment(id, data),
  getAttachments: (id) => sh.tickets.getAttachments(id),
  uploadAttachment: (id, formData) => sh.tickets.uploadAttachment(id, formData),
  stats: () => sh.tickets.stats(),
};

export const alerts = {
  rules: {
    get: (params) => sh.alerts.rules.get(params),
    getById: (id) => sh.alerts.rules.getById(id),
    create: (data) => sh.alerts.rules.create(data),
    update: (id, data) => sh.alerts.rules.update(id, data),
    delete: (id) => sh.alerts.rules.delete(id),
  },
  channels: {
    get: (params) => sh.alerts.channels.get(params),
    create: (data) => sh.alerts.channels.create(data),
    update: (id, data) => sh.alerts.channels.update(id, data),
    delete: (id) => sh.alerts.channels.delete(id),
  },
  triggers: {
    get: (params) => sh.alerts.triggers.get(params),
    acknowledge: (id) => sh.alerts.triggers.acknowledge(id),
  },
};

export const admin = {
  clients: (params) => sh.admin.clients(params),
  clientsAll: () => sh.admin.clientsAll(),
  createClient: (data) => sh.admin.createClient(data),
  updateClient: (id, data) => sh.admin.updateClient(id, data),
  deleteClient: (id) => sh.admin.deleteClient(id),
  projects: (params) => sh.admin.projects(params),
  projectsAll: () => sh.admin.projectsAll(),
  createProject: (data) => sh.admin.createProject(data),
  updateProject: (id, data) => sh.admin.updateProject(id, data),
  deleteProject: (id) => sh.admin.deleteProject(id),
  points: (params) => sh.points.list(params),
  pointsAll: async () => {
    const res = await sh.points.list({ page_size: 1000 });
    return Array.isArray(res) ? res : (res.results || res.data || []);
  },
  pointById: (id) => sh.points.get(id),
  createPoint: (data) => sh.points.create(data),
  updatePoint: (id, data) => sh.points.update(id, data),
  deletePoint: (id) => sh.points.delete(id),
  clientsWithProjects: () => sh.admin.clientsWithProjects(),
  pointsByProject: (projectId) => sh.points.list({ project: projectId, page_size: 1000 }),
  users: (params) => sh.getUsers(params),
  userById: (username) => sh.getUser(username),
  signupUser: (data) => sh.signupUser(data),
  updateUser: (username, data) => sh.updateUser(username, data),
  deleteUser: (username) => sh.deleteUser(username),
  changeUserPassword: (currentPassword, newPassword) =>
    sh.changePassword(currentPassword, newPassword),
  requestPasswordReset: (email) => sh.requestPasswordReset(email),
  confirmPasswordReset: (token, newPassword) =>
    sh.confirmPasswordReset(token, newPassword),
  variables: (params) => sh.getVariables(params),
  variableById: (id) => sh.getVariable(id),
  createVariable: (data) => sh.createVariable(data),
  updateVariable: (id, data) => sh.updateVariable(id, data),
  deleteVariable: (id) => sh.deleteVariable(id),
  schemes: (params) => sh.getSchemes(params),
  schemeById: (id) => sh.getScheme(id),
  createScheme: (data) => sh.createScheme(data),
  updateScheme: (id, data) => sh.updateScheme(id, data),
  deleteScheme: (id) => sh.deleteScheme(id),
  telemetryProviders: (params) => sh.getTelemetryProviders(params),
  telemetryProviderById: (id) => sh.getTelemetryProvider(id),
  complianceProviders: (params) => sh.getComplianceProviders(params),
  complianceProviderById: (id) => sh.getComplianceProvider(id),
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
  controlCenterGeneralStats,
  controlCenterDailySummary,
  controlCenterProjectPoints,
  controlCenterList,
  getSystemEvents,
  getSystemEventsByPoint,
  compliance,
  complianceList,
  toggleCompliance,
  chat,
  verifyDgaVoucher,
  pointRecords,
  pointConfig,
  pointsConfig,
  pointsConfigUpdate,
  flowHistory,
  nearLimitHistory,
  pointsList,
  pointsGet,
  pointsCreate,
  pointsUpdate,
  pointsDelete,
  pointsRecords,
  pointsLatest,
  pointStatus,
  pointsVariables,
  pointsSummary,
  pointsBatchStatus,
  notifications,
  systemStatus,
  resourcesStatus,
  pointsStatus,
  telemetryMetrics,
  toggleTelemetry,
  dgaQueueStatus,
  systemEvents,
  tickets,
  alerts,
  admin,
  PRIORITY,
};

export default orchestrator;
