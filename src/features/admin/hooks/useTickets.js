import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import orchestrator from "../../../api/orchestrator";
import { useAdminAuth } from "./useAdminAuth";
import { validateTicketAttachment } from "../constants/tickets";

/**
 * Normaliza respuestas paginadas o arrays planos del backend.
 */
const normalizeListResponse = (res) => {
  if (Array.isArray(res)) return { results: res, count: res.length };
  const results =
    res?.results || res?.data || res?.tasks || res?.attachments || res?.comments || [];
  return {
    results,
    count: res?.count ?? results.length,
  };
};

/**
 * Resuelve el ID de una categoría a partir del payload o de las categorías
 * cargadas. Soporta category como número (id) o string (category_type/name).
 */
const resolveCategoryId = (category, categories = []) => {
  if (category == null) return category;
  if (typeof category === "number") return category;
  if (!Number.isNaN(Number(category)) && String(category).trim() !== "") {
    return Number(category);
  }
  const value = String(category).toUpperCase();
  const found = categories.find(
    (c) =>
      String(c.id) === String(category) ||
      String(c.category_type).toUpperCase() === value ||
      String(c.name).toUpperCase() === value
  );
  return found ? found.id : category;
};

/**
 * Hook para gestionar tickets de soporte.
 *
 * Se enfoca únicamente en tickets: listado general, Mi Escritorio, stats,
 * comentarios, adjuntos y mutaciones. Los catálogos (usuarios, clientes,
 * puntos, categorías) deben cargarse con hooks especializados para no
 * saturar el backend con requests innecesarios.
 */
