import React, { useEffect, useState } from "react";
import { Tour } from "antd";
import { useTours } from "../../contexts/TourContext";

/**
 * ModuleTour — Wrapper reutilizable para tours de capacitación por módulo.
 *
 * Props:
 * - tourKey: string (identificador único, ej: "tour-telemetry")
 * - steps: array de pasos compatibles con Ant Design Tour
 * - autoStart: boolean (default true) — inicia automáticamente si no fue visto
 * - requiresPoint: boolean (default false) — solo inicia si hay punto seleccionado
 * - hasPoint: boolean — indica si hay un punto seleccionado actualmente
 * - delay: number (default 800) — ms de espera antes de auto-iniciar
 * - children: opcional, se renderiza sin modificar (para incluir botón trigger manual)
 */
const ModuleTour = ({
  tourKey,
  steps,
  autoStart = true,
  requiresPoint = false,
  hasPoint = true,
  delay = 800,
  children,
}) => {
  const { isTourCompleted, completeTour, skipTour, activeTour, startTour } = useTours();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  // Sincronizar con activeTour global (para iniciar desde fuera)
  useEffect(() => {
    if (activeTour === tourKey) {
      setOpen(true);
    }
  }, [activeTour, tourKey]);

  // Auto-start: solo si no fue completado, no hay otro tour activo, y las condiciones se cumplen
  useEffect(() => {
    if (!autoStart) return;
    if (isTourCompleted(tourKey)) return;
    if (activeTour && activeTour !== tourKey) return;
    if (requiresPoint && !hasPoint) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [autoStart, isTourCompleted, activeTour, tourKey, requiresPoint, hasPoint, delay]);

  // Escuchar cuando un drawer terminó de abrirse para avanzar el tour
  useEffect(() => {
    const handleDrawerOpened = (e) => {
      if (e.detail?.tourKey === tourKey && pendingStep !== null) {
        setCurrentStep(pendingStep);
        setPendingStep(null);
        setIsTransitioning(false);
        setRefreshKey((k) => k + 1);
      }
    };
    window.addEventListener("tour-drawer-opened", handleDrawerOpened);
    return () => window.removeEventListener("tour-drawer-opened", handleDrawerOpened);
  }, [tourKey, pendingStep]);

  // Escuchar solicitudes de refresco de targets (cuando un drawer u otro elemento
  // dinámico se abre y los targets necesitan re-evaluarse)
  useEffect(() => {
    const handleRefresh = (e) => {
      if (e.detail?.tourKey === tourKey || e.detail?.tourKey === "all") {
        setRefreshKey((k) => k + 1);
      }
    };
    window.addEventListener("tour-refresh-targets", handleRefresh);
    return () => window.removeEventListener("tour-refresh-targets", handleRefresh);
  }, [tourKey]);

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(0);
    setPendingStep(null);
    setIsTransitioning(false);
    window.dispatchEvent(new CustomEvent("tour-closed", { detail: { tourKey } }));
    // Si el usuario cierra manualmente antes de terminar, lo consideramos skip
    skipTour(tourKey);
  };

  const handleFinish = () => {
    setOpen(false);
    setCurrentStep(0);
    setPendingStep(null);
    setIsTransitioning(false);
    window.dispatchEvent(new CustomEvent("tour-finished", { detail: { tourKey } }));
    completeTour(tourKey);
  };

  const handleChange = (next) => {
    const nextStep = steps[next];

    // Siempre notificar a los listeners (drawers, etc.) para que abran/cierren
    window.dispatchEvent(new CustomEvent("tour-step-change", {
      detail: { tourKey, current: next, step: nextStep },
    }));

    if (nextStep?.opensDrawer) {
      // Si el siguiente paso requiere abrir un drawer, esperamos a que se abra
      // antes de avanzar visualmente el tour. Así el tooltip apunta al elemento
      // ya visible y no queda flotando en el centro.
      setIsTransitioning(true);
      setPendingStep(next);
      // Fallback: si el drawer ya estaba abierto y no dispara afterOpenChange,
      // avanzamos después de un tiempo razonable.
      setTimeout(() => {
        setPendingStep((ps) => {
          if (ps !== null) {
            setCurrentStep(ps);
            setIsTransitioning(false);
            setRefreshKey((k) => k + 1);
          }
          return null;
        });
      }, 600);
    } else {
      setCurrentStep(next);
    }
  };

  return (
    <>
      <Tour
        open={open}
        current={currentStep}
        onClose={handleClose}
        onFinish={handleFinish}
        onChange={handleChange}
        steps={steps}
        indicatorsRender={(current, total) => (
          <span style={{ color: "#1F3461", fontSize: 12 }}>
            {isTransitioning ? "..." : `${current + 1} / ${total}`}
          </span>
        )}
      />
      {children}
    </>
  );
};

export default ModuleTour;
