import { useContext, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, RadioTower, Send, Server } from "lucide-react";
import { AppContext } from "@/App";
import { UNAVAILABLE_MESSAGE, errorText, isUnavailable, retryUnlessMissing } from "@/api/nereus/errors";
import { asRecord } from "@/api/nereus/normalize";
import {
  fetchDgaQueue,
  fetchDgaSummary,
  fetchIncidents,
  fetchPointHealth,
  fetchPortalConfig,
  fetchServiceStatus,
  fetchSlaSummary,
  fetchSlaTickets,
  fetchUptime,
  type PortalFlags,
} from "@/api/nereus/service";
import { DataTable, type DataColumn } from "@/components/brand/DataTable";
import { KpiCard, BlockSkeleton } from "@/components/brand/KpiCard";
import { SeriesChart } from "@/components/brand/SeriesChart";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/hydro";
import { num, records, text, toneOf } from "@/lib/records";

type Shell = {
  state: {
    profile_client?: Array<Record<string, unknown>>;
    selected_profile?: { id?: string | number } | null;
  };
};

const DGA_STATUS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "in_flight", label: "En envío" },
  { value: "accepted", label: "Aceptado" },
  { value: "rejected", label: "Rechazado" },
  { value: "failed", label: "Fallido" },
];

function countOf(payload: unknown, keys: string[]) {
  const root = asRecord(payload) || {};
  const nested = asRecord(root.counts) || asRecord(root.summary) || asRecord(root.queue_status) || root;
  return num(nested, keys);
}

function uptimePercent(payload: unknown) {
  const root = asRecord(payload) || {};
  return num(root, ["uptime", "uptime_percent", "percent", "availability", "availability_percent"]);
}

function uptimeSeries(payload: unknown) {
  return records(payload, ["history", "series", "points", "days", "results"]);
}

function serviceCards(payload: unknown) {
  const listed = records(payload, ["components", "services", "checks", "results", "items"]);
  if (listed.length) return listed;
  const root = asRecord(payload);
  if (!root) return [];
  return ["api", "db", "database", "queue", "worker", "mqtt", "dga", "ingest"].flatMap((key) => {
    const value = root[key];
    const row = asRecord(value);
    if (!row && (typeof value === "string" || typeof value === "boolean")) {
      return [{ name: key, status: value }];
    }
    return row ? [{ name: key, ...row }] : [];
  });
}

function Unavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      title={UNAVAILABLE_MESSAGE}
      description="Este dato todavía no está publicado para el cliente."
      icon={Server}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Reintentar
          </Button>
        ) : null
      }
    />
  );
}

