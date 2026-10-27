import { useContext } from "react";
import { AppContext } from "@/App";
import { DataTable } from "@/components/brand/DataTable";
import { EmptyState } from "@/components/brand/States";
import { records, text } from "@/lib/records";

type Shell = { state: { selected_profile?: Record<string, unknown> | null } };

function volume(nivel: number) {
  if (nivel <= 0) return "0";
  const total = Math.max(0, 0.45 * (4.74 * nivel - 0.53) * 1000);
  return Math.trunc(total).toLocaleString("de-DE");
}

export default function RegistersPtiPage() {
  const { state } = useContext(AppContext) as Shell;
  const modules = state.selected_profile?.modules;
  const today = records(modules && typeof modules === "object" ? (modules as { today?: unknown }).today : null, []);

  if (!today.length) {
    return <EmptyState title="Sin mediciones de hoy" description="Registros PTI usa las lecturas del día del punto seleccionado." />;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-black">Telemetría {new Date().toLocaleDateString("es-CL")}</h2>
      <p className="text-sm text-muted-foreground">{today.length} mediciones</p>
      <DataTable
        rows={today}
        columns={[
          { key: "hour", label: "Hora", render: (row) => `${text(row, ["date_time_medition"], "").slice(11, 16)} hrs` },
          {
            key: "flow",
            label: "Caudal (m³)",
            render: (row) => volume(Number(row.nivel) || 0),
          },
          { key: "nivel", label: "Nivel (m)", render: (row) => text(row, ["nivel"]) },
        ]}
      />
    </div>
  );
}
