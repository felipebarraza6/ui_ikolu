import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./containers/Home";
import Login from "./containers/Login";
import { useAuth } from "./hooks/useAuth";

/**
 * 🚀 COMPONENTE APP ROUTER REFACTORIZADO
 *
 * Ahora usa el hook useAuth para manejar la autenticación
 * en lugar de depender del contexto del login.
 *
 * Características principales:
 * - Autenticación independiente del contexto
 * - Protección de rutas basada en token válido
 * - Redirección automática según estado de auth
 */
const AppRouter = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #1F3461 0%, #2E5B8A 100%)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "white",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(255,255,255,0.3)",
              borderTop: "4px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto",
            }}
          />
          <p>Verificando autenticación...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Verificar si el usuario está autenticado y tiene datos válidos
  const isAuth = isAuthenticated && user && user.username;

  console.log("🔍 AppRouter - Estado de autenticación:", {
    isAuthenticated,
    hasUser: !!user,
    username: user?.username,
    isAuth,
  });

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
