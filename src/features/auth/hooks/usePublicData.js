import { useState, useEffect } from "react";
import { fetchPublicData } from "../services/publicData";

/**
 * Hook para cargar los datos públicos de la mini-landing del login.
 *
 * @param {Object} options
 * @param {boolean} options.enabled - Si debe ejecutar la carga.
 * @returns {{ data: Object|null, loading: boolean, error: Error|null }}
 */
const usePublicData = ({ enabled = true } = {}) => {
  const [state, setState] = useState({
    data: null,
    loading: enabled,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const data = await fetchPublicData();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setState({ data: null, loading: false, error: err });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
};

export default usePublicData;
