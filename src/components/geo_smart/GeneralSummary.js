import React from "react";
import AnalysisPrompt from "./AnalysisPrompt";
import FlowStatusGauges from "./FlowStatusGauges";
import ConsumptionChart from "./ConsumptionChart";
import { Card, Row, Col, Statistic, Flex, Grid } from "antd";
import {
  FaMapMarkerAlt,
  FaSatelliteDish,
  FaCheckCircle,
  FaChartBar,
} from "react-icons/fa";

const { useBreakpoint } = Grid;

/**
 * GeneralSummary
 * This component displays the main summary, analysis, gauges, and charts for all capture points.
 * Place it at the top of your main view.
 *
 * @param {Array} profiles - Array of profile objects (capture points)
 */
const GeneralSummary = ({ profiles }) => {
  const screens = useBreakpoint();
  // Indicadores de resumen
  const totalPoints = profiles?.length || 0;
  const pointsWithGPS =
    profiles?.filter((p) => p.lat && p.lon && p.lat !== "0" && p.lon !== "0")
      .length || 0;
  const totalToday = profiles?.reduce(
    (sum, p) => sum + (p.modules?.m1?.total_today_diff || 0),
    0
  );
  const totalAccum = profiles?.reduce(
    (sum, p) => sum + (p.modules?.m1?.total || 0),
    0
  );

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Indicadores de resumen arriba */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered style={{ textAlign: "center", minHeight: 120 }}>
            <Statistic
              title={
                <span>
                  <FaMapMarkerAlt
                    style={{ color: "#1976d2", marginRight: 6 }}
                  />
                  Total de Puntos
                </span>
              }
              value={totalPoints}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered style={{ textAlign: "center", minHeight: 120 }}>
            <Statistic
              title={
                <span>
                  <FaSatelliteDish
                    style={{ color: "#43a047", marginRight: 6 }}
                  />
                  Con GPS
                </span>
              }
              value={pointsWithGPS}
              suffix={<span style={{ color: "#888" }}>/ {totalPoints}</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered style={{ textAlign: "center", minHeight: 120 }}>
            <Statistic
              title={
                <span>
                  <FaChartBar style={{ color: "#1976d2", marginRight: 6 }} />
                  Consumo Hoy
                </span>
              }
              value={totalToday}
              suffix=" m³"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered style={{ textAlign: "center", minHeight: 120 }}>
            <Statistic
              title={
                <span>
                  <FaCheckCircle style={{ color: "#388e3c", marginRight: 6 }} />
                  Total Acumulado
                </span>
              }
              value={totalAccum}
              suffix=" m³"
            />
          </Card>
        </Col>
      </Row>
      {/* Análisis general y tarjetas */}
      <AnalysisPrompt profiles={profiles} />
      {/* Gráficas de caudal y gauges */}
      <div style={{ marginTop: 24 }}>
        <FlowStatusGauges profiles={profiles} />
      </div>
      <div style={{ marginTop: 24 }}>
        <ConsumptionChart />
      </div>
    </div>
  );
};

export default GeneralSummary;
