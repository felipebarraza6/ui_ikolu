import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./containers/Home";
import Login from "./containers/Login";
import { AppContext } from "./App";

const AppRouter = () => {
  const { state } = useContext(AppContext);
  const isAuth = state && state.isAuth && state.user && state.user.username;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/geo" replace />} />
      <Route
        path="/*"
        element={isAuth ? <Home /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default AppRouter;
