import React, { useCallback, useState, useMemo, useRef, useEffect } from "react";
import "./ControlCenter.css";
import { useData } from "../../contexts/DataContext";
import { useControlCenter } from "./hooks/useControlCenter";
import { useControlCenterStore } from "./stores/controlCenterStore";
import orchestrator from "../../api/orchestrator";
import { useLocation, useNavigate } from "react-router-dom";
import { Flex, Typography, Form, theme, Drawer, message, Button } from "antd";
import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import ControlCenterLayout from "./ControlCenterLayout";
import TelemetryTab from "./TelemetryTab";
import ComplianceTab from "./ComplianceTab";
import CCSupportDrawer from "./CCSupportDrawer";
import PointConfigDrawer from "./PointConfigDrawer";
import CCFlowAnalysisDrawer from "./CCFlowAnalysisDrawer";
import CCComplianceDetailDrawer from "./CCComplianceDetailDrawer";
import SkeletonTelemetry from "./SkeletonTelemetry";
import SkeletonCompliance from "./SkeletonCompliance";
import WarningsDrawer from "./WarningsDrawer";
import VoucherModal from "./VoucherModal";
import StopTelemetryDrawer from "./StopTelemetryDrawer";
import StopComplianceDrawer from "./StopComplianceDrawer";
import { MeasurementsDrawerHeader, MeasurementsDrawerLoading } from "./MeasurementsDrawer";
import ModuleTour from "./ModuleTour";
import { centroControlTour } from "../../config/tours";
import { format, parseISO, subDays, addDays } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { MeasurementsDrawerContentMemo } from "./measurements/MeasurementDrawer";
import { extractRecordNum } from "./measurements/MeasurementUtils";

const { Text, Title } = Typography;
const { useToken } = theme;

