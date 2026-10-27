import { asRecord } from "@/api/nereus/normalize";

export function records(payload: unknown, keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.map(asRecord).filter((row): row is Record<string, unknown> => Boolean(row));
  }
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of keys) {
    const value = root[key];
    if (Array.isArray(value)) {
      return value.map(asRecord).filter((row): row is Record<string, unknown> => Boolean(row));
    }
  }
  return [];
}

export function text(row: Record<string, unknown> | null | undefined, keys: string[], fallback = "—") {
  if (!row) return fallback;
  for (const key of keys) {
    const value = row[key];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }
  return fallback;
}

export function num(row: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!row) return null;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }
  return null;
}

export function toneOf(value: string): "online" | "stale" | "offline" | "info" {
  const textValue = value.toLowerCase();
  if (["ok", "up", "online", "healthy", "accepted", "resolved", "operational", "true"].some((item) => textValue.includes(item))) {
    return "online";
  }
  if (["warn", "degrad", "pending", "in_flight", "in flight", "stale", "investigat", "open"].some((item) => textValue.includes(item))) {
    return "stale";
  }
  if (["down", "fail", "error", "reject", "offline", "critical", "outage", "false"].some((item) => textValue.includes(item))) {
    return "offline";
  }
  return "info";
}
