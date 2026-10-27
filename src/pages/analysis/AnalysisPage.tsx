import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppContext } from "@/App";
import { errorText, isUnavailable, retryUnlessMissing, UNAVAILABLE_MESSAGE } from "@/api/nereus/errors";
import portal from "@/api/nereus/portal";
import { DataTable } from "@/components/brand/DataTable";
import { KpiCard } from "@/components/brand/KpiCard";
import { SeriesChart } from "@/components/brand/SeriesChart";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/lib/hydro";
import { num, records, text } from "@/lib/records";

type Shell = { state: { selected_profile?: Record<string, unknown> | null } };

function pointId(profile: Record<string, unknown> | null | undefined) {
  const id = profile?.id;
  return typeof id === "string" || typeof id === "number" ? id : "";
}

function stamp(row: Record<string, unknown>) {
  return text(row, ["date_time_medition", "datetime", "date"], "");
}

export default function AnalysisPage() {
  const { state } = useContext(AppContext) as Shell;
  const profile = state.selected_profile;
  const id = pointId(profile);
  const name = String(profile?.name || profile?.title || "Punto");
  const [mode, setMode] = useState<"day" | "month">("day");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const iso = mode === "month" ? (month ? `${month}-01` : "") : day;
  const today = records(profile?.modules && typeof profile.modules === "object" ? (profile.modules as { today?: unknown }).today : null, []);

  const query = useQuery({
    queryKey: ["analysis", id, mode, iso],
    enabled: Boolean(id && iso),
    retry: retryUnlessMissing,
    queryFn: () => (mode === "month" ? portal.get_data_month(id, iso) : portal.get_data_day(id, iso, iso)),
  });

  const source = iso ? records(query.data, ["results", "items", "data"]) : today;
  const rows = [...source].sort((a, b) => stamp(a).localeCompare(stamp(b)));
  const labels = rows.map((row) => (stamp(row).length > 10 ? stamp(row).slice(11, 16) : stamp(row).slice(0, 10)));
  const flow = rows.map((row) => num(row, ["flow", "caudal"]));
  const level = rows.map((row) => num(row, ["nivel", "level", "water_table"]));
  const total = rows.map((row) => num(row, ["total", "totalizador"]));
  const series = [
    flow.some((value) => value !== null) ? { label: "Caudal", color: "#203562", values: flow, fill: true } : null,
    level.some((value) => value !== null) ? { label: "Nivel", color: "#0E7490", values: level } : null,
    total.some((value) => value !== null) ? { label: "Totalizador", color: "#CCCF07", values: total } : null,
  ].filter((item): item is { label: string; color: string; values: Array<number | null>; fill?: boolean } => Boolean(item));

  const maxOf = (values: Array<number | null>) => {
    const nums = values.filter((value): value is number => value !== null);
    return nums.length ? Math.max(...nums) : null;
  };

  const download = async () => {
    if (!id || !iso) {
      toast.error("Elige una fecha");
      return;
    }
    try {
      if (mode === "month") await portal.downloadMonth(id, iso);
      else await portal.get_data_sh_range_to_excel(id, iso, iso, name);
    } catch (error) {
      toast.error(errorText(error, "No se pudo descargar la planilla"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Smart Análisis</p>
          <h2 className="mt-1 text-2xl font-black">{name}</h2>
        </div>
        <Button variant="outline" onClick={download} disabled={!iso}>
          Descargar XLSX
        </Button>
      </div>
      {!id ? <EmptyState title="Elige un punto" description="El análisis usa la captación seleccionada en el centro de control." /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex gap-2">
            <Button type="button" variant={mode === "day" ? "default" : "outline"} onClick={() => setMode("day")}>Día</Button>
            <Button type="button" variant={mode === "month" ? "default" : "outline"} onClick={() => setMode("month")}>Mes</Button>
          </div>
          {mode === "day" ? (
            <div>
              <Label htmlFor="analysis-day">Fecha</Label>
              <Input id="analysis-day" className="mt-1" type="date" value={day} onChange={(event) => setDay(event.target.value)} />
            </div>
          ) : (
            <div>
              <Label htmlFor="analysis-month">Mes</Label>
              <Input id="analysis-month" className="mt-1" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>
      {query.isError ? (
        <ErrorState
          title={isUnavailable(query.error) ? UNAVAILABLE_MESSAGE : "No pudimos leer el período"}
          description={errorText(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : null}
      <section className="grid grid-cols-3 gap-3">
        <KpiCard label="Caudal máx." value={formatNumber(maxOf(flow), 2)} hint="lt/s" />
        <KpiCard label="Nivel máx." value={formatNumber(maxOf(level), 2)} hint="m" />
        <KpiCard label="Lecturas" value={formatNumber(rows.length, 0)} />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>{iso ? "Serie del período" : "Lecturas de hoy"}</CardTitle>
        </CardHeader>
        <CardContent>
          {series.length ? <SeriesChart labels={labels} series={series} /> : <p className="text-sm text-muted-foreground">Sin serie para graficar.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5">
          <DataTable
            rows={[...rows].reverse()}
            empty={query.isLoading ? "Cargando…" : "No hay lecturas."}
            columns={[
              { key: "when", label: "Hora", render: (row) => stamp(row) || "—" },
              { key: "flow", label: "Caudal", render: (row) => formatNumber(num(row, ["flow", "caudal"]), 2) },
              { key: "level", label: "Nivel", render: (row) => formatNumber(num(row, ["nivel", "level", "water_table"]), 2) },
              { key: "total", label: "Totalizador", render: (row) => formatNumber(num(row, ["total", "totalizador"]), 1) },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
