import React, { createContext, useReducer } from "react";
import AppRouter from "./AppRouter";
import { appReducer } from "./reducers/appReducer";

export const AppContext = createContext();

function getInitialState() {
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
  const profile_client = safeParseJSON("profile_client", []);
  const selected_profile = safeParseJSON("selected_profile", null);

  return {
    isAuth: !!user && !!token,
    token: token,
    user: user || {},
    profile_client: profile_client || [],
    selected_profile: selected_profile || {
      dga: {},
      config_data: {},
      modules: {},
      profile_ikolu: {},
    },
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
