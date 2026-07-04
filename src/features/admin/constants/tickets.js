import { format, parseISO, isPast, isValid, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Constantes y mapeos para el subsistema de Tickets de Soporte.
 *
 * El backend (core_api_sh / api.smarthydro.app) usa valores en español/mayúsculas
 * para estados, prioridades y categorías. El frontend debe respetar esos valores
 * para crear, actualizar y filtrar tickets correctamente.
 */

// ============================================================================
// ESTADOS
// ============================================================================

export const TICKET_STATUS = {
  ABIERTO: { value: "ABIERTO", label: "Abierto", column: "new" },
  EN_ANALISIS: { value: "EN_ANALISIS", label: "En análisis", column: "review" },
  EN_ORDEN_TRABAJO: { value: "EN_ORDEN_TRABAJO", label: "En OT", column: "ot" },
  ESPERA_CLIENTE: { value: "ESPERA_CLIENTE", label: "Espera cliente", column: "progress" },
  ESPERA_PROVEEDOR: { value: "ESPERA_PROVEEDOR", label: "Espera proveedor", column: "progress" },
  RESUELTO: { value: "RESUELTO", label: "Resuelto", column: "resolved" },
  CERRADO: { value: "CERRADO", label: "Cerrado", column: "resolved" },
  CANCELADO: { value: "CANCELADO", label: "Cancelado", column: "resolved" },
};

export const STATUS_OPTIONS = Object.values(TICKET_STATUS).map(({ value, label }) => ({
  value,
  label,
}));

export const STATUS_FILTER_OPTIONS = STATUS_OPTIONS;

/**
 * Determina la columna Kanban a la que pertenece un estado de ticket.
 */
export const getTicketColumn = (status) => {
  if (!status) return "new";
  const upper = String(status).toUpperCase();
  const found = Object.values(TICKET_STATUS).find((s) => s.value === upper);
  return found?.column || "new";
};

/**
 * Configuración de las columnas Kanban: clave visual, etiqueta y los estados
 * del backend que agrupa. El `dropStatus` es el valor enviado al soltar un
 * ticket en la columna.
 */
export const KANBAN_COLUMNS = [
  { key: "new", label: "Nuevo", statuses: ["ABIERTO"], dropStatus: "ABIERTO" },
  { key: "review", label: "En Análisis", statuses: ["EN_ANALISIS"], dropStatus: "EN_ANALISIS" },
  { key: "ot", label: "En OT", statuses: ["EN_ORDEN_TRABAJO"], dropStatus: "EN_ORDEN_TRABAJO" },
  {
    key: "progress",
    label: "En Espera",
    statuses: ["ESPERA_CLIENTE", "ESPERA_PROVEEDOR"],
    dropStatus: "ESPERA_CLIENTE",
  },
  {
    key: "resolved",
    label: "Resuelto / Cerrado",
    statuses: ["RESUELTO", "CERRADO", "CANCELADO"],
    dropStatus: "RESUELTO",
  },
];

/**
 * Resuelve el estado backend que debe enviarse al soltar un ticket en una
 * columna Kanban. Si el ticket ya pertenece a esa columna (por ejemplo, una
 * columna que agrupa varios estados), conserva su estado actual para no
 * mutarlo innecesariamente; de lo contrario devuelve el estado representativo
 * de la columna.
 */
export const getColumnDropStatus = (columnKey, currentStatus) => {
  const column = KANBAN_COLUMNS.find((c) => c.key === columnKey);
  if (!column) return currentStatus;
  if (!currentStatus) return column.dropStatus;
  if (getTicketColumn(currentStatus) === columnKey) return currentStatus;
  return column.dropStatus;
};

// ============================================================================
// HELPERS DE CLASIFICACIÓN DE ESTADOS
// ============================================================================

export const TICKET_STATUS_COLUMN = {
  NEW: "new",
  REVIEW: "review",
  OT: "ot",
  WAITING: "progress",
  RESOLVED: "resolved",
};

export const isTicketOpen = (status) =>
  getTicketColumn(status) === TICKET_STATUS_COLUMN.NEW;

export const isTicketInAnalysis = (status) =>
  getTicketColumn(status) === TICKET_STATUS_COLUMN.REVIEW;

export const isTicketInOT = (status) =>
  getTicketColumn(status) === TICKET_STATUS_COLUMN.OT;

export const isTicketWaiting = (status) =>
  getTicketColumn(status) === TICKET_STATUS_COLUMN.WAITING;

export const isTicketActive = (status) =>
  [
    TICKET_STATUS_COLUMN.REVIEW,
    TICKET_STATUS_COLUMN.OT,
    TICKET_STATUS_COLUMN.WAITING,
  ].includes(getTicketColumn(status));

export const isTicketClosed = (status) =>
  getTicketColumn(status) === TICKET_STATUS_COLUMN.RESOLVED;

/**
 * Resuelve el label legible para un estado de ticket.
 */
export const getTicketStatusLabel = (status) => {
  if (!status) return "Desconocido";
  const upper = String(status).toUpperCase();
  return Object.values(TICKET_STATUS).find((s) => s.value === upper)?.label || status;
};

/**
 * Devuelve el texto para el badge de OT/programación de visita de un ticket.
 * Muestra la fecha agendada si existe; si no, indica que es una OT cuando
 * corresponda. Retorna null cuando no hay nada relevante que mostrar.
 */
export const getTicketOtBadgeLabel = (ticket) => {
  if (!ticket) return null;

  if (ticket.scheduled_date) {
    try {
      return `Visita ${format(parseISO(ticket.scheduled_date), "dd MMM", { locale: es })}`;
    } catch {
      return `Visita ${ticket.scheduled_date}`;
    }
  }

  const status = String(ticket.status).toUpperCase();
  if (status === "EN_ORDEN_TRABAJO") {
    return "OT";
  }

  return null;
};

// ============================================================================
// PRIORIDADES
// ============================================================================

export const TICKET_PRIORITY = {
  BAJA: { value: "BAJA", label: "Baja", color: "success", variant: "success", borderColor: "#2A9D8F" },
  MEDIA: { value: "MEDIA", label: "Media", color: "default", variant: "void", borderColor: "var(--ikolu-void-text-heading)" },
  ALTA: { value: "ALTA", label: "Alta", color: "warning", variant: "warning", borderColor: "#F4A261" },
  CRITICA: { value: "CRITICA", label: "Crítica", color: "error", variant: "error", borderColor: "#E76F51" },
};

export const PRIORITY_OPTIONS = Object.values(TICKET_PRIORITY).map(({ value, label }) => ({
  value,
  label,
}));

export const PRIORITY_FILTER_OPTIONS = PRIORITY_OPTIONS;

/**
 * Resuelve la configuración visual para una prioridad de ticket.
 */
export const getTicketPriorityConfig = (priority) => {
  if (!priority) return TICKET_PRIORITY.MEDIA;
  const upper = String(priority).toUpperCase();
  return Object.values(TICKET_PRIORITY).find((p) => p.value === upper) || TICKET_PRIORITY.MEDIA;
};

// ============================================================================
// CATEGORÍAS
// ============================================================================

export const TICKET_CATEGORY = {
  SOFTWARE: { value: "SOFTWARE", label: "Software", variant: "void", color: "default", borderColor: "var(--ikolu-void-text-heading)" },
  HARDWARE: { value: "HARDWARE", label: "Hardware", variant: "warning", color: "orange", borderColor: "#F4A261" },
  COMPLIANCE: { value: "COMPLIANCE", label: "Cumplimiento (DGA/SMA)", variant: "success", color: "green", borderColor: "#2A9D8F" },
  WORK_ORDER: { value: "WORK_ORDER", label: "Orden de trabajo", variant: "error", color: "red", borderColor: "#E76F51" },
};

export const CATEGORY_OPTIONS = Object.values(TICKET_CATEGORY).map(({ value, label }) => ({
  value,
  label,
}));

export const TICKET_CATEGORY_TYPE = {
  SOFTWARE: { value: "SOFTWARE", label: "Software", variant: "void", color: "default", borderColor: "var(--ikolu-void-text-heading)" },
  HARDWARE: { value: "HARDWARE", label: "Hardware", variant: "warning", color: "orange", borderColor: "#F4A261" },
  COMPLIANCE: { value: "COMPLIANCE", label: "Cumplimiento (DGA/SMA)", variant: "success", color: "green", borderColor: "#2A9D8F" },
  WORK_ORDER: { value: "WORK_ORDER", label: "Orden de trabajo", variant: "error", color: "red", borderColor: "#E76F51" },
};

export const CATEGORY_TYPE_OPTIONS = Object.values(TICKET_CATEGORY_TYPE).map(({ value, label }) => ({
  value,
  label,
}));

/**
 * Resuelve el label legible para una categoría de ticket.
 * Acepta string u objeto; para objetos lee `category_type`, `value` o `name`.
 */
export const getTicketCategoryLabel = (category) => {
  if (!category) return category;
  const raw = typeof category === "object" ? category.category_type || category.value || category.name || "" : category;
  const upper = String(raw).toUpperCase();
  return Object.values(TICKET_CATEGORY).find((c) => c.value === upper)?.label || raw;
};

/**
 * Devuelve la configuración visual completa para una categoría de ticket.
 * Acepta string u objeto; para objetos lee `category_type`, `value` o `name`.
 */
export const getTicketCategoryConfig = (category) => {
  if (!category) return TICKET_CATEGORY.SOFTWARE;
  const raw = typeof category === "object" ? category.category_type || category.value || category.name || "" : category;
  const upper = String(raw).toUpperCase();
  return Object.values(TICKET_CATEGORY).find((c) => c.value === upper) || TICKET_CATEGORY.SOFTWARE;
};

/**
 * Resuelve el label legible para el tipo de categoría (`category_type`).
 */
export const getTicketCategoryTypeLabel = (categoryType) => {
  if (!categoryType) return categoryType;
  const upper = String(categoryType).toUpperCase();
  return Object.values(TICKET_CATEGORY_TYPE).find((c) => c.value === upper)?.label || categoryType;
};

/**
 * Devuelve la configuración visual para el tipo de categoría (`category_type`).
 */
export const getTicketCategoryTypeConfig = (categoryType) => {
  if (!categoryType) return TICKET_CATEGORY_TYPE.SOFTWARE;
  const upper = String(categoryType).toUpperCase();
  return Object.values(TICKET_CATEGORY_TYPE).find((c) => c.value === upper) || TICKET_CATEGORY_TYPE.SOFTWARE;
};

// ============================================================================
// ORIGEN
// ============================================================================

export const TICKET_ORIGIN = {
  CLIENTE: { value: "CLIENTE", label: "Cliente" },
  INTERNO: { value: "INTERNO", label: "Interno" },
};

export const ORIGIN_OPTIONS = Object.values(TICKET_ORIGIN).map(({ value, label }) => ({
  value,
  label,
}));

export const ORIGIN_FILTER_OPTIONS = ORIGIN_OPTIONS;

/**
 * Resuelve el label legible para el origen de un ticket.
 */
export const getTicketOriginLabel = (origin) => {
  if (!origin) return origin;
  const upper = String(origin).toUpperCase();
  return Object.values(TICKET_ORIGIN).find((o) => o.value === upper)?.label || origin;
};

// ============================================================================
// FUENTE / SOURCE
// ============================================================================

export const TICKET_SOURCE = {
  APP_CLIENTE: { value: "APP_CLIENTE", label: "App Cliente" },
  APP_ADMIN: { value: "APP_ADMIN", label: "App Admin" },
  ALERTA_AUTO: { value: "ALERTA_AUTO", label: "Alerta" },
  SISTEMA: { value: "SISTEMA", label: "Sistema" },
  CORREO: { value: "CORREO", label: "Correo" },
  TELEFONO: { value: "TELEFONO", label: "Teléfono" },
};

export const SOURCE_OPTIONS = Object.values(TICKET_SOURCE).map(({ value, label }) => ({
  value,
  label,
}));

export const SOURCE_FILTER_OPTIONS = [
  { value: "APP_CLIENTE", label: "App Cliente" },
  { value: "APP_ADMIN", label: "App Admin" },
  { value: "ALERTA_AUTO", label: "Alerta" },
  { value: "SISTEMA", label: "Sistema" },
];

/**
 * Resuelve el label legible para la fuente de un ticket.
 */
export const getTicketSourceLabel = (source) => {
  if (!source) return source;
  const upper = String(source).toUpperCase();
  return Object.values(TICKET_SOURCE).find((s) => s.value === upper)?.label || source;
};

/**
 * Determina el origen de un ticket para distinguir manuales de automáticos.
 * Retorna 'system' (SISTEMA/ALERTA_AUTO), 'client' (APP_CLIENTE), 'staff' (APP_STAFF/APP_ADMIN) o 'unknown'.
 */
export const getTicketSourceKind = (source, origin) => {
  const src = String(source || "").toUpperCase();
  const org = String(origin || "").toUpperCase();
  if (src === "SISTEMA" || src === "ALERTA_AUTO") {
    return "system";
  }
  if (src === "APP_CLIENTE" || org === "CLIENTE") {
    return "client";
  }
  if (src === "APP_STAFF" || src === "APP_ADMIN" || org === "INTERNO") {
    return "staff";
  }
  return "unknown";
};

/**
 * Retorna true si el ticket fue generado automáticamente por el sistema o una alerta.
 * Estos tickets se muestran en el área de advertencias y no en el Kanban principal.
 */
export const isAutomaticTicket = (source) => {
  const src = String(source || "").toUpperCase();
  return src === "SISTEMA" || src === "ALERTA_AUTO";
};

// ============================================================================
// ADJUNTOS
// ============================================================================

export const TICKET_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const TICKET_ATTACHMENT_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".xlsx",
  ".xls",
  ".doc",
  ".docx",
  ".txt",
  ".csv",
];

