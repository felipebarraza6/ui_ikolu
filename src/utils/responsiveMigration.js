import React from "react";
import ResponsiveEnhancer from "../components/layout/ResponsiveEnhancer";
import ResponsiveWrapper from "../components/layout/ResponsiveWrapper";
import withResponsiveTable from "../components/layout/withResponsiveTable";

/**
 * Configuración global para activar/desactivar mejoras responsivas
 */
const responsiveConfig = {
  enabled: true,
  autoEnhanceTables: true,
  autoEnhanceForms: true,
  autoEnhanceButtons: true,
  debug: false,
};

/**
 * Función para hacer cualquier componente responsivo sin modificar su código
 * USO: const ResponsiveMyComponent = makeResponsive(MyComponent);
 */
export const makeResponsive = (
  Component,
  options = { enhanceTables: true, enhanceForms: true }
) => {
  const ResponsiveComponent = (props) => {
    if (!responsiveConfig.enabled) {
      return <Component {...props} />;
    }

    let EnhancedComponent = Component;

    // Aplicar mejoras de tabla si está habilitado
    if (options.enhanceTables && responsiveConfig.autoEnhanceTables) {
      EnhancedComponent = withResponsiveTable(EnhancedComponent);
    }

    return (
      <ResponsiveEnhancer enabled={responsiveConfig.enabled}>
        <EnhancedComponent {...props} />
      </ResponsiveEnhancer>
    );
  };

  ResponsiveComponent.displayName = `Responsive(${
    Component.displayName || Component.name || "Component"
  })`;

  return ResponsiveComponent;
};

/**
 * Hook para obtener configuración responsiva
 */
export const useResponsiveConfig = () => {
  return {
    ...responsiveConfig,
    setEnabled: (enabled) => (responsiveConfig.enabled = enabled),
    setAutoEnhanceTables: (enabled) =>
      (responsiveConfig.autoEnhanceTables = enabled),
    setAutoEnhanceForms: (enabled) =>
      (responsiveConfig.autoEnhanceForms = enabled),
    setDebug: (enabled) => (responsiveConfig.debug = enabled),
  };
};

/**
 * Función para envolver rápidamente una página completa
 * USO: export default wrapPage(MyPage);
 */
export const wrapPage = (PageComponent, options = {}) => {
  return makeResponsive(PageComponent, {
    enhanceTables: true,
    enhanceForms: true,
    ...options,
  });
};

/**
 * Función para aplicar solo mejoras de tabla
 * USO: export default enhanceTablesOnly(MyTableComponent);
 */
export const enhanceTablesOnly = (Component) => {
  return withResponsiveTable(Component);
};

/**
 * Función para aplicar solo mejoras de estilo
 * USO: export default enhanceStylesOnly(MyComponent);
 */
export const enhanceStylesOnly = (Component) => {
  const StyledComponent = (props) => (
    <ResponsiveWrapper>
      <Component {...props} />
    </ResponsiveWrapper>
  );

  StyledComponent.displayName = `StyledResponsive(${
    Component.displayName || Component.name || "Component"
  })`;

  return StyledComponent;
};

/**
 * Migración automática por lotes
 * Aplica mejoras a múltiples componentes de una vez
 */
export const batchMigration = (components = {}) => {
  const migratedComponents = {};

  Object.keys(components).forEach((key) => {
    const Component = components[key];
    migratedComponents[key] = makeResponsive(Component);

    if (responsiveConfig.debug) {
      console.log(`✅ Migrated component: ${key}`);
    }
  });

  return migratedComponents;
};

/**
 * Utilidad para migración condicional
 * Solo aplica mejoras si se cumple una condición
 */
export const conditionalMigration = (Component, condition) => {
  return (props) => {
    if (condition && condition(props)) {
      const ResponsiveComponent = makeResponsive(Component);
      return <ResponsiveComponent {...props} />;
    }
    return <Component {...props} />;
  };
};

/**
 * Preset de migración para diferentes tipos de componentes
 */
export const presets = {
  // Para páginas completas
  fullPage: (Component) => wrapPage(Component),

  // Para componentes con tablas
  tableHeavy: (Component) =>
    makeResponsive(Component, { enhanceTables: true, enhanceForms: false }),

  // Para formularios
  formHeavy: (Component) =>
    makeResponsive(Component, { enhanceTables: false, enhanceForms: true }),

  // Solo mejoras visuales
  visualOnly: (Component) => enhanceStylesOnly(Component),

  // Migración mínima (solo estilos globales)
  minimal: (Component) => {
    const MinimalComponent = (props) => (
      <ResponsiveEnhancer>
        <Component {...props} />
      </ResponsiveEnhancer>
    );
    return MinimalComponent;
  },
};

/**
 * Función de debug para verificar qué componentes han sido migrados
 */
export const debugMigration = () => {
  if (responsiveConfig.debug) {
    console.group("🔍 Responsive Migration Debug");
    console.log("Config:", responsiveConfig);
    console.log("Available presets:", Object.keys(presets));
    console.groupEnd();
  }
};

// Auto-ejecutar debug si está habilitado
if (responsiveConfig.debug) {
  debugMigration();
}

export default {
  makeResponsive,
  wrapPage,
  enhanceTablesOnly,
  enhanceStylesOnly,
  batchMigration,
  conditionalMigration,
  presets,
  useResponsiveConfig,
  debugMigration,
};
