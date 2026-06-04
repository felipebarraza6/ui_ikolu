export const COLORS = {
  max: '#E76F51',
  min: '#2A9D8F',
  avg: '#85A2D1',
  consumo: '#3A68AA',
  caudal: '#CCCF07',
  nivel: '#3A68AA',
  freatico: '#85A2D1',
};

export const CHART_METRICS = {
  consumo: { color: COLORS.consumo, unit: 'm³', title: 'Consumo' },
  caudal: { color: COLORS.caudal, unit: 'L/s', title: 'Caudal' },
  nivel: { color: COLORS.nivel, unit: 'm', title: 'Nivel' },
  water_table: { color: COLORS.freatico, unit: 'm', title: 'Freático' },
};
