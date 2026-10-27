import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { fetchPointRecords } from "@/api/nereus/endpoints";
import { RangeBar, type DateWindow } from "@/components/brand/RangeBar";
import { KpiCard } from "@/components/brand/KpiCard";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { BlockSkeleton } from "@/components/brand/KpiCard";
import { Button } from "@/components/ui/button";
import { RecordsTable } from "@/components/telemetry/RecordsTable";
import { PointSwitcher } from "@/components/telemetry/PointSwitcher";
import { usePointsCatalog } from "@/hooks/usePointsCatalog";
import { formatMeasure, formatNumber, parseReadings, presetRange } from "@/lib/hydro";
import { useContext } from "react";
import { AppContext } from "@/App";

export default function ReportsPage() {
  const { state, dispatch } = useContext(AppContext) as {
    state: { selected_profile?: { id?: string | number } };
    dispatch: (_action: { type: string; payload?: unknown }) => void;
  };
  const { points } = usePointsCatalog();
  const selectedId = state.selected_profile?.id ? String(state.selected_profile.id) : points[0]?.id || null;
  const point = points.find((item) => item.id === selectedId) || null;
  const [range, setRange] = useState<DateWindow>(() => ({ preset: "7d", ...presetRange("7d") }));
  const query = useQuery({
    queryKey: ["report_records", selectedId, range.start, range.end],
    queryFn: () => fetchPointRecords(selectedId as string, range.start, range.end),
    enabled: Boolean(selectedId),
    staleTime: 30_000,
  });
  const readings = useMemo(() => parseReadings(query.data), [query.data]);
  const flows = readings.map((row) => row.flow).filter((value): value is number => value !== null);
  const avg = flows.length ? flows.reduce((sum, value) => sum + value, 0) / flows.length : null;
  const firstTotal = readings.find((row) => row.total !== null)?.total ?? null;
  const lastTotal = [...readings].reverse().find((row) => row.total !== null)?.total ?? null;
  const volume = firstTotal !== null && lastTotal !== null ? lastTotal - firstTotal : null;

  const download = (kind: "csv" | "xlsx") => {
    const rows = readings.map((row) => ({
      fecha: row.at,
      caudal_ls: row.flow,
      nivel_m: row.level,
      totalizador_m3: row.total,
      comprobante: row.voucher || "",
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const name = `${(point?.name || "punto").replace(/\s+/g, "_")}_${range.start}_${range.end}`;
    if (kind === "csv") {
      const csv = XLSX.utils.sheet_to_csv(sheet);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Registros");
    XLSX.writeFile(book, `${name}.xlsx`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Reportes</p>
          <h2 className="text-2xl font-black">Registros del punto</h2>
          <p className="mt-1 text-sm text-muted-foreground">Hasta 31 días y 2.000 lecturas. La descarga sale del mismo rango.</p>
        </div>
        <PointSwitcher
          points={points}
          selectedId={selectedId}
          onSelect={(next) => dispatch({ type: "CHANGE_SELECTED_PROFILE", payload: { selected_profile: next.raw } })}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RangeBar value={range} onChange={setRange} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => download("csv")} disabled={!readings.length}>
            CSV
          </Button>
          <Button onClick={() => download("xlsx")} disabled={!readings.length}>
            Excel
          </Button>
        </div>
      </div>
      {!selectedId ? <EmptyState title="No hay puntos para reportar" /> : null}
      {query.isError ? <ErrorState title="No se pudieron armar los registros" onRetry={() => query.refetch()} /> : null}
      {query.isLoading ? <BlockSkeleton className="h-28" /> : null}
      {readings.length > 0 ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label="Lecturas" value={formatNumber(readings.length, 0)} />
            <KpiCard label="Caudal medio" value={formatMeasure(avg, "L/s", 2)} />
            <KpiCard label="Volumen del rango" value={formatMeasure(volume, "m³", 1)} hint="Diferencia de totalizador" />
            <KpiCard label="Punto" value={point?.name || selectedId || "—"} />
          </section>
          <RecordsTable rows={readings} />
        </>
      ) : null}
      {!query.isLoading && selectedId && readings.length === 0 && !query.isError ? (
        <EmptyState title="Sin lecturas en el rango" description="Amplía las fechas o elige otro punto." />
      ) : null}
    </div>
  );
}
