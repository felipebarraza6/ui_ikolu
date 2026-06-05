import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Tour, theme } from "antd";
import { useTours } from "../../contexts/TourContext";

const { useToken } = theme;

/**
 * Resuelve los targets de los steps de forma segura.
 * Convierte funciones target a referencias DOM directas para evitar que
 * rc-tour las ejecute repetidamente en cada render (causa loop infinito).
 *
 * Reglas:
 * - target === null/undefined: se deja tal cual (step con placement center)
 * - target es función: se ejecuta UNA vez. Si retorna elemento DOM, se usa
 *   directamente. Si retorna null/undefined, target queda como null.
 * - target es elemento DOM: se deja tal cual.
 */
const resolveStepTargets = (steps) => {
  if (!Array.isArray(steps)) return [];
  return steps.map((step) => {
    if (!step) return step;
    // Step con target null/undefined es válido (placement center)
    if (step.target === null || step.target === undefined) {
      return step;
    }
    // Si target es función, ejecutar una sola vez y pasar la referencia directa
    if (typeof step.target === "function") {
      try {
        const el = step.target();
        if (el && el.nodeType === 1) {
          return { ...step, target: el };
        }
        return { ...step, target: null };
      } catch {
        return { ...step, target: null };
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
  const openRef = useRef(open);

  // Sincronizar ref para evitar stale closures en timeouts
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Memoizar steps con targets resueltos para evitar que rc-tour
  // ejecute funciones target en cada render (causa loop infinito).
  // Se actualiza cuando cambian los steps originales o cuando refreshKey cambia.
  const resolvedSteps = useMemo(() => resolveStepTargets(steps), [steps, refreshKey]);

  // Memoizar indicatorsRender para evitar re-renders innecesarios del Tour
  const indicatorsRender = useCallback(
    (current, total) => (
      <span style={{ color: token.colorPrimary, fontSize: 12 }}>
        {isTransitioning ? "..." : `${current + 1} / ${total}`}
      </span>
    ),
    [token.colorPrimary, isTransitioning]
  );

  // Sincronizar con activeTour global (para iniciar desde fuera)
  useEffect(() => {
    if (activeTour === tourKey) {
      setOpen(true);
    }
  }, [activeTour, tourKey]);

  // Auto-start: solo si no fue completado, no hay otro tour activo, y las condiciones se cumplen
  useEffect(() => {
    if (!autoStart) return;
    if (!ready) return;
    if (isTourCompleted(tourKey)) return;
    if (activeTour && activeTour !== tourKey) return;
    if (requiresPoint && !hasPoint) return;

    const timer = setTimeout(() => {
      if (!openRef.current) {
        setOpen(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [autoStart, ready, isTourCompleted, activeTour, tourKey, requiresPoint, hasPoint, delay]);

  // Escuchar cuando un drawer terminó de abrirse para avanzar el tour
  useEffect(() => {
    const handleDrawerOpened = (e) => {
      if (e.detail?.tourKey === tourKey && pendingStep !== null) {
        const stepToGo = pendingStep;
        const targetFn = steps[stepToGo]?.target;

        // Esperar activamente hasta que el elemento target exista en el DOM
        // y tenga dimensiones válidas antes de avanzar el paso.
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
            // Fallback: avanzar de todas formas si se agota el tiempo
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

  // Escuchar solicitudes de refresco de targets
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
      const nextStep = steps[next];

      window.dispatchEvent(
        new CustomEvent("tour-step-change", {
          detail: { tourKey, current: next, step: nextStep },
        })
      );

      if (nextStep?.opensDrawer) {
        setIsTransitioning(true);
        setPendingStep(next);
        // Fallback: si el drawer ya estaba abierto y no dispara afterOpenChange
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

  // No renderizar el Tour si no hay steps válidos para evitar errores de rc-component
  if (!resolvedSteps || resolvedSteps.length === 0) {
    return children || null;
  }

  return (
    <>
      <Tour
        key={`${tourKey}-${refreshKey}`}
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
