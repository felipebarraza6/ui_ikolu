import { asRecord, toPointProfile, type PointProfile } from "@/api/nereus/normalize";

export type PointStatus = "online" | "stale" | "offline";
export type CaptureKind = "well" | "surface";
export type FlowBand = "within" | "near" | "over";
export type DgaStandard = "mayor" | "medio" | "menor" | "muyPequenos" | "sinEstandar" | "unknown";
export type ViewMode = "2d" | "3d";

export type CapturePoint = {
  id: string;
  name: string;
  project: string;
  lat: number | null;
  lng: number | null;
  flow: number | null;
  level: number | null;
  total: number | null;
  lastAt: string | null;
  status: PointStatus;
  kind: CaptureKind;
  codeDga: string;
  standard: string;
  authorizedFlow: number | null;
  raw: PointProfile;
};

export type Reading = {
  at: string;
  time: number;
  flow: number | null;
  level: number | null;
  total: number | null;
  voucher: string | null;
};

export type WellProfile = {
  depth: number | null;
  pumpDepth: number | null;
  sensorDepth: number | null;
  ductInches: number | null;
  flowmeterInches: number | null;
  maxFlow: number | null;
};

const numberFormat = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 });
const integerFormat = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });

export function formatNumber(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  if (digits <= 0) return integerFormat.format(value);
  return numberFormat.format(value);
}

