import React, { createContext, useContext, useMemo, useReducer } from 'react';

const DataContext = createContext(null);

const dataReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_SELECTED_PROFILE":
      return { ...state, selected_profile: action.payload.selected_profile };
    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, { selected_profile: null });

  const contextValue = useMemo(() => ({
    selected_profile: state.selected_profile,
    dispatch,
  }), [state.selected_profile, dispatch]);

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData debe usarse dentro de DataProvider');
  return context;
};

export default DataContext;