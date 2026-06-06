import React, { useCallback, useState, useMemo, useRef, useEffect } from "react";
import "./ControlCenter.css";
import { useControlCenterStore } from "./stores/controlCenterStore";
import { useControlCenterData } from "./hooks/useControlCenterData";
import orchestrator from "../../api/orchestrator";
import { Form, theme, Drawer, message } from "antd";
import CCSupportDrawer from "./drawers/SupportDrawer";
import PointConfigDrawer from "./drawers/PointConfigDrawer";
import CCFlowAnalysisDrawer from "./drawers/FlowAnalysisDrawer";
import CCComplianceDetailDrawer from "./drawers/ComplianceDetailDrawer";
import WarningsDrawer from "./drawers/WarningsDrawer";
import VoucherModal from "./drawers/VoucherModal";
import StopTelemetryDrawer from "./drawers/StopTelemetryDrawer";
import StopComplianceDrawer from "./drawers/StopComplianceDrawer";
import { MeasurementsDrawerHeader, MeasurementsDrawerLoading } from "./drawers/MeasurementsDrawer";
import ModuleTour from "./ModuleTour";
import { centroControlTour } from "../../config/tours";
import { format, parseISO, subDays, addDays } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { MeasurementsDrawerContentMemo } from "./measurements/MeasurementDrawer";
import { extractRecordNum } from "./measurements/MeasurementUtils";
import ControlCenterContainer from "./containers/ControlCenterContainer";

const { useToken } = theme;