function Block({
  title,
  query,
  children,
}: {
  title: string;
  query: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => void; data?: unknown };
  children: (_data: unknown) => ReactNode;
}) {
  if (query.isLoading) return <BlockSkeleton className="h-40" />;
  if (query.isError) {
    if (isUnavailable(query.error)) return <Unavailable onRetry={() => query.refetch()} />;
    return (
      <ErrorState
        title={`No pudimos cargar ${title}`}
        description={errorText(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }
  return <>{children(query.data)}</>;
}

export default function ServiceStatusPage() {
  const { state } = useContext(AppContext) as Shell;
  const [days, setDays] = useState("30");
  const [point, setPoint] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const points = (state.profile_client || [])
    .map((item) => ({
      id: String(item.id ?? item.pk ?? ""),
      name: String(item.name || item.title || item.point_name || item.id || "Punto"),
    }))
    .filter((item) => item.id);
  const selectedId = state.selected_profile?.id ? String(state.selected_profile.id) : "";
  const [healthPick, setHealthPick] = useState("");
  const healthId = points.some((item) => item.id === healthPick)
    ? healthPick
    : points.find((item) => item.id === selectedId)?.id || points[0]?.id || "";

  const configQuery = useQuery({
    queryKey: ["portal-config"],
    queryFn: fetchPortalConfig,
    retry: retryUnlessMissing,
  });
  const flags: PortalFlags | undefined = configQuery.data;
  const ready = Boolean(flags);

  const statusQuery = useQuery({
    queryKey: ["service-status"],
    enabled: ready && Boolean(flags?.show_availability),
    queryFn: fetchServiceStatus,
    retry: retryUnlessMissing,
  });
  const uptimeQuery = useQuery({
    queryKey: ["service-uptime", days],
    enabled: ready && Boolean(flags?.show_availability),
    queryFn: () => fetchUptime(Number(days)),
    retry: retryUnlessMissing,
  });
  const dgaSummaryQuery = useQuery({
    queryKey: ["dga-queue-summary"],
    enabled: ready && Boolean(flags?.show_dga_queue),
    queryFn: fetchDgaSummary,
    retry: retryUnlessMissing,
  });
  const dgaQuery = useQuery({
    queryKey: ["dga-queue", point, status, from, to],
    enabled: ready && Boolean(flags?.show_dga_queue),
    queryFn: () =>
      fetchDgaQueue({
        point: point === "all" ? undefined : point,
        status: status === "all" ? undefined : status,
        from: from || undefined,
        to: to || undefined,
      }),
    retry: retryUnlessMissing,
  });
  const slaQuery = useQuery({
    queryKey: ["sla-summary"],
    enabled: ready && Boolean(flags?.show_sla),
    queryFn: fetchSlaSummary,
    retry: retryUnlessMissing,
  });
  const ticketsQuery = useQuery({
    queryKey: ["sla-tickets"],
    enabled: ready && Boolean(flags?.show_sla || flags?.show_internal_tickets),
    queryFn: fetchSlaTickets,
    retry: retryUnlessMissing,
  });
  const healthQuery = useQuery({
    queryKey: ["point-health", healthId],
    enabled: ready && Boolean(flags?.show_device_health) && Boolean(healthId),
    queryFn: () => fetchPointHealth(healthId),
    retry: retryUnlessMissing,
  });
  const incidentsQuery = useQuery({
    queryKey: ["incidents"],
    enabled: ready && Boolean(flags?.show_events),
    queryFn: fetchIncidents,
    retry: retryUnlessMissing,
  });

  const dgaRows = records(dgaQuery.data, ["results", "items", "queue", "submissions", "data"]);
  const ticketRows = records(ticketsQuery.data, ["results", "tickets", "items", "data"]);
  const incidentRows = records(incidentsQuery.data, ["results", "incidents", "items", "data"]);
  const uptimePoints = uptimeSeries(uptimeQuery.data);
  const services = serviceCards(statusQuery.data);
  const platform = services.find((row) => /api|plataforma|platform/i.test(text(row, ["name", "service", "id"])));
  const ingest = services.find((row) => /ingest|cola|queue|worker|mqtt/i.test(text(row, ["name", "service", "id"])));
  const dgaSend = services.find((row) => /dga/i.test(text(row, ["name", "service", "id"])));
  const uptime = uptimePercent(uptimeQuery.data);

  const dgaColumns: DataColumn[] = [
    { key: "point", label: "Punto", render: (row) => text(row, ["point_name", "point", "catchment", "name", "title"]) },
    { key: "status", label: "Estado", render: (row) => text(row, ["status", "state"]) },
    { key: "attempts", label: "Intentos", render: (row) => text(row, ["attempts", "retries", "try_count"]) },
    { key: "error", label: "Último error", render: (row) => text(row, ["last_error", "error", "error_summary"]) },
    { key: "voucher", label: "Comprobante", render: (row) => text(row, ["voucher", "receipt", "comprobante"]) },
    { key: "created", label: "Fecha", render: (row) => text(row, ["created_at", "created", "sent_at", "date"]) },
  ];

  const anyModule = Boolean(
    flags?.show_availability ||
      flags?.show_dga_queue ||
      flags?.show_sla ||
      flags?.show_device_health ||
      flags?.show_events ||
      flags?.show_internal_tickets
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Portal del cliente</p>
          <h2 className="mt-1 text-2xl font-black">Estado del servicio</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Disponibilidad, cola DGA, SLA, salud del equipo e incidentes. Cada bloque aparece solo si tu sucursal lo tiene activo.
          </p>
        </div>
        <div className="w-full sm:w-40">
          <Label htmlFor="period">Período</Label>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger id="period" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 días</SelectItem>
              <SelectItem value="30">30 días</SelectItem>
              <SelectItem value="90">90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {configQuery.isLoading ? <BlockSkeleton className="h-40" /> : null}
      {configQuery.isError ? (
        isUnavailable(configQuery.error) ? (
          <Unavailable onRetry={() => configQuery.refetch()} />
        ) : (
          <ErrorState
            title="No pudimos leer la configuración del portal"
            description={errorText(configQuery.error)}
            onRetry={() => configQuery.refetch()}
          />
        )
      ) : null}
      {ready && !anyModule ? (
        <EmptyState
          title="Sin módulos activos"
          description="portal_config no habilitó bloques de servicio para este cliente."
          icon={Activity}
        />
      ) : null}

      {flags?.show_availability ? (
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statusQuery.isLoading || uptimeQuery.isLoading ? (
              <BlockSkeleton className="col-span-2 h-28 lg:col-span-4" />
            ) : (
              <>
                <KpiCard label="Plataforma" value={text(platform, ["status", "state"], "—")} icon={Server} />
                <KpiCard label="Ingesta" value={text(ingest, ["status", "state"], "—")} icon={RadioTower} />
                <KpiCard label="Envío DGA" value={text(dgaSend, ["status", "state"], "—")} icon={Send} />
                <KpiCard
                  label={`Uptime ${days}d`}
                  value={uptime === null ? "—" : `${formatNumber(uptime, 1)}%`}
                  hint={uptimeQuery.isError && isUnavailable(uptimeQuery.error) ? UNAVAILABLE_MESSAGE : "Disponibilidad del período"}
                  icon={Activity}
                />
              </>
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad de servicios</CardTitle>
              <CardDescription>Estado y latencia por componente, sin datos internos del proveedor.</CardDescription>
            </CardHeader>
            <CardContent>
              <Block title="la disponibilidad" query={statusQuery}>
                {() =>
                  services.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {services.map((row, index) => {
                        const label = text(row, ["name", "service", "component", "id"], `Servicio ${index + 1}`);
                        const stateLabel = text(row, ["status", "state", "health"]);
                        const latency = num(row, ["latency_ms", "latency", "ms"]);
                        return (
                          <div key={`${label}-${index}`} className="flex items-center justify-between rounded-lg border px-3 py-3">
                            <div>
                              <p className="font-bold">{label}</p>
                              <p className="text-xs text-muted-foreground">
                                {latency === null ? "Sin latencia" : `${formatNumber(latency, 0)} ms`}
                              </p>
                            </div>
                            <StatusBadge status={toneOf(stateLabel)} label={stateLabel} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">La respuesta no trae componentes.</p>
                  )
                }
              </Block>
              {uptimePoints.length ? (
                <div className="mt-4">
                  <SeriesChart
                    labels={uptimePoints.map((row) => text(row, ["day", "date", "label"], ""))}
                    series={[
                      {
                        label: "Uptime %",
                        color: "#203562",
                        fill: true,
                        values: uptimePoints.map((row) => num(row, ["uptime", "percent", "value"])),
                      },
                    ]}
                  />
                </div>
              ) : null}
              {uptimeQuery.isError && isUnavailable(uptimeQuery.error) ? (
                <p className="mt-3 text-sm font-bold">{UNAVAILABLE_MESSAGE}</p>
              ) : null}
            </CardContent>
          </Card>
        </section>
      ) : null}

      {flags?.show_dga_queue ? (
        <Card>
          <CardHeader>
            <CardTitle>Cola de envío DGA</CardTitle>
            <CardDescription>Conteo por estado y el detalle filtrable de cada envío.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Block title="el resumen DGA" query={dgaSummaryQuery}>
              {(data) => (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                  <KpiCard label="Pendiente" value={formatNumber(countOf(data, ["pending"]), 0)} />
                  <KpiCard label="En envío" value={formatNumber(countOf(data, ["in_flight", "sending"]), 0)} />
                  <KpiCard label="Aceptado" value={formatNumber(countOf(data, ["accepted", "ok"]), 0)} />
                  <KpiCard label="Rechazado" value={formatNumber(countOf(data, ["rejected"]), 0)} />
                  <KpiCard label="Fallido" value={formatNumber(countOf(data, ["failed", "error"]), 0)} />
                </div>
              )}
            </Block>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Punto</Label>
                <Select value={point} onValueChange={setPoint}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {points.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DGA_STATUS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dga-from">Desde</Label>
                <Input id="dga-from" className="mt-1" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
              </div>
              <div>
                <Label htmlFor="dga-to">Hasta</Label>
                <Input id="dga-to" className="mt-1" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
              </div>
            </div>
            <Block title="el detalle DGA" query={dgaQuery}>
              {() => <DataTable rows={dgaRows} columns={dgaColumns} empty="No hay envíos con ese filtro." />}
            </Block>
          </CardContent>
        </Card>
      ) : null}

      {flags?.show_sla || flags?.show_internal_tickets ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {flags.show_sla ? (
            <Card>
              <CardHeader>
                <CardTitle>SLA de soporte</CardTitle>
                <CardDescription>Cumplimiento de respuesta y resolución.</CardDescription>
              </CardHeader>
              <CardContent>
                <Block title="el SLA" query={slaQuery}>
                  {(data) => {
                    const row = asRecord(data) || {};
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        <KpiCard label="Respuesta en plazo" value={formatNumber(num(row, ["response_met_percent", "response_percent"]), 1)} hint="%" />
                        <KpiCard label="Resolución en plazo" value={formatNumber(num(row, ["resolution_met_percent", "resolution_percent"]), 1)} hint="%" />
                        <KpiCard label="Abiertos" value={formatNumber(num(row, ["open", "open_tickets"]), 0)} />
                        <KpiCard label="Vencidos" value={formatNumber(num(row, ["breached", "overdue", "expired"]), 0)} />
                      </div>
                    );
                  }}
                </Block>
              </CardContent>
            </Card>
          ) : null}
          <Card className={flags.show_sla ? "" : "lg:col-span-2"}>
            <CardHeader>
              <CardTitle>{flags.show_internal_tickets && !flags.show_sla ? "Tickets" : "Tickets del SLA"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Block title="los tickets" query={ticketsQuery}>
                {() => (
                  <DataTable
                    rows={ticketRows}
                    columns={[
                      { key: "title", label: "Ticket", render: (row) => text(row, ["title", "subject", "id"]) },
                      { key: "status", label: "Estado", render: (row) => text(row, ["status", "state"]) },
                      { key: "response", label: "Respuesta", render: (row) => text(row, ["sla_response_met", "response_met"]) },
                      { key: "resolution", label: "Resolución", render: (row) => text(row, ["sla_resolution_met", "resolution_met"]) },
                    ]}
                    empty="No hay tickets."
                  />
                )}
              </Block>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {flags?.show_device_health ? (
        <Card>
          <CardHeader>
            <CardTitle>Salud del equipo</CardTitle>
            <CardDescription>
              Última transmisión, señal y fallas del punto. Umbral sin datos: {flags.stale_hours} h.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm">
              <Label>Punto</Label>
              <Select value={healthId || "none"} onValueChange={setHealthPick}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Elige un punto" />
                </SelectTrigger>
                <SelectContent>
                  {healthId ? null : <SelectItem value="none">Sin puntos</SelectItem>}
                  {points.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!healthId ? <p className="text-sm text-muted-foreground">Elige un punto para ver su salud.</p> : null}
            {healthId ? (
              <Block title="la salud del equipo" query={healthQuery}>
                {(data) => {
                  const row = asRecord(data) || {};
                  const failures = records(data, ["failures", "faults", "alerts"]);
                  const online = text(row, ["is_online", "online", "status"]);
                  return (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={toneOf(online)} label={online} />
                        <span className="text-sm text-muted-foreground">
                          Última tx {text(row, ["last_transmission", "last_tx", "last_seen", "last_reading_at"])}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <KpiCard label="RSSI" value={text(row, ["rssi", "signal"])} />
                        <KpiCard label="Batería" value={text(row, ["battery", "battery_percent", "power"])} />
                        <KpiCard label="Firmware" value={text(row, ["firmware", "fw"])} />
                        <KpiCard label="Fallas" value={formatNumber(failures.length, 0)} />
                      </div>
                      {failures.length ? (
                        <DataTable
                          rows={failures}
                          columns={[
                            { key: "type", label: "Falla", render: (item) => text(item, ["type", "code", "name", "title"]) },
                            { key: "detail", label: "Detalle", render: (item) => text(item, ["detail", "message", "description"]) },
                          ]}
                        />
                      ) : null}
                    </div>
                  );
                }}
              </Block>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {flags?.show_events ? (
        <Card>
          <CardHeader>
            <CardTitle>Incidentes</CardTitle>
            <CardDescription>Avisos publicados por el equipo, con estado e impacto.</CardDescription>
          </CardHeader>
          <CardContent>
            <Block title="los incidentes" query={incidentsQuery}>
              {() => (
                <DataTable
                  rows={incidentRows}
                  columns={[
                    { key: "title", label: "Incidente", render: (row) => text(row, ["title", "name", "summary"]) },
                    {
                      key: "status",
                      label: "Estado",
                      render: (row) => {
                        const label = text(row, ["status", "state"]);
                        return <StatusBadge status={toneOf(label)} label={label} />;
                      },
                    },
                    { key: "impact", label: "Impacto", render: (row) => text(row, ["impact", "severity"]) },
                    { key: "started", label: "Inicio", render: (row) => text(row, ["started_at", "created_at", "date"]) },
                  ]}
                  empty="No hay incidentes publicados."
                />
              )}
            </Block>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
