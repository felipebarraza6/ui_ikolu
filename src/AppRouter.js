import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./containers/Home";
import Login from "./containers/Login";
import ResetPassword from "./containers/ResetPassword";
import PreviewModalQR from "./components/dga/PreviewModalQR";
import { AppContext } from "./App";

const AppRouter = () => {
  const { state } = useContext(AppContext);
  const isAuth = state && state.isAuth && state.user && state.user.username;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Ruta pública para preview del certificado - no requiere autenticación */}
      <Route path="/preview-certificate" element={<PreviewModalQR />} />
      <Route
        path="/"
        element={isAuth ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/*"
        element={isAuth ? <Home /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default AppRouter;
