import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppContext } from '../App';
import sh from '../api/sh/endpoints';
import { notification } from 'antd';

/**
 * Hook para Lazy Loading de perfiles/puntos de captación
 * 
 * Flujo:
 * 1. Al montar (si autenticado) → carga lista minimal de puntos
 * 2. Al seleccionar un punto → carga su detalle completo
 * 3. Las páginas usan el detalle cargado para renderizar
 */
export const useLazyProfile = (options = {}) => {
  const { state, dispatch } = useContext(AppContext);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedList = useRef(false);

  // 🚫 autoSelectFirst eliminado — el usuario debe elegir un punto explícitamente

  // ──────────────────────────────────────────
  // 1. Cargar lista minimal de puntos
  // ──────────────────────────────────────────
  const fetchPointsList = useCallback(async () => {
    if (!state.isAuth) return;
    if (hasFetchedList.current) return;

    setLoadingList(true);
    setError(null);
    hasFetchedList.current = true;

    const isAdmin = state.user?.is_staff || state.user?.is_superuser;

    try {
      let points;
      if (isAdmin) {
        // Admin: cargar todos los puntos del sistema
        const response = await sh.getPointsAll();
        points = response.results || response || [];
      } else {
        // Usuario normal: cargar SOLO sus puntos asignados via /api/ik/my_points/
        const response = await sh.getMyPoints();
        points = Array.isArray(response) ? response : (response.points || response.results || []);
      }

      dispatch({
        type: 'SET_POINTS_LIST',
        payload: { points_list: points }
      });

      // 🚫 NO auto-seleccionar — el usuario debe elegir explícitamente un punto
      return points;
    } catch (err) {
      console.warn('Error cargando lista de puntos:', err.message);
      setError(err);
      return null;
    } finally {
      setLoadingList(false);
    }
  }, [state.isAuth, state.user, dispatch]);

  // ──────────────────────────────────────────
  // Efecto: cargar lista al montar si está autenticado
  // ──────────────────────────────────────────
  useEffect(() => {
    if (state.isAuth) {
      // 🆕 Siempre recargar para usuarios normales (no confiar en localStorage viejo)
      const isAdmin = state.user?.is_staff || state.user?.is_superuser;
      if (!isAdmin || !state.points_list) {
        hasFetchedList.current = false;
        fetchPointsList();
      }
    }
  }, [state.isAuth, state.user, fetchPointsList]);

  // 🚫 Auto-fetch de detalle ELIMINADO — ahora es responsabilidad de PointDetailGuard
  // (usePointDetail hook) cargar el detalle completo cuando se navega a rutas
  // que lo requieren. Esto evita llamadas duplicadas a getPointDetail().
  //
  // Antes: useLazyProfile y ListWells y PointDetailGuard TODOS llamaban
  // getPointDetail() al seleccionar un punto → 3 llamadas API + re-renders
  //
  // Ahora: solo PointDetailGuard carga el detalle cuando la ruta lo necesita.

  return {
    // Estados
    loadingList,
    loading: loadingList,
    error,

    // Data
    pointsList: state.points_list,
    selectedProfile: state.selected_profile,
    hasPoints: state.points_list && state.points_list.length > 0,
    hasSelectedProfile: !!state.selected_profile?.id,

    // Acciones
    fetchPointsList,
    refresh: () => {
      hasFetchedList.current = false;
      return fetchPointsList();
    }
  };
};

export default useLazyProfile;
