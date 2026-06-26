import { create } from "zustand";
import { format, subDays } from "date-fns";

const today = new Date();
const defaultDateRange = {
  startDate: format(subDays(today, 6), "yyyy-MM-dd"),
  endDate: format(today, "yyyy-MM-dd"),
};

export const useControlCenterStore = create((set) => ({
  selectedDate: null,
  selectedProject: null,
  dateRange: defaultDateRange,
  activeTab: "telemetry",

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
    flowHistory: { open: false, point: null },
    nearLimitHistory: { open: false, point: null },
    systemEvents: { open: false },
    systemEventsPoint: { open: false, point: null },
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedProject: (projectId) => set({ selectedProject: projectId }),
  setDateRange: (range) => set({ dateRange: range }),
  setActiveTab: (tab) => set({ activeTab: tab }),

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
  handleViewFlowHistory: (point) =>
    set((state) => ({
      drawers: { ...state.drawers, flowHistory: { open: true, point } },
    })),
  handleViewNearLimitHistory: (point) =>
    set((state) => ({
      drawers: { ...state.drawers, nearLimitHistory: { open: true, point } },
    })),
}));
