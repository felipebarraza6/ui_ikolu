import { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppContext } from "../App";
import sh from "../api/nereus/portal";

/**
 * Perfil del punto seleccionado. El refresco periódico usa refetchInterval.
 */
export const useProfileData = (options = {}) => {
  const { state, dispatch } = useContext(AppContext);
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000,
    onDataLoaded = null,
    fetchOnMount = true,
  } = options;
  const profileId = state.selected_profile?.id;

  const query = useQuery({
    queryKey: ["profile", state.user?.username, profileId],
    enabled: Boolean(fetchOnMount && profileId),
    staleTime: 30_000,
    refetchInterval: autoRefresh ? refreshInterval : false,
    queryFn: async () => {
      const response = await sh.get_profile();
      const allProfiles = response?.user?.catchment_points ?? [];
      const currentProfile =
        allProfiles.find((item) => item.id === profileId) || allProfiles[0] || null;
      return { user: response.user, currentProfile };
    },
  });

  useEffect(() => {
    const currentProfile = query.data?.currentProfile;
    if (!currentProfile) return;
    const hasChanges =
      JSON.stringify(currentProfile) !== JSON.stringify(state.selected_profile);
    if (hasChanges) {
      dispatch({
        type: "UPDATE",
        payload: {
          user: query.data.user,
          selected_profile: currentProfile,
        },
      });
    }
    if (onDataLoaded) onDataLoaded(currentProfile);
  }, [query.data, dispatch, onDataLoaded, state.selected_profile]);

  return {
    loading: query.isLoading,
    error: query.error,
    profile: state.selected_profile,
    refreshProfile: query.refetch,
  };
};

/**
 * Telemetría del punto seleccionado, con refetchInterval en lugar de setInterval.
 */
export const useTelemetryData = (options = {}) => {
  const { state } = useContext(AppContext);
  const { autoRefresh = false, refreshInterval = 5 * 60 * 1000 } = options;
  const profileId = state.selected_profile?.id;

  const query = useQuery({
    queryKey: ["profile-telemetry", profileId],
    enabled: Boolean(profileId),
    staleTime: 30_000,
    refetchInterval: autoRefresh ? refreshInterval : false,
    queryFn: () => sh.get_data_sh(profileId),
  });

  return {
    loading: query.isLoading,
    error: query.error,
    data: query.data,
    refreshData: query.refetch,
  };
};
