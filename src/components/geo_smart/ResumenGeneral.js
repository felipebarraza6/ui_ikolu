import React from "react";
import AnalysisPrompt from "./AnalysisPrompt";
import FlowStatusGauges from "./FlowStatusGauges";
import ConsumptionChart from "./ConsumptionChart";

const ResumenGeneral = ({ profiles }) => {
  return (
    <div style={{ marginBottom: 24 }}>
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

export default ResumenGeneral;
