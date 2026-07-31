import { useState, useEffect, useCallback, useMemo } from "react";
import { message } from "antd";
import orchestrator from "../../../api/orchestrator";

/**
 * Normaliza la respuesta del endpoint /api/ik/tickets/dashboard/
 * para que el frontend la consuma de forma uniforme.
 */
const normalizeDashboard = (res) => {
  const kpis = res?.kpis || {};
  const charts = res?.charts || {};
  const tables = res?.tables || {};

  return {
    kpis,
    charts,
    tables,
    meta: res?.meta || res?.metadata || null,
    // Compatibilidad con la estructura anterior de stats
    stats: {
      total: kpis.tickets ?? 0,
      by_status: charts.by_status || {},
      by_priority: charts.by_priority || {},
      by_category_type: charts.by_category_type || {},
      by_origin: charts.by_origin || {},
      compliance: {
        total: kpis.compliance_total ?? 0,
        by_status: charts.compliance_by_status || {},
        sla_overdue_resolution: kpis.compliance_overdue ?? 0,
        sla_overdue_response: 0,
      },
    },
  };
};

/**
 * Hook para el dashboard de indicadores de tickets.
 *
 * Ahora consume un único endpoint:
 * - GET /api/ik/tickets/dashboard/
 */
export const useTicketIndicators = (options = {}) => {
  const { autoLoad = true } = options;

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async (params = {}) => {
    try {
      const res = await orchestrator.tickets.dashboard(params);
      const normalized = normalizeDashboard(res);
      setDashboard(normalized);
      return normalized;
    } catch (err) {
      console.error("[useTicketIndicators] dashboard error:", err);
      message.error(err.message || "Error al cargar el dashboard de tickets");
      return normalizeDashboard({});
    }
  }, []);

  const refresh = useCallback(
    async (params = {}) => {
      setLoading(true);
      await fetchDashboard(params);
      setLoading(false);
    },
    [fetchDashboard]
  );

  useEffect(() => {
    if (autoLoad) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  const realCount = dashboard?.kpis?.tickets ?? 0;
  const realOpenCount = dashboard?.kpis?.active_tickets ?? 0;

  const overdueSlaTickets = useMemo(
    () => dashboard?.tables?.sla_resolution_overdue || [],
    [dashboard?.tables?.sla_resolution_overdue]
  );

  const overdueResponseTickets = useMemo(
    () => dashboard?.tables?.sla_response_overdue || [],
    [dashboard?.tables?.sla_response_overdue]
  );

  const overdueComplianceTickets = useMemo(
    () => dashboard?.tables?.compliance_overdue || [],
    [dashboard?.tables?.compliance_overdue]
  );

  const distributionByOrigin = useMemo(
    () => ({
      real: {
        status: dashboard?.charts?.by_status || {},
        priority: dashboard?.charts?.by_priority || {},
        categoryType: dashboard?.charts?.by_category_type || {},
      },
      internal: {
        status: {},
        priority: {},
        categoryType: {},
      },
    }),
    [dashboard?.charts?.by_status, dashboard?.charts?.by_priority, dashboard?.charts?.by_category_type]
  );

  const workOrderStats = useMemo(
    () => ({
      total: dashboard?.kpis?.work_orders_total ?? 0,
      withVisit: dashboard?.kpis?.work_orders_with_visit ?? 0,
      withoutVisit: (dashboard?.kpis?.work_orders_total ?? 0) - (dashboard?.kpis?.work_orders_with_visit ?? 0),
    }),
    [dashboard?.kpis?.work_orders_total, dashboard?.kpis?.work_orders_with_visit]
  );

  return {
    dashboard,
    meta: dashboard?.meta || null,
    stats: dashboard?.stats || null,
    realTickets: [],
    internalTickets: [],
    complianceTickets: overdueComplianceTickets,
    workOrderTickets: [],
    workOrderStats,
    realCount,
    realOpenCount,
    overdueSlaTickets,
    overdueResponseTickets,
    overdueComplianceTickets,
    distributionByOrigin,
    loading,
    refresh,
    fetchDashboard,
  };
};

export default useTicketIndicators;
