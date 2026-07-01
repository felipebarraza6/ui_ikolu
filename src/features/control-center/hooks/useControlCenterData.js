import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "../../../contexts/AuthContext";
import orchestrator from "../../../api/orchestrator";
import { dataCache } from "../../../utils/dataCache";
import { transformDashboardStats } from "../utils/transformDashboardStats";

export const useControlCenterData = (options = {}) => {
  const { isAuth } = useAuth();
  const { dateRange, selectedProject, selectedDate, activeTab } = options;

  const [baseData, setBaseData] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [listData, setListData] = useState(null);
  const [listPage, setListPage] = useState(1);
  const [listOrderBy, setListOrderBy] = useState("warnings_count_desc");
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCompliance, setLoadingCompliance] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);

  // Estados de paginación/sorting/búsqueda para compliance.
  const [complianceData, setComplianceData] = useState(null);
  const [compliancePage, setCompliancePage] = useState(1);
  const [compliancePageSize, setCompliancePageSize] = useState(10);
  const [complianceCount, setComplianceCount] = useState(0);
  const [complianceOrderBy, setComplianceOrderBy] = useState("default");
  const [complianceSearch, setComplianceSearch] = useState("");
  const [complianceStandard, setComplianceStandard] = useState("");
  const [complianceNature, setComplianceNature] = useState("");

  // Refs para mantener datos parciales entre renders y reconstruir el objeto unificado.
  const generalStatsRef = useRef(null);
  const complianceRawRef = useRef(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Resetear carga inicial al hacer logout para que vuelva a cargar en el próximo login.
  useEffect(() => {
    if (!isAuth) setInitialLoadDone(false);
  }, [isAuth]);

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

  // Transformar los puntos raw de compliance para que tengan el shape esperado por la UI.
  const compliancePoints = useMemo(() => {
    if (!complianceData) return null;
    const rawList = complianceData.results || complianceData.points;
    if (!Array.isArray(rawList)) return null;
    const transformed = transformDashboardStats(null, complianceData, null, null);
    return transformed?.points || null;
  }, [complianceData]);

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
      // Sobrescribir points con la página actual de compliance transformada.
      points: compliancePoints ?? base.points ?? [],
      compliancePagination: {
        count: complianceCount,
        page: compliancePage,
        pageSize: compliancePageSize,
        orderBy: complianceOrderBy,
        search: complianceSearch,
      },
    };
  }, [baseData, dailySummary, complianceData, compliancePoints, complianceCount, compliancePage, compliancePageSize, complianceOrderBy, complianceSearch]);

  // Carga base: KPIs, proyectos y chat_quota.
  const fetchBaseData = useCallback(async (signal, silent = false) => {
    if (!isAuth) return;
    if (!silent) setLoadingBase(true);

    try {
      const rawGeneral = await orchestrator.controlCenterGeneralStats(signal).catch((err) => {
        if (err.name === "AbortError" || err?.message?.includes("canceled")) throw err;
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
          if (err.name === "AbortError" || err?.message?.includes("canceled")) throw err;
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
      if (complianceStandard) params.standard = complianceStandard;
      if (complianceNature) params.type_dga = complianceNature;

      const rawCompliance = await orchestrator.complianceList(params, signal).catch((err) => {
        if (err.name === "AbortError" || err?.message?.includes("canceled")) throw err;
        console.warn("[useControlCenterData] Endpoint compliance no disponible:", err?.message || err);
        return null;
      });

      if (!mountedRef.current) return;

      // El backend puede devolver los puntos en 'results' o en 'points'.
      const complianceResults = rawCompliance?.results || rawCompliance?.points;
      if (rawCompliance && Array.isArray(complianceResults)) {
        setComplianceData(rawCompliance);
        // Leer count de cualquier campo común para ser flexible con el backend.
        const totalCount =
          rawCompliance.count ??
          rawCompliance.total ??
          rawCompliance.total_count ??
          complianceResults.length;
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
  }, [rebuildData, compliancePage, compliancePageSize, complianceOrderBy, complianceSearch, complianceStandard, complianceNature, selectedProject]);

  // Carga liviana: cuadritos de días.
  const fetchDailySummary = useCallback(async (signal, silent = false) => {
    if (!isAuth) return;
    if (!silent) setLoadingDaily(true);

    try {
      const dailyParams = {};
      if (dateRange?.startDate) dailyParams.start_date = dateRange.startDate;
      if (dateRange?.endDate) dailyParams.end_date = dateRange.endDate;
      if (selectedProject) dailyParams.project_id = selectedProject;

      const rawDailySummary = await orchestrator.controlCenterDailySummary(dailyParams, signal).catch((err) => {
        if (err.name === "AbortError" || err?.message?.includes("canceled")) throw err;
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
  const fetchList = useCallback(async (signal, page = listPage, orderBy = listOrderBy, silent = false) => {
    if (!isAuth) return;

    const date = selectedDate || format(new Date(), "yyyy-MM-dd");
    if (!date) return;

    if (!silent) setLoadingList(true);

    try {
      const params = { date, page };
      if (selectedProject) params.project_id = selectedProject;
      if (orderBy) params.order_by = orderBy;

      const rawList = await orchestrator.controlCenterList(params, signal).catch((err) => {
        if (err.name === "AbortError" || err?.message?.includes("canceled")) throw err;
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

  // Carga inicial: según la pestaña activa.
  // Se marca initialLoadDone solo cuando las peticiones iniciales terminan de verdad;
  // si el efecto se limpia por un re-render o desmontaje (abort), no se marca para
  // permitir que la siguiente ejecución vuelva a intentar cargar los datos.
  useEffect(() => {
    if (!isAuth || initialLoadDone) return;
    const controller = new AbortController();
    let aborted = false;

    const loadInitial = async () => {
      try {
        await fetchBaseData(controller.signal);
        if (activeTab === "compliance") {
          await fetchCompliance(controller.signal);
        } else {
          await Promise.all([
            fetchDailySummary(controller.signal),
            fetchList(controller.signal),
          ]);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !err?.message?.includes("canceled")) {
          console.error("[useControlCenterData] Error en carga inicial:", err);
        }
      } finally {
        if (mountedRef.current && !aborted) {
          setInitialLoadDone(true);
        }
      }
    };

    loadInitial();
    return () => {
      aborted = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, initialLoadDone, activeTab]);

  // Recargar base cuando cambia el proyecto (solo después de la carga inicial).
  useEffect(() => {
    if (!isAuth || !initialLoadDone) return;
    const controller = new AbortController();
    fetchBaseData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, initialLoadDone, selectedProject]);

  // Recargar daily summary cuando cambia fecha o proyecto (solo en telemetry).
  useEffect(() => {
    if (!isAuth || !initialLoadDone || activeTab !== "telemetry") return;
    const controller = new AbortController();
    fetchDailySummary(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, initialLoadDone, activeTab, dateRange?.startDate, dateRange?.endDate, selectedProject]);

  // Recargar lista cuando cambia fecha, proyecto, página u ordenamiento (solo en telemetry).
  useEffect(() => {
    if (!isAuth || !initialLoadDone || activeTab !== "telemetry") return;
    const controller = new AbortController();
    fetchList(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, initialLoadDone, activeTab, selectedDate, selectedProject, listPage, listOrderBy]);

  // Cargar compliance cuando la pestaña activa es compliance y no hay datos,
  // o cuando cambian filtros/paginación.
  useEffect(() => {
    if (!isAuth || activeTab !== "compliance") return;
    const controller = new AbortController();
    fetchCompliance(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, activeTab, selectedProject, compliancePage, compliancePageSize, complianceOrderBy, complianceSearch, complianceStandard, complianceNature, initialLoadDone]);

  // Fallback: si entramos directo a compliance y no hay datos, forzar carga.
  useEffect(() => {
    if (!isAuth || activeTab !== "compliance" || complianceData) return;
    const controller = new AbortController();
    fetchCompliance(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, activeTab, complianceData]);

  // Auto-refresh silencioso cada 60 segundos (unificado con useControlCenter).
  useEffect(() => {
    if (!isAuth) return;
    const interval = setInterval(() => {
      const controller = new AbortController();
      fetchBaseData(controller.signal, true);
      if (activeTab === "telemetry") {
        fetchDailySummary(controller.signal, true);
        fetchList(controller.signal, listPage, listOrderBy, true);
      }
      if (activeTab === "compliance") {
        fetchCompliance(controller.signal, true);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuth, fetchBaseData, fetchDailySummary, fetchList, fetchCompliance, activeTab, listPage, listOrderBy]);

  const refresh = useCallback(async () => {
    // Invalidar caché del Centro de Control para forzar peticiones reales y mostrar skeleton.
    dataCache.invalidatePattern("cc_");
    setIsRefreshing(true);
    const controller = new AbortController();
    try {
      const promises = [fetchBaseData(controller.signal)];
      if (activeTab === "telemetry") {
        promises.push(fetchDailySummary(controller.signal));
        promises.push(fetchList(controller.signal));
      }
      if (activeTab === "compliance") {
        promises.push(fetchCompliance(controller.signal));
      }
      await Promise.all(promises);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchBaseData, fetchDailySummary, fetchList, fetchCompliance, activeTab]);

  const refreshList = useCallback(() => {
    dataCache.invalidatePattern("cc_list_");
    const controller = new AbortController();
    fetchList(controller.signal);
  }, [fetchList]);

  return {
    data,
    loading,
    listLoading,
    complianceLoading: loadingCompliance,
    isRefreshing,
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
    complianceStandard,
    setComplianceStandard,
    complianceNature,
    setComplianceNature,
    isReady: !!data && !loading,
  };
};

export default useControlCenterData;
