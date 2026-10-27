import { useQuery } from "@tanstack/react-query";
import { fetchPointCalendar } from "@/api/nereus/endpoints";
import { asRecord } from "@/api/nereus/normalize";
import { BlockSkeleton } from "@/components/brand/KpiCard";
import { ErrorState } from "@/components/brand/States";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { asNumber, formatMeasure, formatWhen } from "@/lib/hydro";

type DayRow = {
  date: string;
  hasData: boolean;
  records: number;
  flow: number | null;
  level: number | null;
  consumption: number | null;
};

function readDays(payload: unknown): DayRow[] {
  const root = asRecord(payload);
  const list = Array.isArray(payload) ? payload : root?.calendar || root?.results || root?.days;
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      const date = String(row.date || row.day || "");
      if (!date) return null;
      const records = asNumber(row.records_count) ?? 0;
      return {
        date,
        hasData: row.has_data === true || records > 0,
        records,
        flow: asNumber(row.avg_flow_lps),
        level: asNumber(row.avg_nivel_m),
        consumption: asNumber(row.consumption_m3),
      };
    })
    .filter((row): row is DayRow => Boolean(row));
}

export function PointHistorySheet({
  open,
  onOpenChange,
  pointId,
  pointName,
  onPickDay,
}: {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  pointId: string;
  pointName: string;
  onPickDay: (_day: string) => void;
}) {
  const query = useQuery({
    queryKey: ["point_calendar", pointId],
    queryFn: () => fetchPointCalendar(pointId, 30),
    enabled: open && Boolean(pointId),
    staleTime: 30_000,
  });
  const days = readDays(query.data);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" tone="panel" className="w-[min(100%,24rem)]" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Historial · {pointName}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-2 overflow-auto px-4 pb-6">
          <p className="text-xs text-muted-foreground">Últimos 30 días del calendario del punto. Elige un día para ver sus registros.</p>
          {query.isLoading ? <BlockSkeleton className="h-40" /> : null}
          {query.isError ? <ErrorState title="No se pudo leer el calendario" onRetry={() => query.refetch()} /> : null}
          {!query.isLoading && days.length === 0 && !query.isError ? (
            <p className="text-sm font-bold">Este punto no tiene días en el calendario.</p>
          ) : null}
          {days.map((day) => (
            <button
              key={day.date}
              type="button"
              disabled={!day.hasData}
              onClick={() => {
                onPickDay(day.date.slice(0, 10));
                onOpenChange(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left disabled:opacity-50"
            >
              <span>
                <span className="block text-sm font-bold">{formatWhen(`${day.date.slice(0, 10)}T12:00:00`)}</span>
                <span className="text-xs text-muted-foreground">
                  {day.hasData ? `${day.records} registros` : "Sin datos"}
                </span>
              </span>
              <span className="text-right text-xs font-data">
                {formatMeasure(day.flow, "L/s")}
                <br />
                {formatMeasure(day.consumption, "m³")}
              </span>
            </button>
          ))}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
