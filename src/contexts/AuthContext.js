import React, { createContext, useContext, useCallback, useMemo, useReducer } from 'react';
import sh from '../api/sh/endpoints';

const AuthContext = createContext(null);

const safeParseJSON = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined") return defaultValue;
    return JSON.parse(item);
  } catch { return defaultValue; }
};

const initialState = () => {
  const user = safeParseJSON("user", null);
  const token = safeParseJSON("token", null);
  return { user, token, isAuth: !!user && !!token, loading: false, error: null };
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return { user: action.payload.user, token: action.payload.token, isAuth: true, loading: false, error: null };
    case "LOGIN_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return { user: null, token: null, isAuth: false, loading: false, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, null, initialState);

  const login = useCallback(async (email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const data = await sh.authenticated({ email, password });
      const token = data.access_token || data.token;
      const user = data.user;
      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
      return data;
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || "Error de conexión";
      dispatch({ type: "LOGIN_ERROR", payload: msg });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  const contextValue = useMemo(() => ({
    isAuth: state.isAuth,
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    dispatch,
  }), [state.isAuth, state.user?.id, state.token, state.loading, state.error, login, logout]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export default AuthContext;