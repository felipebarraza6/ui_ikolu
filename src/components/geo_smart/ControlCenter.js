import React, { useCallback, useState, useMemo, useRef, useEffect } from "react";
import "./ControlCenter.css";
import { useData } from "../../contexts/DataContext";
import { useControlCenter } from "../../hooks/useControlCenter";
import { useControlCenterStore } from "../../features/geo-smart/stores/controlCenterStore";
import sh from "../../api/sh/endpoints";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Card, Flex, Typography, Spin, Table, Tag, theme, Drawer, Modal, Button, Input, Space, Segmented, Form, message, DatePicker, Alert, Tabs, Select, Tooltip } from "antd";
import {
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaCopy,
  FaSun,
  FaMoon,
  FaChartLine,
  FaTable,
  FaHandPaper,
  FaPauseCircle,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
  FaDownload,
} from "react-icons/fa";


import ControlCenterLayout from "./ControlCenterLayout";
import CCSupportDrawer from "./CCSupportDrawer";
import PointConfigDrawer from "./PointConfigDrawer";
import CCFlowAnalysisDrawer from "./CCFlowAnalysisDrawer";
import CCComplianceDetailDrawer from "./CCComplianceDetailDrawer";
import SkeletonControlCenter from "./SkeletonControlCenter";
import ModuleTour from "../common/ModuleTour";
import { centroControlTour } from "../../config/tours";
import { smarthydro } from "../../theme/smarthydro.tokens";
import moment from "moment";
import { useAuth } from "../../contexts/AuthContext";
import { MeasurementsDrawerContentMemo } from "./measurements/MeasurementDrawer";
import { extractRecordNum } from "./measurements/MeasurementUtils";

