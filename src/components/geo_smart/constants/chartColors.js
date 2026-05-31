export const COLORS = {
  max: '#ff4d4f',
  min: '#52c41a',
  avg: '#000000',
  consumo: '#096dd9',
  caudal: '#13c2c2',
  nivel: '#1890ff',
  freatico: '#8c8c8c',
};

export const CHART_METRICS = {
  consumo: { color: COLORS.consumo, unit: 'm³', title: 'Consumo' },
  caudal: { color: COLORS.caudal, unit: 'L/s', title: 'Caudal' },
  nivel: { color: COLORS.nivel, unit: 'm', title: 'Nivel' },
  water_table: { color: COLORS.freatico, unit: 'm', title: 'Freático' },
};
