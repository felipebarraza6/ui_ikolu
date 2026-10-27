import { useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppContext } from "@/App";
import { errorText, isUnavailable, retryUnlessMissing, UNAVAILABLE_MESSAGE } from "@/api/nereus/errors";
import { asRecord } from "@/api/nereus/normalize";
import portal from "@/api/nereus/portal";
import { DataTable } from "@/components/brand/DataTable";
import { KpiCard } from "@/components/brand/KpiCard";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { records, text } from "@/lib/records";

type Shell = { state: { selected_profile?: Record<string, unknown> | null } };

const VARIABLES = [
  { value: "NIVEL", label: "Nivel freático (m)" },
  { value: "CAUDAL", label: "Caudal (lt/s)" },
  { value: "CAUDAL PROMEDIO", label: "Caudal medio (lt)" },
  { value: "TOTALIZADO", label: "Totalizado (m³)" },
];

const CONDITIONS = [
  { value: "MAX", label: "Mayor que (>)" },
  { value: "MIN", label: "Menor que (<)" },
  { value: "EQUALS", label: "Igual que (=)" },
];

function pointIdOf(profile: Record<string, unknown> | null | undefined) {
  const id = profile?.id;
  return typeof id === "string" || typeof id === "number" ? id : "";
}

function clean(value: string, fallback: string) {
  return !value || value === "—" ? fallback : value;
}

