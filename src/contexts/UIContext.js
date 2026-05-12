import React, { createContext, useContext, useMemo } from 'react';

/**
 * UIContext — Contexto especializado para estado de interfaz
 *
 * Contiene: isLoading, adminView, y otros estados puramente de UI.
 * Separar de DataContext evita que cualquier cambio en datos
 * dispare re-renders en componentes que solo muestran UI.
 *
 * Uso: const { isLoading, adminView, dispatch } = useUI();
 */

export const UIContext = createContext(null);

export const UIProvider = ({ value, children }) => {
  const { isLoading, adminView, dispatch } = value;

  const contextValue = useMemo(() => ({
    isLoading,
    adminView,
    dispatch,
  }), [isLoading, adminView, dispatch]);

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI debe usarse dentro de UIProvider');
  }
  return context;
};

export default UIContext;
