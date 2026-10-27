import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { EmptyState } from "@/components/brand/States";
import { Segmented } from "@/components/brand/Segmented";
import {
  filterCaptures,
  formatMeasure,
  formatWhen,
  type CaptureKind,
  type CapturePoint,
  type PointStatus,
} from "@/lib/hydro";

export function PointRoster({
  points,
  onOpen,
  selectedId,
}: {
  points: CapturePoint[];
  onOpen: (_point: CapturePoint) => void;
  selectedId?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | PointStatus>("all");
  const [kind, setKind] = useState<"all" | CaptureKind>("all");
  const parentRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => filterCaptures(points, query, status, kind), [points, query, status, kind]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 84,
    overscan: 12,
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, proyecto, código DGA o id"
            aria-label="Buscar puntos"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Segmented
            label="Estado"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "Todos" },
              { value: "online", label: "En línea" },
              { value: "stale", label: "Atención" },
              { value: "offline", label: "Sin tx" },
            ]}
          />
          <Segmented
            label="Tipo"
            value={kind}
            onChange={setKind}
            options={[
              { value: "all", label: "Todos" },
              { value: "well", label: "Pozo" },
              { value: "surface", label: "Superficial" },
            ]}
          />
        </div>
      </div>
      <p className="text-xs font-bold text-muted-foreground">
        {rows.length.toLocaleString("es-CL")} de {points.length.toLocaleString("es-CL")} puntos
      </p>
      {rows.length === 0 ? (
        <EmptyState
          title="Ningún punto coincide"
          description="Prueba con otro nombre o quita los filtros de estado."
        />
      ) : (
        <div ref={parentRef} className="h-[min(70vh,720px)] overflow-auto rounded-xl border bg-card">
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((item) => {
              const point = rows[item.index];
              const selected = point.id === selectedId;
              return (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => onOpen(point)}
                  className={
                    selected
                      ? "absolute left-0 top-0 flex w-full items-center gap-3 border-b bg-navy/5 px-4 text-left dark:bg-white/5"
                      : "absolute left-0 top-0 flex w-full items-center gap-3 border-b px-4 text-left hover:bg-muted/60"
                  }
                  style={{ height: item.size, transform: `translateY(${item.start}px)` }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{point.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {point.project || `ID ${point.id}`}
                      {point.codeDga ? ` · DGA ${point.codeDga}` : ""}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="font-data text-sm font-bold">{formatMeasure(point.flow, "L/s")}</p>
                    <p className="text-[11px] text-muted-foreground">{formatWhen(point.lastAt)}</p>
                  </div>
                  <StatusBadge status={point.status} pulse={point.status === "online"} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