const { Text } = Typography;
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
    navigate(tab === "compliance" ? "/control_center/compliance" : "/control_center/telemetry");
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
  const [stopTelemetryOpen, setStopTelemetryOpen] = useState(false);
  const [stopTelemetryLoading, setStopTelemetryLoading] = useState(false);
  const [stopTelemetryPoint, setStopTelemetryPoint] = useState(null);
  const [stopTelemetryForm] = Form.useForm();

  // ── Drawer Detener Cumplimiento ──
  const [stopComplianceOpen, setStopComplianceOpen] = useState(false);
  const [stopComplianceLoading, setStopComplianceLoading] = useState(false);
  const [stopCompliancePoint, setStopCompliancePoint] = useState(null);
  const [stopComplianceForm] = Form.useForm();

  // ── Drawer Solicitar Soporte ──
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportPoint, setSupportPoint] = useState(null);
  const [supportContextType, setSupportContextType] = useState("SOPORTE");
  const [supportForm] = Form.useForm();

  // ── Drawer Configuración del Punto ──
  const [pointConfigOpen, setPointConfigOpen] = useState(false);
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
      const data = await sh.verifyDgaVoucher(
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
        sh.pointRecords(point.id, date, date, 100),
        !pointCfg?.d1 ? sh.pointConfig(point.id) : Promise.resolve(null)
      ]);
      setMeasurementsData(recordsRes);
      if (configRes && configRes.d1 != null) setWellConfig(configRes);
    } catch (err) {
      console.error("[Measurements] Error:", err);
      message.error("Error cargando mediciones");
    } finally {
      setMeasurementsLoading(false);
    }
  }, []); // Sin dependencias gracias a pointsRef

  const handleNavigateDate = useCallback((direction) => {
    if (!selectedMeasurementPoint?.date) return;
    const today = moment().format('YYYY-MM-DD');
    const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const newDate = moment(selectedMeasurementPoint.date).add(direction, 'days').format('YYYY-MM-DD');
    
    if (newDate > today || newDate < sevenDaysAgo) return;
    
    const point = pointsRef.current?.find((p) => p.title === selectedMeasurementPoint.pointName);
    if (!point) return;
    setSelectedMeasurementPoint({ pointName: selectedMeasurementPoint.pointName, date: newDate, pointId: point.id, variables: selectedMeasurementPoint.variables || [] });
    setMeasurementsLoading(true);
    setMeasurementsData(null);
    sh.pointRecords(point.id, newDate, newDate, 100)
      .then(res => setMeasurementsData(res))
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
      sh.pointRecords(newPoint.id, date, date, 100),
      !pointCfg?.d1 ? sh.pointConfig(newPoint.id) : Promise.resolve(null)
    ])
      .then(([recordsRes, configRes]) => {
        setMeasurementsData(recordsRes);
        if (configRes && configRes.d1 != null) setWellConfig(configRes);
      })
      .catch(err => {
        console.error("[Measurements] Error:", err);
        message.error("Error cambiando punto");
      })
      .finally(() => setMeasurementsLoading(false));
  }, [selectedMeasurementPoint]);

  const handleNavigatePointTo = useCallback((point) => {
    if (!point) return;
    const date = selectedMeasurementPoint?.date || moment().format('YYYY-MM-DD');
    const pointVars = last7Ref.current?.[point.title]?.variables || [];
    const pointCfg = last7Ref.current?.[point.title] || null;
    setSelectedMeasurementPoint({ pointName: point.title, date, pointId: point.id, variables: pointVars });
    setWellConfig(pointCfg?.d1 != null ? pointCfg : null);
    setMeasurementsLoading(true);
    setMeasurementsData(null);
    Promise.all([
      sh.pointRecords(point.id, date, date, 100),
      !pointCfg?.d1 ? sh.pointConfig(point.id) : Promise.resolve(null)
    ])
      .then(([recordsRes, configRes]) => {
        setMeasurementsData(recordsRes);
        if (configRes && configRes.d1 != null) setWellConfig(configRes);
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
    const today = moment().format('YYYY-MM-DD');
    const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const newDate = moment(selectedFlowPoint.date).add(direction, 'days').format('YYYY-MM-DD');
    
    if (newDate > today || newDate < sevenDaysAgo) return;
    
    const point = pointsRef.current?.find((p) => p.title === selectedFlowPoint.pointName);
    if (!point) return;
    setSelectedFlowPoint({ ...selectedFlowPoint, date: newDate });
    setFlowAnalysisLoading(true);
    setFlowAnalysisData(null);
    sh.pointRecords(point.id, newDate, newDate, 100)
      .then(res => {
        const allRecords = Array.isArray(res?.results) ? res.results 
          : Array.isArray(res?.records) ? res.records
          : Array.isArray(res?.measurements) ? res.measurements
          : Array.isArray(res?.data) ? res.data
          : [];
        setFlowAnalysisData(allRecords);
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
      const res = await sh.pointConfig(point.id);
      setPointConfigData(res);
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
      const res = await sh.notifications.create(payload);
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
      const res = await sh.notifications.create(payload);
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
      <div style={{ padding: "0 16px" }}>
        <SkeletonControlCenter />
      </div>
    );
  }

  if (error && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }} vertical gap={16}>
        <Text type="danger" strong style={{ fontSize: token.fontSizeLG }}>
          Error cargando el Centro de Control
        </Text>
        <Text type="secondary">{error.message}</Text>
        <button onClick={refresh} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Reintentar
        </button>
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
        <Outlet
          context={{
            last7: data?.last_7,
            selectedDate,
            setSelectedDate,
            handleViewMeasurements,
            handleOpenStopTelemetry,
            handleOpenSupport,
            handleWarningPointClick: (pointName) => {
              setSelectedWarningPoint(pointName);
              setWarningsDrawerOpen(true);
            },
            warningsRaw,
            points,
            handleViewVoucher,
            handleOpenStopCompliance,
            handleViewPointConfig,
            handleViewFlowAnalysis,
            handleViewComplianceDetail,
            loading,
          }}
        />
      </ControlCenterLayout>

      {/* ════════════════════════════════════════
          Drawer de Warnings
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <FaExclamationTriangle style={{ color: token.colorWarning, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>Warnings</Text>
            <Tag color="warning" style={{ margin: 0 }}>
              {warningsList.length} total
            </Tag>
          </Flex>
        }
        placement="right"
        onClose={() => {
          setWarningsDrawerOpen(false);
          setSelectedWarningPoint(null);
        }}
        open={warningsDrawerOpen}
        width={{ xs: "100%", sm: "100%", md: 640 }}
        styles={{ body: { padding: 16 } }}
      >
        <Flex wrap="wrap" gap={8} style={{ marginBottom: 16 }}>
          {Object.entries(warningsRaw).map(([pointName, warnings]) => {
            const arr = Array.isArray(warnings) ? warnings : [];
            if (arr.length === 0) return null;
            const isActive = selectedWarningPoint === pointName;
            return (
              <Tag
                key={pointName}
                color={isActive ? "warning" : "default"}
                style={{ cursor: "pointer", fontSize: 12, padding: "4px 10px", margin: 0 }}
                onClick={() => setSelectedWarningPoint(pointName)}
              >
                {pointName} ({arr.length})
              </Tag>
            );
          })}
        </Flex>
        {selectedWarningPoint && (
          <Table
            dataSource={(warningsRaw[selectedWarningPoint] || []).map((w, i) => ({ ...w, key: i }))}
            size="small"
            pagination={{ pageSize: 10, size: "small" }}
            locale={{ emptyText: "Sin warnings para este punto" }}
            columns={[
              {
                title: "Fecha",
                dataIndex: "time",
                key: "time",
                width: 110,
                render: (time) => (
                  <Text style={{ fontSize: 11, color: token.colorTextSecondary, whiteSpace: "nowrap" }}>
                    {time ? moment(time).format("DD/MM HH:mm") : "—"}
                  </Text>
                ),
              },
              {
                title: "Tipo",
                dataIndex: "type",
                key: "type",
                width: 80,
                render: (type) => <Tag style={{ fontSize: 10, margin: 0 }}>{type}</Tag>,
              },
              {
                title: "Severidad",
                dataIndex: "severity",
                key: "severity",
                width: 90,
                render: (sev) => {
                  const color = sev === "ERROR" ? "red" : sev === "WARNING" ? "orange" : "blue";
                  return <Tag color={color} style={{ fontSize: 10, margin: 0 }}>{sev}</Tag>;
                },
              },
              {
                title: "Mensaje",
                dataIndex: "message",
                key: "message",
                render: (msg) => (
                  <Text style={{ fontSize: 12, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
                    {msg}
                  </Text>
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* ════════════════════════════════════════
          Drawer de Mediciones por punto
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <div style={{ width: "100%" }}>
            {/* Fila única: punto + fecha/tabs + toggle */}
            <Flex align="center" justify="space-between" gap={16}>
              {/* Selector de punto */}
              <Select
                showSearch
                value={selectedMeasurementPoint?.pointId}
                onChange={(val) => {
                  const point = pointsRef.current?.find(p => p.id === val);
                  if (!point) return;
                  handleNavigatePointTo(point);
                }}
                style={{ minWidth: 280, maxWidth: 400 }}
                placeholder="Seleccionar punto"
                optionFilterProp="label"
                optionLabelProp="label"
                size="middle"
                popupMatchSelectWidth={false}
                getPopupContainer={() => document.body}
                listHeight={320}
                dropdownStyle={{ borderRadius: 10, boxShadow: token.boxShadowSecondary }}
                suffixIcon={<FaMapMarkerAlt size={12} style={{ color: token.colorPrimary }} />}
              >
                {pointsRef.current.map((p) => {
                  const pointData = last7Ref.current?.[p.title] || {};
                  const hasGPS = p.hasGPS || pointData.hasGPS;
                  const typeDGA = p.type_dga || pointData.type_dga || '—';
                  const codeDGA = p.code_dga || pointData.code_dga;
                  
                  return (
                    <Select.Option key={p.id} value={p.id} label={p.title || p.name || `Punto ${p.id}`}>
                      <Flex align="center" justify="space-between" style={{ width: '100%', padding: '4px 0' }}>
                        <Flex align="center" gap={10}>
                          <div style={{ 
                            width: 28, 
                            height: 28, 
                            borderRadius: 6, 
                            background: `${token.colorPrimary}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FaMapMarkerAlt size={12} style={{ color: token.colorPrimary }} />
                          </div>
                          <Flex vertical>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{p.title || p.name || `Punto ${p.id}`}</span>
                            {codeDGA && (
                              <span style={{ fontSize: 11, color: token.colorTextSecondary }}>{codeDGA}</span>
                            )}
                          </Flex>
                        </Flex>
                        <Flex gap={6}>
                          {hasGPS && (
                            <Tag size="small" style={{ fontSize: 10, margin: 0, background: '#e6f7ff', color: '#1890ff', border: 'none' }}>
                              GPS
                            </Tag>
                          )}
                          <Tag size="small" style={{ fontSize: 10, margin: 0, background: typeDGA === 'SUBTERRANEO' ? '#f6ffed' : '#fff7e6', color: typeDGA === 'SUBTERRANEO' ? '#52c41a' : '#fa8c16', border: 'none' }}>
                            {typeDGA === 'SUBTERRANEO' ? 'SUB' : typeDGA === 'SUPERFICIAL' ? 'SUP' : typeDGA}
                          </Tag>
                        </Flex>
                      </Flex>
                    </Select.Option>
                  );
                })}
              </Select>

              {/* Centro: navegación + tabs */}
              <Flex align="center" gap={16}>
                {/* Navegación entre fechas */}
                <Flex align="center" gap={8}>
                  {(() => {
                    const today = moment().format('YYYY-MM-DD');
                    const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
                    const currentDate = selectedMeasurementPoint?.date;
                    const canGoBack = currentDate > sevenDaysAgo;
                    const canGoForward = currentDate < today;
                    
                    return (
                      <>
                        <FaArrowLeft
                          size={12}
                          onClick={() => canGoBack && handleNavigateDate(-1)}
                          style={{
                            cursor: canGoBack ? 'pointer' : 'default',
                            opacity: canGoBack ? 0.8 : 0.2,
                            transition: 'opacity 0.2s',
                          }}
                        />
                        <Text style={{ fontSize: 12, fontWeight: 500 }}>
                          {selectedMeasurementPoint?.date ? moment(selectedMeasurementPoint.date).format("ddd D MMM YYYY") : ""}
                        </Text>
                        <FaArrowRight
                          size={12}
                          onClick={() => canGoForward && handleNavigateDate(1)}
                          style={{
                            cursor: canGoForward ? 'pointer' : 'default',
                            opacity: canGoForward ? 0.8 : 0.2,
                            transition: 'opacity 0.2s',
                          }}
                        />
                      </>
                    );
                  })()}
                </Flex>

                {/* Tabs (solo gráfico) */}
                {measurementsViewMode === "chart" && (
                  <Tabs
                    activeKey={measurementsTab}
                    onChange={setMeasurementsTab}
                    size="small"
                    tabBarStyle={{ marginBottom: 0 }}
                    items={[
                      { key: "1", label: "Hidrometría" },
                      { key: "2", label: "Niveles" },
                    ]}
                  />
                )}
              </Flex>

              {/* Toggle vista */}
              <Segmented
                value={measurementsViewMode}
                onChange={setMeasurementsViewMode}
                options={[
                  { label: <Flex align="center" gap={4}><FaChartLine size={12} />Gráfico</Flex>, value: "chart" },
                  { label: <Flex align="center" gap={4}><FaTable size={12} />Datos</Flex>, value: "table" },
                ]}
                size="small"
              />
            </Flex>
          </div>
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
          <Flex vertical gap={16} style={{ padding: "10px 0" }}>
            <Row gutter={[16, 16]}>
              {[1, 2].map(i => (
                <Col xs={24} md={12} key={i}>
                  <div style={{ borderRadius: 12, border: `1px solid ${token.colorBorderSecondary}`, overflow: "hidden" }}>
                    <div style={{ height: 40, background: token.colorBgLayout }} />
                    <div style={{ height: 50, padding: "10px 16px", display: "flex", gap: 8, justifyContent: "center" }}>
                      {[1, 2, 3].map(j => <div key={j} style={{ flex: 1, height: 40, borderRadius: 6, background: "#f5f5f5" }} />)}
                    </div>
                    <div style={{ height: 220, padding: 16 }}>
                      <div style={{ height: "100%", borderRadius: 8, background: "#f5f5f5" }} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Flex>
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

      {/* ════════════════════════════════════════
          Modal de Voucher DGA
      ════════════════════════════════════════ */}
      <Modal
        title={
          <Flex align="center" gap={8} wrap="wrap">
            <FaClipboardCheck style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Text strong style={{ fontSize: 14 }}>{selectedVoucher?.title || "Voucher DGA"}</Text>
            <Tag style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
              {selectedVoucher?.code || "—"}
            </Tag>
            <Tag style={{ fontSize: 10, margin: 0, padding: "0 4px", lineHeight: "16px" }}>
              {selectedVoucher?.type_dga || "SUPERFICIAL"}
            </Tag>
          </Flex>
        }
        open={voucherModalOpen}
        onCancel={() => {
          setVoucherModalOpen(false);
          setSelectedVoucher(null);
          setDgaResult(null);
          setDgaConsole([]);
        }}
        footer={null}
        centered
        width="800px"
        styles={{ body: { paddingBottom: 24, display: 'flex', flexDirection: 'column' } }}
      >
        <Flex vertical gap={12} >
          {/* ── Voucher + Validar en dos columnas ── */}
          {selectedVoucher?.code && selectedVoucher?.voucher && (
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={16}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    value={selectedVoucher?.voucher || ""}
                    readOnly
                    style={{ fontSize: 13, fontFamily: "monospace" }}
                  />
                  <Button
                    type={voucherCopied ? "default" : "primary"}
                    icon={<FaCopy style={{ fontSize: 14 }} />}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(selectedVoucher?.voucher || "");
                        setVoucherCopied(true);
                        setTimeout(() => setVoucherCopied(false), 2000);
                      } catch (err) {
                        console.error("Error copiando voucher:", err);
                      }
                    }}
                  />
                </Space.Compact>
              </Col>
              <Col xs={24} md={8}>
                <Button
                  type="primary"
                  loading={dgaVerifying}
                  onClick={handleVerifyDGA}
                  icon={<FaSearch style={{ fontSize: 12 }} />}
                  style={{ width: "100%" }}
                >
                  {dgaVerifying ? "Validando..." : "Validar "}
                </Button>
              </Col>
            </Row>
          )}

          {/* ── Layout fijo dos columnas: Consola + Resultado ── */}
          <Row gutter={[16, 16]} style={{ minHeight: 500 }}>
            {/* ── Consola (izquierda) ── */}
            <Col xs={24} md={12} style={{ height: 400 }}>
              <div
                style={{
                  background: "#1e1e1e",
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#d4d4d4",
                  height: "500px",
                  overflowY: "auto",
                  lineHeight: 1.6,
                }}
              >
                {dgaConsole.length === 0 ? (
                  <Flex align="center" justify="center" style={{ height: "100%", color: "#6b7280" }}>
                    <Text style={{ color: "#6b7280", fontSize: 12 }}>Listo para validar...</Text>
                  </Flex>
                ) : (
                  dgaConsole.map((line, i) => (
                    <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                      {line.startsWith("> ERROR") ? (
                        <span style={{ color: "#f87171" }}>{line}</span>
                      ) : line.startsWith("> Status: 2") ? (
                        <span style={{ color: "#4ade80" }}>{line}</span>
                      ) : line.startsWith("> Status:") ? (
                        <span style={{ color: "#fbbf24" }}>{line}</span>
                      ) : (
                        line
                      )}
                    </div>
                  ))
                )}
                {dgaVerifying && (
                  <div style={{ color: "#60a5fa" }}>
                    {"▋"}
                  </div>
                )}
              </div>
            </Col>

            {/* ── Resultado (derecha) ── */}
            <Col xs={24} md={12} style={{ height: 500 }}>
              <Flex vertical gap={12} style={{ height: "100%" }}>
                {/* Estado vacío */}
                {!dgaResult && !dgaVerifying && (
                  <Flex vertical align="center" justify="center" style={{ height: "100%", textAlign: "center" }}>
                    <FaClipboardCheck style={{ fontSize: 32, color: token.colorTextDisabled, marginBottom: 12 }} />
                    <Text strong style={{ fontSize: 13, color: token.colorTextSecondary }}>
                      Sin validar
                    </Text>
                    <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginTop: 4 }}>
                      Haz clic en <Text strong>Validar comprobante</Text> para verificar
                    </Text>
                  </Flex>
                )}

                {/* Validando */}
                {dgaVerifying && !dgaResult && (
                  <Flex vertical align="center" justify="center" style={{ height: "100%", textAlign: "center" }}>
                    <Spin size="large" style={{ marginBottom: 12 }} />
                    <Text strong style={{ fontSize: 13, color: token.colorPrimary }}>
                      Consultando DGA...
                    </Text>
                  </Flex>
                )}

                {/* Éxito - status 00 */}
                {dgaResult && dgaResult.status === "00" && dgaResult.data && (
                  <Flex vertical style={{ height: "100%" }} justify="space-between">
                    <Flex vertical gap={12}>
                      {/* Datos principales - grid 2x2 */}
                      <Row gutter={[10, 10]}>
                        <Col span={12}>
                          <div style={{ background: token.colorBgLayout, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                            <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Caudal</Text>
                            <div><Text strong style={{ fontSize: 20, color: token.colorPrimary }}>{dgaResult.data.caudal}</Text> <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>L/s</Text></div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ background: token.colorBgLayout, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                            <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Totalizador</Text>
                            <div><Text strong style={{ fontSize: 20, color: token.colorPrimary }}>{dgaResult.data.totalizador}</Text> <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>m³</Text></div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ background: token.colorBgLayout, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                            <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Fecha</Text>
                            <div><Text strong style={{ fontSize: 15 }}>{dgaResult.data.fechaMedicion}</Text></div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ background: token.colorBgLayout, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                            <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Hora</Text>
                            <div><Text strong style={{ fontSize: 15 }}>{dgaResult.data.horaMedicion}</Text></div>
                          </div>
                        </Col>
                      </Row>

                      {/* Info punto - fila compacta */}
                      {dgaResult.meta && (
                        <Flex gap={8} wrap="wrap">
                          <div style={{ background: token.colorBgLayout, borderRadius: 6, padding: "8px 12px", flex: 1, minWidth: 120 }}>
                            <Text type="secondary" style={{ fontSize: 9, textTransform: "uppercase" }}>Punto</Text>
                            <div><Text style={{ fontSize: 12 }}>{dgaResult.meta.punto}</Text></div>
                          </div>
                          <div style={{ background: token.colorBgLayout, borderRadius: 6, padding: "8px 12px", flex: 1, minWidth: 120 }}>
                            <Text type="secondary" style={{ fontSize: 9, textTransform: "uppercase" }}>Código</Text>
                            <div><Text style={{ fontSize: 12, fontFamily: "monospace" }}>{dgaResult.meta.codigo_obra}</Text></div>
                          </div>
                          <div style={{ background: token.colorBgLayout, borderRadius: 6, padding: "8px 12px", flex: 1, minWidth: 100 }}>
                            <Text type="secondary" style={{ fontSize: 9, textTransform: "uppercase" }}>Tipo</Text>
                            <div><Text style={{ fontSize: 12 }}>{dgaResult.meta.tipo_dga}</Text></div>
                          </div>
                          <div style={{ background: dgaResult.meta.enviado_dga ? token.colorSuccessBg : token.colorErrorBg, borderRadius: 6, padding: "8px 12px", flex: 1, minWidth: 100 }}>
                            <Text type="secondary" style={{ fontSize: 9, textTransform: "uppercase" }}>Enviado</Text>
                            <div><Text style={{ fontSize: 12, color: dgaResult.meta.enviado_dga ? token.colorSuccess : token.colorError }}>{dgaResult.meta.enviado_dga ? "Sí" : "No"}</Text></div>
                          </div>
                        </Flex>
                      )}

                      {/* return_dga banner */}
                      {dgaResult.meta?.return_dga && (
                        <div style={{ background: token.colorSuccessBg, borderRadius: 6, padding: "8px 12px" }}>
                          <Text style={{ fontSize: 11, color: token.colorSuccess }}>{dgaResult.meta.return_dga}</Text>
                        </div>
                      )}
                    </Flex>

                    {/* Botón copiar */}
                    <Button
                      size="small"
                      block
                      icon={<FaCopy style={{ fontSize: 11 }} />}
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(dgaResult, null, 2));
                        message.success("Respuesta copiada");
                      }}
                    >
                      Copiar JSON
                    </Button>
                  </Flex>
                )}

                {/* No encontrado - status 01 */}
                {dgaResult && dgaResult.status === "01" && (
                  <Flex vertical align="center" justify="center" style={{ height: "100%", textAlign: "center" }}>
                    <FaExclamationTriangle style={{ fontSize: 32, color: "#faad14", marginBottom: 12 }} />
                    <Text strong style={{ fontSize: 13, color: token.colorTextSecondary }}>
                      Comprobante no encontrado
                    </Text>
                    <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginTop: 4 }}>
                      Verifica el código y número de comprobante
                    </Text>
                  </Flex>
                )}

                {/* Error de red */}
                {dgaResult && !dgaResult.status && (
                  <Flex vertical align="center" justify="center" style={{ height: "100%", textAlign: "center" }}>
                    <FaExclamationTriangle style={{ fontSize: 32, color: "#ff4d4f", marginBottom: 12 }} />
                    <Text strong style={{ fontSize: 13, color: token.colorTextSecondary }}>
                      Error de conexión
                    </Text>
                    <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginTop: 4 }}>
                      Revisa la consola para más detalles
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Col>
          </Row>
        </Flex>
      </Modal>

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

      {/* ════════════════════════════════════════
          Drawer Detener Telemetría
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <FaHandPaper style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>Solicitud para detener telemetría</Text>
          </Flex>
        }
        open={stopTelemetryOpen}
        onClose={() => {
          setStopTelemetryOpen(false);
          setStopTelemetryPoint(null);
          stopTelemetryForm.resetFields();
        }}
        width={420}
        bodyStyle={{ padding: 20 }}
        footer={
          <Flex justify="flex-end" gap={8}>
            <Button onClick={() => { setStopTelemetryOpen(false); setStopTelemetryPoint(null); stopTelemetryForm.resetFields(); }}>
              Cancelar
            </Button>
            <Button type="primary" loading={stopTelemetryLoading} onClick={() => stopTelemetryForm.submit()}>
              Enviar solicitud
            </Button>
          </Flex>
        }
      >
        {stopTelemetryPoint && (
          <Flex vertical style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 14 }}>{stopTelemetryPoint.name}</Text>
          </Flex>
        )}
        <Form form={stopTelemetryForm} layout="vertical" onFinish={handleSubmitStopTelemetry}>
          {/* Quién crea */}
          <Form.Item label="Solicitado por">
            <Input
              value={user ? `${user.first_name || user.username} (${user.email})` : "—"}
              readOnly
              style={{ borderRadius: 8, fontSize: 13, background: token.colorBgContainerDisabled }}
            />
          </Form.Item>
          {/* Fechas */}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Fecha inicio"
                rules={[{ required: true, message: "Selecciona fecha" }]}
              >
                <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Inicio" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Fecha fin"
                rules={[{ required: true, message: "Selecciona fecha" }]}
              >
                <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Fin" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="reason"
            label="Razón de la solicitud"
            rules={[{ required: true, message: "Ingresa la razón" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ej: Mantenimiento programado del sensor..."
              maxLength={500}
              showCount
              style={{ borderRadius: 8, fontSize: 13 }}
            />
          </Form.Item>
          <Form.Item hidden name="pointId" initialValue={stopTelemetryPoint?.id}>
            <Input />
          </Form.Item>
        </Form>
      </Drawer>

      {/* ════════════════════════════════════════
          Drawer Detener Cumplimiento
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <FaPauseCircle style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>Solicitud para detener cumplimiento</Text>
          </Flex>
        }
        open={stopComplianceOpen}
        onClose={() => {
          setStopComplianceOpen(false);
          setStopCompliancePoint(null);
          stopComplianceForm.resetFields();
        }}
        width={420}
        bodyStyle={{ padding: 20 }}
        footer={
          <Flex justify="flex-end" gap={8}>
            <Button onClick={() => { setStopComplianceOpen(false); setStopCompliancePoint(null); stopComplianceForm.resetFields(); }}>
              Cancelar
            </Button>
            <Button type="primary" loading={stopComplianceLoading} onClick={() => stopComplianceForm.submit()}>
              Enviar solicitud
            </Button>
          </Flex>
        }
      >
        {stopCompliancePoint && (
          <Flex vertical gap={12} style={{ marginBottom: 16 }}>
            <Card size="small" bodyStyle={{ padding: 10 }} style={{ background: `${token.colorPrimary}06`, border: `1px solid ${token.colorPrimary}15` }}>
              <Text strong style={{ fontSize: 13, display: "block" }}>{stopCompliancePoint.name}</Text>
              <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Código: {stopCompliancePoint.code}</Text>
            </Card>
          </Flex>
        )}
        <Form form={stopComplianceForm} layout="vertical" onFinish={handleSubmitStopCompliance}>
          {/* Quién crea */}
          <Form.Item label="Solicitado por">
            <Input
              value={user ? `${user.first_name || user.username} (${user.email})` : "—"}
              readOnly
              style={{ borderRadius: 8, fontSize: 13, background: token.colorBgContainerDisabled }}
            />
          </Form.Item>
          {/* Fechas */}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Fecha inicio"
                rules={[{ required: true, message: "Selecciona fecha" }]}
              >
                <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Inicio" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Fecha fin"
                rules={[{ required: true, message: "Selecciona fecha" }]}
              >
                <DatePicker style={{ width: "100%", borderRadius: 8 }} format="DD/MM/YYYY" placeholder="Fin" />
              </Form.Item>
            </Col>
          </Row>
          {showDgaAlert && !showDgaCriticalAlert && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12, fontSize: 12 }}
              message="Informe Técnico requerido"
              description={
                <Text style={{ fontSize: 12 }}>
                  La detención supera los 5 días. Se debe enviar el <strong>Informe Técnico</strong> (formato libre) que cumpla con los fundamentos principales y cuyo objetivo sea evidenciar las actividades realizadas en terreno.
                </Text>
              }
            />
          )}
          {showDgaCriticalAlert && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 12, fontSize: 12 }}
              message="Informe Detallado Obligatorio"
              description={
                <Text style={{ fontSize: 12 }}>
                  La detención supera los 10 días. Se debe confeccionar un <strong>informe detallado de las actividades realizadas en terreno</strong>, evidenciando cada una de las labores ejecutadas.
                </Text>
              }
            />
          )}
          <Form.Item
            name="reason"
            label="Razón de la solicitud"
            rules={[{ required: true, message: "Ingresa la razón" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ej: Pausa temporal por reconfiguración normativa..."
              maxLength={500}
              showCount
              style={{ borderRadius: 8, fontSize: 13 }}
            />
          </Form.Item>
          <Form.Item hidden name="pointId" initialValue={stopCompliancePoint?.id}>
            <Input />
          </Form.Item>
        </Form>
      </Drawer>

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
