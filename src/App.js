import React, { createContext, useReducer } from "react";
import AppRouter from "./AppRouter";
import { appReducer } from "./reducers/appReducer";

export const AppContext = createContext();

function getInitialState() {
  // 🧹 Limpiar datos masivos viejos de sesiones anteriores
  // El nuevo sistema usa lazy loading, no necesitamos todo el profile_client en localStorage
  try {
    const oldProfileClient = localStorage.getItem("profile_client");
    if (oldProfileClient && oldProfileClient.length > 50000) {
      // Si es muy grande, era la data masiva vieja — la limpiamos
      localStorage.removeItem("profile_client");
    }
  } catch (e) { /* ignore */ }

  // Función auxiliar para parsear localStorage de forma segura
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

  // 🆕 Lazy loading: profile_client ya no se carga al inicio
  // selected_profile NO se recupera de localStorage — el usuario debe seleccionar explícitamente
  // El detalle completo se recarga bajo demanda cuando se selecciona un punto
  const points_list = safeParseJSON("points_list", null);
  const adminView = safeParseJSON("admin_view", "operacional");

  return {
    isAuth: !!user && !!token,
    token: token,
    user: user || {},
    points_summary: points_summary,  // Resumen de puntos del login
    profile_client: null,      // Se carga lazy
    selected_profile: null,    // SIEMPRE null al iniciar — el usuario debe elegir
    points_list: points_list,  // Lista minimal cacheada
    adminView: adminView,      // Vista del admin dashboard
    isLoading: false,          // Estado de carga global
  };
}

const App = () => {
  const [state, dispatch] = useReducer(appReducer, {}, getInitialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <AppRouter />
    </AppContext.Provider>
  );
};

export default App;
