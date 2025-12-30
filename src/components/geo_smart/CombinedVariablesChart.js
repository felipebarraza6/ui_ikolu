import React, { useState, useMemo } from "react";
import {
  Card,
  Select,
  Empty,
  Typography,
  Row,
  Col,
  Statistic,
  Flex,
  Table,
  Tabs,
} from "antd";
import { Line } from "@ant-design/plots";
import moment from "moment";
import { parseSafeDate, formatSafeDate } from "../../utils/dateFormatter";
import { FaChartLine } from "react-icons/fa";
import { IoIosWater } from "react-icons/io";
import {
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  DashOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

/**
 * Vista tabular y estadísticas de todas las variables de un punto de captación
 * - Caudal (L/s)
 * - Nivel Freático (metros bajo superficie) - SOLO pozos subterráneos
 * - Nivel del Sensor (metros) - profundidad del sensor
 * - Consumo (m³)
 */
const CombinedVariablesChart = ({ profiles }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Filtrar solo perfiles con datos de hoy
  const profilesWithData = useMemo(() => {
    return profiles.filter(
      (p) => Array.isArray(p.modules?.today) && p.modules.today.length > 0
    );
  }, [profiles]);

  // Seleccionar el primer perfil por defecto
  React.useEffect(() => {
    if (!selectedProfile && profilesWithData.length > 0) {
      setSelectedProfile(profilesWithData[0].id || profilesWithData[0].title);
    }
  }, [profilesWithData, selectedProfile]);

  // Encontrar el perfil seleccionado
  const profile = useMemo(() => {
    return profilesWithData.find((p) => (p.id || p.title) === selectedProfile);
  }, [profilesWithData, selectedProfile]);

  // Detectar variables configuradas para el perfil seleccionado
  const configuredVars = useMemo(() => {
    if (!profile) return { hasCaudal: false, hasTotalizado: false, hasNivel: false };
    
    const vars = profile?.profile_ikolu?.vars || profile?.config_data?.vars || profile?.config_data?.variables || [];
    return {
      hasCaudal: vars.some(v => v.type_variable?.includes("CAUDAL")),
      hasTotalizado: vars.some(v => v.type_variable?.includes("TOTALIZADO")),
      hasNivel: vars.some(v => v.type_variable?.includes("NIVEL")),
    };
  }, [profile]);

  // Preparar datos en orden cronológico (más antiguo primero) para el gráfico
  const tableData = useMemo(() => {
    if (!profile || !profile.modules?.today) return [];

    const mapped = profile.modules.today
      .map((record, index) => {
        const timeMedition = formatSafeDate(record.date_time_medition, "DD/MM HH:mm", "");
        const timeLogger = formatSafeDate(record.date_time_last_logger, "DD/MM HH:mm", "");

        // Determinar tipo de caudal usando los nuevos campos de la API:
        // - flow_type: "INSTANTANEO" | "MEDIO" (u otros)
        // - is_average: boolean (true = promedio, false = instantáneo)
        let tipoCaudal = "Instantáneo";

        if (record.flow_type) {
          const ft = String(record.flow_type).toUpperCase();
          if (ft.includes("MEDIO")) {
            tipoCaudal = "Medio";
          } else if (ft.includes("INST")) {
            tipoCaudal = "Instantáneo";
          }
        } else if (record.is_average === true) {
          tipoCaudal = "Medio";
        }

        return {
          key: index,
          time: timeMedition,
          timeLogger: timeLogger,
          timestamp: record.date_time_medition,
          caudal: Number(record.flow) || 0,
          tipoCaudal: tipoCaudal,
          nivelFreatico: Number(record.water_table) || null,
          // Algunos perfiles usan "nivel" como nombre de campo para el nivel de sensor
          nivelSensor:
            record.nivel !== undefined && record.nivel !== null
              ? Number(record.nivel)
              : Number(record.water_level) || null,
          consumo: Number(record.total_diff) || 0,
          total: Number(record.total) || 0,
        };
      })
      .filter((d) => d.time !== "");

    // Orden cronológico real por timestamp: más antiguo primero (para el gráfico)
    return mapped.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  }, [profile]);

  // Datos invertidos para la tabla (más recientes primero)
  const tableDataReversed = useMemo(() => {
    return [...tableData].reverse();
  }, [tableData]);

  // Calcular estadísticas con HORAS
  const stats = useMemo(() => {
    if (tableData.length === 0)
      return {
        maxCaudal: 0,
        minCaudal: 0,
        avgCaudal: 0,
        maxCaudalTime: null,
        minCaudalTime: null,
        maxNivelFreatico: null,
        minNivelFreatico: null,
        maxNivelTime: null,
        minNivelTime: null,
        totalConsumo: 0,
        variacionCaudal: 0,
      };

    const caudales = tableData.map((d) => d.caudal).filter((v) => v > 0);
    const nivelesFreaticos = tableData
      .map((d, idx) => ({ value: d.nivelFreatico, time: d.time, idx }))
      .filter((item) => item.value !== null && item.value > 0);
    const consumos = tableData.map((d) => d.consumo);

    const maxC = caudales.length > 0 ? Math.max(...caudales) : 0;
    const minC = caudales.length > 0 ? Math.min(...caudales) : 0;
    const avgC =
      caudales.length > 0
        ? caudales.reduce((a, b) => a + b, 0) / caudales.length
        : 0;

    // Encontrar la HORA del máximo y mínimo caudal
    const maxCaudalItem = tableData.find((d) => d.caudal === maxC);
    const minCaudalItem = tableData.find(
      (d) => d.caudal === minC && d.caudal > 0
    );

    // Encontrar la HORA del máximo y mínimo nivel freático
    let maxNF = null,
      minNF = null,
      maxNFTime = null,
      minNFTime = null;
    if (nivelesFreaticos.length > 0) {
      const maxNFItem = nivelesFreaticos.reduce((max, item) =>
        item.value > max.value ? item : max
      );
      const minNFItem = nivelesFreaticos.reduce((min, item) =>
        item.value < min.value ? item : min
      );
      maxNF = maxNFItem.value;
      minNF = minNFItem.value;
      maxNFTime = maxNFItem.time;
      minNFTime = minNFItem.time;
    }

    return {
      maxCaudal: maxC,
      minCaudal: minC,
      avgCaudal: avgC,
      maxCaudalTime: maxCaudalItem?.time || null,
      minCaudalTime: minCaudalItem?.time || null,
      variacionCaudal: maxC - minC,
      maxNivelFreatico: maxNF,
      minNivelFreatico: minNF,
      maxNivelTime: maxNFTime,
      minNivelTime: minNFTime,
      totalConsumo: consumos.reduce((sum, v) => sum + v, 0),
    };
  }, [tableData]);

  // Determinar si es pozo subterráneo
  const isSubterraneo = profile?.dga?.type_dga === "SUBTERRANEO";
  const hasNivelFreatico = isSubterraneo && stats.maxNivelFreatico !== null;

  // Saber si en el día hay caudal medio para ajustar el título de la columna
  const isCaudalMedioDia = useMemo(
    () => tableData.some((d) => d.tipoCaudal === "Medio"),
    [tableData]
  );

  // Columnas de la tabla - Condicionales según variables configuradas
  const columns = [
    {
      title: "Hora Medición",
      dataIndex: "time",
      key: "time",
      fixed: "left",
      width: 120,
    },
    {
      title: "Hora Logger",
      dataIndex: "timeLogger",
      key: "timeLogger",
      width: 120,
      render: (val) => val || <span style={{ color: "#ccc" }}>—</span>,
    },
    // Caudal - Solo si está configurado
    ...(configuredVars.hasCaudal ? [{
      title: isCaudalMedioDia ? "Caudal Medio (L/s)" : "Caudal (L/s)",
      dataIndex: "caudal",
      key: "caudal",
      width: 120,
      align: "right",
      render: (val) => (
        <span
          style={{ color: val === 0 ? "#999" : "#1976d2", fontWeight: 600 }}
        >
          {val.toFixed(2)}
        </span>
      ),
    }] : []),
    // Consumo y Total - Solo si está configurado TOTALIZADO
    ...(configuredVars.hasTotalizado ? [
      {
        title: "Consumo (m³)",
        dataIndex: "consumo",
        key: "consumo",
        width: 110,
        align: "right",
        render: (val) => (
          <span style={{ color: "#722ed1", fontWeight: 600 }}>
            {Number(val || 0).toFixed(0)}
          </span>
        ),
      },
      {
        title: "Total Acum. (m³)",
        dataIndex: "total",
        key: "total",
        width: 130,
        align: "right",
        render: (val) => (
          <Flex align="center" justify="flex-end" gap={4}>
            <IoIosWater style={{ color: "#1890ff" }} />
            <span style={{ color: "#1890ff", fontWeight: 600 }}>
              {Number(val || 0).toFixed(0)}
            </span>
          </Flex>
        ),
      },
    ] : []),
    // Nivel Freático - Solo para pozos subterráneos (ya existente)
    ...(hasNivelFreatico
      ? [
          {
            title: "Nivel Freático (m)",
            dataIndex: "nivelFreatico",
            key: "nivelFreatico",
            width: 140,
            align: "right",
            render: (val) =>
              val !== null ? (
                <span style={{ color: "#fa8c16", fontWeight: 600 }}>
                  {val.toFixed(2)}
                </span>
              ) : (
                <span style={{ color: "#ccc" }}>—</span>
              ),
          },
          {
            title: "Nivel Sensor (m)",
            dataIndex: "nivelSensor",
            key: "nivelSensor",
            width: 130,
            align: "right",
            render: (val) =>
              val !== null ? (
                <span style={{ color: "#888", fontWeight: 500 }}>
                  {val.toFixed(2)}
                </span>
              ) : (
                <span style={{ color: "#ccc" }}>—</span>
              ),
          },
        ]
      : []),
  ];

  if (profilesWithData.length === 0) {
    return (
      <Card>
        <Empty description="No hay datos de puntos de captación para mostrar" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Flex align="center" gap="small">
          <FaChartLine style={{ color: "#1976d2" }} />
          <Text strong style={{ fontSize: 16 }}>
            Variables en Tiempo Real
          </Text>
        </Flex>
      }
      extra={
        <Select
          value={selectedProfile}
          onChange={setSelectedProfile}
          style={{ minWidth: 200 }}
          placeholder="Selecciona un punto"
        >
          {profilesWithData.map((p) => (
            <Select.Option key={p.id || p.title} value={p.id || p.title}>
              {p.title}
            </Select.Option>
          ))}
        </Select>
      }
    >
      {/* Contador de registros */}
      {profile && (
        <Flex justify="flex-end" align="center" style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {tableData.length} registros hoy
          </Text>
        </Flex>
      )}

      {/* Estadísticas rápidas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Caudal stats - Solo si está configurado */}
        {configuredVars.hasCaudal && (
          <>
            <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ background: "#f0f8ff" }}>
            <Statistic
              title={
                <Flex align="center" gap={4}>
                  <RiseOutlined style={{ color: "#1976d2" }} />
                  <span>Caudal Máximo</span>
                </Flex>
              }
              value={stats.maxCaudal.toFixed(1)}
              suffix="L/s"
              valueStyle={{ color: "#1976d2", fontSize: 20 }}
            />
            {stats.maxCaudalTime && (
              <Text
                style={{
                  fontSize: 11,
                  color: "#666",
                  marginTop: 4,
                  display: "block",
                }}
              >
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {stats.maxCaudalTime}
              </Text>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ background: "#f6ffed" }}>
            <Statistic
              title={
                <Flex align="center" gap={4}>
                  <FallOutlined style={{ color: "#52c41a" }} />
                  <span>Caudal Mínimo</span>
                </Flex>
              }
              value={stats.minCaudal.toFixed(1)}
              suffix="L/s"
              valueStyle={{ color: "#52c41a", fontSize: 20 }}
            />
            {stats.minCaudalTime && (
              <Text
                style={{
                  fontSize: 11,
                  color: "#666",
                  marginTop: 4,
                  display: "block",
                }}
              >
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {stats.minCaudalTime}
              </Text>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ background: "#f9f0ff" }}>
            <Statistic
              title={
                <Flex align="center" gap={4}>
                  <DashOutlined style={{ color: "#722ed1" }} />
                  <span>Caudal Promedio</span>
                </Flex>
              }
              value={stats.avgCaudal.toFixed(1)}
              suffix="L/s"
              valueStyle={{ color: "#722ed1", fontSize: 20 }}
            />
          </Card>
        </Col>
          </>
        )}

        {/* Consumo Total - Solo si está configurado TOTALIZADO */}
        {configuredVars.hasTotalizado && (
          <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ background: "#fff7e6" }}>
            <Statistic
              title={
                <Flex align="center" gap={4}>
                  <LineChartOutlined style={{ color: "#fa8c16" }} />
                  <span>Consumo Total</span>
                </Flex>
              }
              value={stats.totalConsumo.toFixed(2)}
              suffix="m³"
              valueStyle={{ color: "#fa8c16", fontSize: 20 }}
            />
          </Card>
        </Col>
        )}

        {/* Nivel Freático - Solo para pozos subterráneos */}
        {hasNivelFreatico && (
          <>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ background: "#fff1f0" }}>
                <Statistic
                  title="Nivel Freático Más Profundo"
                  value={stats.maxNivelFreatico.toFixed(2)}
                  suffix="m"
                  valueStyle={{ color: "#ff4d4f", fontSize: 20 }}
                  prefix="↓"
                />
                {stats.maxNivelTime && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#666",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {stats.maxNivelTime}
                  </Text>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ background: "#e6fffb" }}>
                <Statistic
                  title="Nivel Freático Más Superficial"
                  value={stats.minNivelFreatico.toFixed(2)}
                  suffix="m"
                  valueStyle={{ color: "#13c2c2", fontSize: 20 }}
                  prefix="↑"
                />
                {stats.minNivelTime && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#666",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {stats.minNivelTime}
                  </Text>
                )}
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Gráficos y Tabla con pestañas */}
      {tableData.length > 0 ? (
        <Tabs
          defaultActiveKey="graficos"
          style={{ marginBottom: 16 }}
          type="card"
          items={[
            {
              key: "graficos",
              label: (
                <span style={{ fontWeight: 600 }}>
                  <AreaChartOutlined style={{ marginRight: 6 }} />
                  Gráficos Combinados
                </span>
              ),
              children: (
                <Card
                  size="small"
                  bordered={false}
                  style={{
                    background: "#fafafa",
                    padding: 16,
                  }}
                >
                  {/* Leyenda de colores */}
                  <Flex gap={16} wrap="wrap" style={{ marginBottom: 12 }}>
                    {configuredVars.hasCaudal && (
                      <Flex align="center" gap={6}>
                        <div
                          style={{ width: 12, height: 3, background: "#1976d2" }}
                        />
                        <Text style={{ fontSize: 12 }}>Caudal (L/s)</Text>
                      </Flex>
                    )}
                    {configuredVars.hasTotalizado && (
                      <Flex align="center" gap={6}>
                        <div
                          style={{ width: 12, height: 3, background: "#722ed1" }}
                        />
                        <Text style={{ fontSize: 12 }}>Consumo (m³)</Text>
                      </Flex>
                    )}
                    {hasNivelFreatico && (
                      <>
                        <Flex align="center" gap={6}>
                          <div
                            style={{
                              width: 12,
                              height: 3,
                              background: "#fa8c16",
                            }}
                          />
                          <Text style={{ fontSize: 12 }}>Nivel Freático (m)</Text>
                        </Flex>
                        <Flex align="center" gap={6}>
                          <div
                            style={{
                              width: 12,
                              height: 3,
                              background: "#13c2c2",
                            }}
                          />
                          <Text style={{ fontSize: 12 }}>Nivel Sensor (m)</Text>
                        </Flex>
                      </>
                    )}
                  </Flex>

                  {/* Gráfico combinado con múltiples series */}
                  <Line
                    data={[
                      // Caudal - Solo si está configurado
                      ...(configuredVars.hasCaudal ? tableData.map((d) => ({
                        time: d.time,
                        value: d.caudal,
                        type: "Caudal (L/s)",
                      })) : []),
                      // Consumo - Solo si está configurado TOTALIZADO
                      ...(configuredVars.hasTotalizado ? tableData.map((d) => ({
                        time: d.time,
                        value: d.consumo,
                        type: "Consumo (m³)",
                      })) : []),
                      // Nivel Freático y Nivel Sensor - Solo para pozos subterráneos
                      ...(hasNivelFreatico
                        ? [
                            ...tableData
                              .filter((d) => d.nivelFreatico !== null)
                              .map((d) => ({
                                time: d.time,
                                value: d.nivelFreatico,
                                type: "Nivel Freático (m)",
                              })),
                            ...tableData
                              .filter((d) => d.nivelSensor !== null)
                              .map((d) => ({
                                time: d.time,
                                value: d.nivelSensor,
                                type: "Nivel Sensor (m)",
                              })),
                          ]
                        : []),
                    ]}
                    xField="time"
                    yField="value"
                    seriesField="type"
                    height={400}
                    smooth={true}
                    color={({ type }) => {
                      if (type === "Caudal (L/s)") return "#1976d2";
                      if (type === "Consumo (m³)") return "#722ed1";
                      if (type === "Nivel Freático (m)") return "#fa8c16";
                      if (type === "Nivel Sensor (m)") return "#13c2c2";
                      return "#666";
                    }}
                    point={{
                      size: 2,
                      shape: "circle",
                    }}
                    legend={{
                      position: "top-right",
                    }}
                    xAxis={{
                      label: {
                        autoRotate: true,
                        autoHide: true,
                      },
                    }}
                    yAxis={{
                      label: {
                        formatter: (v) => Number(v).toFixed(1),
                      },
                    }}
                    tooltip={{
                      shared: true,
                      showCrosshairs: true,
                    }}
                    animation={false}
                  />
                </Card>
              ),
            },
            {
              key: "tabla",
              label: (
                <span style={{ fontWeight: 600 }}>
                  <LineChartOutlined style={{ marginRight: 6 }} />
                  Tabla de Datos
                </span>
              ),
              children: (
                <Card
                  size="small"
                  bordered={false}
                  style={{
                    background: "#fafafa",
                    padding: 16,
                  }}
                >
                  <Table
                    dataSource={tableDataReversed}
                    columns={columns}
                    pagination={{
                      pageSize: 10,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} de ${total} registros`,
                    }}
                    // Scroll horizontal para muchas columnas y vertical para no alargar toda la página
                    scroll={{ x: 900, y: 360 }}
                    // Cabecera fija para mejorar navegación cuando hay muchos registros
                    sticky
                    size="small"
                    bordered
                  />
                </Card>
              ),
            },
          ]}
        />
      ) : (
        <Empty description="No hay datos para mostrar" />
      )}

      {/* Nota explicativa */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: "#f0f8ff",
          borderRadius: 8,
          borderLeft: "4px solid #1976d2",
        }}
      >
        <Flex vertical gap={4}>
          <Text strong style={{ color: "#1f3461", fontSize: 13 }}>
            <InfoCircleOutlined style={{ marginRight: 6 }} />
            Información de las variables:
          </Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            • <strong style={{ color: "#1976d2" }}>Caudal:</strong> Flujo de
            agua en el tiempo medido en Litros por segundo (L/s). Si el título
            de la columna dice <strong>Caudal Medio</strong>, todos los valores
            del día corresponden a promedios del intervalo de medición.
          </Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            • <strong style={{ color: "#722ed1" }}>Consumo:</strong> Volumen de
            agua extraído por intervalo (metros cúbicos)
          </Text>
          {hasNivelFreatico ? (
            <Text style={{ fontSize: 12, color: "#666" }}>
              • <strong style={{ color: "#fa8c16" }}>Nivel Freático:</strong>{" "}
              Profundidad del agua subterránea medida desde la superficie
              (metros). Valores más altos indican agua más profunda.
            </Text>
          ) : (
            <Text style={{ fontSize: 12, color: "#666" }}>
              • <strong style={{ color: "#888" }}>Nivel Freático:</strong> No
              disponible. Esta medición solo está disponible para pozos
              subterráneos.
            </Text>
          )}
        </Flex>
      </div>
    </Card>
  );
};

export default CombinedVariablesChart;
