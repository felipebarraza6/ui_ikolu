/**
 * 🎯 EJEMPLO: LAYOUT MEJORADO PARA TU CAPTURA
 *
 * Este archivo muestra cómo mejorar el layout exacto que veo en tu captura
 * sin romper nada del código existente.
 */

import React from "react";
import { SensorModuleLayout } from "../components/layout/MobileModuleLayout";
import {
  formatVolume,
  formatFlow,
  formatLevel,
} from "../utils/numberFormatter";

/**
 * 🔄 COMPONENTE MEJORADO BASADO EN TU CAPTURA
 * Replica exactamente lo que veo en la imagen pero optimizado
 */
const ModuloBMejorado = ({ data, moduleInfo, ...props }) => {
  // Datos de ejemplo basados en tu captura
  const datosSensoresEjemplo = [
    {
      icon: "🕐",
      label: "",
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
    <SensorModuleLayout
      moduleTitle="MÓDULO B"
      moduleCode="UB-030277"
      sensorData={data || datosSensoresEjemplo}
      headerColor="#1f3461"
      backgroundColor="#f0f2f5"
      {...props}
    />
  );
};

/**
 * 🚀 CÓMO IMPLEMENTAR EN TU APP
 *
 * OPCIÓN 1: Reemplazar componente existente
 * En tu AppRouter.js o donde muestres el módulo:
 *
 * ANTES:
 * <ComponenteOriginal />
 *
 * DESPUÉS:
 * <ModuloBMejorado />
 */

/**
 * 🔄 WRAPPER PARA COMPONENTE EXISTENTE
 * Si ya tienes un componente funcionando, envuélvelo así:
 */
export const WrapperModuloExistente = ({ ComponenteOriginal, ...props }) => {
  return (
    <SensorModuleLayout
      moduleTitle="MÓDULO B"
      moduleCode="UB-030277"
      headerColor="#1f3461"
    >
      {/* Tu componente actual funciona igual */}
      <ComponenteOriginal {...props} />
    </SensorModuleLayout>
  );
};

/**
 * 📊 COMPARACIÓN VISUAL
 * Para que veas la diferencia lado a lado
 */
export const ComparacionLayouts = ({ ComponenteOriginal }) => {
  const [mostrarMejorado, setMostrarMejorado] = React.useState(true);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* Botón para alternar */}
      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          zIndex: 9999,
          background: "white",
          padding: 10,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => setMostrarMejorado(!mostrarMejorado)}
          style={{
            padding: "8px 16px",
            background: mostrarMejorado ? "#52c41a" : "#1890ff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {mostrarMejorado ? "📱 Layout Mejorado" : "🖥️ Layout Original"}
        </button>
      </div>

      {/* Mostrar componente según selección */}
      {mostrarMejorado ? (
        <ModuloBMejorado />
      ) : ComponenteOriginal ? (
        <ComponenteOriginal />
      ) : (
        <div style={{ padding: 20 }}>
          <h3>Componente Original</h3>
          <p>Aquí iría tu componente actual</p>
        </div>
      )}
    </div>
  );
};

/**
 * 🎨 PERSONALIZACIÓN ADICIONAL
 * Puedes cambiar colores, espaciado, etc.
 */
export const ModuloBPersonalizado = (props) => {
  return (
    <SensorModuleLayout
      moduleTitle="MÓDULO B"
      moduleCode="UB-030277"
      headerColor="#2c5aa0" // Color personalizado
      backgroundColor="#f8f9fa" // Fondo personalizado
      sensorData={[
        {
          icon: "⏰",
          label: "Última Lectura",
          value: "86",
          unit: " m³",
          time: "13:00 hrs",
          color: "#2c5aa0",
        },
        // ... más sensores
      ]}
      {...props}
    />
  );
};

// Exportar el componente principal
export default ModuloBMejorado;
