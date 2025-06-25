/**
 * Utilidades globales para formateo de números en la aplicación Ikolu
 *
 * Formatos estándar:
 * - Enteros: 1.000 (punto como separador de miles)
 * - Decimales: 0.00 (punto como separador decimal, por solicitud)
 */

/**
 * Formateador principal para números enteros
 * Utiliza formato español/chileno: punto para miles
 *
 * @param {number|string} value - Valor numérico a formatear
 * @returns {string} - Número formateado como "1.000"
 */
export const formatInteger = (value) => {
  if (value === null || value === undefined || value === "") return "0";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  return Math.round(num).toLocaleString("es-CL");
};

/**
 * Formateador principal para números decimales
 * Utiliza formato español/chileno: punto para miles, coma para decimales
 *
 * @param {number|string} value - Valor numérico a formatear
 * @param {number} decimals - Número de decimales (por defecto 2)
 * @returns {string} - Número formateado como "1.000,00"
 */
export const formatDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined || value === "") return "0.00";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";

  // Formato chileno para separador de miles
  const chileanFormat = num.toLocaleString("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Reemplazar coma decimal por punto, según requerimiento
  return chileanFormat.replace(/,/g, ".");
};

/**
 * Formateador automático que decide entre entero o decimal
 * Si el número tiene decimales significativos, los muestra
 * Si no, muestra como entero
 *
 * @param {number|string} value - Valor numérico a formatear
 * @returns {string} - Número formateado automáticamente
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "0";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  // Si es un número entero o los decimales son insignificantes
  if (num % 1 === 0 || Math.abs(num % 1) < 0.01) {
    return formatInteger(num);
  }

  return formatDecimal(num);
};

/**
 * Formateador específico para volúmenes (m³)
 *
 * @param {number|string} value - Valor del volumen
 * @returns {string} - Volumen formateado
 */
export const formatVolume = (value) => {
  return formatInteger(value);
};

/**
 * Formateador específico para caudales (L/s)
 * Siempre muestra 2 decimales
 *
 * @param {number|string} value - Valor del caudal
 * @returns {string} - Caudal formateado
 */
export const formatFlow = (value) => {
  return formatDecimal(value, 2);
};

/**
 * Formateador específico para niveles freáticos (m)
 * Siempre muestra 2 decimales
 *
 * @param {number|string} value - Valor del nivel
 * @returns {string} - Nivel formateado
 */
export const formatLevel = (value) => {
  return formatDecimal(value, 2);
};

/**
 * Formateador para porcentajes
 *
 * @param {number|string} value - Valor del porcentaje (0-1 o 0-100)
 * @param {boolean} isDecimal - Si el valor está en formato decimal (0-1)
 * @returns {string} - Porcentaje formateado como "50,25%"
 */
export const formatPercentage = (value, isDecimal = false) => {
  if (value === null || value === undefined || value === "") return "0.00%";

  let num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00%";

  // Si está en formato decimal (0-1), convertir a porcentaje
  if (isDecimal) {
    num = num * 100;
  }

  return formatDecimal(num, 2) + "%";
};

/**
 * Clase singleton para mantener consistencia en toda la app
 */
class NumberFormatter {
  constructor() {
    // Configuraciones para diferentes locales
    this.formatters = {
      "es-CL": new Intl.NumberFormat("es-CL"),
      "de-DE": new Intl.NumberFormat("de-DE"), // Para compatibilidad con código existente
    };
  }

  // Métodos principales que delegan a las funciones exportadas
  integer(value) {
    return formatInteger(value);
  }
  decimal(value, decimals) {
    return formatDecimal(value, decimals);
  }
  number(value) {
    return formatNumber(value);
  }
  volume(value) {
    return formatVolume(value);
  }
  flow(value) {
    return formatFlow(value);
  }
  level(value) {
    return formatLevel(value);
  }
  percentage(value, isDecimal) {
    return formatPercentage(value, isDecimal);
  }

  // Método para mantener compatibilidad con código existente
  format(value) {
    return formatNumber(value);
  }
}

// Instancia singleton
export const numberFormatter = new NumberFormatter();

// Export por defecto para importación simple
export default {
  formatInteger,
  formatDecimal,
  formatNumber,
  formatVolume,
  formatFlow,
  formatLevel,
  formatPercentage,
  numberFormatter,
};
