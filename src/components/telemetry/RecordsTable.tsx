import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { formatMeasure, formatWhen, type Reading } from "@/lib/hydro";

export function RecordsTable({ rows }: { rows: Reading[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const ordered = rows.length > 1 && rows[0].time < rows[rows.length - 1].time ? [...rows].reverse() : rows;
  const virtualizer = useVirtualizer({
    count: ordered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 16,
  });

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-4 gap-2 border-b bg-muted/50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        <span>Fecha</span>
        <span>Caudal</span>
        <span>Nivel</span>
        <span>Totalizador</span>
      </div>
      <div ref={parentRef} className="h-[min(52vh,560px)] overflow-auto">
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((item) => {
            const row = ordered[item.index];
            return (
              <div
                key={`${row.at}-${item.index}`}
                className="absolute left-0 top-0 grid w-full grid-cols-4 gap-2 border-b px-3 text-sm"
                style={{ height: item.size, transform: `translateY(${item.start}px)` }}
              >
                <span className="truncate self-center text-xs">{formatWhen(row.at)}</span>
                <span className="self-center font-data">{formatMeasure(row.flow, "L/s", 2)}</span>
                <span className="self-center font-data">{formatMeasure(row.level, "m", 2)}</span>
                <span className="self-center font-data">{formatMeasure(row.total, "m³", 1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
