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
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedList = useRef(false);
  const attemptedDetailRef = useRef(null);

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

      // 🔄 FALLBACK: Usar get_profile() que ya existe en el backend
      try {
        const profileResponse = await sh.get_profile();
        const fullPoints = profileResponse?.user?.catchment_points || [];

        const minimalPoints = fullPoints.map(p => ({
          id: p.id,
          title: p.title,
          dga: p.dga ? { code_dga: p.dga.code_dga } : null,
          config_data: p.config_data ? { is_telemetry: p.config_data.is_telemetry } : null,
          profile_ikolu: p.profile_ikolu ? { entry_by_form: p.profile_ikolu.entry_by_form } : null,
          ...p,
        }));

        dispatch({
          type: 'SET_POINTS_LIST',
          payload: { points_list: minimalPoints }
        });

        dispatch({
          type: 'SET_PROFILE_CLIENT',
          payload: {
            profile_client: fullPoints,
            selected_profile: state.selected_profile || null,
          }
        });

        return minimalPoints;
      } catch (fallbackErr) {
        console.error('Fallback también falló:', fallbackErr);
        setError(fallbackErr);
        return null;
      }
    } finally {
      setLoadingList(false);
    }
  }, [state.isAuth, state.user, state.selected_profile, dispatch]);

  // ──────────────────────────────────────────
  // 2. Cargar detalle completo de un punto
  // ──────────────────────────────────────────
  const fetchPointDetail = useCallback(async (pointId) => {
    if (!pointId) return null;

    setLoadingDetail(true);
    setError(null);

    try {
      const detail = await sh.getPointDetail(pointId);

      // 🛡️ Solo guardar si el detalle tiene id válido
      if (detail && detail.id) {
        dispatch({
          type: 'SET_SELECTED_PROFILE_DETAIL',
          payload: { selected_profile: detail }
        });
      } else {
        console.warn(`Detalle del punto ${pointId} incompleto, no se actualiza estado`);
      }

      return detail;
    } catch (err) {
      console.error(`Error cargando detalle del punto ${pointId}:`, err);
      setError(err);

      // Notificación silenciosa (no molestar al usuario)
      if (err?.response?.status === 404) {
        notification.error({
          message: 'Punto no encontrado',
          description: `El punto de captación #${pointId} no existe o no tienes acceso.`
        });
      }

      // 🛡️ No limpiar selected_profile si el endpoint falla
      return null;
    } finally {
      setLoadingDetail(false);
    }
  }, [dispatch]);

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

  // ──────────────────────────────────────────
  // Efecto: cuando cambia selected_profile sin detalle completo, cargarlo
  // ──────────────────────────────────────────
  useEffect(() => {
    const sp = state.selected_profile;
    // Si tenemos un punto seleccionado pero no tiene config_data (faltan detalles)
    if (sp?.id && !sp?.config_data && !loadingDetail && attemptedDetailRef.current !== sp.id) {
      attemptedDetailRef.current = sp.id;
      fetchPointDetail(sp.id);
    }
  }, [state.selected_profile?.id, loadingDetail, fetchPointDetail]);

  // Resetear attemptedDetailRef cuando cambia el punto seleccionado
  useEffect(() => {
    if (state.selected_profile?.id && attemptedDetailRef.current !== state.selected_profile.id) {
      attemptedDetailRef.current = null;
    }
  }, [state.selected_profile?.id]);

  return {
    // Estados
    loadingList,
    loadingDetail,
    loading: loadingList || loadingDetail,
    error,

    // Data
    pointsList: state.points_list,
    selectedProfile: state.selected_profile,
    hasPoints: state.points_list && state.points_list.length > 0,
    hasSelectedProfile: !!state.selected_profile?.id,

    // Acciones
    fetchPointsList,
    fetchPointDetail,
    refresh: () => {
      hasFetchedList.current = false;
      return fetchPointsList();
    }
  };
};

export default useLazyProfile;
