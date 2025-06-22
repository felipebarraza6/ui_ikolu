import React from "react";
import {
  Card,
  Typography,
  Divider,
  List,
  Avatar,
  Space,
  Collapse,
  Tag,
  Table,
} from "antd";
import {
  BookOutlined,
  ApiOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  MobileOutlined,
  CodeOutlined,
  SettingOutlined,
  BugOutlined,
  GithubOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const Documentation = () => {
  // Datos para la tabla de endpoints
  const endpointsData = [
    {
      key: "1",
      method: "GET",
      endpoint: "/api/wells",
      description: "Obtiene lista de pozos disponibles",
      response: "Array de objetos pozo",
      auth: "Bearer Token",
    },
    {
      key: "2",
      method: "GET",
      endpoint: "/api/wells/{id}/data",
      description: "Obtiene datos históricos de un pozo",
      response: "Array de registros de datos",
      auth: "Bearer Token",
    },
    {
      key: "3",
      method: "POST",
      endpoint: "/api/wells/{id}/manual-data",
      description: "Envía datos manuales de medición",
      response: "Confirmación de guardado",
      auth: "Bearer Token",
    },
    {
      key: "4",
      method: "GET",
      endpoint: "/api/dga/reports",
      description: "Obtiene reportes DGA",
      response: "Array de reportes",
      auth: "Bearer Token",
    },
    {
      key: "5",
      method: "POST",
      endpoint: "/api/dga/send-report",
      description: "Envía reporte a DGA",
      response: "Confirmación de envío",
      auth: "Bearer Token",
    },
  ];

  const endpointsColumns = [
    {
      title: "Método",
      dataIndex: "method",
      key: "method",
      render: (method) => (
        <Tag
          color={
            method === "GET" ? "green" : method === "POST" ? "blue" : "orange"
          }
        >
          {method}
        </Tag>
      ),
    },
    {
      title: "Endpoint",
      dataIndex: "endpoint",
      key: "endpoint",
      render: (endpoint) => <Text code>{endpoint}</Text>,
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Respuesta",
      dataIndex: "response",
      key: "response",
    },
    {
      title: "Autenticación",
      dataIndex: "auth",
      key: "auth",
    },
  ];

  // Estructura JSON de ejemplo
  const jsonStructure = {
    well: {
      id: "string",
      title: "string",
      code_dga: "string",
      config_data: {
        is_telemetry: "boolean",
        standard: "string",
      },
      dga: {
        send_dga: "boolean",
        code_dga: "string",
      },
    },
    measurement_data: {
      timestamp: "ISO 8601",
      level: "number",
      flow: "number",
      volume: "number",
      quality: "object",
    },
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <Card>
        <Title level={2}>
          <BookOutlined /> Documentación Técnica del Sistema Ikoku
        </Title>
        <Paragraph>
          Documentación técnica completa de Ikoku, desarrollado por SmartHydro.
          Esta guía describe la arquitectura, APIs, flujo de datos y componentes
          técnicos de la aplicación.
        </Paragraph>

        <Card
          type="inner"
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                background: "white",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <GithubOutlined style={{ fontSize: 32, color: "#333" }} />
            </div>
            <div style={{ color: "white" }}>
              <Title level={3} style={{ color: "white", margin: 0 }}>
                🚀 Código Abierto
              </Title>
              <Paragraph style={{ color: "white", margin: 0, fontSize: 16 }}>
                Ikoku es un proyecto de{" "}
                <Text strong style={{ color: "white" }}>
                  código abierto
                </Text>{" "}
                desarrollado por SmartHydro. Esto significa que el código fuente
                está disponible públicamente, permitiendo transparencia,
                colaboración y mejora continua de la plataforma.
              </Paragraph>
            </div>
          </div>
        </Card>

        <Card
          type="inner"
          title="¿Por qué Código Abierto?"
          style={{ marginBottom: 24 }}
        >
          <List
            size="large"
            dataSource={[
              {
                title: "🔍 Transparencia Total",
                description:
                  "El código fuente es completamente visible y auditable por cualquier desarrollador o auditor.",
              },
              {
                title: "🤝 Colaboración Comunitaria",
                description:
                  "Permite que la comunidad de desarrolladores contribuya con mejoras, correcciones y nuevas funcionalidades.",
              },
              {
                title: "🛡️ Seguridad Mejorada",
                description:
                  "Al ser público, más ojos pueden revisar el código, identificando y corrigiendo vulnerabilidades más rápidamente.",
              },
              {
                title: "📈 Innovación Continua",
                description:
                  "La naturaleza colaborativa fomenta la innovación y el desarrollo de mejores soluciones.",
              },
              {
                title: "💰 Costos Reducidos",
                description:
                  "Elimina costos de licencias propietarias y permite personalizaciones sin restricciones.",
              },
              {
                title: "🌍 Accesibilidad",
                description:
                  "Organizaciones de cualquier tamaño pueden implementar y adaptar la solución a sus necesidades.",
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Text strong style={{ fontSize: 16 }}>
                      {item.title}
                    </Text>
                  }
                  description={
                    <Text style={{ fontSize: 14 }}>{item.description}</Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <Divider />

        <Title level={3}>
          <ApiOutlined /> APIs y Endpoints
        </Title>
        <Paragraph>
          La aplicación utiliza dos APIs principales según el entorno y cliente:{" "}
          <Text strong>Novus API</Text> y{" "}
          <Text strong>SmartHydro (SH) API</Text>.
        </Paragraph>

        <Card type="inner" title="Configuración de APIs">
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: "Novus API",
                description:
                  "Configuración en `src/api/novus/config.js`. Utilizada para clientes específicos con endpoints personalizados.",
                location: "src/api/novus/",
              },
              {
                title: "SmartHydro (SH) API",
                description:
                  "Configuración en `src/api/sh/config.js`. API principal para la mayoría de operaciones.",
                location: "src/api/sh/",
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<ApiOutlined />} />}
                  title={item.title}
                  description={
                    <div>
                      <div>{item.description}</div>
                      <Text type="secondary">Ubicación: {item.location}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <Title level={4}>Endpoints Principales</Title>
        <Table
          dataSource={endpointsData}
          columns={endpointsColumns}
          pagination={false}
          size="small"
          style={{ marginBottom: 24 }}
        />

        <Divider />

        <Title level={3}>
          <DatabaseOutlined /> Arquitectura de Datos
        </Title>

        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Card type="inner" title="Estructura JSON de Datos">
            <Paragraph>
              Los datos se estructuran en formatos JSON específicos para cada
              entidad del sistema.
            </Paragraph>
            <Collapse defaultActiveKey={["1"]}>
              <Panel header="Estructura de Pozo (Well)" key="1">
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: 16,
                    borderRadius: 4,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(jsonStructure.well, null, 2)}
                </pre>
              </Panel>
              <Panel header="Estructura de Datos de Medición" key="2">
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: 16,
                    borderRadius: 4,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(jsonStructure.measurement_data, null, 2)}
                </pre>
              </Panel>
            </Collapse>
          </Card>

          <Card type="inner" title="Procesamiento de Datos">
            <Paragraph>
              El procesamiento de datos se realiza principalmente en el frontend
              después de recibir los datos crudos de la API.
            </Paragraph>
            <List
              size="small"
              dataSource={[
                "Cálculo de promedios y totales en tiempo real",
                "Transformación de datos para gráficos (Ant Design Charts)",
                "Validación y limpieza de datos recibidos",
                "Cálculo de tendencias y estadísticas",
                "Formateo de fechas y números para visualización",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Space>

        <Divider />

        <Title level={3}>
          <CodeOutlined /> Componentes Principales
        </Title>

        <Space direction="vertical" style={{ width: "100%" }}>
          <Card type="inner" title="Home.js - Layout Principal">
            <Paragraph>
              <Text strong>Responsabilidad:</Text> Componente principal que
              renderiza el layout de la aplicación con navegación lateral.
            </Paragraph>
            <Paragraph>
              <Text strong>Optimizaciones:</Text> Separación en `DesktopLayout`
              y `MobileLayout` para optimizar rendimiento. Uso del hook
              `useResponsive` para determinar el layout apropiado.
            </Paragraph>
            <Paragraph>
              <Text strong>Rutas:</Text> Maneja todas las rutas internas de la
              aplicación a través del componente `AppRoutes`.
            </Paragraph>
          </Card>

          <Card type="inner" title="ListWells.js - Selector de Pozos">
            <Paragraph>
              <Text strong>Responsabilidad:</Text> Muestra y permite la
              selección de pozos disponibles para el usuario.
            </Paragraph>
            <Paragraph>
              <Text strong>Optimizaciones:</Text> Uso de `React.memo`,
              `useCallback` y `useMemo` para evitar renderizados innecesarios.
              Hook `useResponsive` para adaptación móvil.
            </Paragraph>
            <Paragraph>
              <Text strong>Estado:</Text> Integrado con el contexto global de la
              aplicación para manejar la selección de pozos.
            </Paragraph>
          </Card>

          <Card type="inner" title="GraphicLine.js - Visualización">
            <Paragraph>
              <Text strong>Responsabilidad:</Text> Renderiza gráficos de línea
              para mostrar tendencias de datos (caudal, nivel, volumen).
            </Paragraph>
            <Paragraph>
              <Text strong>Optimizaciones:</Text> Constantes y helpers movidos
              fuera del componente. Cálculos de datos y configuraciones
              memoizados con `useMemo`.
            </Paragraph>
            <Paragraph>
              <Text strong>Librería:</Text> Utiliza Ant Design Charts para la
              renderización de gráficos.
            </Paragraph>
          </Card>

          <Card type="inner" title="Sma.js - Análisis Inteligente">
            <Paragraph>
              <Text strong>Responsabilidad:</Text> Permite consultar y
              visualizar datos históricos en rangos de fechas específicos.
            </Paragraph>
            <Paragraph>
              <Text strong>Funcionalidad:</Text> Búsqueda automática al
              seleccionar fechas mediante `useEffect`. Interfaz responsiva
              optimizada.
            </Paragraph>
          </Card>

          <Card type="inner" title="FormMultiData.js - Entrada Manual">
            <Paragraph>
              <Text strong>Responsabilidad:</Text> Formulario para entrada
              manual de datos como consumo mensual de agua.
            </Paragraph>
            <Paragraph>
              <Text strong>Funcionalidad:</Text> Uso de `InputNumber` para
              entrada numérica. Cálculo automático de totales con `useEffect`.
            </Paragraph>
          </Card>
        </Space>

        <Divider />

        <Title level={3}>
          <MobileOutlined /> Arquitectura Responsiva
        </Title>
        <Paragraph>
          La aplicación utiliza un enfoque "mobile-first" con optimizaciones
          específicas para cada plataforma.
        </Paragraph>

        <Collapse defaultActiveKey={["1"]}>
          <Panel header="Hook useResponsive" key="1">
            <Paragraph>
              Ubicado en <Text code>src/hooks/useResponsive.js</Text>, este hook
              personalizado devuelve un objeto con booleanos que indican el
              tamaño de pantalla actual.
            </Paragraph>
            <pre
              style={{ background: "#f5f5f5", padding: 16, borderRadius: 4 }}
            >
              {`const { isMobile, isTablet, isDesktop } = useResponsive();

// Valores de breakpoint:
// isMobile: < 768px
// isTablet: 768px - 1024px  
// isDesktop: > 1024px`}
            </pre>
          </Panel>

          <Panel header="Componentes Responsivos" key="2">
            <List
              size="small"
              dataSource={[
                "DesktopLayout vs MobileLayout en Home.js",
                "ResponsiveSmartAnalysis para análisis",
                "ResponsiveDga para módulo DGA",
                "ResponsiveAlerts para alertas",
                "ResponsiveMyWellComponents para pozos",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Panel>

          <Panel header="Optimizaciones de Rendimiento" key="3">
            <List
              size="small"
              dataSource={[
                "React.memo para evitar re-renderizados",
                "useCallback para funciones estables",
                "useMemo para cálculos costosos",
                "Lazy loading de componentes pesados",
                "Optimización de imágenes y assets",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>

        <Divider />

        <Title level={3}>
          <SettingOutlined /> Configuración y Despliegue
        </Title>

        <Space direction="vertical" style={{ width: "100%" }}>
          <Card type="inner" title="Variables de Entorno">
            <List
              size="small"
              dataSource={[
                "REACT_APP_API_URL: URL base de la API",
                "REACT_APP_ENVIRONMENT: Entorno (development/production)",
                "REACT_APP_CLIENT_ID: Identificador del cliente",
                "REACT_APP_VERSION: Versión de la aplicación",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text code>{item}</Text>
                </List.Item>
              )}
            />
          </Card>

          <Card type="inner" title="Dependencias Principales">
            <List
              size="small"
              dataSource={[
                "React 18.x - Framework principal",
                "Ant Design 5.x - UI Components",
                "React Router 6.x - Navegación",
                "Ant Design Charts - Gráficos",
                "Day.js - Manejo de fechas",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Space>

        <Divider />

        <Title level={3}>
          <BugOutlined /> Debugging y Logs
        </Title>
        <Paragraph>
          Para debugging y monitoreo del sistema, se utilizan las siguientes
          herramientas y prácticas:
        </Paragraph>
        <List
          size="small"
          dataSource={[
            "Console.log para debugging de desarrollo",
            "Error boundaries para captura de errores",
            "React DevTools para inspección de componentes",
            "Network tab para monitoreo de API calls",
            "LocalStorage para persistencia de estado",
          ]}
          renderItem={(item) => (
            <List.Item>
              <Text>{item}</Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Documentation;
