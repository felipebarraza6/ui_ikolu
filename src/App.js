import React, { createContext, useReducer, useMemo } from "react";
import AppRouter from "./AppRouter";
import { appReducer } from "./reducers/appReducer";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { UIProvider } from "./contexts/UIContext";
import { TourProvider } from "./contexts/TourContext";

/**
 * ⚠️ DEPRECATED: AppContext monolítico
 * Usar contextos especializados en su lugar:
 * - useAuth()  → AuthContext  (isAuth, user, token)
 * - useData()  → DataContext  (points, profiles)
 * - useUI()    → UIContext    (loading, adminView)
 *
 * Este contexto se mantiene para compatibilidad con componentes
 * existentes durante la migración gradual.
 */
export const AppContext = createContext();

function getInitialState() {
  const safeParseJSON = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === undefined || item === "undefined") {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  const user = safeParseJSON("user", null);
  const token = safeParseJSON("token", null);
  const points_summary = safeParseJSON("points_summary", null);
  const points_list = safeParseJSON("points_list", null);
  const adminView = safeParseJSON("admin_view", "operacional");

  return {
    isAuth: !!user && !!token,
    token: token,
    user: user || {},
    points_summary: points_summary,
    selected_profile: null,
    points_list: points_list,
    adminView: adminView,
    isLoading: false,
  };
}

const App = () => {
  const [state, dispatch] = useReducer(appReducer, {}, getInitialState);

  // 🆕 Separar state en slices para contextos especializados
  // Esto evita que cualquier cambio en el state dispare re-renders
  // en TODOS los consumidores del contexto global.
  const authValue = useMemo(() => ({
    isAuth: state.isAuth,
    user: state.user,
    token: state.token,
    dispatch,
  }), [state.isAuth, state.user, state.token, dispatch]);

  const dataValue = useMemo(() => ({
    points_summary: state.points_summary,
    selected_profile: state.selected_profile,
    points_list: state.points_list,
    dispatch,
  }), [
    state.points_summary,
    state.selected_profile,
    state.points_list,
    dispatch,
  ]);

  const uiValue = useMemo(() => ({
    isLoading: state.isLoading,
    adminView: state.adminView,
    dispatch,
  }), [state.isLoading, state.adminView, dispatch]);

  // Contexto legacy: solo se actualiza cuando cambia el state completo
  // (mismo comportamiento que antes, para compatibilidad)
  const legacyContextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AuthProvider value={authValue}>
      <DataProvider value={dataValue}>
        <UIProvider value={uiValue}>
          {/* Contexto legacy para compatibilidad durante migración */}
          <AppContext.Provider value={legacyContextValue}>
            <TourProvider>
              <AppRouter />
            </TourProvider>
          </AppContext.Provider>
        </UIProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
