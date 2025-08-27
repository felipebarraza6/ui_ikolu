import { useState, useEffect, useCallback } from "react";
import sh from "../api/sh/endpoints";

/**
 * 👤 HOOK PERSONALIZADO PARA PERFILES DE USUARIO
 *
 * Este hook maneja la obtención de perfiles de usuario desde la API,
 * eliminando la dependencia del contexto del login.
 *
 * @returns {Object} Perfiles de usuario y estado de carga
 */
export const useUserProfiles = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Función para obtener perfiles desde la API
  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await sh.get_profile();
      const userProfiles = response?.user?.catchment_points || [];

      // Procesar perfiles para mantener solo datos esenciales
      const processedProfiles = userProfiles.map((profile, index) => ({
        id: profile.id,
        title: profile.title,
        key: profile.id, // Para compatibilidad con Ant Design
        is_monitoring: profile.is_monitoring || false,
        standard: profile.standard || "STANDARD",
        // Solo mantener config_data esencial para validaciones
        config_data: {
          is_telemetry: profile.config_data?.is_telemetry || false,
          d1: profile.config_data?.d1 || 0,
        },
        // Solo mantener DGA esencial para validaciones
        dga: {
          type_dga: profile.dga?.type_dga || "SUPERFICIAL",
          standard: profile.dga?.standard || "STANDARD",
          code_dga: profile.dga?.code_dga || "",
        },
        // Solo mantener profile_ikolu esencial
        profile_ikolu: {
          m3: profile.profile_ikolu?.m3 || false,
          m4: profile.profile_ikolu?.m4 || false,
        },
      }));

      setProfiles(processedProfiles);

      // Si no hay perfil seleccionado, usar el primero
      if (!selectedProfile && processedProfiles.length > 0) {
        setSelectedProfile(processedProfiles[0]);
      }
    } catch (err) {
      console.error("Error obteniendo perfiles de usuario:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // ← ELIMINÉ LA DEPENDENCIA selectedProfile PARA EVITAR BUCLE INFINITO

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

  // Efecto para carga inicial
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
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
    refreshProfiles: fetchProfiles,

    // Información útil
    totalProfiles: profiles.length,
    enabledProfiles: profiles.filter(isProfileEnabled),
    hasProfiles: profiles.length > 0,
  };
};
