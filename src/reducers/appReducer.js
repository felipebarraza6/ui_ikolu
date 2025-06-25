import sh from "../api/sh/endpoints";

export const appReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_SELECTED_PROFILE":
      localStorage.setItem(
        "selected_profile",
        JSON.stringify(action.payload.selected_profile)
      );
      return {
        ...state,
        selected_profile: action.payload.selected_profile,
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

    case "LOGOUT":
      localStorage.clear();
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
