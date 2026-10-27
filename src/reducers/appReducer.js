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

    case "LOGIN": {
      const points = action.payload.user?.catchment_points || [];
      const branches = action.payload.branches || [];
      const branchId = action.payload.branchId || null;
      const selected = points[0] ? { ...points[0], key: points[0].id ?? points[0].key ?? 0 } : null;

      localStorage.setItem("token", JSON.stringify(action.payload.access_token));
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("profile_client", JSON.stringify(points));
      localStorage.setItem("branches", JSON.stringify(branches));
      if (selected) {
        localStorage.setItem("selected_profile", JSON.stringify(selected));
      } else {
        localStorage.removeItem("selected_profile");
      }
      if (branches.length > 1 && branchId) {
        localStorage.setItem("branch_multi", "1");
        localStorage.setItem("branch_id", String(branchId));
      } else {
        localStorage.removeItem("branch_multi");
        localStorage.removeItem("branch_id");
      }

      return {
        ...state,
        isAuth: true,
        token: action.payload.access_token,
        user: action.payload.user,
        profile_client: points,
        selected_profile: selected,
        branches,
        branchId: branches.length > 1 ? branchId : null,
      };
    }

    case "SET_BRANCH":
      localStorage.setItem("branch_multi", "1");
      localStorage.setItem("branch_id", String(action.payload.branchId));
      return {
        ...state,
        branchId: String(action.payload.branchId),
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
        branches: [],
        branchId: null,
        selected_profile: null,
      };

    default:
      return state;
  }
};
