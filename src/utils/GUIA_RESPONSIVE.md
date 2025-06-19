# 📱 Guía de Responsive Design - Ikolu App

## 🎯 Componentes Responsivos Disponibles

### 1. **ResponsiveLayout**

Layout principal que se adapta automáticamente entre desktop y móvil.

```javascript
import ResponsiveLayout from "../components/layout/ResponsiveLayout";

const MyPage = () => (
  <ResponsiveLayout>
    <div>Contenido de la página</div>
  </ResponsiveLayout>
);
```

### 2. **MobileOptimizedTable**

Tabla que se convierte en cards en móvil.

```javascript
import MobileOptimizedTable from "../components/layout/MobileOptimizedTable";

const MyTable = () => (
  <MobileOptimizedTable
    dataSource={data}
    columns={columns}
    title="Mi Tabla"
    loading={loading}
  />
);
```

### 3. **MobileOptimizedForm**

Formulario optimizado para pantallas táctiles.

```javascript
import MobileOptimizedForm, {
  MobileInput,
  MobileDatePicker,
  MobileSelect,
} from "../components/layout/MobileOptimizedForm";

const MyForm = () => (
  <MobileOptimizedForm
    form={form}
    onFinish={handleSubmit}
    title="Mi Formulario"
  >
    <Form.Item name="name" label="Nombre">
      <MobileInput placeholder="Ingresa tu nombre" />
    </Form.Item>
    <Form.Item name="date" label="Fecha">
      <MobileDatePicker />
    </Form.Item>
  </MobileOptimizedForm>
);
```

## 🪝 Hooks de Responsividad

### 1. **useResponsive**

Hook completo con todas las utilidades.

```javascript
import { useResponsive } from "../hooks/useResponsive";

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, getColSpan, getSpacing, getAntdSize } =
    useResponsive();

  return (
    <Row gutter={[getSpacing(), getSpacing()]}>
      <Col span={getColSpan(24, 12, 8)}>
        <Button size={getAntdSize()}>Mi Botón</Button>
      </Col>
    </Row>
  );
};
```

### 2. **useIsMobile**

Hook simple para detectar móvil.

```javascript
import { useIsMobile } from "../hooks/useResponsive";

const MyComponent = () => {
  const isMobile = useIsMobile();

  return <div style={{ padding: isMobile ? 16 : 24 }}>Contenido</div>;
};
```

## 📏 Breakpoints Estándar

```javascript
const breakpoints = {
  xs: 0, // Teléfonos muy pequeños
  sm: 576, // Teléfonos
  md: 768, // Tablets
  lg: 992, // Desktop pequeño
  xl: 1200, // Desktop
  xxl: 1600, // Desktop grande
};
```

## 🎨 Mejores Prácticas

### ✅ **DO's (Hacer)**

1. **Usar hooks de responsividad**

```javascript
// ✅ Bien
const { isMobile, getSpacing } = useResponsive();
const spacing = getSpacing(16, 24);

// ❌ Mal
const spacing = window.innerWidth < 768 ? 16 : 24;
```

2. **Tamaños de componentes adaptativos**

```javascript
// ✅ Bien
<Button size={isMobile ? "large" : "middle"}>Botón</Button>

// ❌ Mal
<Button>Botón</Button>
```

3. **Grids responsivos**

```javascript
// ✅ Bien
<Col xs={24} sm={12} md={8} lg={6}>Contenido</Col>

// ❌ Mal
<Col span={6}>Contenido</Col>
```

4. **Spacing adaptativo**

```javascript
// ✅ Bien
const spacing = isMobile ? 16 : 24;
<Row gutter={[spacing, spacing]}>

// ❌ Mal
<Row gutter={[24, 24]}>
```

### ❌ **DON'Ts (No hacer)**

1. **No usar valores fijos para móvil**

```javascript
// ❌ Mal
style={{ fontSize: '12px', padding: '8px' }}

// ✅ Bien
style={{
  fontSize: getFontSize(14, 16),
  padding: getSpacing(12, 16)
}}
```

2. **No ignorar la accesibilidad táctil**

```javascript
// ❌ Mal - muy pequeño para tocar
<Button style={{ height: 24 }}>

// ✅ Bien - tamaño mínimo 44px para móvil
<Button style={{ height: getHeight(44, 32) }}>
```

