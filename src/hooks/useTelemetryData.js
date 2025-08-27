import { useState, useEffect, useRef, useCallback } from "react";
import sh from "../api/sh/endpoints";

/**
 * 🚀 HOOK PERSONALIZADO PARA DATOS DE TELEMETRÍA - ARREGLADO
 *
 * Hook optimizado que evita múltiples peticiones y intervalos duplicados
 */
export const useTelemetryData = (profileId, frecuency = 1) => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [nextMeasurement, setNextMeasurement] = useState(null);

  // Referencias para controlar intervalos
  const intervalRef = useRef(null);
  const isInitialized = useRef(false);

  // Función para obtener datos de la API
  const fetchData = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener datos de telemetría directamente
      const telemetryResponse = await sh.get_data_sh(profileId);

      // Procesar datos de telemetría
      const processedData = {
        telemetry: {
          modules: telemetryResponse?.modules || {},
          lastMeasurement:
            telemetryResponse?.modules?.m1?.date_time_medition || null,
          currentData: {
            nivel: telemetryResponse?.modules?.m1?.water_table || 0,
            caudal: telemetryResponse?.modules?.m1?.flow || 0,
            acumulado: telemetryResponse?.modules?.m1?.total || 0,
            acumDia: telemetryResponse?.modules?.m1?.total_today_diff || 0,
            acumAyer: telemetryResponse?.total_consumed_yesterday || 0,
          },
          todayRegisters: telemetryResponse?.results || [],
        },
      };

      setData(processedData);

      // Calcular próxima medición basada en frecuencia
      if (frecuency && frecuency > 0) {
        const now = new Date();
        const minutesUntilNext = frecuency - (now.getMinutes() % frecuency);
        const nextTime = new Date(now.getTime() + minutesUntilNext * 60000);
        setNextMeasurement(nextTime);
      }
    } catch (err) {
      console.error("Error obteniendo datos de telemetría:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileId, frecuency]);

  // Efecto principal simplificado
  useEffect(() => {
    if (!profileId || isInitialized.current) return;

    // Marcar como inicializado para evitar múltiples ejecuciones
    isInitialized.current = true;

    // Carga inicial
    fetchData();

    // Configurar intervalo de recarga solo una vez
    const frecuencyMs = (frecuency || 1) * 60000;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, frecuencyMs);

    // Limpieza al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isInitialized.current = false;
    };
  }, [profileId, frecuency, fetchData]);

  // Función para recarga manual
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Datos principales
    data,
    loading,
    error,

    // Información de telemetría
    telemetry: data?.telemetry || null,

    // Estado de la próxima medición
    nextMeasurement,

    // Funciones de control
    refreshData,

    // Información de frecuencia
    frecuency: frecuency || 1,
    frecuencyMs: (frecuency || 1) * 60000,
  };
};