const ControlCenter = () => {
  const { user } = useAuth();
  const { token } = useToken();

  const drawers = useControlCenterStore((s) => s.drawers);
  const openDrawer = useControlCenterStore((s) => s.openDrawer);
  const closeDrawer = useControlCenterStore((s) => s.closeDrawer);
  const { data, loading, error, refresh } = useControlCenterData();

  // Shorthand helpers para drawer state
  const d = (name) => drawers[name] || { open: false };

  // Refs para datos (se actualizan cuando el store cambia)
  const pointsRef = useRef([]);
  const last7Ref = useRef({});

  useEffect(() => {
    pointsRef.current = data?.points || [];
  }, [data?.points]);

  useEffect(() => {
    last7Ref.current = data?.last_7 || {};
  }, [data?.last_7]);

  // ── Voucher state ──
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [dgaVerifying, setDgaVerifying] = useState(false);
  const [dgaResult, setDgaResult] = useState(null);
  const [dgaConsole, setDgaConsole] = useState([]);
  const [voucherCopied, setVoucherCopied] = useState(false);

  // ── Measurements state ──
  const [selectedMeasurementPoint, setSelectedMeasurementPoint] = useState(null);
  const [measurementsData, setMeasurementsData] = useState(null);
  const [measurementsLoading, setMeasurementsLoading] = useState(false);
  const [measurementsViewMode, setMeasurementsViewMode] = useState("chart");
  const [measurementsTab, setMeasurementsTab] = useState("1");
  const [wellConfig, setWellConfig] = useState(null);

  // ── Flow analysis state ──
  const [selectedFlowPoint, setSelectedFlowPoint] = useState(null);
  const [flowAnalysisData, setFlowAnalysisData] = useState(null);
  const [flowAnalysisLoading, setFlowAnalysisLoading] = useState(false);

  // ── Compliance detail state ──
  const [selectedCompliancePoint, setSelectedCompliancePoint] = useState(null);

  // ── Stop telemetry state ──
  const [stopTelemetryLoading, setStopTelemetryLoading] = useState(false);
  const [stopTelemetryPoint, setStopTelemetryPoint] = useState(null);
  const [stopTelemetryForm] = Form.useForm();

  // ── Stop compliance state ──
  const [stopComplianceLoading, setStopComplianceLoading] = useState(false);
  const [stopCompliancePoint, setStopCompliancePoint] = useState(null);
  const [stopComplianceForm] = Form.useForm();

  // ── Support state ──
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportPoint, setSupportPoint] = useState(null);
  const [supportContextType, setSupportContextType] = useState("SOPORTE");
  const [supportForm] = Form.useForm();

  // ── Point config state ──
  const [pointConfigLoading, setPointConfigLoading] = useState(false);
  const [pointConfigData, setPointConfigData] = useState(null);
  const [pointConfigName, setPointConfigName] = useState("");

  // DGA watch
  const compStart = Form.useWatch("start_date", stopComplianceForm);
  const compEnd = Form.useWatch("end_date", stopComplianceForm);
  const compDiffDays = compStart && compEnd ? compEnd.diff(compStart, "days") : 0;

  const totalDayConsumo = useMemo(() => {
    const records = Array.isArray(measurementsData?.results) ? measurementsData.results
      : Array.isArray(measurementsData?.records) ? measurementsData.records
      : Array.isArray(measurementsData?.measurements) ? measurementsData.measurements
      : Array.isArray(measurementsData?.data) ? measurementsData.data
      : [];
    return records.reduce((sum, m) => sum + (extractRecordNum(m.total_diff) || 0), 0);
  }, [measurementsData]);

  // ── Callbacks para el container ──

  const handleWarningClick = useCallback((pointName) => {
    openDrawer('warnings', { pointName });
  }, []);

  const handleViewVoucher = useCallback((record) => {
    setSelectedVoucher(record);
    setDgaResult(null);
    setDgaConsole([]);
    openDrawer('voucherModal');
  }, []);

  const handleViewMeasurements = useCallback(async (pointName, date, variables = []) => {
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    const pointCfg = last7Ref.current?.[pointName] || null;
    setSelectedMeasurementPoint({ pointName, date, pointId: point.id, variables });
    setWellConfig(pointCfg?.d1 != null ? pointCfg : null);
    openDrawer('measurements');
    setMeasurementsLoading(true);
    setMeasurementsData(null);
    try {
      const [recordsRes, configRes] = await Promise.all([
        orchestrator.pointRecords(point.id, date, date, 100),
        !pointCfg?.d1 ? orchestrator.pointConfig(point.id) : Promise.resolve(null)
      ]);
      setMeasurementsData(recordsRes);
      if (configRes && configRes.d1 != null) setWellConfig(configRes);
    } catch (err) {
      console.error("[Measurements] Error:", err);
      message.error("Error cargando mediciones");
    } finally {
      setMeasurementsLoading(false);
    }
  }, []);

  const handleNavigateDate = useCallback((direction) => {
    if (!selectedMeasurementPoint?.date) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const newDate = format(addDays(parseISO(selectedMeasurementPoint.date), direction), 'yyyy-MM-dd');
    if (newDate > today || newDate < sevenDaysAgo) return;
    const point = pointsRef.current?.find((p) => p.title === selectedMeasurementPoint.pointName);
    if (!point) return;
    setSelectedMeasurementPoint({ pointName: selectedMeasurementPoint.pointName, date: newDate, pointId: point.id, variables: selectedMeasurementPoint.variables || [] });
    setMeasurementsLoading(true);
    setMeasurementsData(null);
    orchestrator.pointRecords(point.id, newDate, newDate, 100)
      .then(setMeasurementsData)
      .catch(err => { console.error(err); message.error("Error navegando fecha"); })
      .finally(() => setMeasurementsLoading(false));
  }, [selectedMeasurementPoint]);

  const handleNavigatePoint = useCallback((direction) => {
    const points = pointsRef.current || [];
    if (points.length === 0) return;
    const currentIndex = points.findIndex(p => p.title === selectedMeasurementPoint?.pointName);
    if (currentIndex === -1) return;
    const newIndex = (currentIndex + direction + points.length) % points.length;
    const newPoint = points[newIndex];
    const date = selectedMeasurementPoint?.date;
    const pointCfg = last7Ref.current?.[newPoint.title] || null;
    setSelectedMeasurementPoint({ pointName: newPoint.title, date, pointId: newPoint.id, variables: last7Ref.current?.[newPoint.title]?.variables || [] });
    setWellConfig(pointCfg?.d1 != null ? pointCfg : null);
    setMeasurementsLoading(true);
    setMeasurementsData(null);
    Promise.all([
      orchestrator.pointRecords(newPoint.id, date, date, 100),
      !pointCfg?.d1 ? orchestrator.pointConfig(newPoint.id) : Promise.resolve(null)
    ])
      .then(([recordsRes, configRes]) => {
        setMeasurementsData(recordsRes);
        if (configRes && configRes.d1 != null) setWellConfig(configRes);
      })
      .catch(err => { console.error(err); message.error("Error cambiando punto"); })
      .finally(() => setMeasurementsLoading(false));
  }, [selectedMeasurementPoint]);

  const handleNavigatePointTo = useCallback((point) => {
    if (!point) return;
    const date = selectedMeasurementPoint?.date || format(new Date(), 'yyyy-MM-dd');
    const pointCfg = last7Ref.current?.[point.title] || null;
    setSelectedMeasurementPoint({ pointName: point.title, date, pointId: point.id, variables: last7Ref.current?.[point.title]?.variables || [] });
    setWellConfig(pointCfg?.d1 != null ? pointCfg : null);
    setMeasurementsLoading(true);
    setMeasurementsData(null);
    Promise.all([
      orchestrator.pointRecords(point.id, date, date, 100),
      !pointCfg?.d1 ? orchestrator.pointConfig(point.id) : Promise.resolve(null)
    ])
      .then(([recordsRes, configRes]) => {
        setMeasurementsData(recordsRes);
        if (configRes && configRes.d1 != null) setWellConfig(configRes);
      })
      .catch(err => { console.error(err); message.error("Error cargando punto"); })
      .finally(() => setMeasurementsLoading(false));
  }, [selectedMeasurementPoint]);

  const handleViewFlowAnalysis = useCallback((pointName, authorizedFlow, measurements) => {
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    setSelectedFlowPoint({ pointName, authorizedFlow, pointId: point.id, measurements });
    openDrawer('flowAnalysis');
    setFlowAnalysisData(measurements);
  }, []);

  const handleViewComplianceDetail = useCallback((point) => {
    setSelectedCompliancePoint(point);
    openDrawer('complianceDetail', { point });
  }, []);

  const handleViewPointConfig = useCallback(async (pointName) => {
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    setPointConfigName(pointName);
    openDrawer('pointConfig', { pointName });
    setPointConfigLoading(true);
    setPointConfigData(null);
    try {
      const res = await orchestrator.pointConfig(point.id);
      setPointConfigData(res);
    } catch (err) {
      console.error(err);
      message.error("Error cargando configuración");
    } finally {
      setPointConfigLoading(false);
    }
  }, []);

  const handleOpenStopTelemetry = useCallback((pointName) => {
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    const payload = { id: point.id, name: pointName, client: point.client_name || "—" };
    setStopTelemetryPoint(payload);
    stopTelemetryForm.resetFields();
    openDrawer('stopTelemetry', { point: payload });
  }, [stopTelemetryForm]);

  const handleOpenStopCompliance = useCallback((record) => {
    const payload = { id: record.id, name: record.title || record.name || "—", code: record.code || "—", client: record.client_name || "—" };
    setStopCompliancePoint(payload);
    stopComplianceForm.resetFields();
    openDrawer('stopCompliance', { point: payload });
  }, [stopComplianceForm]);

  const handleOpenSupport = useCallback((pointNameOrRecord, contextType = "SOPORTE") => {
    let point;
    if (typeof pointNameOrRecord === "string") {
      point = pointsRef.current?.find((p) => p.title === pointNameOrRecord);
      if (!point) point = { id: null, title: pointNameOrRecord, name: pointNameOrRecord, code: null, client_name: null, client: null };
    } else {
      point = pointNameOrRecord;
    }
    if (!point) return;
    const payload = { id: point.id, name: point.title || point.name || "—", code: point.code || null, client: point.client_name || "—" };
    setSupportPoint(payload);
    setSupportContextType(contextType);
    supportForm.resetFields();
    openDrawer('support', { point: payload, contextType });
  }, [supportForm]);

  const handleVerifyDGA = useCallback(async () => {
    if (!selectedVoucher?.code || !selectedVoucher?.voucher) return;
    setDgaVerifying(true);
    setDgaConsole(["Consultando DGA..."]);
    try {
      const data = await orchestrator.verifyDgaVoucher(selectedVoucher.code, selectedVoucher.voucher, selectedVoucher.type_dga || 'SUPERFICIAL');
      setDgaResult(data);
      setDgaConsole(prev => [...prev, "Verificación completada"]);
    } catch (err) {
      setDgaConsole(prev => [...prev, `ERROR: ${err.message}`]);
    } finally {
      setDgaVerifying(false);
    }
  }, [selectedVoucher]);

  const handleSubmitStopTelemetry = useCallback(async (values) => {
    if (!stopTelemetryPoint) return;
    setStopTelemetryLoading(true);
    try {
      const payload = {
        title: `Solicitud detener telemetría - ${stopTelemetryPoint.name}`,
        message: values.reason.trim(),
        point_catchment: stopTelemetryPoint.id,
        type_notification: "SUPPORT", type_alert: "SOPORTE", type_variable: "TODOS",
        priority: "medium", assigned_to: null, is_periodic: false, is_active: true,
        is_read: false, is_response: false, is_finish: false, is_wait: false,
        status_dga: "PENDING", status_sma: "PENDING",
        start_date: values.start_date?.format("YYYY-MM-DD") || null,
        end_date: values.end_date?.format("YYYY-MM-DD") || null,
        emails: user?.email ? [user.email] : [],
      };
      const res = await orchestrator.notifications.create(payload);
      message.success(`Ticket #${res.id} creado exitosamente`);
      stopTelemetryForm.resetFields();
      closeDrawer('stopTelemetry'); setStopTelemetryPoint(null);
    } catch (err) { message.error("Error al crear el ticket"); }
    finally { setStopTelemetryLoading(false); }
  }, [stopTelemetryPoint, stopTelemetryForm, user?.email]);

  const handleSubmitStopCompliance = useCallback(async (values) => {
    if (!stopCompliancePoint) return;
    setStopComplianceLoading(true);
    try {
      const payload = {
        title: `Solicitud detener cumplimiento - ${stopCompliancePoint.name}`,
        message: values.reason.trim(),
        point_catchment: stopCompliancePoint.id,
        type_notification: "SUPPORT", type_alert: "SOPORTE", type_variable: "TODOS",
        priority: "medium", assigned_to: null, is_periodic: false, is_active: true,
        is_read: false, is_response: false, is_finish: false, is_wait: false,
        status_dga: "PENDING", status_sma: "PENDING",
        start_date: values.start_date?.format("YYYY-MM-DD") || null,
        end_date: values.end_date?.format("YYYY-MM-DD") || null,
        emails: user?.email ? [user.email] : [],
      };
      const res = await orchestrator.notifications.create(payload);
      message.success(`Ticket #${res.id} creado exitosamente`);
      stopComplianceForm.resetFields();
      closeDrawer('stopCompliance'); setStopCompliancePoint(null);
    } catch (err) { message.error("Error al crear el ticket"); }
    finally { setStopComplianceLoading(false); }
  }, [stopCompliancePoint, stopComplianceForm, user?.email]);

  const showDgaAlert = stopCompliancePoint?.code && stopCompliancePoint?.code !== "—" && compDiffDays > 5;
  const showDgaCriticalAlert = stopCompliancePoint?.code && stopCompliancePoint?.code !== "—" && compDiffDays > 10;

  return (
    <>
      <ControlCenterContainer
        onViewMeasurements={handleViewMeasurements}
        onOpenStopTelemetry={handleOpenStopTelemetry}
        onOpenSupport={handleOpenSupport}
        onWarningClick={handleWarningClick}
        onViewPointConfig={handleViewPointConfig}
        onViewVoucher={handleViewVoucher}
        onOpenStopCompliance={handleOpenStopCompliance}
        onViewFlowAnalysis={handleViewFlowAnalysis}
        onViewComplianceDetail={handleViewComplianceDetail}
        data={data}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />

      <WarningsDrawer
        open={d('warnings').open}
        onClose={() => closeDrawer('warnings')}
        warningsList={data?.recent_warnings_list || []}
        warningsRaw={data?.recent_warnings || {}}
        selectedWarningPoint={d('warnings').pointName}
        setSelectedWarningPoint={(pointName) => openDrawer('warnings', { pointName })}
      />

      <Drawer
        title={
          <MeasurementsDrawerHeader
            pointsRef={pointsRef}
            last7Ref={last7Ref}
            selectedMeasurementPoint={selectedMeasurementPoint}
            handleNavigatePointTo={handleNavigatePointTo}
            handleNavigateDate={handleNavigateDate}
            measurementsViewMode={measurementsViewMode}
            setMeasurementsViewMode={setMeasurementsViewMode}
            measurementsTab={measurementsTab}
            setMeasurementsTab={setMeasurementsTab}
          />
        }
        open={d('measurements').open}
        onClose={() => {
          closeDrawer('measurements'); setSelectedMeasurementPoint(null);
          setMeasurementsData(null); setWellConfig(null);
          setMeasurementsViewMode("chart"); setMeasurementsTab("1");
        }}
        width="100%"
        styles={{ body: { padding: 8, overflow: "auto" }, header: { paddingBottom: 0, marginBottom: 0 } }}
        style={{ zIndex: 900 }}
      >
        {measurementsLoading ? (
          <MeasurementsDrawerLoading />
        ) : (
          <MeasurementsDrawerContentMemo
            data={measurementsData} token={token} viewMode={measurementsViewMode}
            variables={selectedMeasurementPoint?.variables || []}
            activeTab={measurementsTab} onTabChange={setMeasurementsTab}
            totalDayConsumo={totalDayConsumo}
            selectedMeasurementPoint={selectedMeasurementPoint}
            wellConfig={wellConfig}
          />
        )}
      </Drawer>

      <VoucherModal
        open={d('voucherModal').open}
        onCancel={() => { closeDrawer('voucherModal'); setSelectedVoucher(null); setDgaResult(null); setDgaConsole([]); }}
        selectedVoucher={selectedVoucher}
        dgaResult={dgaResult} dgaConsole={dgaConsole} dgaVerifying={dgaVerifying}
        voucherCopied={voucherCopied} setVoucherCopied={setVoucherCopied}
        onVerifyDGA={handleVerifyDGA}
      />

      <PointConfigDrawer
        open={d('pointConfig').open}
        onClose={() => { closeDrawer('pointConfig'); setPointConfigData(null); }}
        pointName={pointConfigName}
        configData={pointConfigData}
        loading={pointConfigLoading}
      />

      <StopTelemetryDrawer
        open={d('stopTelemetry').open}
        onClose={() => { closeDrawer('stopTelemetry'); setStopTelemetryPoint(null); stopTelemetryForm.resetFields(); }}
        point={stopTelemetryPoint}
        form={stopTelemetryForm}
        loading={stopTelemetryLoading}
        onSubmit={handleSubmitStopTelemetry}
      />

      <StopComplianceDrawer
        open={d('stopCompliance').open}
        onClose={() => { closeDrawer('stopCompliance'); setStopCompliancePoint(null); stopComplianceForm.resetFields(); }}
        point={stopCompliancePoint}
        form={stopComplianceForm}
        loading={stopComplianceLoading}
        onSubmit={handleSubmitStopCompliance}
        showDgaAlert={showDgaAlert}
        showDgaCriticalAlert={showDgaCriticalAlert}
      />

      <CCSupportDrawer
        open={d('support').open}
        onClose={() => { closeDrawer('support'); setSupportPoint(null); setSupportContextType("SOPORTE"); }}
        point={supportPoint}
        form={supportForm}
        loading={supportLoading}
        setLoading={setSupportLoading}
        contextType={supportContextType}
      />

      <CCFlowAnalysisDrawer
        open={d('flowAnalysis').open}
        onClose={() => { closeDrawer('flowAnalysis'); setSelectedFlowPoint(null); setFlowAnalysisData(null); }}
        pointName={selectedFlowPoint?.pointName}
        authorizedFlow={selectedFlowPoint?.authorizedFlow}
        data={selectedFlowPoint?.measurements || []}
      />

      <CCComplianceDetailDrawer
        open={d('complianceDetail').open}
        onClose={() => { closeDrawer('complianceDetail'); setSelectedCompliancePoint(null); }}
        point={selectedCompliancePoint}
      />

      <ModuleTour
        tourKey={centroControlTour.key}
        steps={centroControlTour.steps}
        requiresPoint={centroControlTour.requiresPoint}
        hasPoint={true}
        autoStart={true}
        delay={1000}
        ready={!!data}
      />
    </>
  );
};

export default React.memo(ControlCenter);