export function formatMeasure(value: number | null | undefined, unit: string, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${formatNumber(value, digits)} ${unit}`;
}

export function formatWhen(value: string | null | undefined): string {
  if (!value) return "Sin registro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin registro";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDay(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short" }).format(date);
}

export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function presetRange(preset: "24h" | "7d" | "30d"): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);
  if (preset === "24h") start.setDate(start.getDate() - 1);
  else if (preset === "7d") start.setDate(start.getDate() - 6);
  else start.setDate(start.getDate() - 30);
  return { start: isoDate(start), end: isoDate(end) };
}

/** El API de registros trabaja por día. El tope evita pedir meses de un punto. */
export function clampRange(start: string, end: string, maxDays = 31): { start: string; end: string } {
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return presetRange("7d");
  if (to < from) return { start: end, end: start };
  const span = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  if (span <= maxDays) return { start, end };
  const capped = new Date(to);
  capped.setDate(capped.getDate() - maxDays);
  return { start: isoDate(capped), end };
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function pickNumber(source: Record<string, unknown> | null | undefined, keys: string[]): number | null {
  if (!source) return null;
  for (const key of keys) {
    const value = asNumber(source[key]);
    if (value !== null) return value;
  }
  return null;
}

function pickString(source: Record<string, unknown> | null | undefined, keys: string[]): string {
  if (!source) return "";
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim() && value !== "null") return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function positive(value: number | null): number | null {
  if (value === null || value <= 0) return null;
  return value;
}

/** Chile: latitud negativa más “alta” que la longitud. Cero no es GPS. */
export function readCoordinates(point: Record<string, unknown>): { lat: number | null; lng: number | null } {
  const nests = [point, asRecord(point.location), asRecord(point.geo), asRecord(point.dga), asRecord(point.coordinates)];
  let lat: number | null = null;
  let lng: number | null = null;
  for (const nest of nests) {
    if (!nest || Array.isArray(nest)) continue;
    if (lat === null) lat = pickNumber(nest, ["lat", "latitude", "gps_lat", "y"]);
    if (lng === null) lng = pickNumber(nest, ["lng", "lon", "long", "longitude", "gps_lon", "x"]);
  }
  const pair = point.coordinates ?? point.coords ?? point.gps;
  if (Array.isArray(pair) && pair.length >= 2) {
    const a = asNumber(pair[0]);
    const b = asNumber(pair[1]);
    if (a !== null && b !== null) {
      const aIsLat = a <= -17 && a >= -56;
      const bIsLng = b <= -60 && b >= -80;
      if (aIsLat && bIsLng) {
        lat = lat ?? a;
        lng = lng ?? b;
      } else {
        lng = lng ?? a;
        lat = lat ?? b;
      }
    }
  }
  if (lat === null || lng === null || lat === 0 || lng === 0) return { lat: null, lng: null };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { lat: null, lng: null };
  return { lat, lng };
}

export function pointStatus(lastAt: string | null, onlineFlag: boolean | null, now = Date.now()): PointStatus {
  if (onlineFlag === true) return "online";
  if (onlineFlag === false) return "offline";
  if (!lastAt) return "offline";
  const time = new Date(lastAt).getTime();
  if (Number.isNaN(time)) return "offline";
  const age = now - time;
  if (age < 2 * 60 * 60 * 1000) return "online";
  if (age < 24 * 60 * 60 * 1000) return "stale";
  return "offline";
}

export function statusLabel(status: PointStatus): string {
  if (status === "online") return "En línea";
  if (status === "stale") return "Atención";
  return "Sin transmisión";
}

function latestRecord(point: Record<string, unknown>): Record<string, unknown> {
  const modules = asRecord(point.modules);
  return (
    asRecord(point.latest) ||
    asRecord(point.latest_telemetry) ||
    asRecord(point.telemetry) ||
    asRecord(modules?.m1) ||
    {}
  );
}

export function toCapturePoint(point: Record<string, unknown>, index = 0): CapturePoint {
  const profile = toPointProfile(point, index);
  const latest = latestRecord(profile);
  const dga = asRecord(profile.dga) || {};
  const coords = readCoordinates(profile);
  const lastAt =
    pickString(latest, ["date_time_medition", "date_time", "timestamp"]) ||
    pickString(profile, ["last_transmission", "last_record", "last_seen", "date_time_medition"]) ||
    null;
  const onlineRaw = profile.is_online ?? profile.online ?? latest.is_online;
  const onlineFlag = typeof onlineRaw === "boolean" ? onlineRaw : null;
  const type = pickString(dga, ["type_dga", "type"]).toUpperCase();
  return {
    id: String(profile.id),
    name: profile.name,
    project: pickString(profile, ["project", "project_name", "cliente", "client"]) || pickString(asRecord(profile.point_info), ["project"]),
    lat: coords.lat,
    lng: coords.lng,
    flow: pickNumber(latest, ["flow", "caudal"]) ?? pickNumber(profile, ["flow", "caudal"]),
    level:
      pickNumber(latest, ["nivel", "water_table", "level"]) ??
      pickNumber(profile, ["nivel", "water_table", "level"]),
    total: pickNumber(latest, ["total", "totalizador"]) ?? pickNumber(profile, ["total", "totalizador"]),
    lastAt,
    status: pointStatus(lastAt, onlineFlag),
    kind: type === "SUPERFICIAL" ? "surface" : "well",
    codeDga: pickString(dga, ["code_dga", "code"]),
    standard: pickString(dga, ["standard"]),
    authorizedFlow: positive(pickNumber(dga, ["flow_granted_dga", "authorized_flow"])),
    raw: profile,
  };
}

function listOf(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter((item) => asRecord(item)) as Record<string, unknown>[];
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of ["results", "points", "data", "items", "my_points", "records", "events"]) {
    if (Array.isArray(root[key])) return (root[key] as unknown[]).filter((item) => asRecord(item)) as Record<string, unknown>[];
  }
  return [];
}

export function mergeCatalog(pointsPayload: unknown, summaryPayload: unknown): CapturePoint[] {
  const base = listOf(pointsPayload).map(toCapturePoint);
  const summaryRows = listOf(summaryPayload);
  if (!summaryRows.length) return base;
  const byId = new Map(base.map((point) => [point.id, point]));
  summaryRows.forEach((row, index) => {
    const extra = toCapturePoint(row, index);
    const current = byId.get(extra.id);
    if (!current) {
      byId.set(extra.id, extra);
      return;
    }
    byId.set(extra.id, {
      ...current,
      project: current.project || extra.project,
      lat: current.lat ?? extra.lat,
      lng: current.lng ?? extra.lng,
      flow: current.flow ?? extra.flow,
      level: current.level ?? extra.level,
      total: current.total ?? extra.total,
      lastAt: current.lastAt || extra.lastAt,
      status: current.lastAt ? current.status : extra.status,
      codeDga: current.codeDga || extra.codeDga,
      standard: current.standard || extra.standard,
      authorizedFlow: current.authorizedFlow ?? extra.authorizedFlow,
      kind: current.kind,
    });
  });
  return Array.from(byId.values());
}

export function filterCaptures(
  points: CapturePoint[],
  query: string,
  status: "all" | PointStatus,
  kind: "all" | CaptureKind
): CapturePoint[] {
  const q = query.trim().toLowerCase();
  return points.filter((point) => {
    if (status !== "all" && point.status !== status) return false;
    if (kind !== "all" && point.kind !== kind) return false;
    if (!q) return true;
    return (
      point.name.toLowerCase().includes(q) ||
      point.project.toLowerCase().includes(q) ||
      point.codeDga.toLowerCase().includes(q) ||
      point.id.toLowerCase().includes(q)
    );
  });
}

export function countStatus(points: CapturePoint[]) {
  let online = 0;
  let stale = 0;
  let offline = 0;
  for (const point of points) {
    if (point.status === "online") online += 1;
    else if (point.status === "stale") stale += 1;
    else offline += 1;
  }
  return { total: points.length, online, stale, offline };
}

export function flowBand(flow: number | null, authorized: number | null): FlowBand | null {
  if (flow === null || authorized === null || authorized <= 0) return null;
  if (flow > authorized) return "over";
  if (flow >= authorized * 0.9) return "near";
  return "within";
}

export function parseStandard(raw: string | null | undefined): DgaStandard {
  const value = (raw || "").trim().toUpperCase();
  if (value === "MAYOR") return "mayor";
  if (value === "MEDIO") return "medio";
  if (value === "MENOR") return "menor";
  if (value === "CAUDALES_MUY_PEQUENOS" || value === "CMP") return "muyPequenos";
  if (value === "SIN_ESTANDAR" || value === "") return "sinEstandar";
  return "unknown";
}

export function standardLabel(standard: DgaStandard): string {
  if (standard === "mayor") return "Mayor";
  if (standard === "medio") return "Medio";
  if (standard === "menor") return "Menor";
  if (standard === "muyPequenos") return "Caudales muy pequeños";
  if (standard === "sinEstandar") return "Sin estándar";
  return "No informado";
}

export function standardCadence(standard: DgaStandard): string {
  if (standard === "mayor" || standard === "sinEstandar") return "Un reporte cada hora";
  if (standard === "medio") return "Un reporte al día (00:00)";
  if (standard === "menor") return "Un reporte al mes (día 1)";
  if (standard === "muyPequenos") return "Dos reportes al año (1 ene y 1 jul)";
  return "Cadencia no informada";
}

export function isValidVoucher(value: string | null | undefined): boolean {
  const text = (value || "").trim().toLowerCase();
  return Boolean(text) && text !== "-" && text !== "..." && text !== "null";
}

function hourKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
}

function expectsSlot(standard: DgaStandard, date: Date): boolean {
  if (standard === "mayor" || standard === "sinEstandar") return true;
  if (standard === "medio") return date.getHours() === 0;
  if (standard === "menor") return date.getDate() === 1 && date.getHours() === 0;
  if (standard === "muyPequenos") {
    return (date.getMonth() === 0 || date.getMonth() === 6) && date.getDate() === 1 && date.getHours() === 0;
  }
  return false;
}

export function summarizeSlots(rows: Reading[], standard: DgaStandard, start: string, end: string) {
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T23:00:00`);
  const now = new Date();
  const limit = to.getTime() > now.getTime() ? now : to;
  const bySlot = new Map<string, Reading[]>();
  rows.forEach((row) => {
    const date = new Date(row.time);
    if (Number.isNaN(date.getTime())) return;
    const key = hourKey(date);
    const list = bySlot.get(key);
    if (list) list.push(row);
    else bySlot.set(key, [row]);
  });
  let expected = 0;
  let delivered = 0;
  let missing = 0;
  const cursor = new Date(from);
  while (cursor.getTime() <= limit.getTime()) {
    if (expectsSlot(standard, cursor)) {
      const grace = now.getTime() - cursor.getTime() < 75 * 60 * 1000;
      if (!grace) {
        expected += 1;
        const bucket = bySlot.get(hourKey(cursor)) || [];
        if (bucket.some((row) => isValidVoucher(row.voucher))) delivered += 1;
        else missing += 1;
      }
    }
    cursor.setHours(cursor.getHours() + 1);
  }
  return {
    expected,
    delivered,
    missing,
    rate: expected === 0 ? null : delivered / expected,
  };
}

