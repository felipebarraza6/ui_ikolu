import React, { useMemo } from "react";
import { Drawer, theme } from "antd";
import { useControlCenterStore } from "./stores/controlCenterStore";
import WarningsDrawer from "./drawers/WarningsDrawer";
import VoucherModal from "./drawers/VoucherModal";
import StopTelemetryDrawer from "./drawers/StopTelemetryDrawer";
import StopComplianceDrawer from "./drawers/StopComplianceDrawer";
import PointConfigDrawer from "./drawers/PointConfigDrawer";
import CCSupportDrawer from "./drawers/SupportDrawer";
import CCFlowAnalysisDrawer from "./drawers/FlowAnalysisDrawer";
import CCComplianceDetailDrawer from "./drawers/ComplianceDetailDrawer";
import { MeasurementsDrawerHeader, MeasurementsDrawerLoading } from "./drawers/MeasurementsDrawer";
import { MeasurementsDrawerContentMemo } from "./measurements/MeasurementDrawer";
import ModuleTour from "./ModuleTour";
import { centroControlTour } from "../../config/tours";

const { useToken } = theme;

/**
 * ControlCenterDrawers — Aisla todos los drawers/modales del Centro de Control
 * para evitar que sus re-renders afecten al componente padre.
 *
 * Este componente debe recibir TODAS las props que necesitan los drawers.
 * Está envuelto en React.memo para evitar re-renders innecesarios.
 */
