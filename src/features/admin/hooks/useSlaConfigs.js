import { useState, useEffect, useCallback, useMemo } from "react";
import { message } from "antd";
import orchestrator from "../../../api/orchestrator";

/**
 * Hook especializado para configuraciones SLA.
 *
 * Carga únicamente /api/ik/sla-configs/. No dispara requests de tickets,
 * categorías, usuarios ni catálogos.
 */
export const useSlaConfigs = (options = {}) => {
  const { autoLoad = true } = options;

  const [slaConfigs, setSlaConfigs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSlaConfigs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await orchestrator.tickets.slaConfigs.get(params);
      const list = Array.isArray(res) ? res : res?.results || res?.sla_configs || [];
      setSlaConfigs(list);
      return list;
    } catch (err) {
      console.error("[useSlaConfigs] error:", err);
      message.error(err.message || "Error al cargar configuraciones SLA");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) fetchSlaConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  const createSlaConfig = useCallback(
    async (data) => {
      try {
        const res = await orchestrator.tickets.slaConfigs.create(data);
        message.success("Configuración SLA creada correctamente");
        await fetchSlaConfigs();
        return res;
      } catch (err) {
        message.error(err.message || "Error al crear configuración SLA");
        throw err;
      }
    },
    [fetchSlaConfigs]
  );

  const updateSlaConfig = useCallback(
    async (id, data) => {
      try {
        const res = await orchestrator.tickets.slaConfigs.update(id, data);
        message.success("Configuración SLA actualizada");
        await fetchSlaConfigs();
        return res;
      } catch (err) {
        message.error(err.message || "Error al actualizar configuración SLA");
        throw err;
      }
    },
    [fetchSlaConfigs]
  );

  const deleteSlaConfig = useCallback(
    async (id) => {
      try {
        await orchestrator.tickets.slaConfigs.delete(id);
        message.success("Configuración SLA eliminada");
        await fetchSlaConfigs();
      } catch (err) {
        message.error(err.message || "Error al eliminar configuración SLA");
        throw err;
      }
    },
    [fetchSlaConfigs]
  );

  const slaConfigOptions = useMemo(
    () =>
      slaConfigs.map((s) => ({
        value: s.id,
        label:
          s.name ||
          `${s.priority || "SLA"} · Respuesta ${s.response_time || "-"}h / Resolución ${
            s.resolution_time || "-"
          }h`,
      })),
    [slaConfigs]
  );

  return {
    slaConfigs,
    loading,
    fetchSlaConfigs,
    createSlaConfig,
    updateSlaConfig,
    deleteSlaConfig,
    slaConfigOptions,
  };
};

export default useSlaConfigs;
