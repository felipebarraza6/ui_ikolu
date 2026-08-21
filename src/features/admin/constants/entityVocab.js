/**
 * Vocabulario contextual para el subsistema de Tickets/Tareas.
 *
 * Soporte usa el vocabulario por defecto (ticket = entidad, tarea = sub-entidad).
 * Operaciones usa TASK_VOCAB (tarea = entidad, subtarea = sub-entidad).
 * Esto permite reutilizar los mismos componentes Kanban con labels correctos.
 */

export const DEFAULT_VOCAB = {
  entitySingular: "ticket",
  entityPlural: "tickets",
  entitySingularCap: "Ticket",
  subEntitySingular: "tarea",
  subEntityPlural: "tareas",
  subEntitySingularCap: "Tarea",
  origin: "CLIENTE",
};

export const TASK_VOCAB = {
  entitySingular: "tarea",
  entityPlural: "tareas",
  entitySingularCap: "Tarea",
  subEntitySingular: "subtarea",
  subEntityPlural: "subtareas",
  subEntitySingularCap: "Subtarea",
  origin: "OPERACIONES",
};

export const getEntityVocab = (pathname) =>
  pathname && String(pathname).startsWith("/admin/operations") ? TASK_VOCAB : DEFAULT_VOCAB;

export default DEFAULT_VOCAB;