export const TICKET_ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

/**
 * Extrae la extensión de un archivo (incluyendo el punto).
 * Acepta instancia de File o un string con el nombre.
 */
export const getTicketAttachmentExtension = (file) => {
  const name = file?.name || String(file || "");
  const match = name.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : "";
};

/**
 * Valida un archivo adjunto según las reglas de tickets.
 * Retorna { valid: true } si es válido, o { valid: false, error: string } si falla.
 */
export const validateTicketAttachment = (file) => {
  if (!file || !file.name) {
    return { valid: false, error: "No se ha seleccionado ningún archivo." };
  }

  const extension = getTicketAttachmentExtension(file);
  if (!TICKET_ATTACHMENT_ALLOWED_EXTENSIONS.includes(extension)) {
    const allowed = TICKET_ATTACHMENT_ALLOWED_EXTENSIONS.join(", ");
    return {
      valid: false,
      error: `Extensión no permitida: ${extension || "(vacía)"}. Extensiones válidas: ${allowed}.`,
    };
  }

  if (file.size != null && file.size > TICKET_ATTACHMENT_MAX_SIZE) {
    const maxMb = TICKET_ATTACHMENT_MAX_SIZE / (1024 * 1024);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `El archivo pesa ${sizeMb} MB y excede el límite máximo de ${maxMb} MB.`,
    };
  }

  return { valid: true };
};

