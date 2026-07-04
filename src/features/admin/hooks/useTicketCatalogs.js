import { useState, useEffect, useCallback } from "react";
import orchestrator from "../../../api/orchestrator";

/**
 * Hook para catálogos auxiliares de tickets.
 *
 * Carga usuarios staff, clientes con proyectos, puntos y categorías.
 * Útil para filtros y formularios de creación de tickets.
 */
export const useTicketCatalogs = (options = {}) => {
  const { autoLoad = true } = options;

  const [users, setUsers] = useState([]);
  const [clientsWithProjects, setClientsWithProjects] = useState([]);
  const [points, setPoints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await orchestrator.admin.staffUsers();
      const list = Array.isArray(res) ? res : res?.results || [];
      setUsers(list);
      return list;
    } catch (err) {
      console.error("[useTicketCatalogs] users error:", err);
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
      console.error("[useTicketCatalogs] clientsWithProjects error:", err);
      return [];
    }
  }, []);

  const fetchPoints = useCallback(async () => {
    try {
      const res = await orchestrator.admin.pointsAll();
      const list = Array.isArray(res) ? res : res?.results || [];
      setPoints(list);
      return list;
    } catch (err) {
      console.error("[useTicketCatalogs] points error:", err);
      return [];
    }
  }, []);

  const fetchCategories = useCallback(async (params = {}) => {
    try {
      const res = await orchestrator.tickets.categories.get(params);
      const list = Array.isArray(res) ? res : res?.results || res?.categories || [];
      setCategories(list);
      return list;
    } catch (err) {
      console.error("[useTicketCatalogs] categories error:", err);
      return [];
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchClientsWithProjects(),
      fetchPoints(),
      fetchCategories(),
    ]);
    setLoading(false);
  }, [fetchUsers, fetchClientsWithProjects, fetchPoints, fetchCategories]);

  useEffect(() => {
    if (autoLoad) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  return {
    users,
    clientsWithProjects,
    points,
    categories,
    loading,
    refresh,
    fetchUsers,
    fetchClientsWithProjects,
    fetchPoints,
    fetchCategories,
  };
};

export default useTicketCatalogs;
