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
      // 🆕 Guardar points_summary si viene en la respuesta
      if (action.payload.points_summary) {
        localStorage.setItem("points_summary", JSON.stringify(action.payload.points_summary));
      }

      return {
        ...state,
        isAuth: true,
        token: action.payload.access_token,
        user: action.payload.user,
        points_summary: action.payload.points_summary || null,
        // Inicializar como null, se cargan lazy
        profile_client: null,
        selected_profile: null,
        points_list: null,
      };

    case "UPDATE":
      localStorage.setItem("user", JSON.stringify(action.payload.user));

      // 🚫 NO auto-seleccionar perfil — el usuario debe elegir explícitamente
      const validSelectedProfile = action.payload.selected_profile || state.selected_profile;
      if (validSelectedProfile) {
        localStorage.setItem(
          "selected_profile",
          JSON.stringify(validSelectedProfile)
        );
      }

      return {
        ...state,
        isAuth: true,
        user: action.payload.user,
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
      // 🚀 DEPRECATED: profile_client ya no se almacena en localStorage
      if (action.payload.selected_profile) {
        localStorage.setItem(
          "selected_profile",
          JSON.stringify(action.payload.selected_profile)
        );
      }
      return {
        ...state,
        selected_profile: action.payload.selected_profile || state.selected_profile,
      };

    // 🆕 NUEVO: Guardar lista minimal de puntos
    case "SET_POINTS_LIST":
      if (action.payload.points_list) {
        localStorage.setItem(
          "points_list",
          JSON.stringify(action.payload.points_list)
        );
      }
      return {
        ...state,
        points_list: action.payload.points_list,
      };

    // 🆕 NUEVO: Guardar detalle del punto seleccionado
    case "SET_SELECTED_PROFILE_DETAIL":
      const detail = action.payload.selected_profile;
      // 🛡️ Solo guardar si tiene id válido
      if (!detail || !detail.id) {
        return state;
      }
      localStorage.setItem("selected_profile", JSON.stringify(detail));
      return {
        ...state,
        selected_profile: detail,
      };

    case "SET_ADMIN_VIEW":
      localStorage.setItem("admin_view", action.payload.view);
      return { ...state, adminView: action.payload.view };

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
        selected_profile: null,
        points_summary: null,
        points_list: null,
        adminView: "operacional",
      };

    default:
      return state;
  }
};
