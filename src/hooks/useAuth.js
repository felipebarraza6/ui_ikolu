import { useState, useEffect, useCallback } from "react";
import sh from "../api/sh/endpoints";

/**
 * 🔐 HOOK PERSONALIZADO PARA AUTENTICACIÓN BÁSICA
 *
 * Este hook maneja solo la autenticación básica (token y usuario)
 * sin los datos de perfiles, que ahora vienen de la API.
 *
 * @returns {Object} Estado de autenticación y funciones de control
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para verificar token almacenado
  const checkStoredAuth = useCallback(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      console.log("🔍 checkStoredAuth - storedToken:", storedToken);
      console.log("🔍 checkStoredAuth - storedUser:", storedUser);

      if (storedToken && storedUser) {
        const parsedToken = JSON.parse(storedToken);
        const parsedUser = JSON.parse(storedUser);

        console.log("🔍 checkStoredAuth - parsedToken:", parsedToken);
        console.log("🔍 checkStoredAuth - parsedUser:", parsedUser);

        if (parsedToken && parsedUser) {
          setToken(parsedToken);
          setUser(parsedUser);
          setIsAuthenticated(true); // ← ESTABLECER AQUÍ TAMBIÉN
          console.log("✅ checkStoredAuth - Datos válidos encontrados");
          return true;
        }
      }
      console.log("❌ checkStoredAuth - No hay datos válidos");
      return false;
    } catch (err) {
      console.error("❌ checkStoredAuth - Error:", err);
      return false;
    }
  }, []);

  // Función para iniciar sesión
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await sh.authenticated(credentials);

      // Almacenar solo datos básicos de autenticación
      localStorage.setItem("token", JSON.stringify(response.access_token));
      localStorage.setItem("user", JSON.stringify(response.user));

      // Actualizar estado de manera síncrona
      setToken(response.access_token);
      setUser(response.user);
      setIsAuthenticated(true);

      console.log("✅ Login exitoso - Estado actualizado:", {
        token: response.access_token,
        user: response.user,
        isAuthenticated: true,
      });

      return response;
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message || "Error de autenticación");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile_client");
    localStorage.removeItem("selected_profile");

    // Limpiar estado
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Función para verificar si el token sigue siendo válido
  const validateToken = useCallback(async () => {
    if (!token) return false;

    try {
      // Intentar hacer una llamada a la API para validar el token
      await sh.get_profile();
      return true;
    } catch (err) {
      console.warn("Token inválido, cerrando sesión:", err);
      logout();
      return false;
    }
  }, [token, logout]);

  // Efecto para verificar autenticación al montar
  useEffect(() => {
    console.log(
      "🔍 useAuth useEffect - Iniciando verificación de autenticación"
    );
    const hasStoredAuth = checkStoredAuth();

    // Si hay datos almacenados, establecer isAuthenticated = true
    if (hasStoredAuth) {
      setIsAuthenticated(true);
      console.log("✅ useAuth - Usuario autenticado desde localStorage");
    } else {
      console.log("❌ useAuth - No hay usuario autenticado en localStorage");
    }

    setLoading(false);
    console.log("🔍 useAuth useEffect - Estado final:", {
      isAuthenticated: hasStoredAuth,
      hasUser: !!localStorage.getItem("user"),
      hasToken: !!localStorage.getItem("token"),
    });
  }, [checkStoredAuth]);

  // Efecto para validar token periódicamente - ELIMINADO PARA EVITAR MÚLTIPLES PETICIONES
  // useEffect(() => {
  //   if (!isAuthenticated) return;

  //   const interval = setInterval(() => {
  //     validateToken();
  //   }, 5 * 60 * 1000); // Validar cada 5 minutos

  //   return () => clearInterval(interval);
  // }, [isAuthenticated, validateToken]);

  return {
    // Estados principales
    isAuthenticated,
    user,
    token,
    loading,
    error,

    // Funciones de control
    login,
    logout,
    validateToken,

    // Información útil
    username: user?.username || null,
    isAdmin: user?.is_admin_view || false,
    hasValidToken: !!token,
  };
};
