import moment from "moment";

/**
 * Los formatos de fecha que el backend puede enviar.
 * Algunos puntos envían YYYY-MM-DD y otros YYYY-DD-MM.
 */
export const FLEXIBLE_DATE_FORMATS = [
  moment.ISO_8601,
  "YYYY-DD-MM HH:mm",
  "YYYY-MM-DD HH:mm",
  "YYYY-DD-MM",
  "YYYY-MM-DD",
  "YYYY-MM-DD HH:mm:ss",
];

/**
 * Parsea una fecha de forma segura usando formatos flexibles.
 * @param {string|Date|moment.Moment} date - La fecha a parsear
 * @returns {moment.Moment} - Objeto moment (puede ser inválido si falla el parseo)
 */
export const parseSafeDate = (date) => {
  if (!date) return moment.invalid();
  
  // Si ya es un objeto moment
  if (moment.isMoment(date)) return date;
  
  // Si es un string, usar los formatos flexibles
  if (typeof date === "string") {
    return moment(date, FLEXIBLE_DATE_FORMATS);
  }
  
  // Para otros tipos (Date object, etc)
  return moment(date);
};

/**
 * Formatea una fecha de forma segura.
 * @param {string|Date|moment.Moment} date - La fecha
 * @param {string} format - El formato de salida (por defecto DD/MM/YYYY HH:mm)
 * @param {string} fallback - El valor a retornar si la fecha es inválida
 * @returns {string}
 */
export const formatSafeDate = (date, format = "DD/MM/YYYY HH:mm", fallback = "—") => {
  const m = parseSafeDate(date);
  return m.isValid() ? m.format(format) : fallback;
};

export default {
  FLEXIBLE_DATE_FORMATS,
  parseSafeDate,
  formatSafeDate,
};
