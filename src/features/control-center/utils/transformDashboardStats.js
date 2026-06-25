import { format, subDays } from "date-fns";
import { es } from "date-fns/locale/es";

export const extractNum = (val) => {
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
 * Transforma datos granulados del Centro de Control.
 *
 * Fuentes:
 * - generalStats:  GET /api/ik/control_center/general_stats/   (KPIs, proyectos, chat_quota)
 * - complianceRaw: GET /api/ik/compliance/                    (lista compliance, warnings detalle)
 * - dailySummary:  GET /api/ik/control_center/daily_summary/  (resumen diario para cuadritos)
 *
 * Nota: el endpoint monolítico /api/ik/dashboard_stats/ fue removido a propósito
 * para probar rendimiento con endpoints granulados.
 */
export const transformDashboardStats = (raw, complianceRaw = null, generalStats = null, dailySummary = null) => {
  const gs = generalStats || {};
  const cp = complianceRaw || {};
  const today = new Date();

  if (!gs || typeof gs !== "object") {
    console.warn("[transformDashboardStats] generalStats inválido:", gs);
    return null;
  }

  // Buscar contadores y metadatos en varias estructuras posibles.
  const gsOverview = gs.overview || {};
  const pointsCounters = gs.points || gs.stats || gs.data || gsOverview || {};
  const statusToday = gs.status_today || pointsCounters.status_today || {};

  const chatQuota = gs.chat_quota || pointsCounters.chat_quota || null;
  const projects = Array.isArray(gs.projects)
    ? gs.projects
    : Array.isArray(pointsCounters.projects)
      ? pointsCounters.projects
      : [];
  const complianceStats = cp.stats || cp.compliance_stats || {};

  // Puntos para la pestaña de cumplimiento.
  // Soporta tanto respuesta plana (cp.points) como paginada (cp.results).
  const compliancePoints = Array.isArray(cp.results)
    ? cp.results
    : Array.isArray(cp.points)
      ? cp.points
      : [];

  const complianceByPointName = {};
  compliancePoints.forEach((cpItem) => {
    complianceByPointName[cpItem.point_name] = cpItem;
  });

  const points = compliancePoints.map((p) => {
    const complianceData = complianceByPointName[p.point_name] || {};
    const rawWarning = complianceData.compliance_warning || {};

    return {
      id: p.point_id,
      project_id: p.project_id || null,
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
      complianceActive: p.compliance_active ?? p.send_dga ?? true,
      telemetryActive: p.telemetry_active ?? p.is_active ?? null,
      avg_flow_week: null,
      avg_level_week: null,
      weekly_total_m3: null,
      config_data: p.config_data || null,
      profile_ikolu: p.profile_ikolu || null,
      warnings_count: 0,
      flow_exceeded_count: null,
      flow_near_limit_count: null,
      flow_analysis_days: 0,
      flow_history: null,
      near_limit_history: null,
      compliance_warning: {
        level: rawWarning.level || (rawWarning.triggered ? "warning" : "safe"),
        status: rawWarning.status || (rawWarning.triggered ? "Alerta" : "Dentro de límites"),
        flow_pct: extractNum(rawWarning.flow_pct),
        pct_consumed: extractNum(rawWarning.pct_consumed) ?? extractNum(p.pct_consumed) ?? 0,
        threshold_pct: extractNum(rawWarning.threshold_pct) ?? 80,
        messages: Array.isArray(rawWarning.messages) ? rawWarning.messages : [],
        triggered: rawWarning.triggered ?? false,
      },
    };
  });

  return {
    meta: {
      date: format(today, "yyyy-MM-dd"),
      date_formatted: format(today, "EEEE d 'de' MMMM, yyyy", { locale: es }),
      timezone: "America/Santiago",
    },
    overview: {
      total_points: gsOverview.total_points ?? pointsCounters.total_points ?? pointsCounters.total ?? 0,
      active_points: gsOverview.active_points ?? pointsCounters.active_points ?? statusToday.connected ?? 0,
      points_with_gps: gsOverview.points_with_gps ?? pointsCounters.points_with_gps ?? pointsCounters.with_gps ?? 0,
      points_with_compliance: gsOverview.points_with_compliance ?? pointsCounters.points_with_compliance ?? pointsCounters.with_compliance ?? 0,
      points_with_telemetry: gsOverview.points_with_telemetry ?? pointsCounters.points_with_telemetry ?? pointsCounters.with_telemetry ?? 0,
      warnings: gsOverview.warnings ?? pointsCounters.warnings ?? 0,
    },
    consumption: {
      today_m3: 0,
      yesterday_m3: 0,
      difference_m3: 0,
      difference_percent: 0,
      trend: "same",
      date_label_today: `Hoy (${format(today, "d MMM", { locale: es })})`,
      date_label_yesterday: `Ayer (${format(subDays(today, 1), "d MMM", { locale: es })})`,
    },
    service_status: {
      connected_today: statusToday.connected || 0,
      disconnected_today: statusToday.disconnected || 0,
      without_telemetry:
        (pointsCounters.total || 0) - (pointsCounters.with_telemetry || 0),
      total_points: pointsCounters.total || 0,
    },
    points,
    last_7: {},
    recent_warnings: {},
    recent_warnings_list: [],
    compliance_stats: complianceStats,
    chat_quota: chatQuota,
    projects,
    daily_summary: dailySummary || null,
  };
};

export default transformDashboardStats;
