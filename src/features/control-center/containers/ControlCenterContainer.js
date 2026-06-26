import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  onGeneralWarningClick,
  onPointWarningClick,
  onViewPointConfig,
  onViewVoucher,
  onOpenStopCompliance,
  onViewFlowAnalysis,
  onViewComplianceDetail,
  onViewFlowHistory,
  onViewNearLimitHistory,
  onToggleTelemetry,
  togglingTelemetry,
  onToggleCompliance,
  togglingCompliance,
  activeTab,
  complianceLoading,
  isRefreshing,
  data,
  dailySummary,
  listData,
  listPage,
  setListPage,
  listOrderBy,
  setListOrderBy,
  compliancePage,
  setCompliancePage,
  compliancePageSize,
  setCompliancePageSize,
  complianceCount,
  complianceOrderBy,
  setComplianceOrderBy,
  complianceSearch,
  setComplianceSearch,
  complianceStandard,
  setComplianceStandard,
  complianceNature,
  setComplianceNature,
  loading,
  listLoading,
  error,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { token } = useToken();
  const [changingDate, setChangingDate] = useState(false);

  const selectedDate = useControlCenterStore((s) => s.selectedDate);
  const setSelectedDate = useControlCenterStore((s) => s.setSelectedDate);
  const selectedProject = useControlCenterStore((s) => s.selectedProject);
  const setSelectedProject = useControlCenterStore((s) => s.setSelectedProject);
  const dateRange = useControlCenterStore((s) => s.dateRange);
  const setDateRange = useControlCenterStore((s) => s.setDateRange);

  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;
    navigate(tab === "compliance" ? "/control-center/compliance" : "/control-center/telemetry");
  }, [activeTab, navigate]);

  const handleDateRangeChange = useCallback((range) => {
    setChangingDate(true);
    setDateRange(range);
  }, [setDateRange]);

  // Desactivar skeleton visual cuando terminen todas las cargas activas.
  useEffect(() => {
    if (!loading && !listLoading) setChangingDate(false);
  }, [loading, listLoading]);

  // Activar skeleton visual cuando cambia el proyecto (recarga base + daily + list).
  useEffect(() => {
    setChangingDate(true);
  }, [selectedProject]);

  // Resetear skeleton visual cuando se cambia de pestaña para no dejarlo pegado.
  useEffect(() => {
    setChangingDate(false);
  }, [activeTab]);

  const visualLoading = loading || changingDate;
  const isReady = !!data;
  const overview = useMemo(() => data?.overview || {}, [data?.overview]);
  const projects = useMemo(() => data?.projects || [], [data?.projects]);
  const points = useMemo(() => {
    const all = data?.points || [];
    if (!selectedProject) return all;
    return all.filter((p) => String(p.project_id) === String(selectedProject));
  }, [data?.points, selectedProject]);

  const warningsList = useMemo(() => data?.recent_warnings_list || [], [data?.recent_warnings_list]);
  const warningsRaw = useMemo(() => data?.recent_warnings || {}, [data?.recent_warnings]);
  const chatQuota = useMemo(() => data?.chat_quota || null, [data?.chat_quota]);

  const telemetryTab = useMemo(() => {
    if (!data) return <SkeletonTelemetry />;
    return (
      <TelemetryTab
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
        handleWarningPointClick={onPointWarningClick}
        warningsRaw={warningsRaw}
        handleViewPointConfig={onViewPointConfig}
        onToggleTelemetry={onToggleTelemetry}
        togglingTelemetry={togglingTelemetry}
        loading={visualLoading}
        listLoading={listLoading}
      />
    );
  }, [
    data,
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
    onPointWarningClick,
    warningsRaw,
    onViewPointConfig,
    onToggleTelemetry,
    togglingTelemetry,
    visualLoading,
    listLoading,
  ]);

  const complianceTab = useMemo(() => {
    if (!data) return <SkeletonCompliance pageSize={compliancePageSize} />;
    return (
      <ComplianceTab
        points={points}
        handleViewVoucher={onViewVoucher}
        handleOpenStopCompliance={onOpenStopCompliance}
        handleOpenSupport={onOpenSupport}
        handleViewPointConfig={onViewPointConfig}
        handleViewFlowAnalysis={onViewFlowAnalysis}
        handleViewComplianceDetail={onViewComplianceDetail}
        handleViewFlowHistory={onViewFlowHistory}
        handleViewNearLimitHistory={onViewNearLimitHistory}
        onToggleCompliance={onToggleCompliance}
        togglingCompliance={togglingCompliance}
        loading={complianceLoading || isRefreshing}
        page={compliancePage}
        setPage={setCompliancePage}
        pageSize={compliancePageSize}
        setPageSize={setCompliancePageSize}
        total={complianceCount}
        orderBy={complianceOrderBy}
        setOrderBy={setComplianceOrderBy}
        search={complianceSearch}
        setSearch={setComplianceSearch}
        standard={complianceStandard}
        setStandard={setComplianceStandard}
        nature={complianceNature}
        setNature={setComplianceNature}
      />
    );
  }, [
    data,
    points,
    onViewVoucher,
    onOpenStopCompliance,
    onOpenSupport,
    onViewPointConfig,
    onViewFlowAnalysis,
    onViewComplianceDetail,
    onViewFlowHistory,
    onViewNearLimitHistory,
    onToggleCompliance,
    togglingCompliance,
    complianceLoading,
    isRefreshing,
    compliancePage,
    setCompliancePage,
    compliancePageSize,
    setCompliancePageSize,
    complianceCount,
    complianceOrderBy,
    setComplianceOrderBy,
    complianceSearch,
    setComplianceSearch,
    complianceStandard,
    setComplianceStandard,
    complianceNature,
    setComplianceNature,
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
      onWarningClick={onGeneralWarningClick}
      loading={visualLoading || !data || isRefreshing}
      tableLoading={visualLoading || isRefreshing}
    >
      <div className="tab-transition" key={`tab-${activeTab}`}>
        {activeTab === "telemetry" ? telemetryTab : complianceTab}
      </div>
    </ControlCenterLayout>
  );
};

export default React.memo(ControlCenterContainer);
