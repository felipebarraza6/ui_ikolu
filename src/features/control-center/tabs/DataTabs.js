import React, { useState, useMemo } from "react";
import { Segmented, Flex, theme } from "antd";
import { FaClipboardCheck, FaBroadcastTower } from "react-icons/fa";
import CCComplianceTable from "./compliance/ComplianceTable";
import CCWeekConsumption from "./telemetry/WeekConsumption";

const { useToken } = theme;

const CCDataTabs = ({ points, onViewVoucher, onOpenStopCompliance, onOpenSupport = () => {}, onWarningPointClick = () => {}, warningsRaw = {}, onViewMeasurements, onViewFlowAnalysis, onViewComplianceDetail, onOpenStopTelemetry, onViewPointConfig, last7, selectedDate, onDateSelect, loading = false }) => {
  const { token } = useToken();
  const [activeTab, setActiveTab] = useState("telemetria");

  const segmentOptions = useMemo(() => [
    {
      value: "telemetria",
      label: (
        <Flex align="center" gap={6}>
          <FaBroadcastTower style={{ fontSize: 14 }} />
          <span>Telemetría</span>
        </Flex>
      ),
    },
    {
      value: "cumplimiento",
      label: (
        <Flex align="center" gap={6}>
          <FaClipboardCheck style={{ fontSize: 14 }} />
          <span>Cumplimiento</span>
        </Flex>
      ),
    },
  ], []);

  return (
    <div style={{ padding: "8px 0 0" }}>
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <Segmented
          options={segmentOptions}
          value={activeTab}
          onChange={setActiveTab}
          style={{
            background: token.colorBgLayout,
          }}
        />
      </Flex>
      {activeTab === "telemetria" && (
        <CCWeekConsumption
          last7={last7}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onViewMeasurements={onViewMeasurements}
          onOpenStopTelemetry={onOpenStopTelemetry}
          onOpenSupport={onOpenSupport}
          onWarningPointClick={onWarningPointClick}
          onViewPointConfig={onViewPointConfig}
          warningsRaw={warningsRaw}
          loading={loading}
        />
      )}
      {activeTab === "cumplimiento" && (
        <CCComplianceTable
          points={points}
          last7={last7}
          onViewVoucher={onViewVoucher}
          onOpenStopCompliance={onOpenStopCompliance}
          onOpenSupport={onOpenSupport}
          onViewPointConfig={onViewPointConfig}
          onViewFlowAnalysis={onViewFlowAnalysis}
          onViewComplianceDetail={onViewComplianceDetail}
          loading={loading}
        />
      )}
    </div>
  );
};

export default React.memo(CCDataTabs);
