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
        JSON.stringify(action.payload.catchment_points)
      );
      const storedProfile = localStorage.getItem("selected_profile");
      const selected_profile = storedProfile
        ? JSON.parse(storedProfile)
        : action.payload.user.catchment_points[0];
      console.log(selected_profile);

      return {
        ...state,
        isAuth: true,
        user: action.payload.user,
        profile_client: action.payload.user.catchment_points,
        selected_profile: selected_profile,
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
