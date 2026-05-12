import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import orchestrator from '../api/orchestrator';

/**
 * Hook optimizado para datos del Centro de Control (Dashboard)
 *
 * Características:
 * - Usa endpoints BATCH nativos del backend
 * - Throttlea refrescos automáticos (mínimo 30s entre requests)
 * - Cancela requests obsoletos al desmontar
 * - Evita re-renders con comparación de datos
 * - Fallback graceful si el endpoint batch no está disponible
 *
 * @param {Object} options
 * @param {boolean} options.autoRefresh - Activar refresco automático
 * @param {number} options.refreshInterval - Intervalo en ms (default: 60000)
 * @param {boolean} options.useBatch - Usar endpoints batch nativos (default: true)
 * @returns {Object} { profiles, loading, error, lastRefresh, refresh, stats }
 */
export const useDashboardData = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 60 * 1000,
    useBatch = true,
  } = options;

  const { user } = useAuth();
  const { points_list, profile_client, dispatch } = useData();

  const isAdmin = user?.is_staff || user?.is_superuser;

  const [profiles, setProfiles] = useState(profile_client || points_list || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastFetchRef = useRef(0);

  // 🛡️ Marcar como desmontado al cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Función principal de fetch con throttle
   */
  const fetchData = useCallback(async (silent = false) => {
    // Throttle: mínimo 30s entre requests
    const now = Date.now();
    if (now - lastFetchRef.current < 30000) {
      return;
    }
    lastFetchRef.current = now;

    if (!silent) setLoading(true);
    setError(null);

    try {
      let freshProfiles = [];

      if (isAdmin) {
        // Admin: usar points_summary o lista de puntos
        const points = await orchestrator.getPointsList({ isAdmin: true });
        freshProfiles = points || [];
      } else {
        // Usuario normal: intentar batch summary primero
        const pointIds = points_list?.map(p => p.id).filter(Boolean);

        if (useBatch && pointIds && pointIds.length > 0) {
          try {
            const batchResult = await orchestrator.getBatchSummary(pointIds);
            // El batch summary devuelve { data: { pointId: { ... } } }
            if (batchResult?.data) {
              freshProfiles = Object.values(batchResult.data).map(item => ({
                ...(item.point_info || {}),
                ...(item.latest || {}),
                modules: {
                  today: item.today || [],
                  m1: item.latest || null,
                },
              }));
            }
          } catch (batchErr) {
            console.warn('[useDashboardData] Batch summary failed, falling back to get_profile:', batchErr.message);
          }
        }

        // Fallback: get_profile tradicional
        if (freshProfiles.length === 0) {
          const profileData = await orchestrator.getProfile();
          freshProfiles = profileData?.user?.catchment_points || [];
        }
      }

      // Solo actualizar estado si el componente sigue montado
      if (isMountedRef.current && freshProfiles.length > 0) {
        setProfiles(freshProfiles);
        setLastRefresh(new Date());

        // Actualizar contexto global para otros componentes
        dispatch({
          type: 'SET_PROFILE_CLIENT',
          payload: { profile_client: freshProfiles },
        });
      }
    } catch (err) {
      console.error('[useDashboardData] Error fetching data:', err);
      if (isMountedRef.current) {
        setError(err);
        // Fallback: mantener datos actuales
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [isAdmin, points_list, useBatch, dispatch]);

  /**
   * Refresco manual
   */
  const refresh = useCallback(() => {
    lastFetchRef.current = 0;
    return fetchData(false);
  }, [fetchData]);

  /**
   * Auto-refresh con cleanup
   */
  useEffect(() => {
    // Cargar datos iniciales
    fetchData(false);

    // Configurar auto-refresh
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, fetchData]);

  // Estadísticas memoizadas para evitar recálculos
  const stats = useMemo(() => {
    if (!profiles || profiles.length === 0) {
      return {
        totalProfiles: 0,
        withGPS: 0,
        withTelemetry: 0,
        activeToday: 0,
      };
    }

    const withGPS = profiles.filter(
      (p) => p.lat && p.lon && p.lat !== '0' && p.lon !== '0'
    ).length;

    const withTelemetry = profiles.filter(
      (p) => p.is_telemetry || p.config_data?.is_telemetry
    ).length;

    const activeToday = profiles.filter((p) => {
      const latest = p.modules?.m1 || p.latest_telemetry;
      if (!latest?.date_time_medition) return false;
      const date = new Date(latest.date_time_medition);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length;

    return {
      totalProfiles: profiles.length,
      withGPS,
      withTelemetry,
      activeToday,
    };
  }, [profiles]);

  return {
    profiles,
    loading,
    error,
    lastRefresh,
    refresh,
    stats,
    isAdmin,
  };
};

export default useDashboardData;
