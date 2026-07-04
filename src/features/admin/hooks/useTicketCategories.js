import { useState, useEffect, useCallback, useMemo } from "react";
import { message } from "antd";
import orchestrator from "../../../api/orchestrator";

/**
 * Hook especializado para categorías de tickets.
 *
 * Carga solo lo necesario: categorías y usuarios staff (para operadores).
 * No dispara requests de tickets, stats, clientes ni puntos.
 */
export const useTicketCategories = (options = {}) => {
  const { autoLoad = true } = options;

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async (params = {}) => {
    try {
      const res = await orchestrator.tickets.categories.get(params);
      const list = Array.isArray(res) ? res : res?.results || res?.categories || [];
      setCategories(list);
      return list;
    } catch (err) {
      console.error("[useTicketCategories] categories error:", err);
      return [];
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await orchestrator.admin.staffUsers();
      const list = Array.isArray(res) ? res : res?.results || [];
      setUsers(list);
      return list;
    } catch (err) {
      console.error("[useTicketCategories] users error:", err);
      return [];
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchUsers()]);
    setLoading(false);
  }, [fetchCategories, fetchUsers]);

  useEffect(() => {
    if (autoLoad) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  const createCategory = useCallback(
    async (data) => {
      try {
        const res = await orchestrator.tickets.categories.create(data);
        message.success("Categoría creada correctamente");
        await refresh();
        return res;
      } catch (err) {
        message.error(err.message || "Error al crear categoría");
        throw err;
      }
    },
    [refresh]
  );

  const updateCategory = useCallback(
    async (id, data) => {
      try {
        const res = await orchestrator.tickets.categories.update(id, data);
        message.success("Categoría actualizada");
        await refresh();
        return res;
      } catch (err) {
        message.error(err.message || "Error al actualizar categoría");
        throw err;
      }
    },
    [refresh]
  );

  const deleteCategory = useCallback(
    async (id) => {
      try {
        await orchestrator.tickets.categories.delete(id);
        message.success("Categoría eliminada");
        await refresh();
      } catch (err) {
        message.error(err.message || "Error al eliminar categoría");
        throw err;
      }
    },
    [refresh]
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name || c.title || `Categoría ${c.id}`,
      })),
    [categories]
  );

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: u.full_name || u.username || u.email || `Usuario ${u.id}`,
      })),
    [users]
  );

  return {
    categories,
    users,
    loading,
    refresh,
    fetchCategories,
    fetchUsers,
    createCategory,
    updateCategory,
    deleteCategory,
    categoryOptions,
    userOptions,
  };
};

export default useTicketCategories;
