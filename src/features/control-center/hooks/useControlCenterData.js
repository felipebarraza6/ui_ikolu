import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "../../../contexts/AuthContext";
import orchestrator from "../../../api/orchestrator";
import { transformDashboardStats } from "../utils/transformDashboardStats";

export const useControlCenterData = (options = {}) => {
  const { isAuth } = useAuth();
  const { dateRange, selectedProject, selectedDate } = options;

  const [baseData, setBaseData] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [listData, setListData] = useState(null);
  const [listPage, setListPage] = useState(1);
  const [listOrderBy, setListOrderBy] = useState(null);
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loading = loadingBase || loadingDaily;
  const listLoading = loadingList;

  const data = useMemo(() => {
    if (!baseData) return null;
    return { ...baseData, daily_summary: dailySummary };
  }, [baseData, dailySummary]);

  // Carga base: KPIs, proyectos, chat, tabla legacy de telemetry/compliance.
  const fetchBaseData = useCallback(async (signal, silent = false) => {
    if (!isAuth) return;
    if (!silent) setLoadingBase(true);

    try {
      const [rawGeneral, rawDashboard, rawCompliance] = await Promise.all([
        orchestrator.controlCenterGeneralStats(signal).catch((err) => {
          console.warn("[useControlCenterData] Endpoint general_stats no disponible:", err?.message || err);
          return null;
        }),
        orchestrator.dashboardStats(signal),
        orchestrator.compliance(signal).catch((err) => {
          console.warn("[useControlCenterData] Endpoint compliance no disponible:", err?.message || err);
          return null;
        }),
      ]);

      if (!mountedRef.current) return;

      const transformed = transformDashboardStats(rawDashboard, rawCompliance, rawGeneral, null);
      setBaseData(transformed);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError(err);
    } finally {
      setLoadingBase(false);
    }
  }, [selectedProject]);

  // Carga liviana: cuadritos de días.
  const fetchDailySummary = useCallback(async (signal) => {
    if (!isAuth) return;
    setLoadingDaily(true);

    try {
      const dailyParams = {};
      if (dateRange?.startDate) dailyParams.start_date = dateRange.startDate;
      if (dateRange?.endDate) dailyParams.end_date = dateRange.endDate;
      if (selectedProject) dailyParams.project_id = selectedProject;

      const rawDailySummary = await orchestrator.controlCenterDailySummary(dailyParams, signal).catch((err) => {
        console.warn("[useControlCenterData] Endpoint daily_summary no disponible:", err?.message || err);
        return null;
      });

      if (!mountedRef.current) return;

      setDailySummary(rawDailySummary);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError(err);
    } finally {
      setLoadingDaily(false);
    }
  }, [dateRange?.startDate, dateRange?.endDate, selectedProject]);

  // Carga de la tabla: lista paginada de puntos del día seleccionado.
  const fetchList = useCallback(async (signal, page = listPage, orderBy = listOrderBy) => {
    if (!isAuth) return;

    const date = selectedDate || format(new Date(), "yyyy-MM-dd");
    if (!date) return;

    setLoadingList(true);

    try {
      const params = { date, page };
      if (selectedProject) params.project_id = selectedProject;
      if (orderBy) params.order_by = orderBy;

      const rawList = await orchestrator.controlCenterList(params, signal).catch((err) => {
        console.warn("[useControlCenterData] Endpoint list no disponible:", err?.message || err);
        return null;
      });

      if (!mountedRef.current) return;

      setListData(rawList);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError(err);
    } finally {
      setLoadingList(false);
    }
  }, [selectedDate, selectedProject, listPage, listOrderBy]);

  // Carga inicial
  useEffect(() => {
    if (!isAuth) return;
    const controller = new AbortController();
    fetchBaseData(controller.signal);
    fetchDailySummary(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  // Recargar base cuando cambia el proyecto
  useEffect(() => {
    if (!isAuth) return;
    const controller = new AbortController();
    fetchBaseData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, selectedProject]);

  // Recargar daily summary cuando cambia fecha o proyecto
  useEffect(() => {
    if (!isAuth) return;
    const controller = new AbortController();
    fetchDailySummary(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, dateRange?.startDate, dateRange?.endDate, selectedProject]);

  // Recargar lista cuando cambia fecha, proyecto, página u ordenamiento
  useEffect(() => {
    if (!isAuth) return;
    const controller = new AbortController();
    fetchList(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, selectedDate, selectedProject, listPage, listOrderBy]);

  // Auto-refresh silencioso cada 20 minutos
  useEffect(() => {
    if (!isAuth) return;
    const interval = setInterval(() => {
      const controller = new AbortController();
      fetchBaseData(controller.signal, true);
      fetchDailySummary(controller.signal);
      fetchList(controller.signal);
    }, 1200000);
    return () => clearInterval(interval);
  }, [isAuth, fetchBaseData, fetchDailySummary, fetchList]);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    fetchBaseData(controller.signal);
    fetchDailySummary(controller.signal);
    fetchList(controller.signal);
  }, [fetchBaseData, fetchDailySummary, fetchList]);

  return {
    data,
    loading,
    listLoading,
    error,
    lastRefresh,
    refresh,
    listData,
    listPage,
    setListPage,
    listOrderBy,
    setListOrderBy,
    isReady: !!data && !loading,
  };
};
