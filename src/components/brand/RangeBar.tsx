import { clampRange, presetRange } from "@/lib/hydro";
import { Segmented } from "./Segmented";

export type DateWindow = { start: string; end: string; preset: "24h" | "7d" | "30d" | "custom" };

export function RangeBar({ value, onChange }: { value: DateWindow; onChange: (_next: DateWindow) => void }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Segmented
        label="Rango"
        value={value.preset}
        onChange={(preset) => {
          if (preset === "custom") onChange({ ...value, preset });
          else onChange({ preset, ...presetRange(preset) });
        }}
        options={[
          { value: "24h", label: "24 h" },
          { value: "7d", label: "7 días" },
          { value: "30d", label: "30 días" },
          { value: "custom", label: "Fechas" },
        ]}
      />
      {value.preset === "custom" ? (
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="Desde"
            value={value.start}
            max={value.end}
            onChange={(event) => {
              const next = clampRange(event.target.value, value.end);
              onChange({ preset: "custom", ...next });
            }}
            className="h-9 rounded-md border bg-card px-2 text-sm"
          />
          <input
            type="date"
            aria-label="Hasta"
            value={value.end}
            min={value.start}
            onChange={(event) => {
              const next = clampRange(value.start, event.target.value);
              onChange({ preset: "custom", ...next });
            }}
            className="h-9 rounded-md border bg-card px-2 text-sm"
          />
        </div>
      ) : null}
    </div>
  );
}
