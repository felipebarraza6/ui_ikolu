import React, { createContext, useContext, useMemo } from 'react';

/**
 * DataContext — Contexto especializado para datos de la aplicación
 *
 * Contiene: puntos de captación, perfil seleccionado, resumen de puntos.
 * Separar de AuthContext y UIContext evita re-renders en:
 * - Componentes de autenticación cuando cambian datos
 * - Componentes de UI (spinners) cuando cambian datos
 *
 * Uso: const { points_summary, profile_client, selected_profile, points_list, dispatch } = useData();
 */

export const DataContext = createContext(null);

export const DataProvider = ({ value, children }) => {
  const {
    points_summary,
    profile_client,
    selected_profile,
    points_list,
    dispatch,
  } = value;

  // Memoizar profundamente para evitar re-renders por cambios en otros campos del state
  const contextValue = useMemo(() => ({
    points_summary,
    profile_client,
    selected_profile,
    points_list,
    dispatch,
  }), [
    points_summary,
    profile_client,
    selected_profile,
    points_list,
    dispatch,
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe usarse dentro de DataProvider');
  }
  return context;
};

export default DataContext;
