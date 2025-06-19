/**
 * 🎯 EJEMPLO PRÁCTICO: MIGRACIÓN SEGURA SIN ROMPER NADA
 *
 * Este archivo muestra EXACTAMENTE cómo migrar cualquier página/componente
 * de tu app sin afectar la funcionalidad existente.
 */

import React from "react";
import { useResponsive } from "../hooks/useResponsive";
import ResponsiveEnhancer from "../components/layout/ResponsiveEnhancer";

// 1. IMPORTAR COMPONENTE ORIGINAL (ejemplo: Reports)
import OriginalReports from "../components/reports/Reports";

/**
 * 🔄 VERSIÓN MEJORADA DEL COMPONENTE
 * Mantiene 100% la funcionalidad original + mejoras móvil
 */
const MejorReports = () => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveEnhancer enabled={true}>
      {/* El componente original funciona igual */}
      <OriginalReports />

      {/* Indicador visual opcional para verificar que funciona */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            background: "rgba(0,255,0,0.8)",
            color: "white",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            zIndex: 9999,
          }}
        >
          📱 Versión Móvil Mejorada
        </div>
      )}
    </ResponsiveEnhancer>
  );
};

/**
 * 🚀 IMPLEMENTACIÓN EN TU APP
 *
 * PASO 1: En tu AppRouter.js o donde uses el componente:
 *
 * ANTES:
 * import Reports from './components/reports/Reports';
 *
 * DESPUÉS:
 * import Reports from './examples/EjemploMigracionSegura'; // ← Usar la versión mejorada
 *
 * ¡YA ESTÁ! No necesitas cambiar nada más.
 */

/**
 * 🔄 ROLLBACK INSTANTÁNEO
 *
 * Si hay cualquier problema, simplemente:
 * 1. Cambia el import de vuelta al original
 * 2. O comenta el ResponsiveEnhancer
 * 3. ¡Listo! Todo vuelve a como estaba
 */

/**
 * 🎨 PERSONALIZACIÓN ADICIONAL
 */
const MejorReportsPersonalizado = () => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <ResponsiveEnhancer
      enabled={true}
      // Puedes deshabilitar mejoras específicas si necesitas
      // autoEnhanceTables={false}
      // autoEnhanceForms={false}
    >
      <div
        style={{
          // Espaciado adicional solo en móvil
          padding: isMobile ? 8 : 0,
          // Fondo diferente en tablet
          background: isTablet ? "#f5f5f5" : "transparent",
        }}
      >
        <OriginalReports />
      </div>
    </ResponsiveEnhancer>
  );
};

/**
 * 📊 COMPARACIÓN LADO A LADO (para testing)
 */
export const ComparacionLadoALado = () => {
  const [showOriginal, setShowOriginal] = React.useState(false);

  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          zIndex: 9999,
          background: "white",
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          style={{
            padding: "8px 16px",
            background: showOriginal ? "#ff4d4f" : "#52c41a",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {showOriginal ? "📱 Ver Mejorado" : "🖥️ Ver Original"}
        </button>
      </div>

      {showOriginal ? <OriginalReports /> : <MejorReports />}
    </div>
  );
};

// Exportar la versión mejorada como predeterminada
export default MejorReports;

// También exportar las otras variantes
export { MejorReportsPersonalizado };
