import { useState, useEffect, useCallback, useMemo } from "react";
import { message } from "antd";
import orchestrator from "../../../api/orchestrator";

/**
 * Normaliza respuestas paginadas o arrays planos del backend.
 */
const normalizeListResponse = (res) => {
  if (Array.isArray(res)) return { results: res, count: res.length };
  return {
    results: res?.results || res?.data || [],
    count: res?.count ?? res?.results?.length ?? 0,
  };
};

/**
 * Hook para gestionar tickets de soporte en el módulo admin.
 * Centraliza fetching, mutaciones y opciones derivadas para filtros.
 */
export const useTickets = (options = {}) => {
  const { autoLoad = true } = options;

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clientsWithProjects, setClientsWithProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orchestrator.tickets.get(params);
      const normalized = normalizeListResponse(res);
      setTickets(normalized.results);
      return normalized;
    } catch (err) {
      setError(err);
      message.error(err.message || "Error al cargar tickets");
      return { results: [], count: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await orchestrator.tickets.stats();
      setStats(res);
      return res;
    } catch (err) {
      console.error("[useTickets] stats error:", err);
      return null;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await orchestrator.admin.users({ is_active: true, page_size: 200 });
      const list = Array.isArray(res) ? res : res?.results || [];
      setUsers(list);
      return list;
    } catch (err) {
      console.error("[useTickets] users error:", err);
      return [];
    }
  }, []);

  const fetchClientsWithProjects = useCallback(async () => {
    try {
      const res = await orchestrator.admin.clientsWithProjects();
      const list = Array.isArray(res) ? res : res?.results || [];
      setClientsWithProjects(list);
      return list;
    } catch (err) {
      console.error("[useTickets] clientsWithProjects error:", err);
      return [];
    }
  }, []);

  const refresh = useCallback(
    async (params = {}) => {
      await Promise.all([
        fetchTickets(params),
        fetchStats(),
        fetchUsers(),
        fetchClientsWithProjects(),
      ]);
    },
    [fetchTickets, fetchStats, fetchUsers, fetchClientsWithProjects]
  );

  useEffect(() => {
    if (autoLoad) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  const createTicket = useCallback(
    async (data) => {
      try {
        const res = await orchestrator.tickets.create(data);
        message.success("Ticket creado correctamente");
        await refresh();
        return res;
      } catch (err) {
        message.error(err.message || "Error al crear ticket");
        throw err;
      }
    },
    [refresh]
  );

  const updateTicket = useCallback(
    async (id, data) => {
      try {
        const res = await orchestrator.tickets.update(id, data);
        message.success("Ticket actualizado");
        await refresh();
        return res;
      } catch (err) {
        message.error(err.message || "Error al actualizar ticket");
        throw err;
      }
    },
    [refresh]
  );

  const assignTicket = useCallback(
    async (id, assignedTo) => {
      try {
        const res = await orchestrator.tickets.assign(id, assignedTo);
        message.success("Ticket asignado");
        await refresh();
        return res;
      } catch (err) {
        message.error(err.message || "Error al asignar ticket");
        throw err;
      }
    },
    [refresh]
  );

  const changeStatus = useCallback(
    async (id, status) => {
      try {
        const res = await orchestrator.tickets.changeStatus(id, status);
        message.success("Estado actualizado");
        await refresh();
        return res;
      } catch (err) {
        message.error(err.message || "Error al cambiar estado");
        throw err;
      }
    },
    [refresh]
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

  const createComment = useCallback(async (id, data) => {
    try {
      const res = await orchestrator.tickets.createComment(id, data);
      message.success("Comentario agregado");
      return res;
    } catch (err) {
      message.error(err.message || "Error al agregar comentario");
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
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await orchestrator.tickets.uploadAttachment(id, formData);
      message.success("Adjunto subido");
      return res;
    } catch (err) {
      message.error(err.message || "Error al subir adjunto");
      throw err;
    }
  }, []);

  /** Opciones de filtros derivadas de los tickets cargados. */
  const filterOptions = useMemo(() => {
    const categories = [...new Set(tickets.map((t) => t.category).filter(Boolean))];
    const sources = [...new Set(tickets.map((t) => t.source || t.origin).filter(Boolean))];
    return { categories, sources };
  }, [tickets]);

  return {
    tickets,
    stats,
    users,
    clientsWithProjects,
    loading,
    error,
    refresh,
    fetchTickets,
    fetchStats,
    createTicket,
    updateTicket,
    assignTicket,
    changeStatus,
    getTicketById,
    getComments,
    createComment,
    getAttachments,
    uploadAttachment,
    filterOptions,
  };
};

export default useTickets;
