import { useState, useEffect, useCallback, useRef } from "react";
import orchestrator from "../../../api/orchestrator";
import { useAuth } from "../../../contexts/AuthContext";
import { transformDashboardStats } from "../utils/transformDashboardStats";

/**
 * useControlCenter — Hook unificado para el Centro de Control
 *
 * Ahora usa UN SOLO endpoint:
 *   GET /api/ik/dashboard_stats/
 *
 * Que entrega: contadores, status, compliance_summary, last_7, warnings.
 */
export const useControlCenter = (options = {}) => {
  const { autoRefresh = true, refreshInterval = 60 * 1000 } = options;
  const { isAuth } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!isAuth) return;

      const now = Date.now();
      if (now - lastFetchRef.current < 30000) return;
      lastFetchRef.current = now;

      if (!silent) setLoading(true);
      setError(null);

      const controller = new AbortController();

      try {
        const [rawDashboard, rawCompliance] = await Promise.all([
          orchestrator.dashboardStats(controller.signal),
          orchestrator.compliance(controller.signal).catch((err) => {
            console.warn("[useControlCenter] Endpoint compliance no disponible:", err?.message || err);
            return null;
          }),
        ]);

        const transformed = transformDashboardStats(rawDashboard, rawCompliance);

        if (isMountedRef.current) {
          setData(transformed);
          setError(null);
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

      return () => controller.abort();
    },
    [isAuth]
  );

  useEffect(() => {
    if (isAuth) fetchData();
  }, [isAuth, fetchData]);

  useEffect(() => {
    if (!autoRefresh || !isAuth) return;
    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, refreshInterval, fetchData, isAuth]);

  const refresh = useCallback(() => {
    lastFetchRef.current = 0;
    fetchData();
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