export default function AlertsPage() {
  const { state } = useContext(AppContext) as Shell;
  const queryClient = useQueryClient();
  const pointId = pointIdOf(state.selected_profile);
  const canManage = Boolean(asRecord(state.selected_profile?.profile_ikolu)?.m6);
  const [editing, setEditing] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const query = useQuery({
    queryKey: ["alerts", pointId],
    enabled: Boolean(pointId),
    retry: retryUnlessMissing,
    queryFn: async () => {
      const [all, active] = await Promise.all([
        portal.notifications.get(pointId, 1, "ALERT"),
        portal.notifications.actives(pointId, 1, "ALERT"),
      ]);
      return { all: records(all, ["results", "items"]), active: records(active, ["results", "items"]) };
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["alerts", pointId] });

  const remove = async (id: string | number) => {
    if (!window.confirm("¿Eliminar esta alerta?")) return;
    try {
      await portal.notifications.delete(id);
      toast.success("Alerta eliminada");
      refresh();
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  const toggle = async (row: Record<string, unknown>, isActive: boolean) => {
    try {
      await portal.notifications.update(row.id as string | number, { ...row, is_active: isActive });
      toast.success(isActive ? "Alerta activada" : "Alerta desactivada");
      refresh();
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  const openDetail = async (row: Record<string, unknown>) => {
    setDetail(row);
    try {
      const full = asRecord(await portal.notifications.getById(row.id as string | number));
      if (full) setDetail(full);
    } catch (error) {
      toast.error(errorText(error, "No se pudo cargar el detalle"));
    }
  };

  const rows = query.data?.all || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Punto seleccionado</p>
          <h2 className="mt-1 text-2xl font-black">Alertas</h2>
        </div>
        <Button onClick={() => setEditing(null)} disabled={!canManage || !pointId}>
          Nueva alerta
        </Button>
      </div>
      {!canManage ? (
        <EmptyState title="Módulo de alertas no activado" description="Este punto no tiene habilitada la gestión de alertas." />
      ) : null}
      {!pointId ? <EmptyState title="Elige un punto" description="Las alertas se guardan sobre la captación seleccionada." /> : null}
      {query.isError ? (
        <ErrorState
          title={isUnavailable(query.error) ? UNAVAILABLE_MESSAGE : "No pudimos cargar las alertas"}
          description={isUnavailable(query.error) ? "El endpoint de notificaciones todavía no responde." : errorText(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : null}
      <section className="grid grid-cols-2 gap-3">
        <KpiCard label="Activas" value={String(query.data?.active.length || 0)} />
        <KpiCard label="Total" value={String(rows.length)} />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            rows={rows}
            empty={query.isLoading ? "Cargando…" : "No hay alertas en este punto."}
            columns={[
              { key: "title", label: "Alerta", render: (row) => text(row, ["title", "message"]) },
              { key: "variable", label: "Variable", render: (row) => text(row, ["type_variable"]) },
              { key: "condition", label: "Condición", render: (row) => text(row, ["type_alert"]) },
              { key: "value", label: "Umbral", render: (row) => text(row, ["value"]) },
              {
                key: "actions",
                label: "Acciones",
                render: (row) => (
                  <div className="flex flex-wrap justify-end gap-2 md:justify-start">
                    <Button size="sm" variant="outline" onClick={() => openDetail(row)}>Ver</Button>
                    {canManage ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setEditing(row)}>Editar</Button>
                        <Button size="sm" variant="ghost" onClick={() => toggle(row, !row.is_active)}>
                          {row.is_active ? "Desactivar" : "Activar"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => remove(row.id as string | number)}>
                          Eliminar
                        </Button>
                      </>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
      <Sheet open={editing !== undefined} onOpenChange={(next) => !next && setEditing(undefined)}>
        <SheetContent side="right" tone="panel" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar alerta" : "Nueva alerta"}</SheetTitle>
          </SheetHeader>
          {editing !== undefined ? (
            <AlertForm
              key={String(editing?.id || "new")}
              record={editing}
              pointId={pointId}
              onSaved={() => {
                setEditing(undefined);
                refresh();
              }}
            />
          ) : null}
        </SheetContent>
      </Sheet>
      <Sheet open={Boolean(detail)} onOpenChange={(next) => !next && setDetail(null)}>
        <SheetContent side="right" tone="panel" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{text(detail, ["title"], "Alerta")}</SheetTitle>
          </SheetHeader>
          <dl className="mt-4 space-y-2 text-sm">
            <div>Variable: {text(detail, ["type_variable"])}</div>
            <div>Condición: {text(detail, ["type_alert"])}</div>
            <div>Umbral: {text(detail, ["value"])}</div>
            <div>Vigencia: {text(detail, ["start_date"])} → {text(detail, ["end_date"])}</div>
            <div>Correos: {Array.isArray(detail?.emails) ? detail.emails.join(", ") : text(detail, ["emails"])}</div>
          </dl>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AlertForm({
  record,
  pointId,
  onSaved,
}: {
  record: Record<string, unknown> | null;
  pointId: string | number;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(clean(text(record, ["title"], ""), ""));
  const [variable, setVariable] = useState(clean(text(record, ["type_variable"], ""), "NIVEL"));
  const [condition, setCondition] = useState(clean(text(record, ["type_alert"], ""), "MAX"));
  const [value, setValue] = useState(clean(text(record, ["value"], ""), ""));
  const [emails, setEmails] = useState(Array.isArray(record?.emails) ? record.emails.join(", ") : "");
  const [useRange, setUseRange] = useState(Boolean(record?.start_date || record?.end_date));
  const [start, setStart] = useState(typeof record?.start_date === "string" ? record.start_date.slice(0, 10) : "");
  const [end, setEnd] = useState(typeof record?.end_date === "string" ? record.end_date.slice(0, 10) : "");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const mailList = emails.split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
    if (!title.trim() || !value || !mailList.length) {
      toast.error("Completa nombre, umbral y al menos un correo");
      return;
    }
    setSaving(true);
    const payload = {
      title,
      type_variable: variable,
      type_alert: condition,
      value,
      message: title,
      emails: mailList,
      point_catchment: pointId,
      type_notification: "ALERT",
      is_active: record ? Boolean(record.is_active) : true,
      start_date: useRange ? start || null : null,
      end_date: useRange ? end || null : null,
    };
    try {
      if (record?.id) await portal.notifications.update(record.id as string | number, payload);
      else await portal.notifications.create(payload);
      toast.success(record ? "Alerta actualizada" : "Alerta creada");
      onSaved();
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="mt-4 space-y-3" onSubmit={submit}>
      <div>
        <Label htmlFor="alert-title">Nombre</Label>
        <Input id="alert-title" className="mt-1" value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div>
        <Label>Variable</Label>
        <Select value={variable} onValueChange={setVariable}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {VARIABLES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Condición</Label>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CONDITIONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="alert-value">Umbral</Label>
        <Input id="alert-value" className="mt-1" value={value} onChange={(event) => setValue(event.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={useRange} onChange={(event) => setUseRange(event.target.checked)} />
        Limitar por fechas
      </label>
      {useRange ? (
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={start} onChange={(event) => setStart(event.target.value)} />
          <Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
        </div>
      ) : null}
      <div>
        <Label htmlFor="alert-mail">Correos</Label>
        <Input id="alert-mail" className="mt-1" placeholder="a@empresa.cl, b@empresa.cl" value={emails} onChange={(event) => setEmails(event.target.value)} />
      </div>
      <Button type="submit" disabled={saving}>{saving ? "Guardando…" : record ? "Guardar cambios" : "Crear alerta"}</Button>
    </form>
  );
}
