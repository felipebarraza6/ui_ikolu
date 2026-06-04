import React, { useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flex, Typography, theme, Button } from "antd";
import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import ControlCenterLayout from "../layout/ControlCenterLayout";
import TelemetryTab from "../tabs/telemetry";
import ComplianceTab from "../tabs/compliance";
import SkeletonTelemetry from "../tabs/telemetry/SkeletonTelemetry";
import SkeletonCompliance from "../tabs/compliance/SkeletonCompliance";
import { useControlCenterStore } from "../stores/controlCenterStore";
import { useAuth } from "../../../contexts/AuthContext";

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
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuth } = useAuth();
  const { token } = useToken();

  const {
    data,
    loading,
    error,
    fetchData,
    selectedDate,
    setSelectedDate,
  } = useControlCenterStore();

  // Track if this is the initial mount to prevent error flash on remounts
  const isInitialMount = React.useRef(true);
  
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Data fetching with auto-refresh
  useEffect(() => {
    if (!isAuth) return;
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [isAuth, fetchData]);

  useEffect(() => {
    if (!isAuth) return;
    const interval = setInterval(() => {
      const controller = new AbortController();
      fetchData(controller.signal, true);
      return () => controller.abort();
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuth, fetchData]);

  // Tab routing from URL
  const activeTab = useMemo(() => {
    return location.pathname.includes("/compliance") ? "compliance" : "telemetry";
  }, [location.pathname]);

  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;
    navigate(tab === "compliance" ? "/control-center/compliance" : "/control-center/telemetry");
  }, [activeTab, navigate]);

  const isReady = !!data && !loading;
  const overview = data?.overview || {};
  const points = data?.points || [];
  const warningsList = data?.recent_warnings_list || [];
  const warningsRaw = data?.recent_warnings || {};
  const chatQuota = data?.chat_quota || null;

  // Filter out cancel/abort errors — these are not real errors
  const isRealError = error && error.message !== "canceled" && error.name !== "AbortError";

  // Not ready state — shows skeleton during initial load
  if (!isReady && !isRealError) {
    return (
      <ControlCenterLayout
        overview={{}}
        points={[]}
        warningsList={[]}
        warningsRaw={{}}
        chatQuota={chatQuota}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={true}
      >
        {activeTab === "telemetry" ? <SkeletonTelemetry /> : <SkeletonCompliance />}
      </ControlCenterLayout>
    );
  }

  // Error state — only show for real errors, not aborts
  if (isRealError && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }} vertical gap={16}>
        <ExclamationCircleOutlined style={{ fontSize: 48, color: token.colorError }} />
        <Title level={4} style={{ color: token.colorTextSecondary }}>No se pudieron cargar los datos</Title>
        <Text style={{ color: token.colorTextDisabled }}>{error.message}</Text>
        <Button
          type="primary"
          onClick={() => {
            const controller = new AbortController();
            fetchData(controller.signal);
          }}
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
    >
      <div className="tab-transition" key={`tab-${activeTab}`}>
        {activeTab === "telemetry" ? (
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
            loading={loading}
          />
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
            loading={loading}
          />
        )}
      </div>
    </ControlCenterLayout>
  );
};

export default ControlCenterContainer;
