import { cn } from "@/lib/utils";
import { statusLabel, type PointStatus } from "@/lib/hydro";

const TONE: Record<PointStatus | "info" | "dga", string> = {
  online: "bg-hydro-online/20 text-navy dark:text-hydro-online",
  stale: "bg-hydro-warn/25 text-navy dark:text-hydro-warn",
  offline: "bg-hydro-incident/15 text-navy dark:text-hydro-incident",
  info: "bg-hydro-info/20 text-navy dark:text-hydro-info",
  dga: "border border-navy/20 bg-card text-navy dark:border-white/20 dark:text-limebrand",
};

export function StatusBadge({
  status,
  label,
  pulse = false,
}: {
  status: PointStatus | "info" | "dga";
  label?: string;
  pulse?: boolean;
}) {
  const text = label || (status === "info" || status === "dga" ? "" : statusLabel(status));
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", TONE[status])}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "online" && "bg-hydro-online",
          status === "stale" && "bg-hydro-warn",
          status === "offline" && "bg-hydro-incident",
          status === "info" && "bg-hydro-info",
          status === "dga" && "bg-limebrand",
          pulse && "hydro-pulse"
        )}
      />
      {text}
    </span>
  );
}
