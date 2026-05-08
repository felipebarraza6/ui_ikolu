import sh from "../api/sh/endpoints";
import { clearCacheOnLogout, invalidateProfileCache } from "../utils/dataCache";
import { clearPendingRequests } from "../utils/requestDeduplication";

export const appReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_SELECTED_PROFILE":
      localStorage.setItem(
        "selected_profile",
        JSON.stringify(action.payload.selected_profile)
      );
      // Invalidar caché cuando cambia el perfil seleccionado
      invalidateProfileCache();
      return {
        ...state,
        selected_profile: action.payload.selected_profile,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };

    case "LOGIN":
      console.log(action);
      localStorage.setItem(
        "token",
        JSON.stringify(action.payload.access_token)
      );
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem(
        "profile_client",
        JSON.stringify(action.payload.user.catchment_points)
      );
      localStorage.setItem(
        "selected_profile",
        JSON.stringify(action.payload.user.catchment_points[0])
      );

      return {
        ...state,
        isAuth: true,
        token: action.payload.access_token,
        user: action.payload.user,
        profile_client: action.payload.user.catchment_points,
        selected_profile: {
          ...action.payload.user.catchment_points[0],
          key: 0,
        },
      };

    case "UPDATE":
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem(
        "profile_client",
        JSON.stringify(action.payload.user.catchment_points)
      );

      // Validar selected_profile
      let validSelectedProfile = action.payload.selected_profile;
      const catchmentPoints = action.payload.user.catchment_points;

      if (catchmentPoints && catchmentPoints.length > 0) {
        if (!validSelectedProfile || !validSelectedProfile.id) {
          // Si no hay selected_profile válido, usar el primero
          validSelectedProfile = {
            ...catchmentPoints[0],
            key: catchmentPoints[0].id,
          };
        } else {
          // Verificar si el selected_profile existe en los catchment_points
          const profileExists = catchmentPoints.find(
            (p) => p.id === validSelectedProfile.id
          );
          if (!profileExists) {
            validSelectedProfile = {
              ...catchmentPoints[0],
              key: catchmentPoints[0].id,
            };
          }
        }
        localStorage.setItem(
          "selected_profile",
          JSON.stringify(validSelectedProfile)
        );
      }

      return {
        ...state,
        isAuth: true,
        user: action.payload.user,
        profile_client: action.payload.user.catchment_points,
        selected_profile: validSelectedProfile,
      };

    case "DEFAULT_LIST":
      console.log(action);
      return {
        ...state,
        type_graph: action.payload.type_graph,
        list_default: action.payload.list,
      };

    case "SET_PROFILE_CLIENT":
      localStorage.setItem(
        "profile_client",
        JSON.stringify(action.payload.profile_client)
      );
      if (action.payload.selected_profile) {
        localStorage.setItem(
          "selected_profile",
          JSON.stringify(action.payload.selected_profile)
        );
      }
      return {
        ...state,
        profile_client: action.payload.profile_client,
        selected_profile: action.payload.selected_profile || state.selected_profile,
      };

    case "LOGOUT":
      localStorage.clear();
      // Limpiar caché al hacer logout
      clearCacheOnLogout();
      // ✅ NUEVO: Limpiar requests pendientes
      clearPendingRequests();
      return {
        ...state,
        isAuth: false,
        token: null,
        user: null,
        profile_client: null,
      };

    default:
      return state;
  }
};
