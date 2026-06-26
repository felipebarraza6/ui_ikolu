import { useState, useEffect, useCallback, useRef } from "react";
import orchestrator, { createAutoRefresh } from "../../../api/orchestrator";
import { useAuth } from "../../../contexts/AuthContext";
import { transformDashboardStats } from "../utils/transformDashboardStats";

/**
 * useControlCenter — Hook unificado para el Centro de Control
 *
 * Usa endpoints orchestrated con caché/deduplicación y un único
 * mecanismo de auto-refresh centralizado (createAutoRefresh).
 */
export const useControlCenter = (options = {}) => {
  const { autoRefresh = true, refreshInterval = 60 * 1000 } = options;
  const { isAuth } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const isMountedRef = useRef(true);
  const autoRefreshRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (signal, silent = false) => {
      if (!isAuth) return;

      if (!silent) setLoading(true);
      setError(null);

      try {
        const [rawDashboard, rawCompliance] = await Promise.all([
          orchestrator.dashboardStats(signal),
          orchestrator.complianceList({}, signal).catch((err) => {
            console.warn(
              "[useControlCenter] Endpoint compliance no disponible:",
              err?.message || err,
            );
            return null;
          }),
        ]);

        const transformed = transformDashboardStats(rawDashboard, rawCompliance);

        if (isMountedRef.current) {
          setData(transformed);
          setError(null);
          setLastRefresh(new Date());
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        if (isMountedRef.current) {
          setError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [isAuth],
  );

  // Carga inicial
  useEffect(() => {
    if (!isAuth) return;
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [isAuth, fetchData]);

  // Auto-refresh centralizado (sin throttle manual de 30s)
  useEffect(() => {
    if (!autoRefresh || !isAuth) return;
    autoRefreshRef.current = createAutoRefresh(
      () => fetchData(new AbortController().signal, true),
      refreshInterval,
      { immediate: false },
    );
    return () => {
      autoRefreshRef.current?.cancel();
      autoRefreshRef.current = null;
    };
  }, [autoRefresh, refreshInterval, fetchData, isAuth]);

  const refresh = useCallback(() => {
    return fetchData(new AbortController().signal);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh,
    isReady: !!data && !loading,
    source: "api",
    chatQuota: data?.chat_quota || null,
  };
};

export default useControlCenter;
