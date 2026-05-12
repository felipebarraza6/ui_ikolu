import React, { createContext, useContext, useCallback, useMemo } from 'react';

/**
 * AuthContext — Contexto especializado SOLO para autenticación
 *
 * Separar del AppContext global evita que cualquier cambio en datos
 * de perfil/puntos dispare re-renders en componentes que solo
 * necesitan saber si el usuario está autenticado.
 *
 * Uso: const { isAuth, user, token } = useAuth();
 */

export const AuthContext = createContext(null);

export const AuthProvider = ({ value, children }) => {
  // value = { isAuth, user, token, dispatch }
  const { isAuth, user, token, dispatch } = value;

  // Memoizar para evitar re-renders cuando cambia el objeto value
  const contextValue = useMemo(() => ({
    isAuth,
    user,
    token,
    dispatch,
  }), [isAuth, user?.id, token, dispatch]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
