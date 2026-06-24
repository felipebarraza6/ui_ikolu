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

export const transformDashboardStats = (raw, complianceRaw = null, generalStats = null, dailySummary = null) => {
  if (!raw || typeof raw !== "object") {
    console.warn("[transformDashboardStats] Respuesta inválida:", raw);
    return null;
  }

  const ds = raw;
  const gs = generalStats || {};
  const today = new Date();

  // Preferir KPIs globales del endpoint liviano general_stats si está disponible
  const pointsCounters = gs.points || ds.points || {};
  const statusToday = gs.status_today || ds.status_today || {};
  const complianceStats = ds.compliance_stats || {};
  const chatQuota = gs.chat_quota || ds.chat_quota || null;
  const projects = Array.isArray(gs.projects) ? gs.projects : [];

  const weeklyStatsByPoint = {};
  Object.entries(ds.last_7 || {}).forEach(([pointName, weekData]) => {
    weeklyStatsByPoint[pointName] = {
      total_m3: extractNum(weekData?.total_m3),
      avg_flow_week: extractNum(weekData?.avg_flow_week),
      avg_level_week: extractNum(weekData?.avg_level_week),
    };
  });

  const warningsByPoint = {};
  const recentWarningsList = [];

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

  recentWarningsList.sort((a, b) => {
    const ta = a.time ? new Date(a.time).getTime() : 0;
    const tb = b.time ? new Date(b.time).getTime() : 0;
    return tb - ta;
  });

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

  const dashboardCompliance = Array.isArray(ds.compliance_summary) ? ds.compliance_summary : [];
  const endpointCompliance = Array.isArray(complianceRaw?.points) ? complianceRaw.points : [];

  const complianceList = dashboardCompliance.length > 0
    ? dashboardCompliance
    : endpointCompliance;

  const flowAnalysisByPoint = {};
  Object.entries(ds.last_7 || {}).forEach(([pointName, pointData]) => {
    const days = pointData?.days || [];
    const authorizedFlow = extractNum(
      complianceList.find(c => c.point_name === pointName)?.authorized_flow
    );

    if (!authorizedFlow || authorizedFlow <= 0) {
      flowAnalysisByPoint[pointName] = { exceeded: 0, nearLimit: 0 };
      return;
    }

    let exceededCount = 0;
    let nearLimitCount = 0;

    days.forEach(day => {
      const avgFlow = extractNum(day.avg_flow);
      if (avgFlow == null) return;

      if (avgFlow > authorizedFlow) {
        exceededCount++;
      } else if (avgFlow >= authorizedFlow * 0.8) {
        nearLimitCount++;
      }
    });

    flowAnalysisByPoint[pointName] = {
      exceeded: exceededCount,
      nearLimit: nearLimitCount,
      totalDays: days.length,
    };
  });

  const compliancePoints = complianceRaw?.points || [];
  const complianceByPointName = {};
  compliancePoints.forEach(cp => {
    complianceByPointName[cp.point_name] = cp;
  });

  // Mapa punto_name -> point_id para poder abrir drawers desde telemetry
  // aunque el punto no esté en la lista final de compliance.
  const pointIdByName = {};
  [...complianceList, ...compliancePoints].forEach((p) => {
    if (p.point_name && p.point_id != null && !pointIdByName[p.point_name]) {
      pointIdByName[p.point_name] = p.point_id;
    }
  });

  const points = complianceList.map((p) => {
    const wStats = weeklyStatsByPoint[p.point_name] || {};
    const flowAnalysis = flowAnalysisByPoint[p.point_name] || { exceeded: 0, nearLimit: 0, totalDays: 0 };
    const complianceData = complianceByPointName[p.point_name] || {};

    const nearLimitHistory = complianceData.near_limit_history || null;
    const flowHistory = complianceData.flow_history || null;

    const rawWarning = complianceData.compliance_warning || {};
    const complianceWarning = {
      level: rawWarning.level || (rawWarning.triggered ? "warning" : "safe"),
      status: rawWarning.status || (rawWarning.triggered ? "Alerta" : "Dentro de límites"),
      flow_pct: extractNum(rawWarning.flow_pct),
      pct_consumed: extractNum(rawWarning.pct_consumed) ?? extractNum(p.pct_consumed) ?? 0,
      threshold_pct: extractNum(rawWarning.threshold_pct) ?? 80,
      messages: Array.isArray(rawWarning.messages) ? rawWarning.messages : [],
      triggered: rawWarning.triggered ?? false,
    };

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
      avg_flow_week: wStats.avg_flow_week,
      avg_level_week: wStats.avg_level_week,
      weekly_total_m3: wStats.total_m3,
      config_data: p.config_data || null,
      profile_ikolu: p.profile_ikolu || null,
      warnings_count: warningsByPoint[p.point_name] || 0,
      flow_exceeded_count: flowHistory?.count ?? flowAnalysis.exceeded,
      flow_near_limit_count: nearLimitHistory?.count ?? flowAnalysis.nearLimit,
      flow_analysis_days: flowAnalysis.totalDays,
      flow_history: flowHistory ? {
        count: flowHistory.count ?? 0,
        has_more: flowHistory.has_more ?? false,
        threshold: flowHistory.threshold,
        measurements: flowHistory.measurements || []
      } : null,
      near_limit_history: nearLimitHistory ? {
        count: nearLimitHistory.count ?? 0,
        has_more: nearLimitHistory.has_more ?? false,
        threshold: nearLimitHistory.threshold,
        measurements: nearLimitHistory.measurements || []
      } : null,
      compliance_warning: complianceWarning,
    };
  });

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

  const last7Normalized = {};
  Object.entries(ds.last_7 || {}).forEach(([pointName, weekData]) => {
    last7Normalized[pointName] = {
      ...weekData,
      point_id: pointIdByName[pointName] || weekData?.point_id || null,
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

  return {
    meta: {
      date: format(today, "yyyy-MM-dd"),
      date_formatted: format(today, "EEEE d 'de' MMMM, yyyy", { locale: es }),
      timezone: "America/Santiago",
    },
    overview: {
      total_points: pointsCounters.total || 0,
      active_points: statusToday.connected || 0,
      points_with_gps: pointsCounters.with_gps || 0,
      points_with_compliance: pointsCounters.with_compliance || 0,
      points_with_telemetry: pointsCounters.with_telemetry || 0,
      warnings: pointsCounters.warnings || 0,
    },
    consumption: {
      today_m3: consumptionToday,
      yesterday_m3: consumptionYesterday,
      difference_m3: diffM3,
      difference_percent: Number(diffPercent),
      trend: diffM3 > 0 ? "up" : diffM3 < 0 ? "down" : "same",
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
    last_7: last7Normalized,
    recent_warnings: recentWarningsByPoint,
    recent_warnings_list: recentWarningsList,
    compliance_stats: complianceStats,
    chat_quota: chatQuota,
    projects,
    daily_summary: dailySummary || null,
  };
};
