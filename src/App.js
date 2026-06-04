import React from "react";
import AppRouter from "./AppRouter";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { TourProvider } from "./contexts/TourContext";

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <TourProvider>
          <AppRouter />
        </TourProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;