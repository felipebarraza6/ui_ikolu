import { useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppContext } from "@/App";
import { errorText, isUnavailable, retryUnlessMissing, UNAVAILABLE_MESSAGE } from "@/api/nereus/errors";
import { asRecord } from "@/api/nereus/normalize";
import portal from "@/api/nereus/portal";
import { DataTable } from "@/components/brand/DataTable";
import { KpiCard, BlockSkeleton } from "@/components/brand/KpiCard";
import { ErrorState } from "@/components/brand/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { num, records, text } from "@/lib/records";
import { formatNumber } from "@/lib/hydro";

type Shell = { state: { user?: { is_staff?: boolean } } };

export default function AdminPage() {
  const { state } = useContext(AppContext) as Shell;
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const isStaff = Boolean(state.user?.is_staff);

  const system = useQuery({
    queryKey: ["admin-system"],
    enabled: isStaff,
    retry: retryUnlessMissing,
    queryFn: () => portal.management.systemStatus(),
  });
  const points = useQuery({
    queryKey: ["admin-points"],
    enabled: isStaff,
    retry: retryUnlessMissing,
    queryFn: () => portal.management.pointsStatus(),
  });
  const queue = useQuery({
    queryKey: ["admin-dga"],
    enabled: isStaff,
    retry: retryUnlessMissing,
    queryFn: () => portal.management.dgaQueueStatus(),
  });
  const notes = useQuery({
    queryKey: ["admin-notes"],
    enabled: isStaff,
    retry: retryUnlessMissing,
    queryFn: () => portal.management.notificationsSummary(),
  });

  if (!isStaff) {
    return <ErrorState title="Acceso restringido" description="No tienes permisos de administrador para ver esta sección." />;
  }

  const stats = asRecord(asRecord(system.data)?.statistics) || {};
  const pointRows = records(points.data, ["points", "results", "items"]);
  const queueRoot = asRecord(queue.data) || {};
  const queueStatus = asRecord(queueRoot.queue_status) || {};
  const queueRows = records(queue.data, ["by_point", "results", "items"]);
  const summary = asRecord(asRecord(notes.data)?.summary) || {};

  const run = async (work: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try {
      await work();
      toast.success(ok);
      queryClient.invalidateQueries({ queryKey: ["admin-points"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dga"] });
      queryClient.invalidateQueries({ queryKey: ["admin-system"] });
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Staff</p>
          <h2 className="mt-1 text-2xl font-black">Administración</h2>
        </div>
        <Button variant="outline" onClick={() => { system.refetch(); points.refetch(); queue.refetch(); notes.refetch(); }}>
          Actualizar
        </Button>
      </div>
      {system.isLoading ? <BlockSkeleton className="h-28" /> : null}
      {system.isError ? (
        <ErrorState
          title={isUnavailable(system.error) ? UNAVAILABLE_MESSAGE : "No pudimos leer el estado del sistema"}
          description={errorText(system.error)}
          onRetry={() => system.refetch()}
        />
      ) : null}
      {!system.isLoading && !system.isError ? (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <KpiCard label="Puntos" value={formatNumber(num(stats, ["total_points"]), 0)} />
          <KpiCard label="Activos" value={formatNumber(num(stats, ["active_telemetry"]), 0)} />
          <KpiCard label="Desconectados" value={formatNumber(num(stats, ["disconnected_points"]), 0)} />
          <KpiCard label="Registros 24h" value={formatNumber(num(stats, ["records_last_24h"]), 0)} />
          <KpiCard label="Cola DGA" value={formatNumber(num(stats, ["dga_queue_size"]), 0)} />
          <KpiCard label="Alertas activas" value={formatNumber(num(stats, ["active_notifications"]), 0)} />
        </section>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Puntos</CardTitle>
        </CardHeader>
        <CardContent>
          {points.isError ? <p className="mb-3 text-sm font-bold">{isUnavailable(points.error) ? UNAVAILABLE_MESSAGE : errorText(points.error)}</p> : null}
          <DataTable
            rows={pointRows}
            empty={points.isLoading ? "Cargando…" : "No hay puntos."}
            columns={[
              { key: "title", label: "Nombre", render: (row) => text(row, ["title", "name"]) },
              { key: "project", label: "Proyecto", render: (row) => text(row, ["project"]) },
              { key: "client", label: "Cliente", render: (row) => text(row, ["client"]) },
              { key: "freq", label: "Frecuencia", render: (row) => `${text(row, ["frecuency", "frequency"])} min` },
              { key: "telemetry", label: "Telemetría", render: (row) => (row.telemetry_active ? "Activa" : "Inactiva") },
              {
                key: "action",
                label: "",
                render: (row) => (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => run(() => portal.management.toggleTelemetry(row.id as string | number, !row.telemetry_active), "Telemetría actualizada")}
                  >
                    {row.telemetry_active ? "Desactivar" : "Activar"}
                  </Button>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cola DGA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {queue.isError ? <p className="text-sm font-bold">{isUnavailable(queue.error) ? UNAVAILABLE_MESSAGE : errorText(queue.error)}</p> : null}
          <div className="grid grid-cols-3 gap-3">
            <KpiCard label="En cola" value={formatNumber(num(queueStatus, ["total"]), 0)} />
            <KpiCard label="Errores" value={formatNumber(num(queueStatus, ["errors"]), 0)} />
            <KpiCard label="Antiguos" value={formatNumber(num(queueStatus, ["old_records"]), 0)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" disabled={busy} onClick={() => run(() => portal.management.clearDgaQueue({ only_errors: true }), "Cola DGA limpiada")}>
              Limpiar errores
            </Button>
            <Button disabled={busy} onClick={() => run(() => portal.management.requeueDga({ only_errors: false }), "Registros reencolados")}>
              Reencolar
            </Button>
          </div>
          <DataTable
            rows={queueRows}
            columns={[
              { key: "point", label: "Punto", render: (row) => text(row, ["catchment_point__title", "title", "point"]) },
              { key: "count", label: "Cantidad", render: (row) => text(row, ["count"]) },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.isError ? <p className="mb-3 text-sm font-bold">{isUnavailable(notes.error) ? UNAVAILABLE_MESSAGE : errorText(notes.error)}</p> : null}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label="Total" value={formatNumber(num(summary, ["total"]), 0)} />
            <KpiCard label="Activas" value={formatNumber(num(summary, ["active"]), 0)} />
            <KpiCard label="No leídas" value={formatNumber(num(summary, ["unread"]), 0)} />
            <KpiCard label="Finalizadas" value={formatNumber(num(summary, ["finished"]), 0)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
