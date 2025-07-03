import React, { useState } from "react";
import { Card, Flex } from "antd";
import WaterMonitoringScoreForm from "./WaterMonitoringScoreForm";
import WaterConsumptionTabs from "./WaterConsumptionTabs";
import TotalConsumptionCard from "./TotalConsumptionCard";
// Importar los demás componentes cuando se implementen: TotalConsumptionCard, ConsumptionStats, ConsumptionChart, etc.

const WaterConsumptionModule = () => {
  // Estado para el formulario de score
  const [selectedOptions, setSelectedOptions] = useState([]);
  // Estado para el checkbox de no tracking
  const [noTracking, setNoTracking] = useState(false);
  // Estado para los registros de consumo
  const [records, setRecords] = useState([
    {
      key: "1",
      name: "Registro 1",
      year: new Date().getFullYear(),
      monthly: Array(12).fill(0),
    },
  ]);
  // Estado para la tab activa
  const [activeKey, setActiveKey] = useState("1");

  // Aquí se puede agregar estado global para registros, stats, etc.

  return (
    <Flex
      vertical
      gap="large"
      style={{ maxWidth: "100%", margin: "0 auto", padding: 24 }}
    >
      <WaterMonitoringScoreForm
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />
      <Flex gap="small" vertical={window.innerWidth < 768}>
        <WaterConsumptionTabs
          records={records}
          setRecords={setRecords}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
        />
        {/* Total combinado */}
        <TotalConsumptionCard
          records={records}
          noTracking={noTracking}
          setNoTracking={setNoTracking}
        />
      </Flex>
      {/* Tabs y registros */}

      {/* Aquí se integrarán TotalConsumptionCard, ConsumptionStats, ConsumptionChart, etc. */}
    </Flex>
  );
};

export default WaterConsumptionModule;
