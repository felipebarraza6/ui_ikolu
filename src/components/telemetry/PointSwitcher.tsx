import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { filterCaptures, type CapturePoint } from "@/lib/hydro";

export function PointSwitcher({
  points,
  selectedId,
  onSelect,
}: {
  points: CapturePoint[];
  selectedId: string | null;
  onSelect: (_point: CapturePoint) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);
  const selected = points.find((point) => point.id === selectedId);
  const rows = useMemo(() => filterCaptures(points, query, "all", "all"), [points, query]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 8,
  });

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-10 max-w-full items-center gap-2 rounded-md border bg-card px-3 text-sm font-bold"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="truncate">{selected?.name || "Elegir punto"}</span>
        <ChevronDown className="h-4 w-4 shrink-0" />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border bg-card p-2 shadow-lg">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar punto"
            aria-label="Buscar punto"
          />
          <div ref={parentRef} className="mt-2 h-64 overflow-auto">
            <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((item) => {
                const point = rows[item.index];
                return (
                  <button
                    key={point.id}
                    type="button"
                    className="absolute left-0 top-0 w-full truncate px-2 text-left text-sm hover:bg-muted"
                    style={{ height: item.size, transform: `translateY(${item.start}px)` }}
                    onClick={() => {
                      onSelect(point);
                      setOpen(false);
                    }}
                  >
                    <span className="font-bold">{point.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{point.project}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
