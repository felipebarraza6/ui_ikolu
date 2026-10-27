export type Branch = { id: string; name: string };

export type PointProfile = {
  id: string | number;
  key: string | number;
  name: string;
  dga: Record<string, unknown>;
  config_data: Record<string, unknown>;
  modules: Record<string, unknown>;
  profile_ikolu: Record<string, unknown>;
  [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

export function normalizeBranches(payload: unknown): Branch[] {
  const root = asRecord(payload) || {};
  const user = asRecord(root.user) || {};
  const candidates = [
    root.branches,
    root.sucursales,
    user.branches,
    user.sucursales,
    user.available_branches,
  ];
  let list = candidates.find((item) => Array.isArray(item)) as unknown[] | undefined;
  if (!list) {
    const single = asRecord(root.branch) || asRecord(user.branch) || asRecord(user.sucursal);
    list = single ? [single] : [];
  }

  const branches: Branch[] = [];
  list.forEach((item) => {
    const row = asRecord(item);
    if (!row) return;
    const idRaw = row.id ?? row.branch_id ?? row.pk;
    if (idRaw === undefined || idRaw === null || idRaw === "") return;
    const id = String(idRaw);
    const name = String(row.name ?? row.title ?? row.label ?? `Sucursal ${id}`);
    branches.push({ id, name });
  });
  return branches;
}

export function asList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of ["results", "points", "data", "items", "my_points"]) {
    const value = root[key];
    if (Array.isArray(value)) return value.filter(isRecord);
  }
  return [];
}

export function toPointProfile(point: Record<string, unknown>, index: number): PointProfile {
  const id = (point.id ?? point.point_id ?? point.pk ?? index) as string | number;
  const name = String(
    point.name || point.title || point.point_name || point.nombre || `Punto ${id}`
  );
  return {
    ...point,
    id,
    key: id,
    name,
    dga: asRecord(point.dga) || {},
    config_data: asRecord(point.config_data) || asRecord(point.config) || {},
    modules: asRecord(point.modules) || {},
    profile_ikolu: asRecord(point.profile_ikolu) || {},
  };
}

export function mapPoints(payload: unknown): PointProfile[] {
  return asList(payload).map(toPointProfile);
}

/** Desenvuelve `{ data | stats | summary }` cuando es el único cuerpo útil. */
export function unwrapObject(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload) || {};
  const keys = Object.keys(root).filter((key) => key !== "meta" && key !== "timestamp");
  if (keys.length === 1 && ["data", "stats", "summary"].includes(keys[0])) {
    const inner = asRecord(root[keys[0]]);
    if (inner) return inner;
  }
  return root;
}

export function telemetryByPoint(payload: unknown): Map<string, Record<string, unknown>> {
  const root = asRecord(payload) || {};
  const data = asRecord(root.data) || root;
  const map = new Map<string, Record<string, unknown>>();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "meta" || key === "timestamp") return;
    const row = asRecord(value);
    if (row) map.set(String(key), row);
  });
  return map;
}

export function persistBranchChoice(branches: Branch[]) {
  localStorage.setItem("branches", JSON.stringify(branches));
  if (branches.length < 2) {
    localStorage.removeItem("branch_multi");
    localStorage.removeItem("branch_id");
    return { multi: false, branchId: null as string | null };
  }
  const stored = localStorage.getItem("branch_id");
  const branchId = branches.some((branch) => branch.id === stored)
    ? (stored as string)
    : branches[0].id;
  localStorage.setItem("branch_multi", "1");
  localStorage.setItem("branch_id", branchId);
  return { multi: true, branchId };
}

export function displayName(user: { first_name?: string; last_name?: string; username?: string; email?: string } | null | undefined) {
  if (!user) return "Usuario";
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return full || user.username || user.email || "Usuario";
}

export function errorMessage(error: unknown, fallback: string) {
  const err = error as {
    response?: { data?: { error?: string; message?: string; detail?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.message ||
    fallback
  );
}
