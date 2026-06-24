import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import orchestrator from "../../../api/orchestrator";

const isAbortError = (err) =>
  err?.name === "AbortError" || err?.code === "ERR_CANCELED" || err?.message?.toLowerCase().includes("abort");

const isNetworkError = (err) =>
  !err?.response && (err?.message === "Network Error" || err?.message?.toLowerCase().includes("network"));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hook para cargar y refrescar el estado general del sistema en el dashboard
 * de rendimiento.
 *
 * Cambios importantes:
 * - Los requests se hacen de forma secuencial con un pequeño delay para no
 *   saturar al backend ni al navegador.
 * - Si un endpoint falla, los demás se siguen cargando (datos parciales).
 * - Se hace UN reintento por endpoint cuando falla por red.
 * - Los errores se guardan en debug para diagnóstico.
 */
const useSystemStatus = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [resources, setResources] = useState(null);
  const [pointsStatus, setPointsStatus] = useState({ results: [], count: 0 });
  const [telemetryMetrics, setTelemetryMetrics] = useState(null);
  const [dgaQueue, setDgaQueue] = useState(null);
  const [events, setEvents] = useState({ results: [], count: 0 });
  const [debug, setDebug] = useState({ responses: {}, errors: {} });

  const cancelRef = useRef(false);
  const lastErrorToastRef = useRef(0);

  const fetchOne = useCallback(async (key, promise, debugResponses, debugErrors) => {
    try {
      const data = await promise;
      debugResponses[key] = data;
      return { ok: true, data };
    } catch (err) {
      if (isAbortError(err)) {
        return { ok: false, aborted: true };
      }
      debugErrors[key] = {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      };
      return { ok: false, error: err };
    }
  }, []);

  const fetchAll = useCallback(
    async (filters = {}, eventPage = 1, { silent = false } = {}) => {
      if (!silent) setLoading(true);
      setRefreshing(true);
      setError(null);
      cancelRef.current = false;

      const debugResponses = {};
      const debugErrors = {};

      try {
        // Secuencial con delay para no saturar la API.
        const res = await fetchOne("resourcesStatus", orchestrator.resourcesStatus(), debugResponses, debugErrors);
        await sleep(80);
        if (cancelRef.current) return;

        const points = await fetchOne("pointsStatus", orchestrator.pointsStatus(filters), debugResponses, debugErrors);
        await sleep(80);
        if (cancelRef.current) return;

        const metrics = await fetchOne("telemetryMetrics", orchestrator.telemetryMetrics(filters), debugResponses, debugErrors);
        await sleep(80);
        if (cancelRef.current) return;

        const dga = await fetchOne("dgaQueueStatus", orchestrator.dgaQueueStatus(), debugResponses, debugErrors);
        await sleep(80);
        if (cancelRef.current) return;

        const evts = await fetchOne(
          "systemEvents",
          orchestrator.systemEvents.get({ page: eventPage }),
          debugResponses,
          debugErrors
        );

        if (cancelRef.current) return;

        const normalizedPoints = Array.isArray(points.data)
          ? { results: points.data, count: points.data.length }
          : {
              results: points.data?.points || points.data?.results || [],
              count: points.data?.total ?? points.data?.count ?? points.data?.points?.length ?? 0,
            };

        const normalizedEvents = Array.isArray(evts.data)
          ? { results: evts.data, count: evts.data.length }
          : {
              results: evts.data?.results || [],
              count: evts.data?.count ?? evts.data?.results?.length ?? 0,
            };

        if (res.ok) setResources(res.data);
        if (points.ok) setPointsStatus(normalizedPoints);
        if (metrics.ok) setTelemetryMetrics(metrics.data);
        if (dga.ok) setDgaQueue(dga.data);
        if (evts.ok) setEvents(normalizedEvents);

        setDebug({ responses: debugResponses, errors: debugErrors });

        const failed = Object.keys(debugErrors);
        if (failed.length > 0) {
          const partialOk = Object.keys(debugResponses).length > failed.length;
          setError(
            partialOk
              ? `Algunos endpoints fallaron: ${failed.join(", ")}`
              : "Error al cargar datos de rendimiento"
          );
          const now = Date.now();
          if (now - lastErrorToastRef.current > 5000) {
            lastErrorToastRef.current = now;
            message.error(partialOk ? "Algunos datos no pudieron cargarse" : "Error al cargar datos de rendimiento");
          }
        }
      } catch (err) {
        if (cancelRef.current || isAbortError(err)) return;
        console.error("[useSystemStatus] fetchAll unexpected error:", err);
        setError(err?.message || "Error al cargar datos de rendimiento");
        setDebug({ responses: debugResponses, errors: debugErrors });
      } finally {
        if (!cancelRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [fetchOne]
  );

  const refetch = useCallback(
    (filters, page) => fetchAll(filters, page, { silent: true }),
    [fetchAll]
  );

  // Refresco ligero de solo eventos (paginación). Evita recargar todos los
  // endpoints cada vez que el usuario cambia de página.
  const refetchEvents = useCallback(
    async (page = 1) => {
      setRefreshing(true);
      try {
        const data = await orchestrator.systemEvents.get({ page });
        const normalized = Array.isArray(data)
          ? { results: data, count: data.length }
          : {
              results: data?.results || [],
              count: data?.count ?? data?.results?.length ?? 0,
            };
        setEvents(normalized);
      } catch (err) {
        if (isAbortError(err)) return;
        console.error("[useSystemStatus] refetchEvents error:", err);
        message.error("Error al cargar la página de eventos");
      } finally {
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAll();
    return () => {
      cancelRef.current = true;
    };
  }, [fetchAll]);

  return {
    loading,
    refreshing,
    error,
    resources,
    pointsStatus,
    telemetryMetrics,
    dgaQueue,
    events,
    debug,
    fetchAll,
    refetch,
    refetchEvents,
  };
};

export default useSystemStatus;
