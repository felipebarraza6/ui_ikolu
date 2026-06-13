/**
 * Sistema de caché en memoria para datos de la aplicación
 * Evita llamadas duplicadas a la API cuando los datos aún son válidos
 */
class DataCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos por defecto
  }

  /**
   * Almacena un valor en caché con un tiempo de vida
   * @param {string} key - Clave única para el dato
   * @param {any} value - Valor a almacenar
   * @param {number} ttl - Tiempo de vida en milisegundos
   */
  set(key, value, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  }

  /**
   * Obtiene un valor del caché si aún es válido
   * @param {string} key - Clave del dato
   * @returns {any|null} - El valor almacenado o null si expiró
   */
  get(key) {
    const timestamp = this.timestamps.get(key);

    // Si no existe o expiró, eliminar y retornar null
    if (!timestamp || Date.now() > timestamp) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Verifica si una clave existe y es válida
   * @param {string} key - Clave a verificar
   * @returns {boolean}
   */
  has(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Elimina una entrada específica del caché
   * @param {string} key - Clave a eliminar
   */
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Limpia todo el caché
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Invalida todas las entradas relacionadas con un patrón
   * @param {string} pattern - Patrón de búsqueda (ej: 'profile_')
   */
  invalidatePattern(pattern) {
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    });
  }

  /**
   * Obtiene estadísticas del caché
   * @returns {Object}
   */
  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const [, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
    };
  }
}

// Instancia única del caché
export const dataCache = new DataCache();

/**
 * Helper para generar claves de caché consistentes
 */
export const CacheKeys = {
  profile: (userId) => `profile_${userId}`,
  telemetry: (profileId) => `telemetry_${profileId}`,
  alerts: (profileId) => `alerts_${profileId}`,
  dayData: (profileId, date) => `day_${profileId}_${date}`,
  monthData: (profileId, yearMonth) => `month_${profileId}_${yearMonth}`,
  notifications: (profileId, type) => `notifications_${profileId}_${type}`,
  batchTelemetry: (pointIds, hours) => `batch_telemetry_${pointIds}_${hours}`,
  batchStats: (pointIds, days) => `batch_stats_${pointIds}_${days}`,
  batchSummary: (pointIds) => `batch_summary_${pointIds}`,
};

/**
 * Wrapper para funciones API con caché automático
 * @param {string} key - Clave del caché
 * @param {Function} fetcher - Función que obtiene los datos
 * @param {number} ttl - Tiempo de vida del caché
 * @returns {Promise<any>}
 */
export const withCache = async (key, fetcher, ttl = undefined) => {
  const cached = dataCache.get(key);
  if (cached !== null) {
    return cached;
  }

  try {
    const data = await fetcher();
    dataCache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error(`[Cache ERROR] ${key}:`, error);
    throw error;
  }
};

/**
 * Invalida el caché cuando cambia el perfil seleccionado
 */
export const invalidateProfileCache = () => {
  dataCache.invalidatePattern("profile_");
  dataCache.invalidatePattern("telemetry_");
  dataCache.invalidatePattern("alerts_");
  dataCache.invalidatePattern("day_");
  dataCache.invalidatePattern("month_");
  dataCache.invalidatePattern("notifications_");
};

/**
 * Limpia el caché al hacer logout
 */
export const clearCacheOnLogout = () => {
  dataCache.clear();
};

export default dataCache;
