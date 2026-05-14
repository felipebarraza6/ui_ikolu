import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

const STORAGE_KEY = "ikolu_tours_completed";

const safeGetCompleted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const safeSetCompleted = (keys) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
};

export const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
  const [completedTours, setCompletedTours] = useState(() => safeGetCompleted());
  const [activeTour, setActiveTour] = useState(null);

  const isTourCompleted = useCallback(
    (key) => completedTours.includes(key),
    [completedTours]
  );

  const startTour = useCallback((key) => {
    setActiveTour(key);
  }, []);

  const completeTour = useCallback((key) => {
    setCompletedTours((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      safeSetCompleted(next);
      return next;
    });
    setActiveTour(null);
  }, []);

  const skipTour = useCallback((key) => {
    // Skip marca como completado para no volver a mostrar,
    // pero sin requerir que el usuario pase por todos los pasos.
    setCompletedTours((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      safeSetCompleted(next);
      return next;
    });
    setActiveTour(null);
  }, []);

  const resetTours = useCallback(() => {
    safeSetCompleted([]);
    setCompletedTours([]);
    setActiveTour(null);
  }, []);

  const value = useMemo(
    () => ({
      completedTours,
      activeTour,
      isTourCompleted,
      startTour,
      completeTour,
      skipTour,
      resetTours,
    }),
    [completedTours, activeTour, isTourCompleted, startTour, completeTour, skipTour, resetTours]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTours = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTours debe usarse dentro de TourProvider");
  }
  return context;
};

export default TourContext;