export const useTickets = (options = {}) => {
  const { autoLoad = false } = options;
  const { isStaff } = useAdminAuth();

  const [tickets, setTickets] = useState([]);
  const [ticketCount, setTicketCount] = useState(0);
  const [warningTickets, setWarningTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [myDeskTickets, setMyDeskTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lastTicketsParams = useRef({});
  const lastMyDeskParams = useRef({});
  const ticketsLoaded = useRef(false);
  const myDeskLoaded = useRef(false);

  const fetchTickets = useCallback(async (rawParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...rawParams };
      lastTicketsParams.current = params;

      // Compatibilidad: componentes antiguos usan point_catchment/created_at__*
      if (params.point_catchment != null && params.point_id == null) {
        params.point_id = params.point_catchment;
      }
      delete params.point_catchment;

      if (params.created_at__gte != null && params.created_from == null) {
        params.created_from = params.created_at__gte;
      }
      if (params.created_at__lte != null && params.created_to == null) {
        params.created_to = params.created_at__lte;
      }
      delete params.created_at__gte;
      delete params.created_at__lte;

      const res = await orchestrator.tickets.get({ page_size: 100, ...params });
      const normalized = normalizeListResponse(res?.tickets ? { results: res.tickets, count: res.count } : res);
      setTickets(normalized.results);
      setTicketCount(normalized.count);
      ticketsLoaded.current = true;
      return normalized;
    } catch (err) {
      setError(err);
      message.error(err.message || "Error al cargar tickets");
      return { results: [], count: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWarnings = useCallback(async (rawParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { source: "SISTEMA", ...rawParams };

      if (params.created_at__gte != null && params.created_from == null) {
        params.created_from = params.created_at__gte;
      }
      if (params.created_at__lte != null && params.created_to == null) {
        params.created_to = params.created_at__lte;
      }
      delete params.created_at__gte;
      delete params.created_at__lte;

      const res = await orchestrator.tickets.get({ page_size: 100, ...params });
      const normalized = normalizeListResponse(res?.tickets ? { results: res.tickets, count: res.count } : res);
      setWarningTickets(normalized.results);
      return normalized;
    } catch (err) {
      setError(err);
      message.error(err.message || "Error al cargar advertencias");
      return { results: [], count: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async (params = {}) => {
    try {
      const res = await orchestrator.tickets.stats(params);
      setStats(res);
      return res;
    } catch (err) {
      console.error("[useTickets] stats error:", err);
      return null;
    }
  }, []);

  const fetchMyDesk = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      lastMyDeskParams.current = params;
      const res = await orchestrator.tickets.myDesk({ page_size: 100, ...params });
      const normalized = normalizeListResponse(res?.tickets ? { results: res.tickets, count: res.count } : res);
      setMyDeskTickets(normalized.results);
      myDeskLoaded.current = true;
      return normalized;
    } catch (err) {
      setError(err);
      message.error(err.message || "Error al cargar Mi Escritorio");
      return { results: [], count: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  const refreshTickets = useCallback(
    async (params = {}) => {
      await fetchTickets(params);
    },
    [fetchTickets]
  );

  const refreshMyDesk = useCallback(
    async (params = {}) => {
      await fetchMyDesk(params);
    },
    [fetchMyDesk]
  );

  /** Refresca las listas que hayan sido cargadas (tickets y/o Mi Escritorio). */
  const refreshAfterMutation = useCallback(async () => {
    if (ticketsLoaded.current) await fetchTickets(lastTicketsParams.current);
    if (myDeskLoaded.current) await fetchMyDesk(lastMyDeskParams.current);
  }, [fetchTickets, fetchMyDesk]);

  const createTicket = useCallback(
    async (data, categories = []) => {
      try {
        const payload = { ...data };

        if (payload.point_catchment != null && payload.points == null) {
          payload.points = [payload.point_catchment];
        }

        if (payload.category != null) {
          payload.category = resolveCategoryId(payload.category, categories);
        }

        if (!payload.source) payload.source = "APP_ADMIN";
        if (!payload.origin) payload.origin = "CLIENTE";

        const res = await orchestrator.tickets.create(payload);
        await refreshAfterMutation();
        message.success("Ticket creado correctamente");
        return res;
      } catch (err) {
        message.error(err.message || "Error al crear ticket");
        throw err;
      }
    },
    [refreshAfterMutation]
  );

  const updateTicket = useCallback(
    async (id, data) => {
      try {
        const res = await orchestrator.tickets.update(id, data);
        await refreshAfterMutation();
        return res;
      } catch (err) {
        message.error(err.message || "Error al actualizar ticket");
        throw err;
      }
    },
    [refreshAfterMutation]
  );

  const deleteTicket = useCallback(
    async (id) => {
      try {
        await orchestrator.tickets.delete(id);
        await refreshAfterMutation();
      } catch (err) {
        message.error(err.message || "Error al eliminar ticket");
        throw err;
      }
    },
    [refreshAfterMutation]
  );

  const assignTicket = useCallback(
    async (id, assignedTo) => {
      try {
        const res = await orchestrator.tickets.assign(id, assignedTo);
        message.success("Ticket asignado");
        await refreshAfterMutation();
        return res;
      } catch (err) {
        message.error(err.message || "Error al asignar ticket");
        throw err;
      }
    },
    [refreshAfterMutation]
  );

  const changeStatus = useCallback(
    async (id, status, workOrderCategory) => {
      try {
        const res = await orchestrator.tickets.changeStatus(id, status, workOrderCategory);
        await refreshAfterMutation();
        return res;
      } catch (err) {
        message.error(err.message || "Error al cambiar estado");
        throw err;
      }
    },
    [refreshAfterMutation]
  );

  const getTicketById = useCallback(async (id) => {
    try {
      return await orchestrator.tickets.getById(id);
    } catch (err) {
      message.error(err.message || "Error al obtener ticket");
      throw err;
    }
  }, []);

  const getComments = useCallback(async (id, page = 1) => {
    try {
      const res = await orchestrator.tickets.getComments(id, page);
      return normalizeListResponse(res).results;
    } catch (err) {
      message.error(err.message || "Error al cargar comentarios");
      return [];
    }
  }, []);

  const createComment = useCallback(
    async (id, data) => {
      try {
        const payload = { ...data };
        if (!isStaff && Object.prototype.hasOwnProperty.call(payload, "is_internal")) {
          delete payload.is_internal;
        }
        const res = await orchestrator.tickets.createComment(id, payload);
        return res;
      } catch (err) {
        message.error(err.message || "Error al agregar comentario");
        throw err;
      }
    },
    [isStaff]
  );

  const deleteComment = useCallback(
    async (ticketId, commentId) => {
      try {
        await orchestrator.tickets.deleteComment(ticketId, commentId);
        message.success("Comentario eliminado");
        return true;
      } catch (err) {
        const status = err?.response?.status;
        message.error(
          status === 404
            ? "El backend no soporta borrar comentarios (endpoint no encontrado)"
            : err.message || "Error al eliminar comentario"
        );
        return false;
      }
    },
    []
  );

  const updateComment = useCallback(
    async (ticketId, commentId, data) => {
      try {
        await orchestrator.tickets.updateComment(ticketId, commentId, data);
        return true;
      } catch (err) {
        const status = err?.response?.status;
        message.error(
          status === 404
            ? "El backend no soporta editar comentarios (endpoint no encontrado)"
            : err.message || "Error al editar comentario"
        );
        return false;
      }
    },
    []
  );

  const likeComment = useCallback(
    async (ticketId, commentId) => {
      try {
        const res = await orchestrator.tickets.likeComment(ticketId, commentId);
        return res;
      } catch (err) {
        const status = err?.response?.status;
        message.error(
          status === 404
            ? "El backend no soporta likes en comentarios (endpoint no encontrado)"
            : err.message || "Error al dar me gusta"
        );
        return null;
      }
    },
    []
  );

  const getMentionableUsers = useCallback(async (ticketId) => {
    try {
      const res = await orchestrator.tickets.getMentionableUsers(ticketId);
      return res?.users || [];
    } catch (err) {
      message.error(err.message || "Error al cargar usuarios mencionables");
      return [];
    }
  }, []);

  const getTicketNotifications = useCallback(async (params = {}) => {
    try {
      const res = await orchestrator.tickets.getNotifications(params);
      return res;
    } catch (err) {
      message.error(err.message || "Error al cargar notificaciones");
      return { results: [], unread_count: 0 };
    }
  }, []);

  const markTicketNotificationsRead = useCallback(async (data) => {
    try {
      return await orchestrator.tickets.markNotificationsRead(data);
    } catch (err) {
      message.error(err.message || "Error al marcar notificaciones");
      throw err;
    }
  }, []);

  const getAttachments = useCallback(async (id) => {
    try {
      const res = await orchestrator.tickets.getAttachments(id);
      return normalizeListResponse(res).results;
    } catch (err) {
      message.error(err.message || "Error al cargar adjuntos");
      return [];
    }
  }, []);

  const uploadAttachment = useCallback(async (id, file) => {
    const validation = validateTicketAttachment(file);
    if (!validation.valid) {
      message.error(validation.error);
      throw new Error(validation.error);
    }
    try {
      const res = await orchestrator.tickets.uploadAttachment(id, file);
      message.success("Adjunto subido");
      return res;
    } catch (err) {
      message.error(err.message || "Error al subir adjunto");
      throw err;
    }
  }, []);

  const confirmScheduledDate = useCallback(async (id) => {
    try {
      const res = await orchestrator.tickets.confirmScheduledDate(id);
      message.success("Fecha de visita confirmada");
      await refreshAfterMutation();
      return res;
    } catch (err) {
      message.error(err.message || "Error al confirmar fecha");
      throw err;
    }
  }, [refreshAfterMutation]);

  const cancelScheduledDate = useCallback(async (id, reason) => {
    try {
      const res = await orchestrator.tickets.cancelScheduledDate(id, reason);
      message.success("Fecha de visita cancelada");
      await refreshAfterMutation();
      return res;
    } catch (err) {
      message.error(err.message || "Error al cancelar fecha");
      throw err;
    }
  }, [refreshAfterMutation]);

  // ──────────────────────────────────────────
  // TAREAS POR TICKET
  // ──────────────────────────────────────────

  const getTasks = useCallback(async (id, page = 1) => {
    try {
      const res = await orchestrator.tickets.tasks.get(id, page);
      return normalizeListResponse(res).results;
    } catch (err) {
      message.error(err.message || "Error al cargar tareas");
      return [];
    }
  }, []);

  const createTask = useCallback(
    async (id, data) => {
      try {
        const payload = { ...data };
        if (payload.assigned_to === undefined || payload.assigned_to === null || payload.assigned_to === "") {
          delete payload.assigned_to;
        }
        const res = await orchestrator.tickets.tasks.create(id, payload);
        message.success("Tarea creada");
        return res;
      } catch (err) {
        message.error(err.message || "Error al crear tarea");
        throw err;
      }
    },
    []
  );

  const updateTask = useCallback(async (id, data) => {
    try {
      const payload = { ...data };
      if (payload.assigned_to === undefined || payload.assigned_to === null || payload.assigned_to === "") {
        delete payload.assigned_to;
      }
      const res = await orchestrator.tickets.tasks.update(id, payload);
      message.success("Tarea actualizada");
      return res;
    } catch (err) {
      message.error(err.message || "Error al actualizar tarea");
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await orchestrator.tickets.tasks.delete(id);
      message.success("Tarea eliminada");
    } catch (err) {
      message.error(err.message || "Error al eliminar tarea");
      throw err;
    }
  }, []);

  const uploadTaskAttachment = useCallback(async (id, file) => {
    const validation = validateTicketAttachment(file);
    if (!validation.valid) {
      message.error(validation.error);
      throw new Error(validation.error);
    }
    try {
      const res = await orchestrator.tickets.tasks.uploadAttachment(id, file);
      message.success("Adjunto subido a la tarea");
      return res;
    } catch (err) {
      message.error(err.message || "Error al subir adjunto a la tarea");
      throw err;
    }
  }, []);

  const uploadCommentAttachment = useCallback(async (ticketId, commentId, file) => {
    const validation = validateTicketAttachment(file);
    if (!validation.valid) {
      message.error(validation.error);
      throw new Error(validation.error);
    }
    try {
      const res = await orchestrator.tickets.uploadCommentAttachment(ticketId, commentId, file);
      message.success("Adjunto subido al comentario");
      return res;
    } catch (err) {
      message.error(err.message || "Error al subir adjunto al comentario");
      throw err;
    }
  }, []);

  const getFiles = useCallback(async (params = {}) => {
    try {
      return await orchestrator.tickets.files(params);
    } catch (err) {
      message.error(err.message || "Error al cargar archivos");
      throw err;
    }
  }, []);

  return {
    tickets,
    ticketCount,
    warningTickets,
    stats,
    myDeskTickets,
    loading,
    error,
    fetchTickets,
    fetchStats,
    fetchMyDesk,
    fetchWarnings,
    refreshTickets,
    refreshMyDesk,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    changeStatus,
    getTicketById,
    getComments,
    createComment,
    deleteComment,
    updateComment,
    likeComment,
    getMentionableUsers,
    getTicketNotifications,
    markTicketNotificationsRead,
    getAttachments,
    uploadAttachment,
    uploadCommentAttachment,
    tasks: {
      get: getTasks,
      create: createTask,
      update: updateTask,
      delete: deleteTask,
      uploadAttachment: uploadTaskAttachment,
    },
    getFiles,
    confirmScheduledDate,
    cancelScheduledDate,
  };
};

export default useTickets;