// ============================================================================
// HELPERS DE FECHAS Y CAMPOS DEL BACKEND
// ============================================================================

/**
 * Devuelve el primer campo existente de un ticket probando varios nombres.
 * Útil para mantener compatibilidad si el backend cambia de `created_at` a `created`.
 */
export const getTicketField = (ticket, ...fields) => {
  if (!ticket) return undefined;
  for (const field of fields) {
    if (ticket[field] !== undefined && ticket[field] !== null) return ticket[field];
  }
  return undefined;
};

/**
 * Intenta parsear una fecha de un ticket. Acepta múltiples nombres de campo.
 */
export const getTicketDateValue = (ticket, ...fields) => {
  const value = getTicketField(ticket, ...fields);
  if (!value) return null;
  try {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Formatea una fecha de ticket con el formato deseado.
 */
export const formatTicketDate = (ticket, formatStr, ...fields) => {
  const date = getTicketDateValue(ticket, ...fields);
  if (!date) return null;
  return format(date, formatStr, { locale: es });
};

/**
 * Formatea un valor de fecha/hora ISO a un formato legible.
 * Retorna null si el valor no es parseable.
 */
export const formatTicketDateTime = (value, formatStr = "dd MMM yyyy HH:mm") => {
  if (!value) return null;
  try {
    const date = parseISO(value);
    if (!isValid(date)) return null;
    return format(date, formatStr, { locale: es });
  } catch {
    return null;
  }
};

/**
 * Formatea una fecha ISO a formato corto (dd MMM yyyy).
 */
export const formatTicketDateShort = (value) => formatTicketDateTime(value, "dd MMM yyyy");

/**
 * Formatea una hora ISO a formato HH:mm.
 */
export const formatTicketTime = (value) => formatTicketDateTime(value, "HH:mm");

/**
 * Formatea una fecha de ticket para mostrar día, mes y hora.
 * Útil para timelines y comentarios.
 */
export const formatTicketDateCompact = (value) => formatTicketDateTime(value, "dd MMM, HH:mm");

/**
 * Calcula el estado de un SLA a partir de la fecha límite y la fecha de cumplimiento.
 * Estados: cumplido, no definido, vencido, próximo a vencer o a tiempo.
 * Variantes visuales: 'success' | 'warning' | 'error' | 'default'.
 */
export const getSlaStatus = (deadlineValue, doneAtValue) => {
  if (doneAtValue) {
    return { label: "Cumplido", variant: "success", done: true, overdue: false };
  }
  if (!deadlineValue) {
    return { label: "No aplica", variant: "default", overdue: false, done: false };
  }
  try {
    const deadline = parseISO(deadlineValue);
    if (!isValid(deadline)) {
      return { label: "No definido", variant: "default", overdue: false, done: false };
    }
    const overdue = isPast(deadline);
    const hoursRemaining = differenceInHours(deadline, new Date());
    const nearDue = !overdue && hoursRemaining <= 24;

    if (overdue) {
      return { label: "Vencido", variant: "error", overdue: true, done: false, hoursRemaining };
    }
    if (nearDue) {
      return {
        label: hoursRemaining <= 1 ? "Vence pronto" : "Próximo a vencer",
        variant: "warning",
        overdue: false,
        done: false,
        hoursRemaining,
      };
    }
    return {
      label: "A tiempo",
      variant: "success",
      overdue: false,
      done: false,
      hoursRemaining,
    };
  } catch {
    return { label: "No definido", variant: "default", overdue: false, done: false };
  }
};
