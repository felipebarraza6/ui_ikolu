import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  {
    title: "Centro de control",
    body: "El tablero lista las captaciones de la sucursal. En línea significa una transmisión de las últimas dos horas. Al abrir un punto quedas en telemetría.",
  },
  {
    title: "Telemetría y mapa",
    body: "La ficha muestra caudal, nivel, totalizador y la última transmisión. El mapa agrupa los puntos con GPS. Los que no tienen coordenadas se cuentan y no se dibujan.",
  },
  {
    title: "Cumplimiento DGA y análisis",
    body: "Cumplimiento resume comprobantes y bandas de caudal. Smart Análisis pide el día o el mes del punto seleccionado y puede descargar la planilla XLSX.",
  },
  {
    title: "Estado del servicio",
    body: "Disponibilidad, cola DGA, SLA, salud del equipo e incidentes se muestran solo si portal_config los activa para tu sucursal. Si un dato aún no existe, la tarjeta dice que no está disponible.",
  },
  {
    title: "Alertas y soporte",
    body: "Las alertas se crean sobre el punto seleccionado, con umbral y correos. Los tickets de soporte aceptan comentarios. El cambio de contraseña se pide a soporte.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Ayuda</p>
        <h2 className="mt-1 text-2xl font-black">Cómo usar Ikolu</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          El portal habla solo con la fachada /api/ik/. No usa el API histórico de core.
        </p>
      </div>
      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{section.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
