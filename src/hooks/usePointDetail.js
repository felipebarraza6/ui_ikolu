import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppContext } from '../App';
import sh from '../api/sh/endpoints';

/**
 * Hook para asegurar que el detalle completo del punto seleccionado esté cargado.
 * Las páginas lo usan para esperar a tener config_data, dga, profile_ikolu, etc.
 * 
 * 🛡️ FIX: No entrar en loop infinito si el punto no tiene detalle completo
 * (puntos de my_points vienen sin config_data/dga/profile_ikolu).
 */
export const usePointDetail = () => {
  const { state, dispatch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const attemptedRef = useRef(null); // ID del punto para el que ya intentamos cargar

  const selectedProfile = state.selected_profile;
  const hasDetail = selectedProfile && 
    selectedProfile.id && 
    selectedProfile.config_data && 
    selectedProfile.dga &&
    selectedProfile.profile_ikolu;

  const loadDetail = useCallback(async () => {
    if (!selectedProfile?.id) return;
    if (hasDetail) return;

    // 🛡️ Evitar loop: solo intentar una vez por punto
    if (attemptedRef.current === selectedProfile.id) return;
    attemptedRef.current = selectedProfile.id;

    setLoading(true);
    try {
      const detail = await sh.getPointDetail(selectedProfile.id);
      if (detail) {
        dispatch({
          type: 'SET_SELECTED_PROFILE_DETAIL',
          payload: { selected_profile: detail }
        });
      }
    } catch (err) {
      console.warn('Endpoint detail no disponible, usando fallback a get_profile:', err.message);

      try {
        const profileResponse = await sh.get_profile();
        const fullPoints = profileResponse?.user?.catchment_points || [];
        const foundPoint = fullPoints.find(p => p.id === selectedProfile.id);

        if (foundPoint) {
          dispatch({
            type: 'SET_SELECTED_PROFILE_DETAIL',
            payload: { selected_profile: foundPoint }
          });
        }
      } catch (fallbackErr) {
        console.error('Fallback también falló:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProfile?.id, hasDetail, dispatch]);

  // Resetear attemptedRef cuando cambia el punto seleccionado
  useEffect(() => {
    if (selectedProfile?.id && attemptedRef.current !== selectedProfile.id) {
      attemptedRef.current = null;
    }
  }, [selectedProfile?.id]);

  // Cargar detalle automáticamente si falta (solo una vez por punto)
  useEffect(() => {
    if (selectedProfile?.id && !hasDetail && !loading && attemptedRef.current !== selectedProfile.id) {
      loadDetail();
    }
  }, [selectedProfile?.id, hasDetail, loading, loadDetail]);

  return {
    loading,
    hasDetail,
    selectedProfile,
    refreshDetail: loadDetail,
  };
};

export default usePointDetail;
