import { Droplets, Gauge, Radio, Timer, Waves } from "lucide-react";
import { KpiCard } from "@/components/brand/KpiCard";
import { formatMeasure, formatWhen, type Reading } from "@/lib/hydro";

export function TelemetryKpis({
  latest,
  online,
}: {
  latest: Reading | null;
  online: boolean;
}) {
  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
      <KpiCard label="Caudal" value={formatMeasure(latest?.flow ?? null, "L/s", 2)} icon={Gauge} />
      <KpiCard label="Totalizador" value={formatMeasure(latest?.total ?? null, "m³", 1)} icon={Droplets} />
      <KpiCard label="Nivel" value={formatMeasure(latest?.level ?? null, "m", 2)} icon={Waves} />
      <KpiCard label="Última tx" value={latest ? formatWhen(latest.at) : "—"} icon={Timer} />
      <KpiCard label="En línea" value={online ? "Sí" : "No"} hint={online ? "Menos de 2 horas" : "Sin dato reciente"} icon={Radio} />
    </section>
  );
}
