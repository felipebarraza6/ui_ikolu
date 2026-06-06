import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Tour, theme } from "antd";
import { useTours } from "../../contexts/TourContext";

const { useToken } = theme;

/**
 * Resuelve los targets de los steps de forma segura.
 * Convierte funciones target a referencias DOM directas para evitar que
 * rc-tour las ejecute repetidamente en cada render (causa loop infinito).
 */
const resolveStepTargets = (steps) => {
  if (!Array.isArray(steps)) return [];
  return steps.map((step) => {
    if (!step) return step;
    if (step.target === null || step.target === undefined) {
      return step;
    }
    if (typeof step.target === "function") {
      try {
        const el = step.target();
        if (el && el.nodeType === 1) {
          return { ...step, target: el };
        }
        return step;
      } catch {
        return step;
      }
    }
    return step;
  });
};

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
  ready = true,
  children,
}) => {
  const { token } = useToken();
  const { isTourCompleted, completeTour, skipTour, activeTour } = useTours();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);
  const timeoutRef = useRef(null);

  const currentStepRef = useRef(currentStep);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const resolvedSteps = useMemo(() => resolveStepTargets(steps), [steps, refreshKey]);

  const indicatorsRender = useCallback(
    (current, total) => (
      <span style={{ color: token.colorPrimary, fontSize: 12 }}>
        {isTransitioning ? "..." : `${current + 1} / ${total}`}
      </span>
    ),
    [token.colorPrimary, isTransitioning]
  );

  useEffect(() => {
    if (activeTour === tourKey) {
      setOpen(true);
    }
  }, [activeTour, tourKey]);

  useEffect(() => {
    if (!autoStart) return;
    if (!ready) return;
    if (isTourCompleted(tourKey)) return;
    if (activeTour && activeTour !== tourKey) return;
    if (requiresPoint && !hasPoint) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [autoStart, ready, isTourCompleted, activeTour, tourKey, requiresPoint, hasPoint, delay]);

  useEffect(() => {
    const handleDrawerOpened = (e) => {
      if (e.detail?.tourKey === tourKey && pendingStep !== null) {
        const stepToGo = pendingStep;
        const targetFn = steps[stepToGo]?.target;

        const start = Date.now();
        const MAX_WAIT = 3000;
        const POLL_INTERVAL = 80;

        const tryAdvance = () => {
          const el = typeof targetFn === "function" ? targetFn() : null;
          const rect = el?.getBoundingClientRect();
          const isReady = rect && rect.width > 0 && rect.height > 0;

          if (isReady) {
            setCurrentStep(stepToGo);
            setPendingStep(null);
            setIsTransitioning(false);
            setRefreshKey((k) => k + 1);
            timeoutRef.current = null;
          } else if (Date.now() - start < MAX_WAIT) {
            timeoutRef.current = setTimeout(tryAdvance, POLL_INTERVAL);
          } else {
            setCurrentStep(stepToGo);
            setPendingStep(null);
            setIsTransitioning(false);
            setRefreshKey((k) => k + 1);
            timeoutRef.current = null;
          }
        };

        tryAdvance();
      }
    };
    window.addEventListener("tour-drawer-opened", handleDrawerOpened);
    return () => {
      window.removeEventListener("tour-drawer-opened", handleDrawerOpened);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [tourKey, pendingStep, steps]);

  useEffect(() => {
    const handleRefresh = (e) => {
      if (e.detail?.tourKey === tourKey || e.detail?.tourKey === "all") {
        setRefreshKey((k) => k + 1);
      }
    };
    window.addEventListener("tour-refresh-targets", handleRefresh);
    return () => window.removeEventListener("tour-refresh-targets", handleRefresh);
  }, [tourKey]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setCurrentStep(0);
    setPendingStep(null);
    setIsTransitioning(false);
    window.dispatchEvent(new CustomEvent("tour-closed", { detail: { tourKey } }));
    skipTour(tourKey);
  }, [tourKey, skipTour]);

  const handleFinish = useCallback(() => {
    setOpen(false);
    setCurrentStep(0);
    setPendingStep(null);
    setIsTransitioning(false);
    window.dispatchEvent(new CustomEvent("tour-finished", { detail: { tourKey } }));
    completeTour(tourKey);
  }, [tourKey, completeTour]);

  const handleChange = useCallback(
    (next) => {
      if (next === currentStepRef.current) return;

      const nextStep = steps[next];

      window.dispatchEvent(new CustomEvent("tour-step-change", {
        detail: { tourKey, current: next, step: nextStep },
      }));

      if (nextStep?.opensDrawer) {
        setIsTransitioning(true);
        setPendingStep(next);
        timeoutRef.current = setTimeout(() => {
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
    },
    [steps, tourKey]
  );

  return (
    <>
      <Tour
        open={open}
        current={currentStep}
        onClose={handleClose}
        onFinish={handleFinish}
        onChange={handleChange}
        steps={resolvedSteps}
        indicatorsRender={indicatorsRender}
      />
      {children}
    </>
  );
};

export default ModuleTour;
