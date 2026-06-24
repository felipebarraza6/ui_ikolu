import React, { useMemo, useCallback, useState, useEffect } from "react";
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
  dailySummary,
  listData,
  listPage,
  setListPage,
  listOrderBy,
  setListOrderBy,
  loading,
  listLoading,
  error,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useToken();
  const [changingDate, setChangingDate] = useState(false);

  const selectedDate = useControlCenterStore((s) => s.selectedDate);
  const setSelectedDate = useControlCenterStore((s) => s.setSelectedDate);
  const selectedProject = useControlCenterStore((s) => s.selectedProject);
  const setSelectedProject = useControlCenterStore((s) => s.setSelectedProject);
  const dateRange = useControlCenterStore((s) => s.dateRange);
  const setDateRange = useControlCenterStore((s) => s.setDateRange);

  const activeTab = useMemo(() => {
    return location.pathname.includes("/compliance") ? "compliance" : "telemetry";
  }, [location.pathname]);

  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;
    navigate(tab === "compliance" ? "/control-center/compliance" : "/control-center/telemetry");
  }, [activeTab, navigate]);

  const handleDateRangeChange = useCallback((range) => {
    setChangingDate(true);
    setDateRange(range);
  }, [setDateRange]);

  useEffect(() => {
    if (!loading) setChangingDate(false);
  }, [loading]);

  const visualLoading = loading || changingDate;
  const isReady = !!data;
  const overview = useMemo(() => data?.overview || {}, [data?.overview]);
  const projects = useMemo(() => data?.projects || [], [data?.projects]);
  const points = useMemo(() => {
    const all = data?.points || [];
    if (!selectedProject) return all;
    return all.filter((p) => p.project_id === selectedProject);
  }, [data?.points, selectedProject]);

  const last7 = useMemo(() => {
    const all = data?.last_7 || {};
    if (!selectedProject) return all;
    const filtered = {};
    Object.entries(all).forEach(([pointName, weekData]) => {
      if (weekData?.point_id == null) return;
      if (weekData.point_id === selectedProject) {
        filtered[pointName] = weekData;
      }
    });
    return filtered;
  }, [data?.last_7, selectedProject]);

  const warningsList = useMemo(() => data?.recent_warnings_list || [], [data?.recent_warnings_list]);
  const warningsRaw = useMemo(() => data?.recent_warnings || {}, [data?.recent_warnings]);
  const chatQuota = useMemo(() => data?.chat_quota || null, [data?.chat_quota]);

  const telemetryTab = useMemo(() => {
    if (!data) return <SkeletonTelemetry />;
    return (
      <TelemetryTab
        last7={last7}
        dailySummary={dailySummary}
        listData={listData}
        listPage={listPage}
        setListPage={setListPage}
        listOrderBy={listOrderBy}
        setListOrderBy={setListOrderBy}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        handleViewMeasurements={onViewMeasurements}
        handleOpenStopTelemetry={onOpenStopTelemetry}
        handleOpenSupport={onOpenSupport}
        handleWarningPointClick={onWarningClick}
        warningsRaw={warningsRaw}
        handleViewPointConfig={onViewPointConfig}
        loading={visualLoading}
        listLoading={listLoading}
      />
    );
  }, [
    data,
    last7,
    dailySummary,
    listData,
    listPage,
    setListPage,
    listOrderBy,
    setListOrderBy,
    selectedDate,
    setSelectedDate,
    onViewMeasurements,
    onOpenStopTelemetry,
    onOpenSupport,
    onWarningClick,
    warningsRaw,
    onViewPointConfig,
    visualLoading,
    listLoading,
  ]);

  const complianceTab = useMemo(() => {
    if (!data) return <SkeletonCompliance />;
    return (
      <ComplianceTab
        points={points}
        last7={last7}
        handleViewVoucher={onViewVoucher}
        handleOpenStopCompliance={onOpenStopCompliance}
        handleOpenSupport={onOpenSupport}
        handleViewPointConfig={onViewPointConfig}
        handleViewFlowAnalysis={onViewFlowAnalysis}
        handleViewComplianceDetail={onViewComplianceDetail}
        loading={visualLoading}
      />
    );
  }, [
    data,
    points,
    last7,
    onViewVoucher,
    onOpenStopCompliance,
    onOpenSupport,
    onViewPointConfig,
    onViewFlowAnalysis,
    onViewComplianceDetail,
    visualLoading,
  ]);

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
      projects={projects}
      selectedProject={selectedProject}
      onSelectProject={setSelectedProject}
      dateRange={dateRange}
      onDateRangeChange={handleDateRangeChange}
      warningsList={warningsList}
      warningsRaw={warningsRaw}
      chatQuota={chatQuota}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onWarningClick={onWarningClick}
      loading={!data}
      tableLoading={visualLoading}
    >
      <div className="tab-transition" key={`tab-${activeTab}`}>
        {activeTab === "telemetry" ? telemetryTab : complianceTab}
      </div>
    </ControlCenterLayout>
  );
};

export default React.memo(ControlCenterContainer);