const ControlCenterDrawers = ({
  // Store helpers
  drawers,
  openDrawer,
  closeDrawer,

  // Refs
  pointsRef,

  // Voucher state
  selectedVoucher,
  setSelectedVoucher,
  dgaVerifying,
  dgaResult,
  dgaConsole,
  voucherCopied,
  setVoucherCopied,
  handleVerifyDGA,

  // Measurements state
  selectedMeasurementPoint,
  setSelectedMeasurementPoint,
  measurementsData,
  measurementsLoading,
  measurementsViewMode,
  setMeasurementsViewMode,
  measurementsTab,
  setMeasurementsTab,
  wellConfig,
  setWellConfig,
  totalDayConsumo,
  handleNavigateDate,
  handleNavigatePointTo,

  // Flow analysis state
  selectedFlowPoint,
  setSelectedFlowPoint,
  flowAnalysisData,
  setFlowAnalysisData,

  // Compliance detail state
  selectedCompliancePoint,
  setSelectedCompliancePoint,

  // Stop telemetry state
  stopTelemetryPoint,
  setStopTelemetryPoint,
  stopTelemetryLoading,
  setStopTelemetryLoading,
  stopTelemetryForm,
  handleSubmitStopTelemetry,

  // Stop compliance state
  stopCompliancePoint,
  setStopCompliancePoint,
  stopComplianceLoading,
  setStopComplianceLoading,
  stopComplianceForm,
  handleSubmitStopCompliance,
  showDgaAlert,
  showDgaCriticalAlert,

  // Support state
  supportPoint,
  setSupportPoint,
  supportLoading,
  setSupportLoading,
  supportContextType,
  setSupportContextType,
  supportForm,

  // Point config state
  pointConfigLoading,
  pointConfigData,
  pointConfigName,
  setPointConfigData,
}) => {
  const { token } = useToken();
  const d = (name) => drawers[name] || { open: false };

  const warningsList = useControlCenterStore.getState().getWarningsList();
  const warningsRaw = useControlCenterStore.getState().getWarningsRaw();

  return (
    <>
      <WarningsDrawer
        open={d("warnings").open}
        onClose={() => closeDrawer("warnings")}
        warningsList={warningsList}
        warningsRaw={warningsRaw}
        selectedWarningPoint={d("warnings").pointName}
        setSelectedWarningPoint={(pointName) => openDrawer("warnings", { pointName })}
      />

      <Drawer
        title={
          <MeasurementsDrawerHeader
            pointsRef={pointsRef}
            selectedMeasurementPoint={selectedMeasurementPoint}
            handleNavigatePointTo={handleNavigatePointTo}
            handleNavigateDate={handleNavigateDate}
            measurementsViewMode={measurementsViewMode}
            setMeasurementsViewMode={setMeasurementsViewMode}
            measurementsTab={measurementsTab}
            setMeasurementsTab={setMeasurementsTab}
          />
        }
        open={d("measurements").open}
        onClose={() => {
          closeDrawer("measurements");
          setSelectedMeasurementPoint(null);
          setMeasurementsData(null);
          setWellConfig(null);
          setMeasurementsViewMode("chart");
          setMeasurementsTab("1");
        }}
        width="100%"
        styles={{ body: { padding: 8, overflow: "auto" }, header: { paddingBottom: 0, marginBottom: 0 } }}
        style={{ zIndex: 900 }}
      >
        {measurementsLoading ? (
          <MeasurementsDrawerLoading />
        ) : (
          <MeasurementsDrawerContentMemo
            data={measurementsData}
            token={token}
            viewMode={measurementsViewMode}
            variables={selectedMeasurementPoint?.variables || []}
            activeTab={measurementsTab}
            onTabChange={setMeasurementsTab}
            totalDayConsumo={totalDayConsumo}
            selectedMeasurementPoint={selectedMeasurementPoint}
            wellConfig={wellConfig}
          />
        )}
      </Drawer>

      <VoucherModal
        open={d("voucherModal").open}
        onCancel={() => {
          closeDrawer("voucherModal");
          setSelectedVoucher(null);
          setDgaResult(null);
          setDgaConsole([]);
        }}
        selectedVoucher={selectedVoucher}
        dgaResult={dgaResult}
        dgaConsole={dgaConsole}
        dgaVerifying={dgaVerifying}
        voucherCopied={voucherCopied}
        setVoucherCopied={setVoucherCopied}
        onVerifyDGA={handleVerifyDGA}
      />

      <PointConfigDrawer
        open={d("pointConfig").open}
        onClose={() => {
          closeDrawer("pointConfig");
          setPointConfigData(null);
        }}
        pointName={pointConfigName}
        configData={pointConfigData}
        loading={pointConfigLoading}
      />

      <StopTelemetryDrawer
        open={d("stopTelemetry").open}
        onClose={() => {
          closeDrawer("stopTelemetry");
          setStopTelemetryPoint(null);
          stopTelemetryForm.resetFields();
        }}
        point={stopTelemetryPoint}
        form={stopTelemetryForm}
        loading={stopTelemetryLoading}
        onSubmit={handleSubmitStopTelemetry}
      />

      <StopComplianceDrawer
        open={d("stopCompliance").open}
        onClose={() => {
          closeDrawer("stopCompliance");
          setStopCompliancePoint(null);
          stopComplianceForm.resetFields();
        }}
        point={stopCompliancePoint}
        form={stopComplianceForm}
        loading={stopComplianceLoading}
        onSubmit={handleSubmitStopCompliance}
        showDgaAlert={showDgaAlert}
        showDgaCriticalAlert={showDgaCriticalAlert}
      />

      <CCSupportDrawer
        open={d("support").open}
        onClose={() => {
          closeDrawer("support");
          setSupportPoint(null);
          setSupportContextType("SOPORTE");
        }}
        point={supportPoint}
        form={supportForm}
        loading={supportLoading}
        setLoading={setSupportLoading}
        contextType={supportContextType}
      />

      <CCFlowAnalysisDrawer
        open={d("flowAnalysis").open}
        onClose={() => {
          closeDrawer("flowAnalysis");
          setSelectedFlowPoint(null);
          setFlowAnalysisData(null);
        }}
        pointName={selectedFlowPoint?.pointName}
        authorizedFlow={selectedFlowPoint?.authorizedFlow}
        data={selectedFlowPoint?.measurements || []}
      />

      <CCComplianceDetailDrawer
        open={d("complianceDetail").open}
        onClose={() => {
          closeDrawer("complianceDetail");
          setSelectedCompliancePoint(null);
        }}
        point={selectedCompliancePoint}
      />

      <ModuleTour
        tourKey={centroControlTour.key}
        steps={centroControlTour.steps}
        requiresPoint={centroControlTour.requiresPoint}
        hasPoint={true}
        autoStart={true}
        delay={1000}
      />
    </>
  );
};

export default React.memo(ControlCenterDrawers);
