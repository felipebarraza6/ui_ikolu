import React from "react";
import { Tabs, Flex, theme } from "antd";
import { FaClipboardCheck, FaBroadcastTower } from "react-icons/fa";
import CCComplianceTable from "./CCComplianceTable";
import CCWeekConsumption from "./CCWeekConsumption";
import "../../styles/cc-data-tabs.css";

const { useToken } = theme;

const CCDataTabs = ({ points, onViewVoucher, onOpenStopCompliance, onSelectPoint, onViewMeasurements, onOpenStopTelemetry, last7, selectedDate, onDateSelect }) => {
  const { token } = useToken();

  const tabItems = [
    {
      key: "telemetria",
      label: (
        <Flex align="center" gap={6} className="tab-label">
          <FaBroadcastTower style={{ fontSize: 14 }} />
          <span>Telemetría</span>
        </Flex>
      ),
      children: (
        <CCWeekConsumption
          last7={last7}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onViewMeasurements={onViewMeasurements}
          onOpenStopTelemetry={onOpenStopTelemetry}
          onSelectPoint={onSelectPoint}
        />
      ),
    },
    {
      key: "cumplimiento",
      label: (
        <Flex align="center" gap={6} className="tab-label">
          <FaClipboardCheck style={{ fontSize: 14 }} />
          <span>Cumplimiento Normativo</span>
        </Flex>
      ),
      children: (
        <CCComplianceTable
          points={points}
          onViewVoucher={onViewVoucher}
          onOpenStopCompliance={onOpenStopCompliance}
          onSelectPoint={onSelectPoint}
        />
      ),
    },
  ];

  return (
    <div className="cc-data-tabs" style={{ borderRadius: token.borderRadiusLG, overflow: "hidden" }}>
        <Tabs
          defaultActiveKey="telemetria"
          type="card"
          items={tabItems}
        />
      </div>
  );
};

export default React.memo(CCDataTabs);
