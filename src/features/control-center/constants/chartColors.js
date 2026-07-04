// Paleta Void para el Centro de Control: blancos/grises con opacidad.
// Solo se conservan colores semánticos para máximos/mínimos.
export const COLORS = {
  max: '#E76F51',
  min: '#2A9D8F',
  avg: 'rgba(255, 255, 255, 0.7)',
  consumo: 'rgba(255, 255, 255, 0.85)',
  caudal: 'rgba(255, 255, 255, 0.6)',
  nivel: 'rgba(255, 255, 255, 0.5)',
  freatico: 'rgba(255, 255, 255, 0.4)',
};

export const CHART_METRICS = {
  consumo: { color: COLORS.consumo, unit: 'm³', title: 'Consumo' },
  caudal: { color: COLORS.caudal, unit: 'L/s', title: 'Caudal' },
  nivel: { color: COLORS.nivel, unit: 'm', title: 'Nivel' },
  water_table: { color: COLORS.freatico, unit: 'm', title: 'Freático' },
};
