import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets, RadioTower, RefreshCw, TriangleAlert, Waves } from "lucide-react";
import { AppContext } from "@/App";
import { BlockSkeleton, KpiCard, KpiSkeleton } from "@/components/brand/KpiCard";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { PointRoster } from "@/components/live/PointRoster";
import { Button } from "@/components/ui/button";
import { usePointsCatalog } from "@/hooks/usePointsCatalog";
import { formatNumber, type CapturePoint } from "@/lib/hydro";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AppContext) as {
    dispatch: (_action: { type: string; payload?: unknown }) => void;
  };
  const { points, counts, pointsQuery, summaryQuery, statsQuery } = usePointsCatalog();
  const loading = pointsQuery.isLoading && points.length === 0;
  const failed = pointsQuery.isError && points.length === 0;
  const refreshing = pointsQuery.isFetching || summaryQuery.isFetching || statsQuery.isFetching;

  const openPoint = (point: CapturePoint) => {
    dispatch({ type: "CHANGE_SELECTED_PROFILE", payload: { selected_profile: point.raw } });
    navigate("/telemetry");
  };

  const refetch = () => {
    pointsQuery.refetch();
    summaryQuery.refetch();
    statsQuery.refetch();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">
              Panel en vivo
            </p>
            <StatusBadge status="online" label="Actualización cada minuto" pulse />
          </div>
          <h2 className="mt-1 text-2xl font-black">Estado de tus captaciones</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            El listado está virtualizado para miles de puntos. En línea es una transmisión de las últimas dos horas.
          </p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={refreshing}>
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
          Actualizar
        </Button>
      </div>

      {failed ? (
        <ErrorState
          title="No pudimos leer el centro de control"
          description="Revisa la sesión o vuelve a intentar."
          onRetry={() => pointsQuery.refetch()}
        />
      ) : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          <KpiSkeleton />
        ) : (
          <>
            <KpiCard label="Puntos" value={formatNumber(counts.total, 0)} hint="En esta sucursal" icon={Waves} />
            <KpiCard label="En línea" value={formatNumber(counts.online, 0)} hint="Últimas 2 horas" icon={RadioTower} />
            <KpiCard label="Atención" value={formatNumber(counts.stale, 0)} hint="Entre 2 y 24 horas" icon={TriangleAlert} />
            <KpiCard label="Sin transmisión" value={formatNumber(counts.offline, 0)} hint="Sin dato reciente" icon={Droplets} />
          </>
        )}
      </section>

      {loading ? <BlockSkeleton className="h-80" /> : null}
      {!loading && !failed && points.length === 0 ? (
        <EmptyState
          title="No hay puntos en esta sucursal"
          description="Cuando Nereus publique captaciones en my_points, aparecerán aquí."
        />
      ) : null}
      {!loading && points.length > 0 ? <PointRoster points={points} onOpen={openPoint} /> : null}
    </div>
  );
}
