import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "../../../contexts/AuthContext";
import orchestrator from "../../../api/orchestrator";
import { transformDashboardStats } from "../utils/transformDashboardStats";

export const useControlCenterData = (options = {}) => {
  const { isAuth } = useAuth();
  const { dateRange, selectedProject, selectedDate, activeTab } = options;

  const [baseData, setBaseData] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [listData, setListData] = useState(null);
  const [listPage, setListPage] = useState(1);
  const [listOrderBy, setListOrderBy] = useState(null);
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCompliance, setLoadingCompliance] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const mountedRef = useRef(true);

  // Estados de paginación/sorting/búsqueda para compliance.
  const [complianceData, setComplianceData] = useState(null);
  const [compliancePage, setCompliancePage] = useState(1);
  const [compliancePageSize, setCompliancePageSize] = useState(10);
  const [complianceCount, setComplianceCount] = useState(0);
  const [complianceOrderBy, setComplianceOrderBy] = useState(null);
  const [complianceSearch, setComplianceSearch] = useState("");

  // Refs para mantener datos parciales entre renders y reconstruir el objeto unificado.
  const generalStatsRef = useRef(null);
  const complianceRawRef = useRef(null);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const rebuildData = useCallback(() => {
    const transformed = transformDashboardStats(
      null,
      complianceRawRef.current,
      generalStatsRef.current,
      dailySummary
    );
    if (mountedRef.current) {
      setBaseData(transformed);
    }
  }, [dailySummary]);

  const loading = loadingBase || loadingDaily;
  const listLoading = loadingList;

  const data = useMemo(() => {
    // Si no hay ni base ni compliance, no hay datos.
    if (!baseData && !complianceData) return null;

    const today = new Date();
    const base = baseData || {
      meta: {
        date: format(today, "yyyy-MM-dd"),
        timezone: "America/Santiago",
      },
      overview: {},
      consumption: {},
      service_status: {},
      points: [],
      last_7: {},
      recent_warnings: {},
      recent_warnings_list: [],
      compliance_stats: {},
      chat_quota: null,
      projects: [],
      daily_summary: null,
    };

    return {
      ...base,
      daily_summary: dailySummary ?? base.daily_summary,
      // Sobrescribir points con la página actual de compliance cuando aplica.
      // Si complianceData.results existe, se usa; si no, se conserva baseData.points.
      points: complianceData?.results ?? base.points ?? [],
      compliancePagination: {
        count: complianceCount,
        page: compliancePage,
        pageSize: compliancePageSize,
        orderBy: complianceOrderBy,
        search: complianceSearch,
      },
    };
  }, [baseData, dailySummary, complianceData, complianceCount, compliancePage, compliancePageSize, complianceOrderBy, complianceSearch]);

  // Carga base: KPIs, proyectos y chat_quota.
  const fetchBaseData = useCallback(async (signal, silent = false) => {
    if (!isAuth) return;
    if (!silent) setLoadingBase(true);

    try {
      const rawGeneral = await orchestrator.controlCenterGeneralStats(signal).catch((err) => {
        console.warn("[useControlCenterData] Endpoint general_stats no disponible:", err?.message || err);
        return null;
      });

      if (!mountedRef.current) return;

      // Fallback a dashboard_stats solo si general_stats no trae KPIs ni proyectos.
      const hasData = rawGeneral && (
        rawGeneral.overview?.total_points != null ||
        rawGeneral.points?.total != null ||
        Array.isArray(rawGeneral.projects)
      );

      let mergedGeneral = rawGeneral;
      if (!hasData) {
        const rawDashboard = await orchestrator.dashboardStats(signal).catch((err) => {
          console.warn("[useControlCenterData] Fallback dashboard_stats no disponible:", err?.message || err);
          return null;
        });
        if (rawDashboard) {
          mergedGeneral = { ...rawDashboard, ...rawGeneral };
        }
      }

      generalStatsRef.current = mergedGeneral;
      rebuildData();
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError(err);
    } finally {
      setLoadingBase(false);
    }
  }, [rebuildData]);

  // Carga de compliance: GET /api/ik/compliance/?page=&page_size=&project_id=&search=&order_by=
  // Soporta respuesta paginada { count, results } o plana { points }.
  const fetchCompliance = useCallback(async (signal, silent = false) => {
    if (!isAuth) return;
    if (!silent) setLoadingCompliance(true);

    try {
      const params = {
        page: compliancePage,
        page_size: compliancePageSize,
        order_by: complianceOrderBy,
        search: complianceSearch,
        project_id: selectedProject,
      };

      const rawCompliance = await orchestrator.complianceList(params, signal).catch((err) => {
        console.warn("[useControlCenterData] Endpoint compliance no disponible:", err?.message || err);
        return null;
      });

      if (!mountedRef.current) return;

      if (rawCompliance && Array.isArray(rawCompliance.results)) {
        setComplianceData(rawCompliance);
        // Leer count de cualquier campo común para ser flexible con el backend.
        const totalCount =
          rawCompliance.count ??
          rawCompliance.total ??
          rawCompliance.total_count ??
          rawCompliance.results.length;
        setComplianceCount(totalCount);
      } else {
        setComplianceData(null);
        setComplianceCount(0);
      }

      complianceRawRef.current = rawCompliance;
      rebuildData();
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError(err);
    } finally {
      setLoadingCompliance(false);
    }
  }, [rebuildData, compliancePage, compliancePageSize, complianceOrderBy, complianceSearch, selectedProject]);

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

  // Carga inicial: solo base, daily summary y list.
  useEffect(() => {
    if (!isAuth || initialLoadDoneRef.current) return;
    const controller = new AbortController();
    fetchBaseData(controller.signal);
    fetchDailySummary(controller.signal);
    fetchList(controller.signal);
    initialLoadDoneRef.current = true;
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  // Recargar base cuando cambia el proyecto (solo después de la carga inicial).
  useEffect(() => {
    if (!isAuth || !initialLoadDoneRef.current) return;
    const controller = new AbortController();
    fetchBaseData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, selectedProject]);

  // Recargar daily summary cuando cambia fecha o proyecto.
  useEffect(() => {
    if (!isAuth || !initialLoadDoneRef.current) return;
    const controller = new AbortController();
    fetchDailySummary(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, dateRange?.startDate, dateRange?.endDate, selectedProject]);

  // Recargar lista cuando cambia fecha, proyecto, página u ordenamiento.
  useEffect(() => {
    if (!isAuth || !initialLoadDoneRef.current) return;
    const controller = new AbortController();
    fetchList(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, selectedDate, selectedProject, listPage, listOrderBy]);

  // Cargar compliance solo cuando la pestaña activa es compliance o cambian filtros/paginación.
  useEffect(() => {
    if (!isAuth || activeTab !== "compliance") return;
    const controller = new AbortController();
    fetchCompliance(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, activeTab, selectedProject, compliancePage, compliancePageSize, complianceOrderBy, complianceSearch]);

  // Auto-refresh silencioso cada 20 minutos (solo endpoints que ya están activos).
  useEffect(() => {
    if (!isAuth) return;
    const interval = setInterval(() => {
      const controller = new AbortController();
      fetchBaseData(controller.signal, true);
      fetchDailySummary(controller.signal);
      fetchList(controller.signal);
      if (activeTab === "compliance") {
        fetchCompliance(controller.signal, true);
      }
    }, 1200000);
    return () => clearInterval(interval);
  }, [isAuth, fetchBaseData, fetchDailySummary, fetchList, fetchCompliance, activeTab]);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    fetchBaseData(controller.signal);
    fetchDailySummary(controller.signal);
    fetchList(controller.signal);
    if (activeTab === "compliance") {
      fetchCompliance(controller.signal);
    }
  }, [fetchBaseData, fetchDailySummary, fetchList, fetchCompliance, activeTab]);

  const refreshList = useCallback(() => {
    const controller = new AbortController();
    fetchList(controller.signal);
  }, [fetchList]);

  return {
    data,
    loading,
    listLoading,
    complianceLoading: loadingCompliance,
    error,
    lastRefresh,
    refresh,
    refreshList,
    listData,
    listPage,
    setListPage,
    listOrderBy,
    setListOrderBy,
    complianceData,
    compliancePage,
    setCompliancePage,
    compliancePageSize,
    setCompliancePageSize,
    complianceCount,
    complianceOrderBy,
    setComplianceOrderBy,
    complianceSearch,
    setComplianceSearch,
    isReady: !!data && !loading,
  };
};

export default useControlCenterData;
