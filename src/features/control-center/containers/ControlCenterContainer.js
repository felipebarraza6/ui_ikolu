import React, { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flex, Typography, theme, Button } from "antd";
import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import ControlCenterLayout from "../layout/ControlCenterLayout";
import TelemetryTab from "../tabs/telemetry";
import ComplianceTab from "../tabs/compliance";
import SkeletonCompliance from "../tabs/compliance/SkeletonCompliance";
import SkeletonTelemetry from "../tabs/telemetry/SkeletonTelemetry";
import { useControlCenterStore } from "../stores/controlCenterStore";

const { Text, Title } = Typography;
const { useToken } = theme;

const ControlCenterContainer = ({
  onViewMeasurements,
  onOpenStopTelemetry,
  onOpenSupport,
  onWarningClick,
  onViewPointConfig,
  onViewVoucher,
  onOpenStopCompliance,
  onViewFlowAnalysis,
  onViewComplianceDetail,
  data,
  loading,
  error,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useToken();

  const selectedDate = useControlCenterStore((s) => s.selectedDate);
  const setSelectedDate = useControlCenterStore((s) => s.setSelectedDate);

  const activeTab = useMemo(() => {
    return location.pathname.includes("/compliance") ? "compliance" : "telemetry";
  }, [location.pathname]);

  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;
    navigate(tab === "compliance" ? "/control-center/compliance" : "/control-center/telemetry");
  }, [activeTab, navigate]);

  const isReady = !!data;
  const overview = useMemo(() => data?.overview || {}, [data?.overview]);
  const points = useMemo(() => data?.points || [], [data?.points]);
  const warningsList = useMemo(() => data?.recent_warnings_list || [], [data?.recent_warnings_list]);
  const warningsRaw = useMemo(() => data?.recent_warnings || {}, [data?.recent_warnings]);
  const chatQuota = useMemo(() => data?.chat_quota || null, [data?.chat_quota]);

  const isRealError = error && error.message !== "canceled" && error.name !== "AbortError";

  if (isRealError && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }} vertical gap={16}>
        <ExclamationCircleOutlined style={{ fontSize: 48, color: token.colorError }} />
        <Title level={4} style={{ color: token.colorTextSecondary }}>No se pudieron cargar los datos</Title>
        <Text style={{ color: token.colorTextDisabled }}>{error.message}</Text>
        <Button
          type="primary"
          onClick={() => onRefresh && onRefresh()}
          icon={<ReloadOutlined />}
        >
          Reintentar
        </Button>
      </Flex>
    );
  }

  return (
    <ControlCenterLayout
      overview={overview}
      points={points}
      warningsList={warningsList}
      warningsRaw={warningsRaw}
      chatQuota={chatQuota}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onWarningClick={onWarningClick}
      loading={!data}
    >
      <div className="tab-transition" key={`tab-${activeTab}`}>
        {activeTab === "telemetry" ? (
          !data ? (
            <SkeletonTelemetry />
          ) : (
            <TelemetryTab
              last7={data?.last_7}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              handleViewMeasurements={onViewMeasurements}
              handleOpenStopTelemetry={onOpenStopTelemetry}
              handleOpenSupport={onOpenSupport}
              handleWarningPointClick={onWarningClick}
              warningsRaw={warningsRaw}
              handleViewPointConfig={onViewPointConfig}
            />
          )
        ) : (
          !data ? (
            <SkeletonCompliance />
          ) : (
            <ComplianceTab
              points={points}
              last7={data?.last_7}
              handleViewVoucher={onViewVoucher}
              handleOpenStopCompliance={onOpenStopCompliance}
              handleOpenSupport={onOpenSupport}
              handleViewPointConfig={onViewPointConfig}
              handleViewFlowAnalysis={onViewFlowAnalysis}
              handleViewComplianceDetail={onViewComplianceDetail}
            />
          )
        )}
      </div>
    </ControlCenterLayout>
  );
};

export default React.memo(ControlCenterContainer);
