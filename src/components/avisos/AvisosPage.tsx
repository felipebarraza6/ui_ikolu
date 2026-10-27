import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "@/App";
import { fetchEventsSummary, fetchSystemEvents } from "@/api/nereus/endpoints";
import { asList, asRecord, unwrapObject } from "@/api/nereus/normalize";
import { KpiCard, KpiSkeleton } from "@/components/brand/KpiCard";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { Segmented } from "@/components/brand/Segmented";
import { usePointsCatalog } from "@/hooks/usePointsCatalog";
import { formatWhen } from "@/lib/hydro";

type Lens = "all" | "critical" | "attention";

type Aviso = {
  id: string;
  type: string;
  label: string;
  lens: "critical" | "attention";
  at: string | null;
  pointId: string | null;
  pointName: string;
  detail: string;
};

const LABELS: Record<string, string> = {
  DISCONNECTION: "Desconexión",
  RECONNECTION: "Reconexión",
  MEASUREMENT_ERROR: "Error de medición",
  COUNTER_RESET: "Reinicio de contador",
  MASSIVE_JUMP_BLOCKED: "Salto bloqueado",
  TOKEN_REFRESH: "Token",
  API_ERROR: "Error de API",
};

function lensOf(type: string): "critical" | "attention" {
  if (["DISCONNECTION", "MEASUREMENT_ERROR", "API_ERROR", "MASSIVE_JUMP_BLOCKED"].includes(type)) return "critical";
  return "attention";
}

function readPointId(row: Record<string, unknown>): string | null {
  const direct = row.point_id ?? row.catchment_point_id;
  if (typeof direct === "number" || typeof direct === "string") return String(direct);
  const point = asRecord(row.point);
  if (point?.id !== undefined && point.id !== null) return String(point.id);
  return null;
}

function toAvisos(payload: unknown): Aviso[] {
  return asList(payload).map((row, index) => {
    const type = String(row.event_type || row.type || row.kind || "EVENT");
    const at = typeof row.created === "string" ? row.created : typeof row.timestamp === "string" ? row.timestamp : typeof row.date === "string" ? row.date : null;
    const point = asRecord(row.point);
    return {
      id: String(row.id ?? index),
      type,
      label: LABELS[type] || "Evento",
      lens: lensOf(type),
      at,
      pointId: readPointId(row),
      pointName: String(point?.title || point?.name || row.point_title || row.point_name || ""),
      detail: String(row.message || row.detail || row.description || ""),
    };
  });
}

export default function AvisosPage() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AppContext) as {
    dispatch: (_action: { type: string; payload?: unknown }) => void;
  };
  const { points } = usePointsCatalog();
  const [lens, setLens] = useState<Lens>("all");
  const eventsQuery = useQuery({
    queryKey: ["system_events"],
    queryFn: () => fetchSystemEvents(100),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const summaryQuery = useQuery({
    queryKey: ["events_summary"],
    queryFn: () => fetchEventsSummary(7),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const avisos = useMemo(() => toAvisos(eventsQuery.data), [eventsQuery.data]);
  const visible = lens === "all" ? avisos : avisos.filter((item) => item.lens === lens);
  const critical = avisos.filter((item) => item.lens === "critical").length;
  const attention = avisos.length - critical;
  const summary = unwrapObject(summaryQuery.data);

  const openPoint = (pointId: string | null) => {
    if (!pointId) return;
    const point = points.find((item) => item.id === pointId);
    if (!point) return;
    dispatch({ type: "CHANGE_SELECTED_PROFILE", payload: { selected_profile: point.raw } });
    navigate("/telemetry");
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Buzón</p>
        <h2 className="text-2xl font-black">Avisos del servicio</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Muestra los últimos 100 eventos del centro de control. Crítico es desconexión, error de medición o de API.
        </p>
      </div>
      {eventsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiSkeleton />
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="En la muestra" value={String(avisos.length)} />
          <KpiCard label="Críticos" value={String(critical)} />
          <KpiCard label="Atención" value={String(attention)} />
          <KpiCard label="Resumen 7 días" value={typeof summary.total === "number" ? String(summary.total) : "—"} />
        </section>
      )}
      <Segmented
        label="Corte de avisos"
        value={lens}
        onChange={setLens}
        options={[
          { value: "all", label: "Todos" },
          { value: "critical", label: "Críticos" },
          { value: "attention", label: "Atención" },
        ]}
      />
      {eventsQuery.isError ? <ErrorState title="No se pudieron leer los avisos" onRetry={() => eventsQuery.refetch()} /> : null}
      {!eventsQuery.isLoading && visible.length === 0 && !eventsQuery.isError ? (
        <EmptyState title="Sin incidencias en estos registros" description="El buzón se actualiza cada minuto." />
      ) : null}
      <div className="space-y-2">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openPoint(item.pointId)}
            className="flex w-full flex-col gap-1 rounded-xl border bg-card px-4 py-3 text-left hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              <span className="flex items-center gap-2">
                <StatusBadge status={item.lens === "critical" ? "offline" : "stale"} label={item.label} />
                <span className="text-sm font-bold">{item.pointName || "Sin punto"}</span>
              </span>
              {item.detail ? <span className="mt-1 block text-sm text-muted-foreground">{item.detail}</span> : null}
            </span>
            <span className="text-xs text-muted-foreground">{formatWhen(item.at)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
