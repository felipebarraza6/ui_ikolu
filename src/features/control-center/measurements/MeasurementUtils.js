/* ── Helper: normalizar número que puede venir como objeto {source, parsedValue} ── */
export const extractRecordNum = (val) => {
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

/* ── Helper: extraer mediciones de respuesta del endpoint ── */
export const extractMeasurements = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.records)) return raw.records;
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw.measurements)) return raw.measurements;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.calendar)) return raw.calendar;
  return [];
};

/* ── Helper: clasificar mediciones por franja horaria ── */
export const classifyByTimeOfDay = (measurements) => {
  const dawn = [];     // 00:00 - 05:00
  const morning = [];  // 06:00 - 12:00
  const afternoon = []; // 13:00 - 18:00
  const night = [];    // 19:00 - 23:00

  measurements.forEach((m) => {
    const timeStr = m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at;
    if (!timeStr) return;
    const hour = new Date(timeStr).getHours();
    if (hour >= 0 && hour <= 5) dawn.push(m);
    else if (hour >= 6 && hour <= 12) morning.push(m);
    else if (hour >= 13 && hour <= 18) afternoon.push(m);
    else night.push(m);
  });

  const sortByTime = (a, b) => {
    const ta = new Date(a.date_time || a.date_time_medition || a.timestamp || a.time || a.created_at).getTime();
    const tb = new Date(b.date_time || b.date_time_medition || b.timestamp || b.time || b.created_at).getTime();
    return ta - tb;
  };

  return {
    dawn: dawn.sort(sortByTime),
    morning: morning.sort(sortByTime),
    afternoon: afternoon.sort(sortByTime),
    night: night.sort(sortByTime),
  };
};

/* ── Helper: obtener período del día ── */
export const getPeriod = (hour) => {
  if (hour >= 0 && hour <= 5) return { label: "Madrugada", icon: "FaMoon" };
  if (hour >= 6 && hour <= 12) return { label: "Mañana", icon: "FaSun" };
  if (hour >= 13 && hour <= 18) return { label: "Tarde", icon: "FaSun" };
  return { label: "Noche", icon: "FaMoon" };
};

/* ── Helper: formatear KPI ── */
export const formatKPI = (obj, decimals = 2, suffix = "") => {
  if (!obj) return "—";
  const val = Number(obj.value).toFixed(decimals);
  return `${val}${suffix}`;
};
