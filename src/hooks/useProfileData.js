import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppContext } from '../App';
import sh from '../api/sh/endpoints';

/**
 * Custom hook para gestionar datos del perfil de forma centralizada
 *
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoRefresh - Si debe actualizar automáticamente
 * @param {number} options.refreshInterval - Intervalo de actualización en ms (default: 5 minutos)
 * @param {Function} options.onDataLoaded - Callback cuando se cargan datos
 * @param {boolean} options.fetchOnMount - Si debe cargar datos al montar (default: true)
 * @returns {Object} { loading, error, profile, refreshProfile }
 */
export const useProfileData = (options = {}) => {
  const { state, dispatch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutos por defecto
    onDataLoaded = null,
    fetchOnMount = true
  } = options;

  // Función para obtener datos del perfil
  const fetchProfileData = useCallback(async () => {
    if (!state.selected_profile?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await sh.get_profile();
      const allProfiles = response?.user?.catchment_points ?? [];
      const currentProfile = allProfiles.find(
        p => p.id === state.selected_profile.id
      ) || allProfiles[0];

      // Solo actualizar si hay cambios reales
      const hasChanges = JSON.stringify(currentProfile) !== JSON.stringify(state.selected_profile);

      if (hasChanges) {
        dispatch({
          type: 'UPDATE',
          payload: {
            user: response.user,
            selected_profile: currentProfile
          }
        });
      }

      if (onDataLoaded) {
        onDataLoaded(currentProfile);
      }

      return currentProfile;
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.selected_profile?.id, dispatch, onDataLoaded]);

  // Función pública para refrescar manualmente
  const refreshProfile = useCallback(() => {
    return fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    // Limpiar intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cargar datos iniciales si está habilitado
    if (fetchOnMount && state.selected_profile?.id) {
      fetchProfileData();
    }

    // Configurar auto-refresh si está habilitado
    if (autoRefresh && state.selected_profile?.id) {
      intervalRef.current = setInterval(() => {
        fetchProfileData();
      }, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.selected_profile?.id, autoRefresh, refreshInterval, fetchOnMount, fetchProfileData]);

  return {
    loading,
    error,
    profile: state.selected_profile,
    refreshProfile
  };
};

/**
 * Hook simplificado para obtener datos de telemetría del perfil actual
 *
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoRefresh - Si debe actualizar automáticamente
 * @param {number} options.refreshInterval - Intervalo de actualización en ms
 * @returns {Object} { loading, error, data, refreshData }
 */
export const useTelemetryData = (options = {}) => {
  const { state } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const intervalRef = useRef(null);

  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000 // 5 minutos por defecto
  } = options;

  const fetchTelemetryData = useCallback(async () => {
    if (!state.selected_profile?.id) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await sh.get_data_sh(state.selected_profile.id);
      setData(response);
      return response;
    } catch (err) {
      console.error('Error fetching telemetry data:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.selected_profile?.id]);

  const refreshData = useCallback(() => {
    return fetchTelemetryData();
  }, [fetchTelemetryData]);

  useEffect(() => {
    // Limpiar intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cargar datos iniciales
    if (state.selected_profile?.id) {
      fetchTelemetryData();
    }

    // Configurar auto-refresh
    if (autoRefresh && state.selected_profile?.id) {
      intervalRef.current = setInterval(() => {
        fetchTelemetryData();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.selected_profile?.id, autoRefresh, refreshInterval, fetchTelemetryData]);

  return { loading, error, data, refreshData };
};
