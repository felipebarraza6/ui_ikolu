import { create } from "zustand";
import orchestrator from "../../../api/orchestrator";
import { transformDashboardStats } from "../utils/transformDashboardStats";

export const useControlCenterStore = create((set, get) => ({
  // ── UI State ──
  selectedDate: null,
  activeTab: "telemetry",
  loading: false,
  error: null,
  lastRefresh: null,

  // ── Data State ──
  data: null,

  // ── Drawers (genérico) ──
  drawers: {
    measurements: { open: false, point: null },
    voucherModal: { open: false },
    stopTelemetry: { open: false, point: null },
    stopCompliance: { open: false, point: null },
    support: { open: false, point: null, contextType: "SOPORTE" },
    warnings: { open: false, pointName: null },
    pointConfig: { open: false, pointName: "" },
    flowAnalysis: { open: false, point: null },
    complianceDetail: { open: false, point: null },
  },

  // ── Actions: UI ──
  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastRefresh: (date) => set({ lastRefresh: date }),
  setData: (data) => set({ data }),

  // ── Async Fetch ──
  fetchData: async (signal, silent = false) => {
    if (!silent) set({ loading: true, error: null });
    try {
      const [rawDashboard, rawCompliance] = await Promise.all([
        orchestrator.dashboardStats(signal),
        orchestrator.compliance(signal).catch((err) => {
          console.warn("[controlCenterStore] Endpoint compliance no disponible:", err?.message || err);
          return null;
        }),
      ]);
      const transformed = transformDashboardStats(rawDashboard, rawCompliance);
      set({ data: transformed, loading: false, error: null, lastRefresh: new Date() });
    } catch (err) {
      if (err.name === "AbortError") return;
      set({ error: err, loading: false });
    }
  },

  // ── Generic Drawer Actions ──
  openDrawer: (name, payload = {}) =>
    set((state) => ({
      drawers: { ...state.drawers, [name]: { ...state.drawers[name], open: true, ...payload } },
    })),
  closeDrawer: (name) =>
    set((state) => ({
      drawers: { ...state.drawers, [name]: { ...state.drawers[name], open: false } },
    })),
  closeAllDrawers: () =>
    set((state) => {
      const closed = {};
      Object.keys(state.drawers).forEach((key) => {
        closed[key] = { ...state.drawers[key], open: false };
      });
      return { drawers: closed };
    }),

  // ── Convenience Actions ──
  handleWarningPointClick: (pointName) =>
    set((state) => ({
      drawers: { ...state.drawers, warnings: { open: true, pointName } },
    })),
  handleViewMeasurements: (point) =>
    set((state) => ({
      drawers: { ...state.drawers, measurements: { open: true, point } },
    })),
  handleViewVoucher: () =>
    set((state) => ({
      drawers: { ...state.drawers, voucherModal: { ...state.drawers.voucherModal, open: true } },
    })),
  handleOpenStopTelemetry: (point) =>
    set((state) => ({
      drawers: { ...state.drawers, stopTelemetry: { open: true, point } },
    })),
  handleOpenStopCompliance: (point) =>
    set((state) => ({
      drawers: { ...state.drawers, stopCompliance: { open: true, point } },
    })),
  handleOpenSupport: (point, type) =>
    set((state) => ({
      drawers: { ...state.drawers, support: { open: true, point, contextType: type || "SOPORTE" } },
    })),
  handleViewPointConfig: (pointName) =>
    set((state) => ({
      drawers: { ...state.drawers, pointConfig: { open: true, pointName } },
    })),
  handleViewFlowAnalysis: (point) =>
    set((state) => ({
      drawers: { ...state.drawers, flowAnalysis: { open: true, point } },
    })),
  handleViewComplianceDetail: (point, type) =>
    set((state) => ({
      drawers: { ...state.drawers, complianceDetail: { open: true, point: { point, type } } },
    })),

  // ── Selectors ──
  getOverview: () => get().data?.overview || {},
  getPoints: () => get().data?.points || [],
  getLast7: () => get().data?.last_7 || {},
  getWarningsList: () => get().data?.recent_warnings_list || [],
  getWarningsRaw: () => get().data?.recent_warnings || {},
  getChatQuota: () => get().data?.chat_quota || null,
}));
