import { useState, useEffect, useCallback, useRef } from "react";
import sh from "../api/sh/endpoints";
import { useAuth } from "../contexts/AuthContext";
import moment from "moment";
import "moment/locale/es";

moment.locale("es");

/**
 * Normaliza valores que el backend manda como:
 *   - número directo: 46.3
 *   - null
 *   - objeto: { source: "490046.0", parsedValue: 490046 }
 *   - string: "0.0"
 */
const extractNum = (val) => {
  if (val == null) return null;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return isNaN(n) ? null : n;
  }
  if (typeof val === "object") {
    if (val.parsedValue != null) {
      const n = Number(val.parsedValue);
      return isNaN(n) ? null : n;
    }
    if (val.source != null) {
      const n = Number(val.source);
      return isNaN(n) ? null : n;
    }
  }
  return null;
};

/**
 * Transforma la respuesta del nuevo endpoint /api/ik/dashboard_stats/
 * (unificado) al formato que espera ControlCenter.js.
 */
const transformDashboardStats = (raw) => {
  if (!raw || typeof raw !== "object") {
    console.warn("[useControlCenter] Respuesta inválida:", raw);
    return null;
  }

  const ds = raw;
  const today = moment();

  // ── 1. Contadores globales ──
  const pointsCounters = ds.points || {};
  const statusToday = ds.status_today || {};
  const complianceStats = ds.compliance_stats || {};

  // ── 2. Estadísticas semanales por punto desde last_7 ──
  const weeklyStatsByPoint = {};
  Object.entries(ds.last_7 || {}).forEach(([pointName, weekData]) => {
    weeklyStatsByPoint[pointName] = {
      total_m3: extractNum(weekData?.total_m3),
      avg_flow_week: extractNum(weekData?.avg_flow_week),
      avg_level_week: extractNum(weekData?.avg_level_week),
    };
  });

  // ── 3. Warnings por punto + lista plana reciente ──
  const warningsByPoint = {};
  const recentWarningsList = [];

  // Extraer warnings desde last_7[point].days[].warnings
  Object.entries(ds.last_7 || {}).forEach(([pointName, pointData]) => {
    const days = pointData?.days || [];
    const pointWarnings = [];
    
    days.forEach((day) => {
      const dayWarnings = day?.warnings || [];
      dayWarnings.forEach((w) => {
        pointWarnings.push({
          pointName,
          time: w.time,
          type: w.type,
          severity: w.severity,
          message: w.message,
        });
      });
    });
    
    warningsByPoint[pointName] = pointWarnings.length;
    recentWarningsList.push(...pointWarnings);
  });

  // También soportar recent_warnings si el backend lo envía
  Object.entries(ds.recent_warnings || {}).forEach(([pointName, warnings]) => {
    const arr = Array.isArray(warnings) ? warnings : [];
    if (!warningsByPoint[pointName]) {
      warningsByPoint[pointName] = arr.length;
    }
    arr.forEach((w) => {
      recentWarningsList.push({
        pointName,
        time: w.time,
        type: w.type,
        severity: w.severity,
        message: w.message,
      });
    });
  });

  // Ordenar warnings por tiempo desc
  recentWarningsList.sort((a, b) => {
    const ta = a.time ? moment(a.time).valueOf() : 0;
    const tb = b.time ? moment(b.time).valueOf() : 0;
    return tb - ta;
  });

  // Construir recent_warnings (objeto keyed por punto) desde los warnings extraídos de last_7
  const recentWarningsByPoint = {};
  recentWarningsList.forEach(w => {
    if (!recentWarningsByPoint[w.pointName]) {
      recentWarningsByPoint[w.pointName] = [];
    }
    const normalizedWarning = { ...w };
    if (normalizedWarning.type === "Salto masivo bloqueado") {
      normalizedWarning.type = "Salto masivo";
    }
    recentWarningsByPoint[w.pointName].push(normalizedWarning);
  });

  // ── 4. Construir tabla de puntos desde compliance_summary ──
  const complianceList = Array.isArray(ds.compliance_summary)
    ? ds.compliance_summary
    : [];

  const points = complianceList.map((p) => {
    const wStats = weeklyStatsByPoint[p.point_name] || {};
    return {
      id: p.point_id,
      title: p.point_name,
      code: p.code || p.code_dga || null,
      code_dga: p.code_dga || null,
      compliance_type: Array.isArray(p.compliance_type) ? p.compliance_type : [],
      standard: p.standard || "—",
      type_dga: p.type_dga || "NO_DEFINIDO",
      send_dga: p.send_dga,
      send_sma: p.send_sma,
      last_sent_at: p.last_sent_at,
      voucher: p.voucher,
      flow_lps: extractNum(p.flow),
      water_table_m: extractNum(p.water_table),
      total_m3: extractNum(p.total),
      authorized_flow: extractNum(p.authorized_flow),
      authorized_total: extractNum(p.authorized_total),
      annual_consumption: extractNum(p.annual_consumption),
      pct_consumed: extractNum(p.pct_consumed),
      // Datos enriquecidos desde last_7
      avg_flow_week: wStats.avg_flow_week,
      avg_level_week: wStats.avg_level_week,
      weekly_total_m3: wStats.total_m3,
      // Configuración del punto (variables activas)
      config_data: p.config_data || null,
      profile_ikolu: p.profile_ikolu || null,
      // Datos desde warnings
      warnings_count: warningsByPoint[p.point_name] || 0,
    };
  });

  // ── 5. Calcular consumo hoy/ayer desde last_7 ──
  let consumptionToday = 0;
  let consumptionYesterday = 0;

  Object.values(ds.last_7 || {}).forEach((weekData) => {
    const days = weekData?.days || [];
    if (days.length >= 1) {
      const todayDay = days[days.length - 1];
      consumptionToday += extractNum(todayDay?.consumption) || 0;
    }
    if (days.length >= 2) {
      const yesterdayDay = days[days.length - 2];
      consumptionYesterday += extractNum(yesterdayDay?.consumption) || 0;
    }
  });

  const diffM3 = consumptionToday - consumptionYesterday;
  const diffPercent =
    consumptionYesterday > 0
      ? ((diffM3 / consumptionYesterday) * 100).toFixed(2)
      : consumptionToday > 0
      ? 100
      : 0;

  // ── 6. Normalizar last_7 para el frontend ──
  // El backend manda days con valores como objetos; los normalizamos aquí
  // para que ControlCenter.js los use directamente.
  const last7Normalized = {};
  Object.entries(ds.last_7 || {}).forEach(([pointName, weekData]) => {
    last7Normalized[pointName] = {
      ...weekData,
      total_m3: extractNum(weekData?.total_m3),
      avg_flow_week: extractNum(weekData?.avg_flow_week),
      avg_level_week: extractNum(weekData?.avg_level_week),
      variables: (weekData?.variables || []).map(v => String(v).toUpperCase()),
      days: (weekData?.days || []).map((d) => ({
        ...d,
        consumption: extractNum(d.consumption),
        avg_flow: extractNum(d.avg_flow),
        avg_level: extractNum(d.avg_level),
      })),
    };
  });

  // ── 7. Construir daily_summary plano ──
  return {
    meta: {
      date: today.format("YYYY-MM-DD"),
      date_formatted: today.format("dddd D [de] MMMM, YYYY"),
      timezone: "America/Santiago",
    },
    overview: {
      total_points: pointsCounters.total || 0,
      active_points: statusToday.connected || 0,
      points_with_gps: pointsCounters.with_gps || 0,
      points_with_compliance: pointsCounters.with_compliance || 0,
      points_with_telemetry: pointsCounters.with_telemetry || 0,
    },
    consumption: {
      today_m3: consumptionToday,
      yesterday_m3: consumptionYesterday,
      difference_m3: diffM3,
      difference_percent: Number(diffPercent),
      trend: diffM3 > 0 ? "up" : diffM3 < 0 ? "down" : "same",
      date_label_today: `Hoy (${today.format("D MMM")})`,
      date_label_yesterday: `Ayer (${moment(today).subtract(1, "day").format("D MMM")})`,
    },
    service_status: {
      connected_today: statusToday.connected || 0,
      disconnected_today: statusToday.disconnected || 0,
      without_telemetry:
        (pointsCounters.total || 0) - (pointsCounters.with_telemetry || 0),
      total_points: pointsCounters.total || 0,
    },
    points,
    last_7: last7Normalized,
    recent_warnings: recentWarningsByPoint,
    recent_warnings_list: recentWarningsList,
    compliance_stats: complianceStats,
    chat_quota: ds.chat_quota || null,
  };
};

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
        const raw = await sh.dashboardStats(controller.signal);

        const transformed = transformDashboardStats(raw);

        if (isMountedRef.current) {
          setData(transformed);
          setLastRefresh(new Date());
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
