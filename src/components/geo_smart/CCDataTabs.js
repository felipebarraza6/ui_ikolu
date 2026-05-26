import React from "react";
import { Tabs, Flex, theme } from "antd";
import { FaClipboardCheck, FaBroadcastTower } from "react-icons/fa";
import CCComplianceTable from "./CCComplianceTable";
import CCWeekConsumption from "./CCWeekConsumption";

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
    <>
      <style>{`
        .cc-data-tabs .ant-tabs-nav {
          background: #1F3461;
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
          padding: 14px 28px !important;
          margin: 0 !important;
          transition: all 0.2s ease;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab .tab-label span {
          color: rgba(255,255,255,0.6) !important;
          font-weight: 500;
          font-size: 14px;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab .tab-label svg {
          color: rgba(255,255,255,0.6) !important;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab:hover .tab-label span {
          color: white !important;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab:hover .tab-label svg {
          color: white !important;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab-active {
          background: rgba(255,255,255,0.15) !important;
          border: none !important;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab-active .tab-label span {
          color: white !important;
          font-weight: 600;
        }
        .cc-data-tabs .ant-tabs-card .ant-tabs-tab-active .tab-label svg {
          color: white !important;
        }
        .cc-data-tabs .ant-tabs-content-holder {
          background: transparent;
          border: none;
        }
        .cc-data-tabs .ant-tabs-content {
          padding: 16px 0 0;
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
