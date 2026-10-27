import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CODE = "DGA-2024-001234";

const FIELDS = [
  ["Código DGA", CODE],
  ["Nombre", "Pozo de prueba"],
  ["Tipo", "Subterráneo"],
  ["Caudal otorgado", "25,5 L/s"],
  ["Volumen otorgado", "50.000 m³"],
  ["SHAC", "SHAC-2024-001234"],
  ["Región", "Metropolitana"],
  ["Comuna", "Santiago"],
  ["Estándar", "Mayor"],
];

export default function PreviewCertificatePage() {
  return (
    <main className="min-h-screen bg-muted px-4 py-10">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Vista previa del certificado DGA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Ejemplo público, sin sesión, para revisar el comprobante.</p>
          <div className="flex justify-center rounded-lg border bg-white p-4">
            <QRCodeSVG value={CODE} size={160} />
          </div>
          <dl className="space-y-2 text-sm">
            {FIELDS.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 border-b py-1">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </main>
  );
}
