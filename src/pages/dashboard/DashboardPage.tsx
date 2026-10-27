import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Droplets, Gauge, Radio, RefreshCw } from "lucide-react";
import { AppContext } from "@/App";
import {
  fetchBatchTelemetry,
  fetchDashboardStats,
  fetchMyPoints,
  fetchPointsSummary,
} from "@/api/nereus/endpoints";
import {
  asRecord,
  mapPoints,
  telemetryByPoint,
  unwrapObject,
  type PointProfile,
} from "@/api/nereus/normalize";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const numberFormat = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 });

const STAT_LABELS: Record<string, string> = {
  total: "Puntos",
  total_points: "Puntos",
  points_total: "Puntos",
  count: "Puntos",
  online: "En línea",
  online_points: "En línea",
  points_online: "En línea",
  offline: "Sin transmisión",
  offline_points: "Sin transmisión",
  alerts: "Alertas",
  active_alerts: "Alertas",
  flow: "Caudal",
  total_flow: "Caudal",
  avg_flow: "Caudal medio",
  consumption_today: "Consumo hoy",
  total_today: "Consumo hoy",
  total_consumption: "Consumo",
};

type StatCard = { key: string; label: string; value: string };

function statValue(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return numberFormat.format(value);
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) return numberFormat.format(value.length);
  return null;
}

function collectStats(payload: unknown, prefix: string): StatCard[] {
  const source = unwrapObject(payload);
  const cards: StatCard[] = [];
  Object.entries(source).forEach(([key, value]) => {
    const label = STAT_LABELS[key];
    const shown = statValue(value);
    if (!label || shown === null) return;
    cards.push({ key: `${prefix}-${key}`, label, value: shown });
  });
  return cards.slice(0, 4);
}

function formatWhen(value: unknown) {
  if (typeof value !== "string" || !value) return "Sin registro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin registro";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function pointOnline(point: PointProfile, entry: Record<string, unknown> | undefined) {
  if (point.is_online === true || point.online === true) return true;
  if (point.is_online === false || point.online === false) return false;
  const latest = asRecord(entry?.latest);
  if (!latest || entry?.no_data_reason) return false;
  const raw = latest.date_time_medition;
  if (typeof raw !== "string") return true;
  const time = new Date(raw).getTime();
  if (Number.isNaN(time)) return true;
  return Date.now() - time < 2 * 60 * 60 * 1000;
}

function metric(value: unknown, unit: string) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${numberFormat.format(value)} ${unit}`;
  }
  if (typeof value === "string" && value) return `${value} ${unit}`;
  return "—";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AppContext) as {
    state: { branchId?: string | null };
    dispatch: (_action: { type: string; payload?: unknown }) => void;
  };
  const branchKey = state.branchId || "default";

  const pointsQuery = useQuery({
    queryKey: ["my_points", branchKey],
    queryFn: fetchMyPoints,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const summaryQuery = useQuery({
    queryKey: ["points_summary", branchKey],
    queryFn: fetchPointsSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const statsQuery = useQuery({
    queryKey: ["dashboard_stats", branchKey],
    queryFn: fetchDashboardStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const points = mapPoints(pointsQuery.data);
  const pointIds = points.map((point) => point.id).slice(0, 50);

  const telemetryQuery = useQuery({
    queryKey: ["batch_telemetry", branchKey, pointIds.join(",")],
    queryFn: () => fetchBatchTelemetry(pointIds, 24),
    enabled: pointIds.length > 0,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const telemetry = telemetryByPoint(telemetryQuery.data);
  const kpis = [
    ...collectStats(statsQuery.data, "stats"),
    ...collectStats(summaryQuery.data, "summary"),
  ].slice(0, 4);

  const refreshing =
    pointsQuery.isFetching || summaryQuery.isFetching || statsQuery.isFetching || telemetryQuery.isFetching;

  const openPoint = (point: PointProfile) => {
    dispatch({
      type: "CHANGE_SELECTED_PROFILE",
      payload: { selected_profile: point },
    });
    navigate("/telemetry");
  };

  const failed = pointsQuery.isError && points.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">
            Operación
          </p>
          <h2 className="text-2xl font-black">Estado de tus captaciones</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Puntos, resumen y telemetría del lote. La vista se actualiza sola cada minuto.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            pointsQuery.refetch();
            summaryQuery.refetch();
            statsQuery.refetch();
            telemetryQuery.refetch();
          }}
          disabled={refreshing}
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
          Actualizar
        </Button>
      </div>

      {failed ? (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-destructive">
              No pudimos leer el centro de control. Revisa la sesión o vuelve a intentar.
            </p>
            <Button variant="outline" onClick={() => pointsQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {pointsQuery.isLoading && kpis.length === 0
          ? [0, 1, 2, 3].map((item) => (
              <Card key={item}>
                <CardContent>
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-3 h-8 w-20" />
                </CardContent>
              </Card>
            ))
          : (kpis.length ? kpis : [{ key: "points", label: "Puntos", value: numberFormat.format(points.length) }]).map(
              (card) => (
                <Card key={card.key}>
                  <CardContent>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="mt-2 font-data text-3xl font-bold text-navy dark:text-limebrand">
                      {card.value}
                    </p>
                    <div className="mt-3 h-1 w-10 rounded-full bg-limebrand" />
                  </CardContent>
                </Card>
              )
            )}
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pointsQuery.isLoading
          ? [0, 1, 2].map((item) => (
              <Card key={item}>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
          : null}

        {!pointsQuery.isLoading && points.length === 0 && !failed ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent>
              <p className="font-bold">No hay puntos en esta sucursal.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando Nereus publique captaciones en my_points, aparecerán aquí.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {points.map((point) => {
          const entry = telemetry.get(String(point.id));
          const latest = asRecord(entry?.latest);
          const online = pointOnline(point, entry);
          const info = asRecord(entry?.point_info);
          const project = info?.project || point.project;
          return (
            <button
              key={String(point.id)}
              type="button"
              onClick={() => openPoint(point)}
              className="rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{point.name}</CardTitle>
                    <p className="truncate text-xs text-muted-foreground">
                      {project ? String(project) : `ID ${point.id}`}
                    </p>
                  </div>
                  <Badge variant={online ? "accent" : "muted"}>{online ? "En línea" : "Sin datos"}</Badge>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 pt-3">
                  <Metric icon={Gauge} label="Caudal" value={metric(latest?.flow, "L/s")} />
                  <Metric icon={Droplets} label="Nivel" value={metric(latest?.nivel, "m")} />
                  <Metric icon={Radio} label="Total" value={metric(latest?.total, "m³")} />
                  <p className="col-span-3 text-xs text-muted-foreground">
                    Última medición: {formatWhen(latest?.date_time_medition)}
                  </p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted/70 px-2 py-2">
      <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-1 font-data text-sm font-bold">{value}</p>
    </div>
  );
}
