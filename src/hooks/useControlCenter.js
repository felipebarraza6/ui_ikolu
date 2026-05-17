import { useState, useEffect, useCallback, useRef } from "react";
import sh from "../api/sh/endpoints";
import moment from "moment";
import "moment/locale/es";

moment.locale("es");

/**
 * Transforma la respuesta de los endpoints reales del backend
 * (dashboard_stats + points_summary) al formato plano daily_summary.
 *
 * Esto mantiene ControlCenter.js agnóstico de la fuente de datos.
 */
const transformApiResponseToDailySummary = (dashboardStats, pointsSummary) => {
  if (!pointsSummary || !Array.isArray(pointsSummary)) return null;

  const today = moment();
  const yesterday = moment().subtract(1, "day");

  const ds = dashboardStats || {};

  const diffM3 = (ds.consumption_today || 0) - (ds.consumption_yesterday || 0);
  const diffPercent =
    (ds.consumption_yesterday || 0) > 0
      ? ((diffM3 / ds.consumption_yesterday) * 100).toFixed(2)
      : (ds.consumption_today || 0) > 0 ? 100 : 0;

  const trend = diffM3 > 0 ? "up" : diffM3 < 0 ? "down" : "same";

  const points = pointsSummary.map((p) => {
    const lt = p.latest_telemetry || {};
    const daysNotConnection = Number(lt.days_not_connection) || 0;
    const isConnected = daysNotConnection === 0;

    return {
      id: p.id,
      title: p.title,
      project_name: p.project_name || p.project?.name || "—",
      client_name: p.client_name || p.client?.name || "—",
      active: p.active !== false,
      is_telemetry: p.is_telemetry === true || p.config_data?.is_telemetry === true,
      has_gps: !!(p.lat && p.lon && p.lat !== "0" && p.lon !== "0"),
      provider: p.provider || "novus",
      dga: {
        code_dga: p.dga?.code_dga || null,
        type_dga: p.dga?.type_dga || "SUBTERRANEO",
        send_dga: p.dga?.send_dga || false,
        flow_granted_lps: p.dga?.flow_granted_dga ? Number(p.dga.flow_granted_dga) : (p.dga?.flow_granted_lps || 0),
      },
      config_data: {
        variables: p.config_data?.variables || p.config_data?.vars || [],
      },
      latest_telemetry: {
        date_time_medition: lt.date_time_medition || lt.date,
        date_formatted: lt.date_formatted || (lt.date_time_medition ? moment(lt.date_time_medition).format("DD/MM HH:mm") : "—"),
        flow_lps: lt.flow_lps != null ? Number(lt.flow_lps) : (lt.flow != null ? Number(lt.flow) : null),
        total_m3: lt.total_m3 != null ? Number(lt.total_m3) : (lt.total != null ? Number(lt.total) : null),
        nivel_m: lt.nivel_m != null ? Number(lt.nivel_m) : (lt.nivel != null ? Number(lt.nivel) : null),
        water_table_m: lt.water_table_m != null ? Number(lt.water_table_m) : (lt.water_table != null ? Number(lt.water_table) : null),
        is_error: lt.is_error || false,
        days_not_connection: daysNotConnection,
      },
      alerts: {
        count: p.alerts?.count || 0,
        active: p.alerts?.active || [],
      },
      status: {
        is_connected_today: isConnected,
        label: isConnected ? "OK" : "Desconectado",
        color: isConnected ? "success" : "error",
        description: isConnected
          ? "Conectado y enviando datos"
          : `Sin datos hace ${daysNotConnection} día(s)`,
      },
    };
  });

  const historicalTotal = points.reduce((acc, p) => {
    return acc + (p.latest_telemetry?.total_m3 || 0);
  }, 0);

  return {
    meta: {
      date: today.format("YYYY-MM-DD"),
      date_formatted: today.format("dddd D [de] MMMM, YYYY"),
      timezone: "America/Santiago",
    },
    overview: {
      total_points: ds.total_points || points.length,
      active_points: ds.active_points || 0,
      points_with_alerts: ds.points_with_alerts || points.filter((p) => (p.alerts?.count || 0) > 0).length,
      points_with_gps: ds.points_with_gps || points.filter((p) => p.has_gps).length,
    },
    consumption: {
      today_m3: ds.consumption_today || 0,
      yesterday_m3: ds.consumption_yesterday || 0,
      difference_m3: diffM3,
      difference_percent: Number(diffPercent),
      trend,
      date_label_today: `Hoy (${today.format("D MMM")})`,
      date_label_yesterday: `Ayer (${yesterday.format("D MMM")})`,
    },
    service_status: {
      connected_today: ds.connected_today || 0,
      disconnected_today: ds.disconnected_today || 0,
      without_telemetry: ds.without_telemetry || 0,
      health_percent: ds.health_percent || 100,
      health_label: ds.health_label || "Óptimo",
      health_color: ds.health_color || "#52c41a",
    },
    points,
    historical: {
      total_accumulated_m3: ds.historical_total || historicalTotal,
      total_accumulated_formatted: `${new Intl.NumberFormat("de-DE").format(Math.round(ds.historical_total || historicalTotal))} m³`,
    },
  };
};

/**
 * useControlCenter — Hook unificado para el Centro de Control
 *
 * Usa endpoints reales del backend:
 * 1. GET /api/ik/dashboard_stats/  → KPIs agregados
 * 2. GET /api/ik/points_summary/   → Puntos con última telemetría
 *
 * Transforma ambas respuestas al formato plano daily_summary
 * para mantener ControlCenter.js agnóstico de la fuente.
 */
export const useControlCenter = (options = {}) => {
  const {
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
        // Llamadas paralelas a los dos endpoints reales
        const [dashboardStats, pointsSummary] = await Promise.all([
          sh.dashboardStats().catch((err) => {
            console.warn("[useControlCenter] dashboard_stats failed:", err.message);
            return null;
          }),
          sh.getPointsSummary().catch((err) => {
            console.warn("[useControlCenter] points_summary failed:", err.message);
            return null;
          }),
        ]);

        // Si points_summary falla, no tenemos datos de puntos
        if (!pointsSummary) {
          throw new Error("No se pudieron obtener los puntos del usuario");
        }

        const transformed = transformApiResponseToDailySummary(dashboardStats, pointsSummary);

        if (isMountedRef.current) {
          setData(transformed);
          setLastRefresh(new Date());
          setError(null);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    []
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
    source: "api",
  };
};

export default useControlCenter;