## 📊 Patrones de Componentes

### 1. **Tablas → Cards en Móvil**

```javascript
const MyTable = () => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        {data.map((item) => (
          <Card key={item.id} size="small">
            <Row justify="space-between">
              <Col>
                <Text strong>Nombre:</Text>
              </Col>
              <Col>{item.name}</Col>
            </Row>
          </Card>
        ))}
      </Space>
    );
  }

  return <Table dataSource={data} columns={columns} />;
};
```

### 2. **Formularios Apilados en Móvil**

```javascript
const MyForm = () => {
  const { isMobile } = useResponsive();

  return (
    <Form layout={isMobile ? "vertical" : "horizontal"}>
      <Row gutter={[16, 16]}>
        <Col span={isMobile ? 24 : 12}>
          <Form.Item name="field1">
            <Input size={isMobile ? "large" : "middle"} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
```

### 3. **Navegación Adaptativa**

```javascript
const Navigation = () => {
  const { isMobile } = useResponsive();

  return isMobile ? <BottomNavigation /> : <SidebarNavigation />;
};
```

## 🔧 Configuración Global

### CSS Variables para Responsive

```css
:root {
  --mobile-padding: 16px;
  --desktop-padding: 24px;
  --mobile-font-size: 14px;
  --desktop-font-size: 16px;
  --touch-target-size: 44px;
}

@media (max-width: 768px) {
  .responsive-padding {
    padding: var(--mobile-padding);
  }
  .responsive-font {
    font-size: var(--mobile-font-size);
  }
}
```

### Tema Ant Design Personalizado

```javascript
const responsiveTheme = {
  token: {
    fontSize: isMobile ? 14 : 16,
    controlHeight: isMobile ? 44 : 32,
    borderRadius: 8,
  },
  components: {
    Button: {
      controlHeight: isMobile ? 44 : 32,
    },
    Input: {
      controlHeight: isMobile ? 44 : 32,
    },
  },
};
```

## 📝 Migración de Componentes Existentes

### Paso 1: Identificar Componentes No Responsivos

```bash
# Buscar patrones problemáticos
grep -r "window.innerWidth" src/
grep -r "style={{.*px" src/
grep -r "span={[0-9]" src/
```

### Paso 2: Aplicar Hooks de Responsividad

```javascript
// Antes
const MyComponent = () => (
  <div style={{ padding: "24px" }}>
    <Row>
      <Col span={8}>Contenido</Col>
    </Row>
  </div>
);

// Después
const MyComponent = () => {
  const { getSpacing, getColSpan } = useResponsive();

  return (
    <div style={{ padding: getSpacing() }}>
      <Row>
        <Col span={getColSpan(24, 12, 8)}>Contenido</Col>
      </Row>
    </div>
  );
};
```

### Paso 3: Usar Componentes Optimizados

```javascript
// Antes
<Table dataSource={data} columns={columns} />

// Después
<MobileOptimizedTable dataSource={data} columns={columns} />
```

## 🚀 Mejoras Implementadas

### ✅ **Navegación Móvil**

- Drawer deslizable para menú principal
- Bottom navigation con accesos rápidos
- Header compacto con acciones esenciales

### ✅ **Layout Responsivo**

- Sidebar colapsable automáticamente
- Contenido adaptativo con margins inteligentes
- Footer que se oculta en móvil

### ✅ **Componentes Optimizados**

- Tablas que se convierten en cards
- Formularios con campos más grandes
- Botones con área táctil mínima de 44px

### ✅ **UX Mejorada**

- Transiciones suaves entre breakpoints
- Gestos táctiles nativos
- Performance optimizada

## 🎯 Próximos Pasos

1. **Migrar todos los componentes** a usar hooks responsivos
2. **Implementar nuevos patrones** en componentes complejos
3. **Testear en dispositivos reales** para validar UX
4. **Optimizar performance** con lazy loading
5. **Añadir PWA capabilities** para mejor experiencia móvil

---

_Recuerda: La responsividad no es solo sobre tamaños de pantalla, sino sobre crear la mejor experiencia para cada dispositivo._