export function parseReadings(payload: unknown): Reading[] {
  const rows = listOf(payload);
  const readings: Reading[] = [];
  rows.forEach((row) => {
    const at = pickString(row, ["date_time_medition", "date_time", "timestamp", "created"]);
    const time = new Date(at).getTime();
    if (!at || Number.isNaN(time)) return;
    readings.push({
      at,
      time,
      flow: pickNumber(row, ["flow", "caudal"]),
      level: pickNumber(row, ["nivel", "water_table", "level"]),
      total: pickNumber(row, ["total", "totalizador", "total_raw"]),
      voucher: pickString(row, ["n_voucher", "voucher"]) || null,
    });
  });
  readings.sort((a, b) => a.time - b.time);
  return readings;
}

export function downsample<T>(rows: T[], max: number): T[] {
  if (rows.length <= max) return rows;
  const out: T[] = [];
  const step = (rows.length - 1) / (max - 1);
  for (let index = 0; index < max; index += 1) out.push(rows[Math.round(index * step)]);
  return out;
}

export function seriesExtent(rows: Reading[], key: "flow" | "level" | "total"): { min: number; max: number } | null {
  let min = Infinity;
  let max = -Infinity;
  for (const row of rows) {
    const value = row[key];
    if (value === null) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max };
}

export function levelFill(level: number | null, rows: Reading[]): number {
  if (level === null) return 0.55;
  const extent = seriesExtent(rows, "level");
  if (!extent || Math.abs(extent.max - extent.min) < 0.0001) return 0.55;
  return Math.min(1, Math.max(0, (level - extent.min) / (extent.max - extent.min)));
}

