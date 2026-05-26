import React from "react";
import { Card, Tabs, Flex, Typography, theme } from "antd";
import { FaClipboardCheck, FaBroadcastTower } from "react-icons/fa";
import CCComplianceTable from "./CCComplianceTable";
import CCWeekConsumption from "./CCWeekConsumption";

const { Text } = Typography;
const { useToken } = theme;

const CCDataTabs = ({ points, onViewVoucher, onOpenStopCompliance, onSelectPoint, onViewMeasurements, onOpenStopTelemetry, last7, selectedDate, onDateSelect }) => {
  const { token } = useToken();

  const tabItems = [
    {
      key: "telemetria",
      label: (
        <Flex align="center" gap={6}>
          <FaBroadcastTower style={{ fontSize: 14 }} />
          <Text strong>Telemetría</Text>
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
        <Flex align="center" gap={6}>
          <FaClipboardCheck style={{ fontSize: 14 }} />
          <Text strong>Cumplimiento Normativo</Text>
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
    <>
      <style>{`
        .cc-data-tabs .ant-tabs-nav {
          background: #f5f5f5;
          border-radius: 12px 12px 0 0;
          padding: 12px 12px 0;
          margin-bottom: 0 !important;
          border: none !important;
        }
        .cc-data-tabs .ant-tabs-nav::before {
          display: none;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab {
          background: transparent !important;
          border: none !important;
          border-radius: 8px 8px 0 0 !important;
          padding: 12px 24px !important;
          margin: 0 !important;
          transition: all 0.2s ease;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab .ant-tabs-tab-btn {
          color: #666 !important;
          font-weight: 500;
          font-size: 14px;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab:hover .ant-tabs-tab-btn {
          color: #333 !important;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab-active {
          background: #1F3461 !important;
          border: none !important;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
          font-weight: 600;
        }
        .cc-data-tabs .ant-tabs-content-holder {
          background: transparent;
          border: none;
        }
        .cc-data-tabs .ant-tabs-content {
          padding: 0;
        }
      `}</style>
      <div className="cc-data-tabs" style={{ borderRadius: token.borderRadiusLG, overflow: "hidden" }}>
        <Tabs
          defaultActiveKey="telemetria"
          type="card"
          items={tabItems}
        />
      </div>
    </>
  );
};

export default React.memo(CCDataTabs);
