import React, { useMemo } from "react";
import { Card, Typography, Divider, Statistic, Flex, Row, Col } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

/**
 * 📊 COMPONENTE DE RESUMEN INTELIGENTE DE DATOS
 *
 * Este componente genera análisis automáticos en lenguaje natural basado en datos de monitoreo hídrico.
 * Es reutilizable para diferentes módulos (Smart Analysis, DGA, etc.) y períodos (día, mes, año).
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Array de datos de monitoreo
 * @param {string} props.periodType - Tipo de período ('day', 'month', 'year')
 * @param {string} props.title - Título personalizado del resumen
 * @param {Object} props.config - Configuración opcional para personalizar análisis
 * @param {boolean} props.showKPIs - Mostrar/ocultar tarjetas de KPIs (default: true)
 * @param {boolean} props.showInsights - Mostrar/ocultar insights (default: true)
 * @param {boolean} props.isToday - Indica si los datos son del día actual (para ajustar el lenguaje)
 *
 * @example
 * <DataSummary
 *   data={monthData}
 *   periodType="month"
 *   title="Resumen Inteligente del Mes"
 *   config={{
 *     flowUnit: "L/s",
 *     consumptionUnit: "m³/h",
 *     levelUnit: "m"
 *   }}
 * />
 */
const DataSummary = ({
  data,
  periodType = "day",
  title: parentTitle,
  isToday = false,
  config = {},
  showKPIs = true,
  showInsights = true,
}) => {
  // Formatter para usar puntos como separador de miles
  const formatNumberWithDots = (value) => {
    if (typeof value !== "number") {
      return value;
    }
    // Usar un locale como 'de-DE' que utiliza puntos para miles y comas para decimales
    return new Intl.NumberFormat("de-DE").format(value);
  };

  // Configuración por defecto
  const defaultConfig = {
    flowUnit: "L/s",
    consumptionUnit: "m³/h",
    levelUnit: "m",
    flowField: "flow",
    consumptionField: "total_diff",
    levelField: "water_table",
    totalField: "total_today_diff",
    dateField: "date_time_medition",
    // Configuración de formato de fecha según el tipo de período
    dateFormat: {
      day: { slice: [11, 16], format: "HH:mm" },
      month: { slice: [5, 10], format: "DD/MM" },
      year: { slice: [0, 10], format: "YYYY-MM-DD" },
    },
  };

  const finalConfig = { ...defaultConfig, ...config };
  const dateConfig =
    finalConfig.dateFormat[periodType] || finalConfig.dateFormat.day;

  /**
   * Calcula estadísticas descriptivas de los datos
   * @returns {Object|null} Objeto con estadísticas calculadas o null si no hay datos
   */
  const summaryStats = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Helper para convertir a número y filtrar valores no válidos
    const getNumericValues = (field) =>
      data.map((d) => parseFloat(d[field])).filter((v) => !isNaN(v));

    const flowValues = getNumericValues(finalConfig.flowField);
    const consumptionValues = getNumericValues(finalConfig.consumptionField);
    const levelValues = getNumericValues(finalConfig.levelField);

    const avgFlow =
      flowValues.length > 0
        ? flowValues.reduce((a, b) => a + b, 0) / flowValues.length
        : 0;
    const maxFlow = flowValues.length > 0 ? Math.max(...flowValues) : 0;
    const minFlow = flowValues.length > 0 ? Math.min(...flowValues) : 0;

    const avgConsumption =
      consumptionValues.length > 0
        ? consumptionValues.reduce((a, b) => a + b, 0) /
          consumptionValues.length
        : 0;
    const maxConsumption =
      consumptionValues.length > 0 ? Math.max(...consumptionValues) : 0;
    const minConsumption =
      consumptionValues.length > 0 ? Math.min(...consumptionValues) : 0;

    const avgLevel =
      levelValues.length > 0
        ? levelValues.reduce((a, b) => a + b, 0) / levelValues.length
        : 0;
    const maxLevel = levelValues.length > 0 ? Math.max(...levelValues) : 0;
    const minLevel = levelValues.length > 0 ? Math.min(...levelValues) : 0;

    // FIX: Lógica de cálculo de consumo total corregida para día/mes
    const totalConsumption =
      periodType === "day" && data.length > 0
        ? parseFloat(data[0][finalConfig.totalField]) || 0
        : data.reduce(
            (sum, record) =>
              sum + (parseFloat(record[finalConfig.totalField]) || 0),
            0
          );

    // Encontrar registros con valores máximos y mínimos
    const maxFlowRecord = data.find(
      (d) => parseFloat(d[finalConfig.flowField]) === maxFlow
    );
    const minFlowRecord = data.find(
      (d) => parseFloat(d[finalConfig.flowField]) === minFlow
    );
    const maxConsumptionRecord = data.find(
      (d) => parseFloat(d[finalConfig.consumptionField]) === maxConsumption
    );
    const minConsumptionRecord = data.find(
      (d) => parseFloat(d[finalConfig.consumptionField]) === minConsumption
    );

    return {
      maxFlow: {
        value: maxFlow,
        time: maxFlowRecord?.[finalConfig.dateField].slice(...dateConfig.slice),
      },
      minFlow: {
        value: minFlow,
        time: minFlowRecord?.[finalConfig.dateField].slice(...dateConfig.slice),
      },
      avgFlow,
      maxConsumption: {
        value: maxConsumption,
        time: maxConsumptionRecord?.[finalConfig.dateField].slice(
          ...dateConfig.slice
        ),
      },
      minConsumption: {
        value: minConsumption,
        time: minConsumptionRecord?.[finalConfig.dateField].slice(
          ...dateConfig.slice
        ),
      },
      avgConsumption,
      maxLevel,
      minLevel,
      avgLevel,
      totalConsumption,
      registros: data.length,
    };
  }, [data, finalConfig, dateConfig, periodType]);

  /**
   * Genera insights en lenguaje natural basados en las estadísticas
   * @returns {Array} Array de objetos con insights generados
   */
  const generateInsights = () => {
    if (!summaryStats) return [];

    // Lógica de lenguaje contextual
    const timeLabel = isToday ? "a las" : periodType === "day" ? "a las" : "el";
    const periodLabel = isToday
      ? "de hoy"
      : periodType === "day"
      ? "del día"
      : "del período";
    const verbTense = isToday ? "está registrando" : "registró";
    const verbTenseMaintained = isToday ? "ha mantenido" : "mantuvo";
    const totalConsumptionLabel = isToday
      ? `El consumo total hasta ahora es de`
      : `El consumo total ${periodLabel} fue de`;

    const insights = [];

    // INSIGHT: Bajo o nulo consumo
    if (summaryStats.totalConsumption <= 0.1) {
      insights.push({
        title: "💧 Análisis de Consumo",
        type: "info",
        content: `No se ha registrado un consumo significativo de agua ${periodLabel}. La mayoría de las mediciones muestran un caudal bajo o nulo.`,
      });
    }

    if (summaryStats.maxFlow > 0 || summaryStats.avgFlow > 0) {
      const flowVariation =
        summaryStats.avgFlow > 0
          ? (
              ((summaryStats.maxFlow - summaryStats.minFlow) /
                summaryStats.avgFlow) *
              100
            ).toFixed(1)
          : 0;
      insights.push({
        title: "📊 Análisis de Caudal",
        content: `El caudal ${verbTense} variaciones. El máximo de ${summaryStats.maxFlow.value.toFixed(
          1
        )} ${finalConfig.flowUnit} se alcanzó ${timeLabel} ${
          summaryStats.maxFlow.time
        }, mientras que el promedio es de ${summaryStats.avgFlow.toFixed(1)} ${
          finalConfig.flowUnit
        }.`,
        type: "info",
      });
    }

    if (summaryStats.maxConsumption > 0 || summaryStats.avgConsumption > 0) {
      insights.push({
        title: "💧 Análisis de Consumo",
        content: `El consumo ${
          periodType === "day" ? "horario" : "promedio"
        } ${verbTenseMaintained} un promedio de ${summaryStats.avgConsumption.toFixed(
          2
        )} ${
          finalConfig.consumptionUnit
        }. ${totalConsumptionLabel} ${formatNumberWithDots(
          summaryStats.totalConsumption
        )} m³.`,
        type: "success",
      });
    }

    if (summaryStats.maxLevel > 0 || summaryStats.avgLevel > 0) {
      const levelVariation =
        summaryStats.avgLevel > 0
          ? (
              ((summaryStats.maxLevel - summaryStats.minLevel) /
                summaryStats.avgLevel) *
              100
            ).toFixed(1)
          : 0;
      insights.push({
        title: "🌊 Análisis de Nivel Freático",
        content: `El nivel freático ${verbTenseMaintained} un promedio de ${summaryStats.avgLevel.toFixed(
          2
        )} ${
          finalConfig.levelUnit
        }. La variación entre el máximo (${summaryStats.maxLevel.toFixed(2)} ${
          finalConfig.levelUnit
        }) y mínimo (${summaryStats.minLevel.toFixed(2)} ${
          finalConfig.levelUnit
        }) representa un ${levelVariation}% de fluctuación.`,
        type: "info",
      });
    }

    // INSIGHT: Resumen general
    if (summaryStats.totalConsumption > 0.1) {
      const generalFeeling = () => {
        if (summaryStats.avgFlow > 15) return "alto";
        if (summaryStats.avgFlow > 5) return "moderado";
        return "bajo";
      };

      insights.push({
        title: `📝 Resumen ${periodLabel}`,
        type: "summary",
        content: `Se han analizado ${
          summaryStats.registros
        } registros hasta el momento. Los datos muestran un consumo ${generalFeeling()}, con caudales moderados y un nivel freático profundo.`,
      });
    }

    return insights;
  };

  // Si no hay datos, no mostrar nada
  if (!summaryStats) return null;

  const insights = generateInsights();
  const title =
    parentTitle || `Resumen Inteligente ${isToday ? "de Hoy" : "del Período"}`;

  const styles = {
    kpiCard: (color) => ({
      border: "1px solid #e8e8e8",
      borderRadius: "12px",
      padding: "16px",
      backgroundColor: color.bg,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
    }),

    kpiTitle: {
      fontSize: "14px",
      color: "#595959",
      fontWeight: 500,
    },
    kpiValue: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#262626",
    },
    kpiSuffix: {
      fontSize: "16px",
      fontWeight: 500,
      marginLeft: "4px",
      color: "#595959",
    },
  };

  return (
    <Card
      style={{
        marginBottom: 16,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
      title={
        <Flex align="center" gap="small">
          <InfoCircleOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0, color: "#1f1f1f" }}>
            {title}
          </Title>
        </Flex>
      }
    >
      <Flex vertical gap="middle">
        {/* KPIs Principales */}
        {showKPIs && (
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Card style={styles.kpiCard({ bg: "#e6f7ff" })}>
                <Statistic
                  title={<span style={styles.kpiTitle}>Consumo Total</span>}
                  value={summaryStats.totalConsumption}
                  valueStyle={styles.kpiValue}
                  formatter={(value) => (
                    <span style={styles.kpiValue}>
                      {new Intl.NumberFormat("de-DE").format(value)}
                      <span style={styles.kpiSuffix}> m³</span>
                    </span>
                  )}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={styles.kpiCard({ bg: "#f6ffed" })}>
                <Statistic
                  title={<span style={styles.kpiTitle}>Caudal Promedio</span>}
                  value={summaryStats.avgFlow.toFixed(1)}
                  valueStyle={styles.kpiValue}
                  suffix={
                    <span style={styles.kpiSuffix}>{finalConfig.flowUnit}</span>
                  }
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={styles.kpiCard({ bg: "#fff7e6" })}>
                <Statistic
                  title={<span style={styles.kpiTitle}>Nivel Promedio</span>}
                  value={summaryStats.avgLevel.toFixed(2)}
                  valueStyle={styles.kpiValue}
                  suffix={
                    <span style={styles.kpiSuffix}>
                      {finalConfig.levelUnit}
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={styles.kpiCard({ bg: "#fff1f0" })}>
                <Statistic
                  title={<span style={styles.kpiTitle}>Registros</span>}
                  value={summaryStats.registros}
                  valueStyle={styles.kpiValue}
                  suffix={<span style={styles.kpiSuffix}>datos</span>}
                />
              </Card>
            </Col>
          </Row>
        )}

        {showKPIs && showInsights && <Divider style={{ margin: "8px 0" }} />}

        {/* Insights en lenguaje natural */}
        {showInsights && (
          <Flex vertical gap="small">
            {insights.map((insight, index) => (
              <Card
                key={index}
                size="small"
                style={{
                  background:
                    insight.type === "info"
                      ? "#e6f7ff"
                      : insight.type === "success"
                      ? "#f6ffed"
                      : insight.type === "warning"
                      ? "#fff7e6"
                      : "#fafafa",
                  border:
                    insight.type === "info"
                      ? "1px solid #91d5ff"
                      : insight.type === "success"
                      ? "1px solid #b7eb8f"
                      : insight.type === "warning"
                      ? "1px solid #ffd591"
                      : "1px solid #d9d9d9",
                }}
              >
                <Flex vertical gap="small">
                  <Title level={5} style={{ margin: 0, color: "#1f1f1f" }}>
                    {insight.title}
                  </Title>
                  <Paragraph
                    style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}
                  >
                    {insight.content}
                  </Paragraph>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default DataSummary;
