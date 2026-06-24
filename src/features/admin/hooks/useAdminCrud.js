import { useState, useEffect, useCallback, useMemo } from "react";
import { message } from "antd";

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
 * Hook genérico para CRUDs administrativos.
 *
 * @param {Object} api - objeto con métodos opcionales:
 *   get(params), getById(id), create(data), update(id, data), delete(id)
 * @param {Object} options
 * @param {boolean} options.autoLoad - si carga al montar
 * @param {Object} options.initialParams - params iniciales para get()
 */
export const useAdminCrud = (api, options = {}) => {
  const { autoLoad = true, initialParams = {} } = options;

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(
    async (params = initialParams) => {
      if (!api.get) return { results: [], count: 0 };
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(params);
        const normalized = normalizeListResponse(res);
        setItems(normalized.results);
        setCount(normalized.count);
        return normalized;
      } catch (err) {
        setError(err);
        console.error("[useAdminCrud] fetch error:", err);
        message.error(err?.response?.data?.detail || err.message || "Error al cargar datos");
        return { results: [], count: 0 };
      } finally {
        setLoading(false);
      }
    },
    [api, initialParams]
  );

  const refresh = useCallback(
    (params) => fetchItems(params),
    [fetchItems]
  );

  useEffect(() => {
    if (autoLoad) fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  const fetchById = useCallback(
    async (id) => {
      if (!api.getById) return null;
      try {
        return await api.getById(id);
      } catch (err) {
        message.error(err?.response?.data?.detail || "Error al obtener detalle");
        throw err;
      }
    },
    [api]
  );

  const createItem = useCallback(
    async (data) => {
      if (!api.create) return null;
      setSaving(true);
      try {
        const res = await api.create(data);
        message.success("Creado correctamente");
        await fetchItems();
        return res;
      } catch (err) {
        message.error(err?.response?.data?.detail || "Error al crear");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [api, fetchItems]
  );

  const updateItem = useCallback(
    async (id, data) => {
      if (!api.update) return null;
      setSaving(true);
      try {
        const res = await api.update(id, data);
        message.success("Actualizado correctamente");
        await fetchItems();
        return res;
      } catch (err) {
        message.error(err?.response?.data?.detail || "Error al actualizar");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [api, fetchItems]
  );

  const deleteItem = useCallback(
    async (id) => {
      if (!api.delete) return null;
      try {
        const res = await api.delete(id);
        message.success("Eliminado correctamente");
        await fetchItems();
        return res;
      } catch (err) {
        message.error(err?.response?.data?.detail || "Error al eliminar");
        throw err;
      }
    },
    [api, fetchItems]
  );

  return useMemo(
    () => ({
      items,
      count,
      loading,
      saving,
      error,
      refresh,
      fetchById,
      createItem,
      updateItem,
      deleteItem,
    }),
    [items, count, loading, saving, error, refresh, fetchById, createItem, updateItem, deleteItem]
  );
};

export default useAdminCrud;