const ControlCenter = () => {
  const { dispatch } = useData();
  const { user } = useAuth();
  const { data, loading, error, refresh, isReady, chatQuota } = useControlCenter({
    autoRefresh: true,
    refreshInterval: 60000,
  });
  const { token } = useToken();
  const location = useLocation();
  const navigate = useNavigate();

  // ── Tab activa desde URL ──
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/compliance")) return "compliance";
    return "telemetry";
  }, [location.pathname]);

  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;
    navigate(tab === "compliance" ? "/control-center/compliance" : "/control-center/telemetry");
  }, [activeTab, navigate]);

  // ── Zustand Store ──
  const store = useControlCenterStore();
  const selectedDate = store.selectedDate;
  const setSelectedDate = store.setSelectedDate;
  const warningsDrawerOpen = store.warningsDrawerOpen;
  const setWarningsDrawerOpen = store.setWarningsDrawerOpen;
  const selectedWarningPoint = store.selectedWarningPoint;
  const setSelectedWarningPoint = store.setSelectedWarningPoint;
  const voucherModalOpen = store.voucherModalOpen;
  const setVoucherModalOpen = store.setVoucherModalOpen;
  const measurementsDrawerOpen = store.measurementsDrawerOpen;
  const setMeasurementsDrawerOpen = store.setMeasurementsDrawerOpen;
  const flowAnalysisDrawerOpen = store.flowAnalysisDrawerOpen;
  const setFlowAnalysisDrawerOpen = store.setFlowAnalysisDrawerOpen;
  const complianceDetailDrawerOpen = store.complianceDetailDrawerOpen;
  const setComplianceDetailDrawerOpen = store.setComplianceDetailDrawerOpen;
  const pointConfigOpen = store.pointConfigDrawerOpen;
  const setPointConfigOpen = store.setPointConfigDrawerOpen;
  const stopTelemetryOpen = store.stopTelemetryModalOpen;
  const setStopTelemetryOpen = store.setStopTelemetryModalOpen;
  const stopComplianceOpen = store.stopComplianceModalOpen;
  const setStopComplianceOpen = store.setStopComplianceModalOpen;
  const supportOpen = store.supportModalOpen;
  const setSupportOpen = store.setSupportModalOpen;

  // Sync URL tab with store
  useEffect(() => {
    store.setActiveTab(activeTab);
  }, [activeTab]);

  // Ref para estabilizar callbacks sin depender de data?.points
  const pointsRef = useRef(data?.points || []);
  const last7Ref = useRef(data?.last_7 || {});
  
  useEffect(() => {
    pointsRef.current = data?.points || [];
  }, [data?.points]);
  
  useEffect(() => {
    last7Ref.current = data?.last_7 || {};
  }, [data?.last_7]);
  const [wellConfig, setWellConfig] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCopied, setVoucherCopied] = useState(false);

  // ── Verificación DGA ──
  const [dgaVerifying, setDgaVerifying] = useState(false);
  const [dgaResult, setDgaResult] = useState(null);
  const [dgaConsole, setDgaConsole] = useState([]);

  // ── Drawer de Mediciones ──
  const [selectedMeasurementPoint, setSelectedMeasurementPoint] = useState(null);
  const [measurementsData, setMeasurementsData] = useState(null);
  const [measurementsLoading, setMeasurementsLoading] = useState(false);
  const [measurementsViewMode, setMeasurementsViewMode] = useState("chart");
  const [measurementsTab, setMeasurementsTab] = useState("1");

  // ─ Drawer de Análisis de Caudal ─
  const [selectedFlowPoint, setSelectedFlowPoint] = useState(null);
  const [flowAnalysisData, setFlowAnalysisData] = useState(null);
  const [flowAnalysisLoading, setFlowAnalysisLoading] = useState(false);
  
  // ── Drawer de Detalle de Cumplimiento ──
  const [selectedCompliancePoint, setSelectedCompliancePoint] = useState(null);
  // ── Consumo total del día (para mostrar en header del drawer) ──
  const totalDayConsumo = useMemo(() => {
    const records = Array.isArray(measurementsData?.results) ? measurementsData.results 
      : Array.isArray(measurementsData?.records) ? measurementsData.records
      : Array.isArray(measurementsData?.measurements) ? measurementsData.measurements
      : Array.isArray(measurementsData?.data) ? measurementsData.data
      : [];
    return records.reduce((sum, m) => sum + (extractRecordNum(m.total_diff) || 0), 0);
  }, [measurementsData]);

  // ── Drawer Detener Telemetría ──
  const [stopTelemetryLoading, setStopTelemetryLoading] = useState(false);
  const [stopTelemetryPoint, setStopTelemetryPoint] = useState(null);
  const [stopTelemetryForm] = Form.useForm();

  // ── Drawer Detener Cumplimiento ──
  const [stopComplianceLoading, setStopComplianceLoading] = useState(false);
  const [stopCompliancePoint, setStopCompliancePoint] = useState(null);
  const [stopComplianceForm] = Form.useForm();

  // ── Drawer Solicitar Soporte ──
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportPoint, setSupportPoint] = useState(null);
  const [supportContextType, setSupportContextType] = useState("SOPORTE");
  const [supportForm] = Form.useForm();

  // ── Drawer Configuración del Punto ──
  const [pointConfigLoading, setPointConfigLoading] = useState(false);
  const [pointConfigData, setPointConfigData] = useState(null);
  const [pointConfigName, setPointConfigName] = useState("");

  // ── Watch fechas para alerta DGA (hooks siempre antes de returns condicionales) ──
  const compStart = Form.useWatch("start_date", stopComplianceForm);
  const compEnd = Form.useWatch("end_date", stopComplianceForm);
  const compDiffDays = compStart && compEnd ? compEnd.diff(compStart, "days") : 0;

  const handleViewVoucher = useCallback((record) => {
    setSelectedVoucher(record);
    setDgaResult(null);
    setDgaConsole([]);
    setVoucherModalOpen(true);
  }, []);

  const handleVerifyDGA = useCallback(async () => {
    if (!selectedVoucher?.code || !selectedVoucher?.voucher) return;
    setDgaVerifying(true);
    setDgaConsole([]);
    
    // Debug: ver token
    const rawToken = localStorage.getItem("token");
    const token = JSON.parse(rawToken || "null");
    setDgaConsole(prev => [...prev, `> Token existe: ${!!token}`]);
    setDgaConsole(prev => [...prev, `> Token (primeros 20 chars): ${token ? token.substring(0, 20) + '...' : 'NO HAY'}`]);
    setDgaConsole(prev => [...prev, `> Código obra: ${selectedVoucher.code}`]);
    setDgaConsole(prev => [...prev, `> Comprobante: ${selectedVoucher.voucher}`]);
    setDgaConsole(prev => [...prev, `> Tipo DGA: ${selectedVoucher.type_dga || 'SUPERFICIAL'}`]);
    setDgaConsole(prev => [...prev, `> Consultando DGA...`]);
    setDgaConsole(prev => [...prev, `> Código obra: ${selectedVoucher.code}`]);
    setDgaConsole(prev => [...prev, `> Comprobante: ${selectedVoucher.voucher}`]);
    try {
      const data = await orchestrator.verifyDgaVoucher(
        selectedVoucher.code,
        selectedVoucher.voucher,
        selectedVoucher.type_dga || 'SUPERFICIAL'
      );
      setDgaResult(data);
      setDgaConsole(prev => [...prev, `> Status: ${data.status || 'unknown'}`]);
      setDgaConsole(prev => [...prev, `> Respuesta:`]);
      setDgaConsole(prev => [...prev, JSON.stringify(data, null, 2)]);
    } catch (err) {
      console.error("[DGA Verify] Error:", err);
      if (err.response) {
        setDgaConsole(prev => [...prev, `> Status: ${err.response.status}`]);
        setDgaConsole(prev => [...prev, `> Respuesta error:`]);
        setDgaConsole(prev => [...prev, JSON.stringify(err.response.data, null, 2)]);
      } else {
        setDgaConsole(prev => [...prev, `> ERROR: ${err.message}`]);
      }
    } finally {
      setDgaVerifying(false);
    }
  }, [selectedVoucher]);

  const handleViewMeasurements = useCallback(async (pointName, date, variables = []) => {
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    const pointCfg = last7Ref.current?.[pointName] || null;
    setSelectedMeasurementPoint({ pointName, date, pointId: point.id, variables });
    setWellConfig(pointCfg?.d1 != null ? pointCfg : null);
    setMeasurementsDrawerOpen(true);
    setMeasurementsLoading(true);
    setMeasurementsData(null);
    try {
      const [recordsRes, configRes] = await Promise.all([
        orchestrator.pointRecords(point.id, date, date, 100),
        !pointCfg?.d1 ? orchestrator.pointConfig(point.id) : Promise.resolve(null)
      ]);
      setMeasurementsData(recordsRes);
      if (configRes && configRes.d1 != null) setWellConfig(configRes);
      message.success("Mediciones cargadas exitosamente");
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
      .then(res => {
        setMeasurementsData(res);
        message.success("Fecha navegada exitosamente");
      })
      .catch(err => {
        console.error("[Measurements] Error:", err);
        message.error("Error navegando fecha");
      })
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
    const pointVars = last7Ref.current?.[newPoint.title]?.variables || [];
    const pointCfg = last7Ref.current?.[newPoint.title] || null;
    setSelectedMeasurementPoint({ pointName: newPoint.title, date, pointId: newPoint.id, variables: pointVars });
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
        message.success("Punto navegado exitosamente");
      })
      .catch(err => {
        console.error("[Measurements] Error:", err);
        message.error("Error cambiando punto");
      })
      .finally(() => setMeasurementsLoading(false));
  }, [selectedMeasurementPoint]);

  const handleNavigatePointTo = useCallback((point) => {
    if (!point) return;
    const date = selectedMeasurementPoint?.date || format(new Date(), 'yyyy-MM-dd');
    const pointVars = last7Ref.current?.[point.title]?.variables || [];
    const pointCfg = last7Ref.current?.[point.title] || null;
    setSelectedMeasurementPoint({ pointName: point.title, date, pointId: point.id, variables: pointVars });
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
        message.success("Punto cargado exitosamente");
      })
      .catch(err => {
        console.error("[Measurements] Error:", err);
        message.error("Error cargando punto");
      })
      .finally(() => setMeasurementsLoading(false));
  }, [selectedMeasurementPoint]);

  // ─ Análisis de Caudal vs Límite ──
  const handleViewFlowAnalysis = useCallback((pointName, authorizedFlow, measurements) => {
    console.log("[FlowAnalysis] Abriendo drawer:", pointName, authorizedFlow, measurements.length, "mediciones");
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    
    setSelectedFlowPoint({ pointName, authorizedFlow, pointId: point.id, measurements });
    setFlowAnalysisDrawerOpen(true);
    setFlowAnalysisLoading(false); // Datos ya vienen listos, no hay loading
    setFlowAnalysisData(measurements);
  }, []);
  
  // ─ Detalle de Cumplimiento ──
  const handleViewComplianceDetail = useCallback((point, section = "detail") => {
    console.log("[ComplianceDetail] Abriendo drawer:", point.title, section);
    setSelectedCompliancePoint(point);
    setComplianceDetailDrawerOpen(true);
  }, []);

  const handleNavigateFlowDate = useCallback((direction) => {
    if (!selectedFlowPoint?.date) return;
    const today = format(new Date(), 'yyyy-MM-DD');
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-DD');
    const newDate = format(addDays(parseISO(selectedFlowPoint.date), direction), 'yyyy-MM-DD');
    
    if (newDate > today || newDate < sevenDaysAgo) return;
    
    const point = pointsRef.current?.find((p) => p.title === selectedFlowPoint.pointName);
    if (!point) return;
    setSelectedFlowPoint({ ...selectedFlowPoint, date: newDate });
    setFlowAnalysisLoading(true);
    setFlowAnalysisData(null);
    orchestrator.pointRecords(point.id, newDate, newDate, 100)
      .then(res => {
        const allRecords = Array.isArray(res?.results) ? res.results 
          : Array.isArray(res?.records) ? res.records
          : Array.isArray(res?.measurements) ? res.measurements
          : Array.isArray(res?.data) ? res.data
          : [];
        setFlowAnalysisData(allRecords);
        message.success("Datos de caudal cargados exitosamente");
      })
      .catch(err => {
        console.error("[FlowAnalysis] Error:", err);
        message.error("Error cargando datos de caudal");
      })
      .finally(() => setFlowAnalysisLoading(false));
  }, [selectedFlowPoint]);

  const handleViewPointConfig = useCallback(async (pointName) => {
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    setPointConfigName(pointName);
    setPointConfigOpen(true);
    setPointConfigLoading(true);
    setPointConfigData(null);
    try {
      const res = await orchestrator.pointConfig(point.id);
      setPointConfigData(res);
      message.success("Configuracion cargada exitosamente");
    } catch (err) {
      console.error("[PointConfig] Error:", err);
      message.error("Error cargando configuración");
    } finally {
      setPointConfigLoading(false);
    }
  }, []);

  const handleSelectPoint = useCallback(
    (point) => {
      dispatch({
        type: "CHANGE_SELECTED_PROFILE",
        payload: { selected_profile: { ...point, key: point.id } },
      });
    },
    [dispatch]
  );

  /* ── Detener Telemetría ── */
  const handleOpenStopTelemetry = useCallback((pointName) => {
    const point = pointsRef.current?.find((p) => p.title === pointName);
    if (!point) return;
    setStopTelemetryPoint({ id: point.id, name: pointName, client: point.client_name || point.client || "—" });
    stopTelemetryForm.resetFields();
    setStopTelemetryOpen(true);
  }, [stopTelemetryForm]);

  const handleSubmitStopTelemetry = useCallback(async (values) => {
    if (!stopTelemetryPoint) return;
    setStopTelemetryLoading(true);
    try {
      const payload = {
        title: `Solicitud detener telemetría - ${stopTelemetryPoint.name}`,
        message: values.reason.trim(),
        point_catchment: stopTelemetryPoint.id,
        type_notification: "SUPPORT",
        type_alert: "SOPORTE",
        type_variable: "TODOS",
        priority: "medium",
        assigned_to: null,
        is_periodic: false,
        is_active: true,
        is_read: false,
        is_response: false,
        is_finish: false,
        is_wait: false,
        status_dga: "PENDING",
        status_sma: "PENDING",
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
        emails: user?.email ? [user.email] : [],
      };
      const res = await orchestrator.notifications.create(payload);
      message.success(`Ticket #${res.id} creado exitosamente`);
      stopTelemetryForm.resetFields();
      setStopTelemetryOpen(false);
      setStopTelemetryPoint(null);
    } catch (err) {
      console.error("[StopTelemetry] Error:", err);
      message.error("Error al crear el ticket");
    } finally {
      setStopTelemetryLoading(false);
    }
  }, [stopTelemetryPoint, stopTelemetryForm, user?.email]);

  /* ── Detener Cumplimiento ── */
  const handleOpenStopCompliance = useCallback((record) => {
    setStopCompliancePoint({ id: record.id, name: record.title || record.name || "—", code: record.code || "—", client: record.client_name || record.client || "—" });
    stopComplianceForm.resetFields();
    setStopComplianceOpen(true);
  }, [stopComplianceForm]);

  const handleSubmitStopCompliance = useCallback(async (values) => {
    if (!stopCompliancePoint) return;
    setStopComplianceLoading(true);
    try {
      const payload = {
        title: `Solicitud detener cumplimiento - ${stopCompliancePoint.name}`,
        message: values.reason.trim(),
        point_catchment: stopCompliancePoint.id,
        type_notification: "SUPPORT",
        type_alert: "SOPORTE",
        type_variable: "TODOS",
        priority: "medium",
        assigned_to: null,
        is_periodic: false,
        is_active: true,
        is_read: false,
        is_response: false,
        is_finish: false,
        is_wait: false,
        status_dga: "PENDING",
        status_sma: "PENDING",
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
        emails: user?.email ? [user.email] : [],
      };
      const res = await orchestrator.notifications.create(payload);
      message.success(`Ticket #${res.id} creado exitosamente`);
      stopComplianceForm.resetFields();
      setStopComplianceOpen(false);
      setStopCompliancePoint(null);
    } catch (err) {
      console.error("[StopCompliance] Error:", err);
      message.error("Error al crear el ticket");
    } finally {
      setStopComplianceLoading(false);
    }
  }, [stopCompliancePoint, stopComplianceForm, user?.email]);

  /* ── Solicitar Soporte ── */
  const handleOpenSupport = useCallback((pointNameOrRecord, contextType = "SOPORTE") => {
    let point;
    if (typeof pointNameOrRecord === "string") {
      point = pointsRef.current?.find((p) => p.title === pointNameOrRecord);
      // Si no se encuentra (punto desactivado), crear objeto mínimo
      if (!point) {
        point = { id: null, title: pointNameOrRecord, name: pointNameOrRecord, code: null, client_name: null, client: null };
      }
    } else {
      point = pointNameOrRecord;
    }
    if (!point) return;
    setSupportPoint({ id: point.id, name: point.title || point.name || "—", code: point.code || null, client: point.client_name || point.client || "—" });
    setSupportContextType(contextType);
    supportForm.resetFields();
    setSupportOpen(true);
  }, [supportForm]);

  const overview = data?.overview || {};
  const points = data?.points || [];
  const warningsList = data?.recent_warnings_list || [];
  const warningsRaw = data?.recent_warnings || {};

  if (loading && !isReady) {
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
        {activeTab === 'telemetry' ? <SkeletonTelemetry /> : <SkeletonCompliance />}
      </ControlCenterLayout>
    );
  }

  if (error && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }} vertical gap={16}>
        <ExclamationCircleOutlined style={{ fontSize: 48, color: token.colorError }} />
        <Title level={4} style={{ color: token.colorTextSecondary }}>No se pudieron cargar los datos</Title>
        <Text style={{ color: token.colorTextDisabled }}>{error.message}</Text>
        <Button type="primary" onClick={refresh} icon={<ReloadOutlined />}>Reintentar</Button>
      </Flex>
    );
  }

  const showDgaAlert = stopCompliancePoint?.code && stopCompliancePoint?.code !== "—" && compDiffDays > 5;
  const showDgaCriticalAlert = stopCompliancePoint?.code && stopCompliancePoint?.code !== "—" && compDiffDays > 10;

  return (
    <>
      <ControlCenterLayout
        overview={overview}
        points={points}
        warningsList={warningsList}
        warningsRaw={warningsRaw}
        chatQuota={chatQuota}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onWarningClick={(pointName) => {
          setSelectedWarningPoint(pointName);
          setWarningsDrawerOpen(true);
        }}
      >
        <div className="tab-transition" key={`tab-${activeTab}`}>
          {activeTab === 'telemetry' ? (
            <TelemetryTab
              last7={data?.last_7}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              handleViewMeasurements={handleViewMeasurements}
              handleOpenStopTelemetry={handleOpenStopTelemetry}
              handleOpenSupport={handleOpenSupport}
              handleWarningPointClick={(pointName) => {
                setSelectedWarningPoint(pointName);
                setWarningsDrawerOpen(true);
              }}
              warningsRaw={warningsRaw}
              handleViewPointConfig={handleViewPointConfig}
              loading={loading}
            />
          ) : (
            <ComplianceTab
              points={points}
              last7={data?.last_7}
              handleViewVoucher={handleViewVoucher}
              handleOpenStopCompliance={handleOpenStopCompliance}
              handleOpenSupport={handleOpenSupport}
              handleViewPointConfig={handleViewPointConfig}
              handleViewFlowAnalysis={handleViewFlowAnalysis}
              handleViewComplianceDetail={handleViewComplianceDetail}
              loading={loading}
            />
          )}
        </div>
      </ControlCenterLayout>

      <WarningsDrawer
        open={warningsDrawerOpen}
        onClose={() => {
          setWarningsDrawerOpen(false);
          setSelectedWarningPoint(null);
        }}
        warningsList={warningsList}
        warningsRaw={warningsRaw}
        selectedWarningPoint={selectedWarningPoint}
        setSelectedWarningPoint={setSelectedWarningPoint}
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
        open={measurementsDrawerOpen}
        onClose={() => {
          setMeasurementsDrawerOpen(false);
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
        open={voucherModalOpen}
        onCancel={() => {
          setVoucherModalOpen(false);
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

      {/* ════════════════════════════════════════
          Drawer Configuración del Punto
      ════════════════════════════════════════ */}
      <PointConfigDrawer
        open={pointConfigOpen}
        onClose={() => {
          setPointConfigOpen(false);
          setPointConfigData(null);
        }}
        pointName={pointConfigName}
        configData={pointConfigData}
        loading={pointConfigLoading}
      />

      <StopTelemetryDrawer
        open={stopTelemetryOpen}
        onClose={() => {
          setStopTelemetryOpen(false);
          setStopTelemetryPoint(null);
          stopTelemetryForm.resetFields();
        }}
        point={stopTelemetryPoint}
        form={stopTelemetryForm}
        loading={stopTelemetryLoading}
        onSubmit={handleSubmitStopTelemetry}
      />

      <StopComplianceDrawer
        open={stopComplianceOpen}
        onClose={() => {
          setStopComplianceOpen(false);
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

      {/* ════════════════════════════════════════
          Drawer Solicitar Soporte
      ════════════════════════════════════════ */}
      <CCSupportDrawer
        open={supportOpen}
        onClose={() => {
          setSupportOpen(false);
          setSupportPoint(null);
          setSupportContextType("SOPORTE");
        }}
        point={supportPoint}
        form={supportForm}
        loading={supportLoading}
        setLoading={setSupportLoading}
        contextType={supportContextType}
      />

      {/* ════════════════════════════════════════
          Drawer Análisis de Caudal vs Límite
      ════════════════════════════════════════ */}
      <CCFlowAnalysisDrawer
        open={flowAnalysisDrawerOpen}
        onClose={() => {
          setFlowAnalysisDrawerOpen(false);
          setSelectedFlowPoint(null);
          setFlowAnalysisData(null);
        }}
        pointName={selectedFlowPoint?.pointName}
        authorizedFlow={selectedFlowPoint?.authorizedFlow}
        data={selectedFlowPoint?.measurements || []}
      />
      
      {/* ════════════════════════════════════════
          Drawer Detalle de Cumplimiento
      ════════════════════════════════════════ */}
      <CCComplianceDetailDrawer
        open={complianceDetailDrawerOpen}
        onClose={() => {
          setComplianceDetailDrawerOpen(false);
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

export default React.memo(ControlCenter);
