import { create } from "zustand";

export const useAdminStore = create((set, get) => ({
  // Navegación
  activeTab: "performance",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Filtros globales admin
  filters: {
    client: null,
    project: null,
    point: null,
    dateRange: null,
    status: null,
    priority: null,
    assignedTo: null,
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () =>
    set({
      filters: {
        client: null,
        project: null,
        point: null,
        dateRange: null,
        status: null,
        priority: null,
        assignedTo: null,
      },
    }),

  // Tickets / Soporte
  selectedTicket: null,
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
  ticketCreateOpen: false,
  setTicketCreateOpen: (open) => set({ ticketCreateOpen: open }),

  // Refresh triggers
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));

export default useAdminStore;
