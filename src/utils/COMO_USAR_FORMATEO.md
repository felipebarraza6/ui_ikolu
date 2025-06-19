# 🔢 Guía de Formateo de Números - Ikolu App

## 📋 Funciones Globales Disponibles

### Importación

```javascript
import {
  formatInteger,
  formatDecimal,
  formatNumber,
  formatVolume,
  formatFlow,
  formatLevel,
  formatPercentage,
  numberFormatter,
} from "../utils/numberFormatter";
```

## 🎯 Casos de Uso Específicos

### 1. **Volúmenes (m³)**

```javascript
// ❌ Antes
render: (total) => parseInt(total).toLocaleString("es-CL");
render: (a) => numberForMiles.format(a);

// ✅ Ahora
render: (total) => formatVolume(total);
// Resultado: "1.234" (sin decimales)
```

### 2. **Caudales (L/s)**

```javascript
// ❌ Antes
render: (flow) => parseFloat(flow).toFixed(2);

// ✅ Ahora
render: (flow) => formatFlow(flow);
// Resultado: "123,45" (siempre 2 decimales)
```

### 3. **Niveles Freáticos (m)**

```javascript
// ❌ Antes
render: (nivel) => parseFloat(nivel).toFixed(1);

// ✅ Ahora
render: (nivel) => formatLevel(nivel);
// Resultado: "12,50" (siempre 2 decimales)
```

### 4. **Números Enteros**

```javascript
// ❌ Antes
value.toLocaleString("es-CL");

// ✅ Ahora
formatInteger(value);
// Resultado: "1.234"
```

### 5. **Números Decimales**

```javascript
// ❌ Antes
parseFloat(value).toLocaleString("es-ES", { minimumFractionDigits: 2 });

// ✅ Ahora
formatDecimal(value, 2); // 2 decimales
// Resultado: "1.234,56"
```

## 📊 Ejemplos en Tablas (Ant Design)

```javascript
const columns = [
  {
    title: "Caudal (L/s)",
    dataIndex: "flow",
    render: (flow) => formatFlow(flow),
  },
  {
    title: "Acumulado (m³)",
    dataIndex: "total",
    render: (total) => formatVolume(total),
  },
  {
    title: "Nivel Freático (m)",
    dataIndex: "water_table",
    render: (level) => formatLevel(level),
  },
  {
    title: "Porcentaje (%)",
    dataIndex: "percentage",
    render: (pct) => formatPercentage(pct),
  },
];
```

## 🎨 Ejemplos en Gráficos

```javascript
// Para tooltips en gráficos
const chartConfig = {
  tooltip: {
    formatter: (value, name) => {
      if (name === "total") return formatVolume(value) + " m³";
      if (name === "flow") return formatFlow(value) + " L/s";
      if (name === "level") return formatLevel(value) + " m";
      return formatNumber(value);
    },
  },
};
```

## 🏷️ Ejemplos en Componentes

```javascript
// En tags, títulos, textos
<Tag>{formatVolume(flow_granted_dga)} m³</Tag>
<Title level={4}>{formatFlow(currentFlow)} L/s</Title>
<p>Consumo total: {formatVolume(totalConsumption)} m³</p>
```

## 🔄 Migración del Código Existente

### Buscar y Reemplazar

1. **`parseInt(value).toLocaleString("es-CL")`** → **`formatVolume(value)`**
2. **`parseFloat(value).toFixed(2)`** → **`formatFlow(value)`** (para caudales)
3. **`parseFloat(value).toFixed(1)`** → **`formatLevel(value)`** (para niveles)
4. **`numberForMiles.format(a)`** → **`formatVolume(a)`** (para volúmenes)
5. **`new Intl.NumberFormat("de-DE")`** → **Usar funciones directas**

### ⚠️ Archivos que Necesitan Actualización

- `src/components/reports/Reports.js` ✅ (En proceso)
- `src/components/mywell/TableStandarVerySmall.js`
- `src/components/smart_data/*/TableData.js`
- `src/components/Sma.js`
- `src/components/graphics/Stats.js`
- `src/components/home/Supp.js`
- Y muchos más...

## 🧪 Formato de Salida

| Entrada | Función                        | Salida     |
| ------- | ------------------------------ | ---------- |
| 1234    | `formatInteger(1234)`          | "1.234"    |
| 1234.56 | `formatDecimal(1234.56)`       | "1.234,56" |
| 1234.5  | `formatFlow(1234.5)`           | "1.234,50" |
| 12.3    | `formatLevel(12.3)`            | "12,30"    |
| 0.75    | `formatPercentage(0.75, true)` | "75,00%"   |

## 🎯 Beneficios

✅ **Consistencia**: Mismo formato en toda la app  
✅ **Mantenibilidad**: Un solo lugar para cambiar formatos  
✅ **Legibilidad**: Funciones con nombres descriptivos  
✅ **Flexibilidad**: Diferentes funciones para diferentes tipos de datos  
✅ **Internacionalización**: Fácil cambio de locale en el futuro

## 🚀 Próximos Pasos

1. Migrar todos los archivos que usan formateo de números
2. Eliminar instancias de `new Intl.NumberFormat()`
3. Crear tests unitarios para las funciones
4. Considerar añadir más formatos específicos si es necesario

---

_Recuerda: Siempre importar las funciones desde `../utils/numberFormatter` y usar la función más específica para cada tipo de dato._
