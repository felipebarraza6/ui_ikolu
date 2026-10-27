import { useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AppContext } from "@/App";
import { fetchPointConfig, fetchPointRecords } from "@/api/nereus/endpoints";
import { RangeBar, type DateWindow } from "@/components/brand/RangeBar";
import { SeriesChart } from "@/components/brand/SeriesChart";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { BlockSkeleton } from "@/components/brand/KpiCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PointHistorySheet } from "@/components/history/PointHistorySheet";
import { usePointsCatalog } from "@/hooks/usePointsCatalog";
import {
  downsample,
  formatWhen,
  levelFill,
  parseReadings,
  parseWellProfile,
  pointStatus,
  presetRange,
  readViewMode,
  seriesExtent,
  userStorageKey,
  writeViewMode,
  type ViewMode,
  type WellProfile,
} from "@/lib/hydro";
import { PointSwitcher } from "./PointSwitcher";
import { RecordsTable } from "./RecordsTable";
import { TelemetryKpis } from "./TelemetryKpis";
import { WellStage } from "./WellStage";

const EMPTY_PROFILE: WellProfile = {
  depth: null,
  pumpDepth: null,
  sensorDepth: null,
  ductInches: null,
  flowmeterInches: null,
  maxFlow: null,
};

export default function TelemetryPage() {
  const { state, dispatch } = useContext(AppContext) as {
    state: {
      user?: { id?: string | number; username?: string; email?: string };
      selected_profile?: { id?: string | number; name?: string; title?: string };
    };
    dispatch: (_action: { type: string; payload?: unknown }) => void;
  };
  const { points } = usePointsCatalog();
  const selectedId = state.selected_profile?.id ? String(state.selected_profile.id) : null;
  const point = points.find((item) => item.id === selectedId) || null;
  const userKey = userStorageKey(state.user);
  const [mode, setMode] = useState<ViewMode>(() => readViewMode(userKey));
  const [range, setRange] = useState<DateWindow>(() => ({ preset: "7d", ...presetRange("7d") }));
  const [historyOpen, setHistoryOpen] = useState(false);

  const recordsQuery = useQuery({
    queryKey: ["point_records", selectedId, range.start, range.end],
    queryFn: () => fetchPointRecords(selectedId as string, range.start, range.end),
    enabled: Boolean(selectedId),
    staleTime: 30_000,
  });
  const configQuery = useQuery({
    queryKey: ["point_config", selectedId],
    queryFn: () => fetchPointConfig(selectedId as string),
    enabled: Boolean(selectedId),
    staleTime: 60_000,
  });

  const readings = useMemo(() => parseReadings(recordsQuery.data), [recordsQuery.data]);
  const latest = readings.length ? readings[readings.length - 1] : null;
  const profile = useMemo(() => (configQuery.data ? parseWellProfile(configQuery.data) : EMPTY_PROFILE), [configQuery.data]);
  const chartRows = useMemo(() => downsample(readings, 360), [readings]);
  const labels = chartRows.map((row) => formatWhen(row.at));
  const online = point ? point.status === "online" : pointStatus(latest?.at || null, null) === "online";
  const fill = levelFill(latest?.level ?? point?.level ?? null, readings);
  const flowExtent = seriesExtent(readings, "flow");
  const levelExtent = seriesExtent(readings, "level");
  const totalExtent = seriesExtent(readings, "total");

  const changeMode = (next: ViewMode) => {
    setMode(next);
    writeViewMode(userKey, next);
  };

  if (!selectedId) {
    return (
      <EmptyState
        title="Elige un punto"
        description="El centro de control y el mapa abren la telemetría del punto."
        action={
          <Button asChild variant="outline">
            <Link to="/">Volver al tablero</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Telemetría</p>
          <h2 className="truncate text-2xl font-black">{point?.name || state.selected_profile?.name || "Punto"}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={point?.status || (online ? "online" : "offline")} pulse={online} />
            {point?.codeDga ? <StatusBadge status="dga" label={`DGA ${point.codeDga}`} /> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PointSwitcher
            points={points}
            selectedId={selectedId}
            onSelect={(next) =>
              dispatch({ type: "CHANGE_SELECTED_PROFILE", payload: { selected_profile: next.raw } })
            }
          />
          <Button variant="outline" onClick={() => setHistoryOpen(true)}>
            Historial
          </Button>
        </div>
      </div>

      <RangeBar value={range} onChange={setRange} />

      {recordsQuery.isError ? (
        <ErrorState title="No se pudieron leer los registros" onRetry={() => recordsQuery.refetch()} />
      ) : null}

      {recordsQuery.isLoading ? <BlockSkeleton className="h-28" /> : <TelemetryKpis latest={latest} online={online} />}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,280px)_1fr]">
        <WellStage
          mode={mode}
          onMode={changeMode}
          kind={point?.kind || "well"}
          fill={fill}
          flow={latest?.flow ?? point?.flow ?? null}
          level={latest?.level ?? point?.level ?? null}
          total={latest?.total ?? point?.total ?? null}
          profile={profile}
          status={point?.status || (online ? "online" : "offline")}
        />
        <div className="space-y-3">
          {recordsQuery.isLoading ? <BlockSkeleton className="h-56" /> : null}
          {!recordsQuery.isLoading && readings.length === 0 ? (
            <EmptyState title="Sin registros en este rango" description="Prueba 30 días o elige otro punto." />
          ) : null}
          {flowExtent ? (
            <Card>
              <CardHeader>
                <CardTitle>Caudal</CardTitle>
              </CardHeader>
              <CardContent>
                <SeriesChart
                  labels={labels}
                  series={[
                    { label: "L/s", color: "#00C8FF", values: chartRows.map((row) => row.flow), fill: true },
                    ...(point?.authorizedFlow
                      ? [
                          {
                            label: "Autorizado",
                            color: "#FF847A",
                            values: chartRows.map(() => point.authorizedFlow),
                            dashed: true,
                          },
                          {
                            label: "90%",
                            color: "#FFC46B",
                            values: chartRows.map(() => (point.authorizedFlow || 0) * 0.9),
                            dashed: true,
                          },
                        ]
                      : []),
                  ]}
                />
              </CardContent>
            </Card>
          ) : null}
          {levelExtent ? (
            <Card>
              <CardHeader>
                <CardTitle>Nivel</CardTitle>
              </CardHeader>
              <CardContent>
                <SeriesChart
                  labels={labels}
                  series={[{ label: "m", color: "#203562", values: chartRows.map((row) => row.level), fill: true }]}
                />
              </CardContent>
            </Card>
          ) : null}
          {totalExtent ? (
            <Card>
              <CardHeader>
                <CardTitle>Totalizador</CardTitle>
              </CardHeader>
              <CardContent>
                <SeriesChart
                  labels={labels}
                  series={[{ label: "m³", color: "#CCCF07", values: chartRows.map((row) => row.total) }]}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {readings.length > 0 ? <RecordsTable rows={readings} /> : null}

      <PointHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        pointId={selectedId}
        pointName={point?.name || "Punto"}
        onPickDay={(day) => setRange({ preset: "custom", start: day, end: day })}
      />
    </div>
  );
}
