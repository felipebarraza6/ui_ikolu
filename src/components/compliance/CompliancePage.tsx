import { useContext, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AppContext } from "@/App";
import { fetchCompliance, fetchFlowHistory, fetchNearLimit } from "@/api/nereus/endpoints";
import { KpiCard, KpiSkeleton } from "@/components/brand/KpiCard";
import { SeriesChart } from "@/components/brand/SeriesChart";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePointsCatalog } from "@/hooks/usePointsCatalog";
import {
  downsample,
  flowBand,
  formatMeasure,
  formatNumber,
  formatWhen,
  parseReadings,
  parseStandard,
  standardCadence,
  standardLabel,
  summarizeSlots,
  isoDate,
} from "@/lib/hydro";

export default function CompliancePage() {
  const navigate = useNavigate();
  const { dispatch } = useContext(AppContext) as {
    dispatch: (_action: { type: string; payload?: unknown }) => void;
  };
  const { points } = usePointsCatalog();
  const dgaPoints = useMemo(() => points.filter((point) => point.codeDga), [points]);
  const [pointId, setPointId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState(30);
  const selected = dgaPoints.find((point) => point.id === pointId) || dgaPoints[0] || null;
  const activeId = selected?.id || null;

  const listQuery = useQuery({
    queryKey: ["compliance"],
    queryFn: () => fetchCompliance(),
    staleTime: 30_000,
  });
  const flowQuery = useQuery({
    queryKey: ["flow_history", activeId, days],
    queryFn: () => fetchFlowHistory(activeId as string, days),
    enabled: Boolean(activeId),
    staleTime: 30_000,
  });
  const nearQuery = useQuery({
    queryKey: ["near_limit", activeId, days],
    queryFn: () => fetchNearLimit(activeId as string, days),
    enabled: Boolean(activeId),
    staleTime: 30_000,
  });

  const readings = useMemo(() => parseReadings(flowQuery.data), [flowQuery.data]);
  const nearRows = useMemo(() => parseReadings(nearQuery.data), [nearQuery.data]);
  const slotWindow = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - Math.max(days - 1, 0));
    return { start: isoDate(start), end: isoDate(end) };
  }, [days]);
  const standard = parseStandard(selected?.standard);
  const slots = summarizeSlots(readings, standard, slotWindow.start, slotWindow.end);
  const hasVoucher = readings.some((row) => row.voucher);
  const bands = readings.reduce(
    (acc, row) => {
      const band = flowBand(row.flow, selected?.authorizedFlow ?? null);
      if (band) acc[band] += 1;
      return acc;
    },
    { within: 0, near: 0, over: 0 }
  );
  const chartRows = downsample(readings, 360);
  const listVirtual = useVirtualizer({
    count: dgaPoints.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  const openTelemetry = () => {
    if (!selected) return;
    dispatch({ type: "CHANGE_SELECTED_PROFILE", payload: { selected_profile: selected.raw } });
    navigate("/telemetry");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">DGA · MEE</p>
          <h2 className="text-2xl font-black">Cumplimiento de caudal</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Bandas frente al caudal autorizado: dentro, desde el 90% y sobre el límite. El porcentaje usa los comprobantes del período.
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((option) => (
            <Button key={option} variant={days === option ? "default" : "outline"} onClick={() => setDays(option)}>
              {option} días
            </Button>
          ))}
        </div>
      </div>

      {listQuery.isError && dgaPoints.length === 0 ? (
        <ErrorState title="No se pudo leer el cumplimiento" onRetry={() => listQuery.refetch()} />
      ) : null}

      {dgaPoints.length === 0 ? (
        <EmptyState title="Ningún punto con código DGA" description="Cuando el punto tenga code_dga, el cumplimiento aparece aquí." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
          <div ref={listRef} className="h-[min(70vh,640px)] overflow-auto rounded-xl border bg-card">
            <div className="relative w-full" style={{ height: listVirtual.getTotalSize() }}>
              {listVirtual.getVirtualItems().map((item) => {
                const point = dgaPoints[item.index];
                const active = point.id === activeId;
                return (
                  <button
                    key={point.id}
                    type="button"
                    onClick={() => setPointId(point.id)}
                    className={
                      active
                        ? "absolute left-0 top-0 w-full bg-navy px-3 text-left text-white"
                        : "absolute left-0 top-0 w-full px-3 text-left hover:bg-muted"
                    }
                    style={{ height: item.size, transform: `translateY(${item.start}px)` }}
                  >
                    <span className="block truncate text-sm font-bold">{point.name}</span>
                    <span className={active ? "text-xs text-white/80" : "text-xs text-muted-foreground"}>{point.codeDga}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {selected ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="dga" label={standardLabel(standard)} />
                <span className="text-sm text-muted-foreground">{standardCadence(standard)}</span>
                <Button variant="outline" onClick={openTelemetry}>
                  Ver telemetría
                </Button>
              </div>
              {flowQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <KpiSkeleton />
                </div>
              ) : (
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <KpiCard
                    label="Entregados"
                    value={slots.rate === null || !hasVoucher ? "—" : `${formatNumber(slots.rate * 100, 0)}%`}
                    hint={
                      !hasVoucher
                        ? "Sin comprobantes en la respuesta"
                        : slots.expected
                          ? `${slots.delivered} de ${slots.expected}`
                          : "Sin ranuras exigidas"
                    }
                  />
                  <KpiCard label="Dentro" value={formatNumber(bands.within, 0)} hint="Bajo el 90%" />
                  <KpiCard label="Cerca" value={formatNumber(bands.near, 0)} hint="90% al autorizado" />
                  <KpiCard label="Sobre límite" value={formatNumber(bands.over, 0)} hint={formatMeasure(selected.authorizedFlow, "L/s", 2)} />
                </section>
              )}
              {flowQuery.isError ? <ErrorState title="Sin historial de caudal" onRetry={() => flowQuery.refetch()} /> : null}
              {chartRows.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Caudal y bandas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SeriesChart
                      labels={chartRows.map((row) => formatWhen(row.at))}
                      series={[
                        { label: "Caudal", color: "#00C8FF", values: chartRows.map((row) => row.flow), fill: true },
                        ...(selected.authorizedFlow
                          ? [
                              {
                                label: "Autorizado",
                                color: "#FF847A",
                                values: chartRows.map(() => selected.authorizedFlow),
                                dashed: true,
                              },
                              {
                                label: "90%",
                                color: "#FFC46B",
                                values: chartRows.map(() => (selected.authorizedFlow || 0) * 0.9),
                                dashed: true,
                              },
                            ]
                          : []),
                      ]}
                    />
                  </CardContent>
                </Card>
              ) : null}
              <Card>
                <CardHeader>
                  <CardTitle>Cerca o sobre el límite</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(nearRows.length ? nearRows : readings.filter((row) => flowBand(row.flow, selected.authorizedFlow) !== "within"))
                    .slice(-12)
                    .reverse()
                    .map((row) => (
                      <div key={`${row.at}-${row.flow}`} className="flex items-center justify-between text-sm">
                        <span>{formatWhen(row.at)}</span>
                        <span className="font-data font-bold">{formatMeasure(row.flow, "L/s", 2)}</span>
                      </div>
                    ))}
                  {readings.length === 0 && !flowQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">No hay lecturas de caudal en el período.</p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
