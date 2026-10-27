import { useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppContext } from "@/App";
import { errorText, isUnavailable, retryUnlessMissing, UNAVAILABLE_MESSAGE } from "@/api/nereus/errors";
import portal from "@/api/nereus/portal";
import { DataTable } from "@/components/brand/DataTable";
import { KpiCard } from "@/components/brand/KpiCard";
import { ErrorState } from "@/components/brand/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { records, text } from "@/lib/records";

type Shell = {
  state: {
    selected_profile?: { id?: string | number } | null;
    user?: { id?: string | number };
  };
};

const VARIABLES = ["NIVEL", "CAUDAL", "CAUDAL PROMEDIO", "TOTALIZADO", "TODOS"];

export default function SupportPage() {
  const { state } = useContext(AppContext) as Shell;
  const queryClient = useQueryClient();
  const pointId = state.selected_profile?.id || "";
  const [title, setTitle] = useState("");
  const [variable, setVariable] = useState("TODOS");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [threadId, setThreadId] = useState<string | number | null>(null);
  const [comment, setComment] = useState("");

  const query = useQuery({
    queryKey: ["support", pointId],
    enabled: Boolean(pointId),
    retry: retryUnlessMissing,
    queryFn: async () => {
      const [closed, active] = await Promise.all([
        portal.notifications.get(pointId, 1, "SUPPORT"),
        portal.notifications.actives(pointId, 1, "SUPPORT"),
      ]);
      return { closed: records(closed, ["results"]), active: records(active, ["results"]) };
    },
  });

  const comments = useQuery({
    queryKey: ["support-comments", threadId],
    enabled: threadId !== null,
    retry: retryUnlessMissing,
    queryFn: () => portal.notifications.responses.get(threadId as string | number, 1),
  });

  const createTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pointId || !title.trim() || !message.trim()) {
      toast.error("Título y mensaje son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await portal.notifications.create({
        title,
        message,
        type_variable: variable,
        point_catchment: pointId,
        type_notification: "SUPPORT",
      });
      toast.success("Ticket creado");
      setTitle("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["support", pointId] });
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const sendComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!threadId || !comment.trim()) return;
    try {
      await portal.notifications.responses.create({
        notification: threadId,
        message: comment,
        user: state.user?.id,
      });
      setComment("");
      toast.success("Comentario enviado");
      comments.refetch();
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  const active = query.data?.active || [];
  const closed = query.data?.closed || [];
  const commentRows = records(comments.data, ["results"]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Soporte</p>
        <h2 className="mt-1 text-2xl font-black">Tickets</h2>
        <p className="text-sm text-muted-foreground">soporte@smarthydro.cl evalúa el caso en menos de 24 horas.</p>
      </div>
      {query.isError ? (
        <ErrorState
          title={isUnavailable(query.error) ? UNAVAILABLE_MESSAGE : "No pudimos cargar los tickets"}
          description={errorText(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : null}
      <section className="grid grid-cols-2 gap-3">
        <KpiCard label="Activos" value={String(active.length)} />
        <KpiCard label="Cerrados" value={String(closed.length)} />
      </section>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={createTicket}>
              <div>
                <Label htmlFor="ticket-title">Título</Label>
                <Input id="ticket-title" className="mt-1" value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div>
                <Label>Variable</Label>
                <Select value={variable} onValueChange={setVariable}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VARIABLES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ticket-message">Mensaje</Label>
                <Textarea id="ticket-message" className="mt-1" value={message} onChange={(event) => setMessage(event.target.value)} />
              </div>
              <Button type="submit" disabled={saving || !pointId}>{saving ? "Enviando…" : "Crear ticket"}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataTable
              rows={[...active, ...closed]}
              empty={query.isLoading ? "Cargando…" : "No hay tickets."}
              columns={[
                { key: "title", label: "Ticket", render: (row) => text(row, ["title"]) },
                { key: "status", label: "Estado", render: (row) => (row.is_active ? "Activo" : "Cerrado") },
                { key: "message", label: "Mensaje", render: (row) => text(row, ["message"]) },
                {
                  key: "actions",
                  label: "",
                  render: (row) => (
                    <Button size="sm" variant="outline" onClick={() => setThreadId(row.id as string | number)}>
                      Comentarios
                    </Button>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
      <Sheet open={threadId !== null} onOpenChange={(next) => !next && setThreadId(null)}>
        <SheetContent side="right" tone="panel" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Comentarios</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {comments.isError ? <p className="text-sm font-bold">{isUnavailable(comments.error) ? UNAVAILABLE_MESSAGE : errorText(comments.error)}</p> : null}
            {commentRows.map((row, index) => (
              <article key={String(row.id ?? index)} className="rounded-lg border p-3 text-sm">
                <p className="font-bold">{text(asUser(row), ["username"], "Usuario")}</p>
                <p className="mt-1">{text(row, ["message", "comment", "text"])}</p>
              </article>
            ))}
            {!commentRows.length && !comments.isLoading ? <p className="text-sm text-muted-foreground">Sin comentarios.</p> : null}
            <form className="space-y-2" onSubmit={sendComment}>
              <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Escribe un comentario" />
              <Button type="submit">Enviar</Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function asUser(row: Record<string, unknown>) {
  const user = row.user;
  return user && typeof user === "object" ? (user as Record<string, unknown>) : null;
}
