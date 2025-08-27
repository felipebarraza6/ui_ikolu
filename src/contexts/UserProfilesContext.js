import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import sh from "../api/sh/endpoints";

/**
 * 🧭 CONTEXTO COMPARTIDO PARA PERFILES DE USUARIO
 *
 * Evita múltiples peticiones al endpoint get_profile
 * Comparte datos entre todos los componentes
 */
const UserProfilesContext = createContext();

export const useUserProfilesContext = () => {
  const context = useContext(UserProfilesContext);
  if (!context) {
    throw new Error(
      "useUserProfilesContext debe usarse dentro de UserProfilesProvider"
    );
  }
  return context;
};

export const UserProfilesProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para obtener perfiles desde la API
  const fetchProfiles = useCallback(async () => {
    if (isInitialized) return; // Solo evitar múltiples peticiones

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching profiles..."); // Debug log

      // Verificar si hay usuario en localStorage antes de hacer la petición
      const user = JSON.parse(localStorage.getItem("user") || null);
      console.log("🔍 User from localStorage:", user);

      if (!user || !user.username) {
        throw new Error("No hay usuario autenticado en localStorage");
      }

      console.log(
        "🌐 Haciendo petición a la API real:",
        `users/${user.username}/`
      );
      const response = await sh.get_profile();
      console.log("📡 API Response REAL:", response);
      console.log("📡 API Response data:", response?.data);
      console.log("📡 API Response user:", response?.data?.user);
      console.log(
        "📡 API Response catchment_points:",
        response?.data?.user?.catchment_points
      );

      // LOGS ADICIONALES PARA DEBUGGEAR
      console.log("🔍 Response completo:", JSON.stringify(response, null, 2));
      console.log("🔍 Response.data:", response?.data);
      console.log("🔍 Response.user:", response?.user);
      console.log("🔍 Response.catchment_points:", response?.catchment_points);

      // LA ESTRUCTURA CORRECTA ES: response.user.catchment_points (NO response.data.user.catchment_points)
      const userProfiles = response?.user?.catchment_points || [];
      console.log("🏞️ User profiles found:", userProfiles.length);
      console.log("🏞️ First profile example:", userProfiles[0]);

      // Procesar perfiles para mantener solo datos esenciales
      const processedProfiles = userProfiles.map((profile) => ({
        id: profile.id,
        title: profile.title,
        key: profile.id,
        is_monitoring: profile.is_monitoring || false,
        standard: profile.standard || "STANDARD",
        frecuency: profile.frecuency || 1,
        config_data: {
          is_telemetry: profile.config_data?.is_telemetry || false,
          d1: profile.config_data?.d1 || 0,
        },
        dga: {
          type_dga: profile.dga?.type_dga || "SUPERFICIAL",
          standard: profile.dga?.standard || "STANDARD",
          code_dga: profile.dga?.code_dga || "",
        },
        profile_ikolu: {
          m3: profile.profile_ikolu?.m3 || false,
          m4: profile.profile_ikolu?.m4 || false,
        },
        modules: profile.modules || {},
        total_consumed_today: profile.total_consumed_today || 0,
        total_consumed_yesterday: profile.total_consumed_yesterday || 0,
      }));

      setProfiles(processedProfiles);

      // Si no hay perfil seleccionado, usar el primero
      if (processedProfiles.length > 0) {
        setSelectedProfile(processedProfiles[0]);
        console.log("✅ Selected profile:", processedProfiles[0].title);
      }

      setIsInitialized(true);
      console.log("✅ Profiles loaded successfully"); // Debug log
    } catch (err) {
      console.error("❌ Error obteniendo perfiles de usuario:", err);
      console.error("❌ Error completo:", {
        message: err.message,
        stack: err.stack,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isInitialized]); // ← SOLO isInitialized como dependencia

  // Función para cambiar perfil seleccionado
  const changeSelectedProfile = useCallback(
    (profileId) => {
      const profile = profiles.find((p) => p.id === profileId);
      if (profile) {
        setSelectedProfile(profile);
      }
    },
    [profiles]
  );

  // Función para obtener perfil por ID
  const getProfileById = useCallback(
    (profileId) => {
      return profiles.find((p) => p.id === profileId);
    },
    [profiles]
  );

  // Función para validar si un perfil está habilitado
  const isProfileEnabled = useCallback((profile) => {
    if (!profile || !profile.config_data) return false;

    return (
      profile.config_data.is_telemetry ||
      profile.standard === "CAUDALES_MUY_PEQUENOS" ||
      profile.standard === "MENOR"
    );
  }, []);

  // Función para recargar perfiles
  const refreshProfiles = useCallback(() => {
    setIsInitialized(false);
    fetchProfiles();
  }, [fetchProfiles]);

  // Efecto para carga inicial
  useEffect(() => {
    console.log("🔍 useEffect fetchProfiles triggered", {
      isInitialized,
      loading,
      profilesCount: profiles.length,
      hasUser: !!localStorage.getItem("user"),
      hasToken: !!localStorage.getItem("token"),
    });
    fetchProfiles();
  }, [fetchProfiles]);

  // Log cuando cambia el estado
  useEffect(() => {
    console.log("📊 State changed:", {
      loading,
      isInitialized,
      profilesCount: profiles.length,
      hasSelectedProfile: !!selectedProfile,
    });
  }, [loading, isInitialized, profiles.length, selectedProfile]);

  const value = {
    // Estados principales
    loading,
    error,

    // Datos de perfiles
    profiles,
    selectedProfile,

    // Funciones de control
    changeSelectedProfile,
    getProfileById,
    isProfileEnabled,
    refreshProfiles,

    // Información útil
    totalProfiles: profiles.length,
    enabledProfiles: profiles.filter(isProfileEnabled),
    hasProfiles: profiles.length > 0,
  };

  return (
    <UserProfilesContext.Provider value={value}>
      {children}
    </UserProfilesContext.Provider>
  );
};
