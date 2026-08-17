import orchestrator from '../api/orchestrator';
import sh from '../api/sh/endpoints';
import { deduplicateRequest, clearPendingRequests } from '../utils/requestDeduplication';
import { dataCache } from '../utils/dataCache';

jest.mock('../api/sh/endpoints', () => ({
  __esModule: true,
  default: {
    dashboardStats: jest.fn(),
    controlCenterGeneralStats: jest.fn(),
    controlCenterDailySummary: jest.fn(),
    controlCenterProjectPoints: jest.fn(),
    controlCenterList: jest.fn(),
    controlCenterSystemEvents: jest.fn(),
    controlCenterSystemEventsByPoint: jest.fn(),
    chat: jest.fn(),
    compliance: jest.fn(),
    complianceList: jest.fn(),
    toggleCompliance: jest.fn(),
    flowHistory: jest.fn(),
    nearLimitHistory: jest.fn(),
    pointRecords: jest.fn(),
    pointConfig: jest.fn(),
    points: {
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      records: jest.fn(),
      latest: jest.fn(),
      status: jest.fn(),
      config: jest.fn(),
      configUpdate: jest.fn(),
      variables: jest.fn(),
      summary: jest.fn(),
      batchStatus: jest.fn(),
      mine: jest.fn(),
    },
    ikPoint: {
      summary: jest.fn(),
      config: jest.fn(),
      records: jest.fn(),
      variables: jest.fn(),
      calendar: jest.fn(),
      gaps: jest.fn(),
    },
    batch: {
      telemetry: jest.fn(),
      stats: jest.fn(),
      summary: jest.fn(),
    },
    management: {
      systemStatus: jest.fn(),
      systemMap: jest.fn(),
      resourcesStatus: jest.fn(),
      pointsStatus: jest.fn(),
      telemetryMetrics: jest.fn(),
      toggleTelemetry: jest.fn(),
      dgaQueueStatus: jest.fn(),
      clearDgaQueue: jest.fn(),
      requeueDga: jest.fn(),
      updatePointFrequency: jest.fn(),
      notificationsSummary: jest.fn(),
    },
    systemEvents: {
      get: jest.fn(),
      summary: jest.fn(),
    },
    tickets: {
      get: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      assign: jest.fn(),
      changeStatus: jest.fn(),
      confirmScheduledDate: jest.fn(),
      cancelScheduledDate: jest.fn(),
      getComments: jest.fn(),
      createComment: jest.fn(),
      deleteComment: jest.fn(),
      updateComment: jest.fn(),
      likeComment: jest.fn(),
      getMentionableUsers: jest.fn(),
      getNotifications: jest.fn(),
      markNotificationsRead: jest.fn(),
      getAttachments: jest.fn(),
      uploadAttachment: jest.fn(),
      uploadCommentAttachment: jest.fn(),
      tasks: {
        get: jest.fn(),
        create: jest.fn(),
        getById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        uploadAttachment: jest.fn(),
      },
      files: jest.fn(),
      stats: jest.fn(),
      myDesk: jest.fn(),
      dashboard: jest.fn(),
      ranking: jest.fn(),
      categories: {
        get: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      slaConfigs: {
        get: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      convertToClient: jest.fn(),
    },
    alerts: {
      rules: {
        get: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      channels: {
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      triggers: {
        get: jest.fn(),
        acknowledge: jest.fn(),
      },
    },
    admin: {
      clients: jest.fn(),
      clientsAll: jest.fn(),
      createClient: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: jest.fn(),
      projects: jest.fn(),
      projectsAll: jest.fn(),
      createProject: jest.fn(),
      updateProject: jest.fn(),
      deleteProject: jest.fn(),
      catchmentPoints: jest.fn(),
      getCatchmentPoint: jest.fn(),
      createCatchmentPoint: jest.fn(),
      updateCatchmentPoint: jest.fn(),
      deleteCatchmentPoint: jest.fn(),
      clientsWithProjects: jest.fn(),
      pointsByProject: jest.fn(),
      projectPoints: jest.fn(),
      staffUsers: jest.fn(),
      getPointsAll: jest.fn(),
      ticketCategories: {
        get: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      slaConfigs: {
        get: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    },
    telemetry: {
      backfill: jest.fn(),
      reprocess: jest.fn(),
    },
    counterResets: {
      list: jest.fn(),
      get: jest.fn(),
    },
    reports: {
      jsonByProject: jest.fn(),
      jsonByPoint: jest.fn(),
      jsonLastMonth: jest.fn(),
      jsonLastYear: jest.fn(),
      jsonAnnualCompressed: jest.fn(),
      downloadByProject: jest.fn(),
      downloadByPoint: jest.fn(),
      downloadLastMonth: jest.fn(),
      downloadLastYear: jest.fn(),
      downloadAnnualCompressed: jest.fn(),
      downloadActivePoints: jest.fn(),
    },
    dgaConfigs: {
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    notifications: {
      create: jest.fn(),
      get: jest.fn(),
      actives: jest.fn(),
      getById: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      getAllByType: jest.fn(),
      getByPoint: jest.fn(),
      responses: {
        get: jest.fn(),
        create: jest.fn(),
      },
    },
    parseApiError: jest.fn(),
  },
}));

describe('Tier 3: Cross-Feature Combinations & State Synergy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataCache.clear();
    clearPendingRequests();
  });

  describe('1. Request Deduplication Concurrency Control', () => {
    it('shares a single in-flight Promise among multiple concurrent callers', async () => {
      let callCount = 0;
      const delayedFetcher = () =>
        new Promise((resolve) => {
          callCount++;
          setTimeout(() => resolve({ value: 'result-42' }), 50);
        });

      // Three simultaneous requests with the same key
      const [res1, res2, res3] = await Promise.all([
        deduplicateRequest('concurrent_key', delayedFetcher),
        deduplicateRequest('concurrent_key', delayedFetcher),
        deduplicateRequest('concurrent_key', delayedFetcher),
      ]);

      expect(callCount).toBe(1);
      expect(res1).toEqual({ value: 'result-42' });
      expect(res2).toEqual({ value: 'result-42' });
      expect(res3).toEqual({ value: 'result-42' });
    });

    it('allows fresh execution once the previous request completes', async () => {
      let callCount = 0;
      const fetcher = () => {
        callCount++;
        return Promise.resolve({ call: callCount });
      };

      const firstCall = await deduplicateRequest('seq_key', fetcher);
      expect(firstCall.call).toBe(1);
      expect(callCount).toBe(1);

      const secondCall = await deduplicateRequest('seq_key', fetcher);
      expect(secondCall.call).toBe(2);
      expect(callCount).toBe(2);
    });

    it('properly cleans up key on rejection and propagates error to all concurrent callers', async () => {
      let callCount = 0;
      const failingFetcher = () =>
        new Promise((_, reject) => {
          callCount++;
          setTimeout(() => reject(new Error('Network drop')), 30);
        });

      const promises = [
        deduplicateRequest('fail_dedup', failingFetcher),
        deduplicateRequest('fail_dedup', failingFetcher),
      ];

      await expect(Promise.all(promises)).rejects.toThrow('Network drop');
      expect(callCount).toBe(1);

      // Subsequent call should be allowed to retry
      const retryFetcher = jest.fn().mockResolvedValue('recovered');
      const retryResult = await deduplicateRequest('fail_dedup', retryFetcher);
      expect(retryResult).toBe('recovered');
      expect(retryFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Multi-tier Orchestrator Caching & Deduplication Integration', () => {
    it('combines deduplication for in-flight requests and dataCache for subsequent requests', async () => {
      const mockStats = { kpis: { online: 5 } };
      sh.dashboardStats.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve(mockStats), 30))
      );

      // Concurrent calls: Deduplication layer intercepts
      const [res1, res2] = await Promise.all([
        orchestrator.dashboardStats(),
        orchestrator.dashboardStats(),
      ]);

      expect(res1).toEqual(mockStats);
      expect(res2).toEqual(mockStats);
      expect(sh.dashboardStats).toHaveBeenCalledTimes(1);

      // Subsequent call: DataCache layer intercepts
      const res3 = await orchestrator.dashboardStats();
      expect(res3).toEqual(mockStats);
      expect(sh.dashboardStats).toHaveBeenCalledTimes(1);
    });

    it('invalidatePointCache clears all related cache namespaces', () => {
      dataCache.set('telemetry_10', { flow: 10 });
      dataCache.set('day_10_2026-08-17', { total: 100 });
      dataCache.set('month_10_2026-08', { total: 3000 });
      dataCache.set('batch_summary_10,20', { 10: {}, 20: {} });
      dataCache.set('batch_telemetry_10,20_1', { 10: {}, 20: {} });
      dataCache.set('unrelated_key', { other: true });

      orchestrator.invalidatePointCache(10);

      expect(dataCache.get('telemetry_10')).toBeNull();
      expect(dataCache.get('day_10_2026-08-17')).toBeNull();
      expect(dataCache.get('month_10_2026-08')).toBeNull();
      expect(dataCache.get('batch_summary_10,20')).toBeNull();
      expect(dataCache.get('batch_telemetry_10,20_1')).toBeNull();
      expect(dataCache.get('unrelated_key')).toEqual({ other: true });
    });

    it('cancelAllRequests and getOrchestratorStats report queue metrics', () => {
      const stats = orchestrator.getStats();
      expect(stats).toHaveProperty('pendingRequests');
      expect(stats).toHaveProperty('activeRequests');
      expect(stats).toHaveProperty('activeAbortControllers');
      expect(stats).toHaveProperty('cacheStats');

      // Cancel all requests resets controllers
      orchestrator.cancelAllRequests();
      const newStats = orchestrator.getStats();
      expect(newStats.activeAbortControllers).toBe(0);
      expect(newStats.pendingRequests).toBe(0);
    });
  });

  describe('3. AutoRefresh Throttling & Lifecycle Management', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('throttles rapid callback invocations within MIN_REFRESH_INTERVAL (30s)', async () => {
      const callback = jest.fn().mockResolvedValue('data');
      const autoRefresh = orchestrator.createAutoRefresh(callback, 10000, { immediate: true });

      expect(callback).toHaveBeenCalledTimes(1);

      // Fast forward 10s (interval fires, but throttled because < 30s)
      jest.advanceTimersByTime(10000);
      expect(callback).toHaveBeenCalledTimes(1);

      // Fast forward past 30s (total 35s from initial)
      jest.advanceTimersByTime(25000);
      expect(callback).toHaveBeenCalledTimes(2);

      autoRefresh.cancel();
    });

    it('refresh() bypasses throttle interval and forces callback execution', async () => {
      const callback = jest.fn().mockResolvedValue('forced_data');
      const autoRefresh = orchestrator.createAutoRefresh(callback, 60000, { immediate: false });

      expect(callback).toHaveBeenCalledTimes(0);

      // Force immediate refresh
      await autoRefresh.refresh();
      expect(callback).toHaveBeenCalledTimes(1);

      autoRefresh.cancel();
    });

    it('cancel() prevents further timer firings', () => {
      const callback = jest.fn();
      const autoRefresh = orchestrator.createAutoRefresh(callback, 40000, { immediate: false });

      autoRefresh.cancel();
      jest.advanceTimersByTime(100000);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