export function parseWellProfile(payload: unknown): WellProfile {
  const root = asRecord(payload) || {};
  const nested = asRecord(root.config_data) || asRecord(root.config) || root;
  return {
    depth: positive(pickNumber(nested, ["d1", "depth"])),
    pumpDepth: positive(pickNumber(nested, ["d2", "pump_depth"])),
    sensorDepth: positive(pickNumber(nested, ["d3", "sensor_depth"])),
    ductInches: positive(pickNumber(nested, ["d4"])),
    flowmeterInches: positive(pickNumber(nested, ["d5"])),
    maxFlow: positive(pickNumber(nested, ["max_flow_ls", "max_flow"])),
  };
}

export function readViewMode(userKey: string): ViewMode {
  try {
    return localStorage.getItem(`ikolu.view.${userKey}`) === "3d" ? "3d" : "2d";
  } catch {
    return "2d";
  }
}

export function writeViewMode(userKey: string, mode: ViewMode) {
  try {
    localStorage.setItem(`ikolu.view.${userKey}`, mode);
  } catch {
    /* el modo queda solo en la sesión */
  }
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

export function userStorageKey(user: { id?: string | number; username?: string; email?: string } | null | undefined): string {
  if (!user) return "anon";
  if (user.id !== undefined && user.id !== null && String(user.id)) return String(user.id);
  return user.username || user.email || "anon";
}
