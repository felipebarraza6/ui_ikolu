/**
 * 🚨 SOLUCIÓN AL PROBLEMA DEL SIDEBAR EN MÓVIL
 *
 * Basado en tu captura, el problema es que el sidebar no se oculta correctamente
 * y comprime todo el contenido hacia un lado. ¡Aquí está la solución!
 */

import React from "react";
import {
  FixSidebarProblem,
  withFullscreenMobile,
} from "../components/layout/MobileFullscreenFix";
import { SensorModuleLayout } from "../components/layout/MobileModuleLayout";
import {
  formatVolume,
  formatFlow,
  formatLevel,
} from "../utils/numberFormatter";

/**
 * 🔧 COMPONENTE CORREGIDO BASADO EN TU CAPTURA
 * Esta es la solución exacta para el problema que veo
 */
const ModuloBSinSidebar = () => {
  // Datos exactos de tu captura
  const sensorData = [
    {
      icon: "🕐",
      value: formatVolume(86),
      unit: "(m³)",
      time: "13:00 hrs",
      color: "#1f3461",
    },
    {
      icon: "⚡",
      label: "Caudal",
      value: formatFlow(0.0),
      unit: "(L/s)",
      color: "#1f3461",
    },
    {
      icon: "🌊",
      label: "Nivel Freático",
      value: formatLevel(20.9),
      unit: "(m)",
      color: "#1f3461",
    },
    {
      icon: "💧",
      label: "Acumulado",
      value: formatVolume(351566),
      unit: "(m³)",
      color: "#1f3461",
    },
  ];

  return (
    <FixSidebarProblem>
      <SensorModuleLayout
        moduleTitle="MÓDULO B"
        moduleCode="UB-030277"
        sensorData={sensorData}
        headerColor="#1f3461"
        backgroundColor="#f0f2f5"
      />
    </FixSidebarProblem>
  );
};

/**
 * 🚀 CÓMO APLICAR LA SOLUCIÓN A TU COMPONENTE EXISTENTE
 *
 * OPCIÓN 1: Envolver tu componente actual
 */
export const SolucionRapida = ({ ComponenteOriginal, ...props }) => {
  return (
    <FixSidebarProblem>
      <ComponenteOriginal {...props} />
    </FixSidebarProblem>
  );
};

/**
 * 🔄 OPCIÓN 2: Usar HOC (Higher Order Component)
 */
export const ComponenteConSolucion = withFullscreenMobile(
  ModuloBSinSidebar,
  "ModuloBMobileSafe"
);

/**
 * 📱 IMPLEMENTACIÓN EN TU APP
 *
 * En AppRouter.js o donde uses el componente:
 *
 * ANTES (problema del sidebar):
 * <TuComponente />
 *
 * DESPUÉS (solución aplicada):
 * <FixSidebarProblem>
 *   <TuComponente />
 * </FixSidebarProblem>
 *
 * O más simple:
 * <SolucionRapida ComponenteOriginal={TuComponente} />
 */

/**
 * 🎯 SOLUCIÓN ESPECÍFICA PARA EL LAYOUT DE TU APP
 */
export const LayoutIkoluMobileFix = ({ children }) => {
  return (
    <>
      {/* CSS crítico para anular el sidebar problemático */}
      <style>{`
        @media (max-width: 768px) {
          /* Ocultar completamente el sidebar en móvil */
          .ant-layout-sider {
            display: none !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Forzar que el contenido use toda la pantalla */
          .ant-layout-content {
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
          }
          
          /* Anular cualquier margen del layout principal */
          .ant-layout {
            margin: 0 !important;
          }
          
          /* Evitar scroll horizontal */
          body, html {
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Ocultar el menú hamburger problemático */
          .hamburger-menu {
            display: none !important;
          }
        }
      `}</style>

      {/* Contenido con solución aplicada */}
      <FixSidebarProblem>{children}</FixSidebarProblem>
    </>
  );
};

/**
 * 📊 COMPONENTE DE TESTING
 * Para comparar antes y después de la solución
 */
export const TestingSidebar = ({ ComponenteOriginal }) => {
  const [usarSolucion, setUsarSolucion] = React.useState(true);

  return (
    <div>
      {/* Control para testing */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 10000,
          background: "white",
          padding: 10,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #ddd",
        }}
      >
        <button
          onClick={() => setUsarSolucion(!usarSolucion)}
          style={{
            padding: "8px 16px",
            background: usarSolucion ? "#52c41a" : "#ff4d4f",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {usarSolucion ? "✅ Con Solución" : "❌ Con Problema"}
        </button>
      </div>

      {/* Renderizar según la selección */}
      {usarSolucion ? (
        <ModuloBSinSidebar />
      ) : ComponenteOriginal ? (
        <ComponenteOriginal />
      ) : (
        <div
          style={{
            padding: 20,
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
          }}
        >
          <h3>⚠️ Versión con Problema</h3>
          <p>Aquí se vería el contenido comprimido por el sidebar</p>
        </div>
      )}
    </div>
  );
};

// Exportar la solución principal
export default ModuloBSinSidebar;
