export const COLORS = {
  max: '#E76F51',
  min: '#2A9D8F',
  avg: '#90E0EF',
  consumo: '#0077B6',
  caudal: '#00B4D8',
  nivel: '#0077B6',
  freatico: '#90E0EF',
};

export const CHART_METRICS = {
  consumo: { color: COLORS.consumo, unit: 'm³', title: 'Consumo' },
  caudal: { color: COLORS.caudal, unit: 'L/s', title: 'Caudal' },
  nivel: { color: COLORS.nivel, unit: 'm', title: 'Nivel' },
  water_table: { color: COLORS.freatico, unit: 'm', title: 'Freático' },
};
