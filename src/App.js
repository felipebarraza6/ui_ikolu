import React, { createContext, useReducer } from "react";
import AppRouter from "./AppRouter";
import { appReducer } from "./reducers/appReducer";

export const AppContext = createContext();

function getInitialState() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = JSON.parse(localStorage.getItem("token") || "null");
  const profile_client = JSON.parse(
    localStorage.getItem("profile_client") || "[]"
  );
  const selected_profile = JSON.parse(
    localStorage.getItem("selected_profile") || "null"
  );

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
