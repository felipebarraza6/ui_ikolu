import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import orchestrator from "../../../api/orchestrator";

/**
 * Normaliza la respuesta del endpoint /api/ik/tickets/ranking/
 * para que el frontend la consuma de forma uniforme.
 */
const normalizeRanking = (res) => ({
  byResolved: res?.by_resolved || [],
  byAssigned: res?.by_assigned || [],
  byCreated: res?.by_created || [],
  bySlaResolutionOverdue: res?.by_sla_resolution_overdue || [],
  bySlaResponseOverdue: res?.by_sla_response_overdue || [],
  meta: res?.meta || res?.metadata || null,
});

/**
 * Hook para el ranking de personas de tickets (soporte/SLA).
 *
 * Consume un único endpoint:
 * - GET /api/ik/tickets/ranking/
 *
 * Las tres dimensiones son independientes: la misma persona puede
 * aparecer en varias listas. Siempre se debe enviar el rango de fecha
 * visible (created_at__gte / created_at__lte), igual que el dashboard.
 */
export const useTicketRanking = (options = {}) => {
  const { autoLoad = true } = options;

  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRanking = useCallback(async (params = {}) => {
    try {
      const res = await orchestrator.tickets.ranking(params);
      const normalized = normalizeRanking(res);
      setRanking(normalized);
      return normalized;
    } catch (err) {
      console.error("[useTicketRanking] ranking error:", err);
      message.error(err.message || "Error al cargar el ranking de colaboradores");
      return normalizeRanking({});
    }
  }, []);

  const refresh = useCallback(
    async (params = {}) => {
      setLoading(true);
      await fetchRanking(params);
      setLoading(false);
    },
    [fetchRanking]
  );

  useEffect(() => {
    if (autoLoad) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  return {
    ranking,
    meta: ranking?.meta || null,
    byResolved: ranking?.byResolved || [],
    byAssigned: ranking?.byAssigned || [],
    byCreated: ranking?.byCreated || [],
    bySlaResolutionOverdue: ranking?.bySlaResolutionOverdue || [],
    bySlaResponseOverdue: ranking?.bySlaResponseOverdue || [],
    loading,
    refresh,
    fetchRanking,
  };
};

export default useTicketRanking;
