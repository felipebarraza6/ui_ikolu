import { useState, useEffect, useCallback, useRef } from "react";
import sh from "../api/sh/endpoints";

/**
 * Hook para consumir GET /api/ik/daily_summary/
 *
 * Devuelve datos pre-calculados por el backend para el Centro de Control:
 * - overview: contadores
 * - consumption: hoy/ayer/diferencia/trend
 * - service_status: salud, conectados, desconectados
 * - points: lista con latest_telemetry, status, alerts
 * - historical: total acumulado
 * - meta: fecha formateada
 *
 * Características:
 * - Throttle mínimo 30s entre requests
 * - Cancela updates si el componente se desmontó
 * - Auto-refresh configurable
 * - Fallback graceful si el endpoint no está disponible
 */
export const useDailySummary = (options = {}) => {
  const {
    date = null,
    autoRefresh = true,
    refreshInterval = 60 * 1000,
  } = options;

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
      const now = Date.now();
      if (now - lastFetchRef.current < 30000) return;
      lastFetchRef.current = now;

      if (!silent) setLoading(true);
      setError(null);

      try {
        const result = await sh.dailySummary(date);
        if (isMountedRef.current) {
          setData(result);
          setLastRefresh(new Date());
          setError(null);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err);
          // No limpiamos data para mantener último estado válido
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [date]
  );

  // Fetch inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, refreshInterval, fetchData]);

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
  };
};

export default useDailySummary;
