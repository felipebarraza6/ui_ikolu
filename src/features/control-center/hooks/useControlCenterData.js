import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import orchestrator from "../../../api/orchestrator";
import { transformDashboardStats } from "../utils/transformDashboardStats";

export const useControlCenterData = () => {
  const { isAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = useCallback(async (signal, silent = false) => {
    if (!isAuth) return;

    if (!silent) setLoading(true);

    try {
      const [rawDashboard, rawCompliance] = await Promise.all([
        orchestrator.dashboardStats(signal),
        orchestrator.compliance(signal).catch((err) => {
          console.warn("[useControlCenterData] Endpoint compliance no disponible:", err?.message || err);
          return null;
        }),
      ]);

      if (!mountedRef.current) return;

      const transformed = transformDashboardStats(rawDashboard, rawCompliance);
      setData(transformed);
      setLoading(false);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [isAuth, fetchData]);

  useEffect(() => {
    if (!isAuth) return;
    const interval = setInterval(() => {
      const controller = new AbortController();
      fetchData(controller.signal, true);
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuth, fetchData]);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh,
    isReady: !!data && !loading,
  };
};
