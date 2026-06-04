import { create } from "zustand";

export const useControlCenterStore = create((set, get) => ({
  // ── UI State ──
  selectedDate: null,
  activeTab: "telemetry",
  loading: false,
  error: null,
  lastRefresh: null,
  
  // ── Data State ──
  data: null,
  
  // ── Drawers & Modals ──
  measurementsDrawerOpen: false,
  selectedPointForMeasurements: null,
  voucherModalOpen: false,
  selectedPointForVoucher: null,
  stopTelemetryModalOpen: false,
  selectedPointForStopTelemetry: null,
  stopComplianceModalOpen: false,
  selectedPointForStopCompliance: null,
  supportModalOpen: false,
  selectedPointForSupport: null,
  warningsDrawerOpen: false,
  selectedWarningPoint: null,
  pointConfigDrawerOpen: false,
  selectedPointForConfig: null,
  flowAnalysisDrawerOpen: false,
  selectedPointForFlowAnalysis: null,
  complianceDetailDrawerOpen: false,
  selectedPointForComplianceDetail: null,
  
  // ── Actions: UI ──
  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastRefresh: (date) => set({ lastRefresh: date }),
  
  // ── Actions: Data ──
  setData: (data) => set({ data }),
  
  // ── Actions: Drawers & Modals ──
  setMeasurementsDrawerOpen: (open) => set({ measurementsDrawerOpen: open }),
  setSelectedPointForMeasurements: (point) => set({ selectedPointForMeasurements: point }),
  setVoucherModalOpen: (open) => set({ voucherModalOpen: open }),
  setSelectedPointForVoucher: (point) => set({ selectedPointForVoucher: point }),
  setStopTelemetryModalOpen: (open) => set({ stopTelemetryModalOpen: open }),
  setSelectedPointForStopTelemetry: (point) => set({ selectedPointForStopTelemetry: point }),
  setStopComplianceModalOpen: (open) => set({ stopComplianceModalOpen: open }),
  setSelectedPointForStopCompliance: (point) => set({ selectedPointForStopCompliance: point }),
  setSupportModalOpen: (open) => set({ supportModalOpen: open }),
  setSelectedPointForSupport: (point) => set({ selectedPointForSupport: point }),
  setWarningsDrawerOpen: (open) => set({ warningsDrawerOpen: open }),
  setSelectedWarningPoint: (point) => set({ selectedWarningPoint: point }),
  setPointConfigDrawerOpen: (open) => set({ pointConfigDrawerOpen: open }),
  setSelectedPointForConfig: (point) => set({ selectedPointForConfig: point }),
  setFlowAnalysisDrawerOpen: (open) => set({ flowAnalysisDrawerOpen: open }),
  setSelectedPointForFlowAnalysis: (point) => set({ selectedPointForFlowAnalysis: point }),
  setComplianceDetailDrawerOpen: (open) => set({ complianceDetailDrawerOpen: open }),
  setSelectedPointForComplianceDetail: (point) => set({ selectedPointForComplianceDetail: point }),
  
  // ── Convenience Actions ──
  handleViewMeasurements: (point) => set({
    selectedPointForMeasurements: point,
    measurementsDrawerOpen: true,
  }),
  handleViewVoucher: (point) => set({
    selectedPointForVoucher: point,
    voucherModalOpen: true,
  }),
  handleOpenStopTelemetry: (point) => set({
    selectedPointForStopTelemetry: point,
    stopTelemetryModalOpen: true,
  }),
  handleOpenStopCompliance: (point) => set({
    selectedPointForStopCompliance: point,
    stopComplianceModalOpen: true,
  }),
  handleOpenSupport: (point, type) => set({
    selectedPointForSupport: { point, type },
    supportModalOpen: true,
  }),
  handleWarningPointClick: (pointName) => set({
    selectedWarningPoint: pointName,
    warningsDrawerOpen: true,
  }),
  handleViewPointConfig: (pointName) => set({
    selectedPointForConfig: pointName,
    pointConfigDrawerOpen: true,
  }),
  handleViewFlowAnalysis: (point) => set({
    selectedPointForFlowAnalysis: point,
    flowAnalysisDrawerOpen: true,
  }),
  handleViewComplianceDetail: (point, type) => set({
    selectedPointForComplianceDetail: { point, type },
    complianceDetailDrawerOpen: true,
  }),
  
  // ── Close All ──
  closeAllDrawers: () => set({
    measurementsDrawerOpen: false,
    voucherModalOpen: false,
    stopTelemetryModalOpen: false,
    stopComplianceModalOpen: false,
    supportModalOpen: false,
    warningsDrawerOpen: false,
    pointConfigDrawerOpen: false,
    flowAnalysisDrawerOpen: false,
    complianceDetailDrawerOpen: false,
  }),
  
  // ── Selectors (computed) ──
  getOverview: () => get().data?.overview || {},
  getPoints: () => get().data?.points || [],
  getLast7: () => get().data?.last_7 || {},
  getWarningsList: () => get().data?.recent_warnings_list || [],
  getWarningsRaw: () => get().data?.recent_warnings || {},
  getChatQuota: () => get().data?.chat_quota || null,
  getPointsWithTelemetry: () => get().data?.overview?.points_with_telemetry || 0,
  getPointsWithCompliance: () => get().data?.overview?.points_with_compliance || 0,
  getTotalPoints: () => get().data?.overview?.total_points || 0,
}));
