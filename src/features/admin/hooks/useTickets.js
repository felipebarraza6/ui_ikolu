import { useState, useEffect, useCallback } from "react";
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
    res?.results || res?.data || res?.attachments || res?.comments || [];
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

  const fetchTickets = useCallback(async (rawParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...rawParams };

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
      const res = await orchestrator.tickets.myDesk({ page_size: 100, ...params });
      const normalized = normalizeListResponse(res?.tickets ? { results: res.tickets, count: res.count } : res);
      setMyDeskTickets(normalized.results);
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
        message.success("Ticket creado correctamente");
        // Refresco en segundo plano para no bloquear el cierre del drawer.
        fetchTickets().catch((refreshErr) => {
          console.error("[useTickets] createTicket refresh error:", refreshErr);
        });
        return res;
      } catch (err) {
        message.error(err.message || "Error al crear ticket");
        throw err;
      }
    },
    [fetchTickets]
  );

  const updateTicket = useCallback(
    async (id, data) => {
      try {
        const res = await orchestrator.tickets.update(id, data);
        message.success("Ticket actualizado");
        await fetchTickets();
        return res;
      } catch (err) {
        message.error(err.message || "Error al actualizar ticket");
        throw err;
      }
    },
    [fetchTickets]
  );

  const deleteTicket = useCallback(
    async (id) => {
      try {
        await orchestrator.tickets.delete(id);
        message.success("Ticket eliminado");
        await fetchTickets();
      } catch (err) {
        message.error(err.message || "Error al eliminar ticket");
        throw err;
      }
    },
    [fetchTickets]
  );

  const assignTicket = useCallback(
    async (id, assignedTo) => {
      try {
        const res = await orchestrator.tickets.assign(id, assignedTo);
        message.success("Ticket asignado");
        await fetchTickets();
        return res;
      } catch (err) {
        message.error(err.message || "Error al asignar ticket");
        throw err;
      }
    },
    [fetchTickets]
  );

  const changeStatus = useCallback(
    async (id, status) => {
      try {
        const res = await orchestrator.tickets.changeStatus(id, status);
        message.success("Estado actualizado");
        await fetchTickets();
        return res;
      } catch (err) {
        message.error(err.message || "Error al cambiar estado");
        throw err;
      }
    },
    [fetchTickets]
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
        message.success("Comentario agregado");
        return res;
      } catch (err) {
        message.error(err.message || "Error al agregar comentario");
        throw err;
      }
    },
    [isStaff]
  );

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
    getAttachments,
    uploadAttachment,
  };
};

export default useTickets;
