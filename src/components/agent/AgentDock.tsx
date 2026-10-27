import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppContext } from "@/App";
import { createAgentConversation, fetchDefaultAgent, sendAgentChat } from "@/api/nereus/endpoints";
import { asRecord, errorMessage } from "@/api/nereus/normalize";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePointsCatalog } from "@/hooks/usePointsCatalog";
import { formatMeasure, formatWhen, statusLabel, userStorageKey } from "@/lib/hydro";

type ChatLine = { id: string; role: "user" | "assistant"; text: string };

type StoredChat = { conversationId: string | null; messages: ChatLine[] };

function storageKey(userKey: string, branchId: string | null | undefined) {
  return `ikolu.nereus.chat.${userKey}.${branchId || "default"}`;
}

function readStore(key: string): StoredChat {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { conversationId: null, messages: [] };
    const parsed = JSON.parse(raw) as StoredChat;
    if (!parsed || !Array.isArray(parsed.messages)) return { conversationId: null, messages: [] };
    return { conversationId: parsed.conversationId || null, messages: parsed.messages.slice(-40) };
  } catch {
    return { conversationId: null, messages: [] };
  }
}

function replyText(payload: unknown): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  const root = asRecord(payload);
  if (!root) return "Sin respuesta.";
  for (const key of ["content", "message", "text", "answer", "response"]) {
    if (typeof root[key] === "string" && String(root[key]).trim()) return String(root[key]);
  }
  const nested = asRecord(root.assistant) || asRecord(root.reply) || asRecord(root.data);
  if (nested) {
    for (const key of ["content", "message", "text"]) {
      if (typeof nested[key] === "string" && String(nested[key]).trim()) return String(nested[key]);
    }
  }
  const messages = root.messages;
  if (Array.isArray(messages)) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const row = asRecord(messages[index]);
      if (!row) continue;
      const role = String(row.role || row.sender || "").toLowerCase();
      if (role === "user" || role === "human") continue;
      const text = row.content || row.message || row.text;
      if (typeof text === "string" && text.trim()) return text;
    }
  }
  return "El agente respondió sin texto.";
}

function agentIdOf(payload: unknown): string | null {
  const root = asRecord(payload);
  if (!root) return null;
  const nested = asRecord(root.agent) || root;
  const id = nested.id ?? nested.pk ?? nested.agent_id ?? root.id;
  if (id === undefined || id === null || id === "") return null;
  return String(id);
}

function conversationIdOf(payload: unknown): string | null {
  const root = asRecord(payload);
  if (!root) return null;
  const id = root.id ?? root.pk ?? root.conversation_id;
  if (id === undefined || id === null || id === "") return null;
  return String(id);
}

export function AgentDock() {
  const { state } = useContext(AppContext) as {
    state: {
      branchId?: string | null;
      user?: { id?: string | number; username?: string; email?: string };
      selected_profile?: {
        id?: string | number;
        name?: string;
        title?: string;
        modules?: { m1?: Record<string, unknown> };
      };
    };
  };
  const userKey = userStorageKey(state.user);
  const key = storageKey(userKey, state.branchId);
  const { points } = usePointsCatalog();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [store, setStore] = useState<StoredChat>(() => readStore(key));
  const keyRef = useRef(key);
  const scroller = useRef<HTMLDivElement>(null);
  const pointId = state.selected_profile?.id ? String(state.selected_profile.id) : null;
  const capture = points.find((item) => item.id === pointId) || null;
  const contextLine = useMemo(() => {
    if (!capture) return pointId ? `Punto abierto id ${pointId}.` : "No hay un punto abierto.";
    return `Punto ${capture.name} (id ${capture.id}). Caudal ${formatMeasure(capture.flow, "L/s", 2)}. Nivel ${formatMeasure(capture.level, "m", 2)}. Totalizador ${formatMeasure(capture.total, "m³", 1)}. Última tx ${formatWhen(capture.lastAt)}. Estado ${statusLabel(capture.status)}.`;
  }, [capture, pointId]);

  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      setStore(readStore(key));
      return;
    }
    localStorage.setItem(key, JSON.stringify(store));
  }, [key, store]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [store.messages, open]);

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    const userLine: ChatLine = { id: `u-${Date.now()}`, role: "user", text };
    setStore((current) => ({ ...current, messages: [...current.messages, userLine].slice(-40) }));
    setBusy(true);
    try {
      let conversationId = store.conversationId;
      if (!conversationId) {
        const agent = await fetchDefaultAgent();
        const agentId = agentIdOf(agent);
        if (!agentId) throw new Error("Nereus no entregó el agente por defecto.");
        const created = await createAgentConversation(agentId, capture?.name ? `Ikolu · ${capture.name}` : "Ikolu");
        conversationId = conversationIdOf(created);
        if (!conversationId) throw new Error("No se pudo abrir la conversación.");
        setStore((current) => ({ ...current, conversationId }));
      }
      const payload = await sendAgentChat(
        conversationId,
        `Contexto del punto abierto: ${contextLine}\n\nPregunta: ${text}`
      );
      const answer: ChatLine = { id: `a-${Date.now()}`, role: "assistant", text: replyText(payload) };
      setStore((current) => ({
        conversationId,
        messages: [...current.messages, answer].slice(-40),
      }));
    } catch (error) {
      toast.error(errorMessage(error, "Nereus no pudo responder"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-bold text-white shadow-lg dark:bg-limebrand dark:text-navy"
      >
        <Sparkles className="h-4 w-4" />
        Nereus
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" tone="panel" aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>Nereus</SheetTitle>
          </SheetHeader>
          <p className="px-4 text-xs text-muted-foreground">{contextLine}</p>
          <div ref={scroller} className="mt-3 flex-1 space-y-2 overflow-auto px-4">
            {store.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pregunta por el caudal, el nivel o el cumplimiento del punto abierto.</p>
            ) : null}
            {store.messages.map((line) => (
              <div
                key={line.id}
                className={
                  line.role === "user"
                    ? "ml-8 rounded-xl bg-navy px-3 py-2 text-sm text-white"
                    : "mr-8 rounded-xl bg-muted px-3 py-2 text-sm"
                }
              >
                {line.text}
              </div>
            ))}
          </div>
          <form
            className="space-y-2 border-t p-4"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              placeholder="Escribe a Nereus"
              aria-label="Mensaje para Nereus"
              className="w-full resize-none rounded-md border bg-card px-3 py-2 text-sm"
            />
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStore({ conversationId: null, messages: [] })}
              >
                Nueva conversación
              </Button>
              <Button type="submit" disabled={busy || !draft.trim()}>
                {busy ? "Enviando" : "Enviar"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
