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

  // Validar y sincronizar selected_profile con profile_client
  let validSelectedProfile = null;

  if (selected_profile && profile_client && profile_client.length > 0) {
    // Verificar si el selected_profile existe en profile_client
    const profileExists = profile_client.find(
      (p) => p.id === selected_profile.id
    );
    if (profileExists) {
      validSelectedProfile = selected_profile;
    } else {
      // Si no existe, usar el primer perfil disponible
      validSelectedProfile = {
        ...profile_client[0],
        key: profile_client[0].id,
      };
      // Actualizar localStorage con el perfil corregido
      localStorage.setItem(
        "selected_profile",
        JSON.stringify(validSelectedProfile)
      );
    }
  } else if (profile_client && profile_client.length > 0) {
    // Si no hay selected_profile pero sí hay profile_client, usar el primero
    validSelectedProfile = { ...profile_client[0], key: profile_client[0].id };
    localStorage.setItem(
      "selected_profile",
      JSON.stringify(validSelectedProfile)
    );
  }

  return {
    isAuth: !!user && !!token,
    token: token,
    user: user || {},
    profile_client: profile_client || [],
    selected_profile: validSelectedProfile || {
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
