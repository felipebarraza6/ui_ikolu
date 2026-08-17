import orchestrator from '../api/orchestrator';
import sh from '../api/sh/endpoints';
import { dataCache } from '../utils/dataCache';
import { clearPendingRequests } from '../utils/requestDeduplication';

jest.mock('../api/sh/endpoints', () => ({
  __esModule: true,
  default: {
    authenticated: jest.fn(),
    requestPasswordReset: jest.fn(),
    confirmPasswordReset: jest.fn(),
    getPublicAnnouncements: jest.fn(),
    get_profile: jest.fn(),
    me: jest.fn(),
    changePassword: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getUsers: jest.fn(),
    getUser: jest.fn(),
    createUser: jest.fn(),
    signupUser: jest.fn(),
    getVariables: jest.fn(),
    getVariable: jest.fn(),
    createVariable: jest.fn(),
    updateVariable: jest.fn(),
    deleteVariable: jest.fn(),
    getSchemes: jest.fn(),
    getScheme: jest.fn(),
    createScheme: jest.fn(),
    updateScheme: jest.fn(),
    deleteScheme: jest.fn(),
    getTelemetryProviders: jest.fn(),
    getTelemetryProvider: jest.fn(),
    getComplianceProviders: jest.fn(),
    getComplianceProvider: jest.fn(),
    downloadFile: jest.fn(),
    get_data_sh: jest.fn(),
    get_data_sh_range: jest.fn(),
    get_data_sh_range_to_excel: jest.fn(),
    get_data_sh_range_to_excel_dga: jest.fn(),
    get_data_sh_range_hour: jest.fn(),
    get_data_send_dga: jest.fn(),
    get_data_sh_range_graphic: jest.fn(),
    get_data_structural: jest.fn(),
    get_data_structural_month: jest.fn(),
    delete_data_sh: jest.fn(),
    create_data_sh: jest.fn(),
    update_data_sh: jest.fn(),
    get_data_day: jest.fn(),
    get_data_month: jest.fn(),
    downloadMonth: jest.fn(),
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFiles: jest.fn(),
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
    getPointsAll: jest.fn(),
    getPointDetail: jest.fn(),
    getPointsSummary: jest.fn(),
    getPointSummary: jest.fn(),
    getMyPoints: jest.fn(),
    batch: {
      telemetry: jest.fn(),
      stats: jest.fn(),
      summary: jest.fn(),
    },
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
    telemetry: {
      backfill: jest.fn(),
      reprocess: jest.fn(),
    },
    counterResets: {
      list: jest.fn(),
      get: jest.fn(),
    },
    validatePasswordResetToken: jest.fn(),
    dailySummary: jest.fn(),
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
    uploadAvatar: jest.fn(),
    updateNotifyEmailPreference: jest.fn(),
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
    parseApiError: jest.fn(),
  },
}));

describe('Tier 1: Capa One Orchestrator Gateway Interface Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataCache.clear();
    clearPendingRequests();
  });

  describe('1. Puntos & Telemetría Orchestration', () => {
    it('orchestrator.getBatchTelemetry uses native batch endpoint and caches result', async () => {
      const mockBatchResponse = {
        data: {
          10: { flow: 20.5, level: 12.3 },
          20: { flow: 15.0, level: 8.9 },
        },
        meta: { requested: 2, returned: 2 },
      };
      sh.batch.telemetry.mockResolvedValue(mockBatchResponse);

      const result = await orchestrator.getBatchTelemetry([10, 20], { hours: 2, useCache: true });
      expect(sh.batch.telemetry).toHaveBeenCalledWith([10, 20], 2);
      expect(result).toEqual(mockBatchResponse);

      // Verify cached call doesn't re-invoke backend
      const cachedResult = await orchestrator.getBatchTelemetry([10, 20], { hours: 2, useCache: true });
      expect(sh.batch.telemetry).toHaveBeenCalledTimes(1);
      expect(cachedResult).toEqual(mockBatchResponse);
    });

    it('orchestrator.getBatchStats calls sh.batch.stats and returns aggregated stats', async () => {
      const mockStats = {
        data: { 10: { total_volume: 50000 }, 20: { total_volume: 32000 } },
        meta: { requested: 2, returned: 2 },
      };
      sh.batch.stats.mockResolvedValue(mockStats);

      const res = await orchestrator.getBatchStats([10, 20], { days: 30 });
      expect(sh.batch.stats).toHaveBeenCalledWith([10, 20], 30);
      expect(res).toEqual(mockStats);
    });

    it('orchestrator.getBatchSummary calls sh.batch.summary', async () => {
      const mockSummary = { data: { 10: { latest: 12.3 } } };
      sh.batch.summary.mockResolvedValue(mockSummary);

      const res = await orchestrator.getBatchSummary([10]);
      expect(sh.batch.summary).toHaveBeenCalledWith([10]);
      expect(res).toEqual(mockSummary);
    });

    it('orchestrator.pointsList and pointsGet delegate to sh.points', async () => {
      sh.points.list.mockResolvedValue({ results: [{ id: 1 }] });
      sh.points.get.mockResolvedValue({ id: 1, name: 'Pozo 1' });
      sh.points.create.mockResolvedValue({ id: 2 });
      sh.points.update.mockResolvedValue({ id: 2, name: 'Pozo 2' });
      sh.points.delete.mockResolvedValue({ success: true });
      sh.points.records.mockResolvedValue({ results: [] });
      sh.points.latest.mockResolvedValue({ flow: 10 });
      sh.points.status.mockResolvedValue({ online: true });
      sh.points.config.mockResolvedValue({ d1: 100 });
      sh.points.configUpdate.mockResolvedValue({ d1: 120 });
      sh.points.variables.mockResolvedValue(['caudal']);
      sh.points.summary.mockResolvedValue({ id: 1 });
      sh.points.batchStatus.mockResolvedValue({ 1: { online: true } });
      sh.pointConfig = jest.fn().mockResolvedValue({ d1: 100 });

      await orchestrator.pointsList({ project: 1 });
      expect(sh.points.list).toHaveBeenCalledWith({ project: 1 });

      await orchestrator.pointsGet(1);
      expect(sh.points.get).toHaveBeenCalledWith(1);

      await orchestrator.pointsCreate({ name: 'Pozo 2' });
      expect(sh.points.create).toHaveBeenCalledWith({ name: 'Pozo 2' });

      await orchestrator.pointsUpdate(2, { name: 'Pozo 2' });
      expect(sh.points.update).toHaveBeenCalledWith(2, { name: 'Pozo 2' });

      await orchestrator.pointsDelete(2);
      expect(sh.points.delete).toHaveBeenCalledWith(2);

      await orchestrator.pointsRecords(1, { limit: 10 });
      expect(sh.points.records).toHaveBeenCalledWith(1, { limit: 10 });

      await orchestrator.pointsLatest(1);
      expect(sh.points.latest).toHaveBeenCalledWith(1);

      await orchestrator.pointStatus(1, 30);
      expect(sh.points.status).toHaveBeenCalledWith(1, 30);

      await orchestrator.pointConfig(1);
      expect(sh.pointConfig).toHaveBeenCalledWith(1);

      await orchestrator.pointsConfigUpdate(1, { d1: 120 });
      expect(sh.points.configUpdate).toHaveBeenCalledWith(1, { d1: 120 });

      await orchestrator.pointsVariables(1);
      expect(sh.points.variables).toHaveBeenCalledWith(1);

      await orchestrator.pointsSummary(1);
      expect(sh.points.summary).toHaveBeenCalledWith(1);

      await orchestrator.pointsBatchStatus([1]);
      expect(sh.points.batchStatus).toHaveBeenCalledWith([1]);
    });

    it('orchestrator.ikPoint methods delegate cleanly', async () => {
      sh.ikPoint.summary.mockResolvedValue({ id: 5 });
      sh.ikPoint.config.mockResolvedValue({ d2: 40 });
      sh.ikPoint.records.mockResolvedValue([]);
      sh.ikPoint.variables.mockResolvedValue(['level']);
      sh.ikPoint.calendar.mockResolvedValue({ days: 7 });
      sh.ikPoint.gaps.mockResolvedValue([]);

      await orchestrator.ikPointSummary(5);
      expect(sh.ikPoint.summary).toHaveBeenCalledWith(5);

      await orchestrator.ikPointConfig(5);
      expect(sh.ikPoint.config).toHaveBeenCalledWith(5);

      await orchestrator.ikPointRecords(5, { limit: 5 });
      expect(sh.ikPoint.records).toHaveBeenCalledWith(5, { limit: 5 });

      await orchestrator.ikPointVariables(5);
      expect(sh.ikPoint.variables).toHaveBeenCalledWith(5);

      await orchestrator.ikPointCalendar(5, 7);
      expect(sh.ikPoint.calendar).toHaveBeenCalledWith(5, 7);

      await orchestrator.ikPointGaps(5, { start_date: '2026-08-01' });
      expect(sh.ikPoint.gaps).toHaveBeenCalledWith(5, { start_date: '2026-08-01' });
    });
  });

  describe('2. Centro de Control Orchestration', () => {
    it('orchestrator.dashboardStats, controlCenterGeneralStats, dailySummary, projectPoints, list', async () => {
      sh.dashboardStats.mockResolvedValue({ kpis: { points: 10 } });
      sh.controlCenterGeneralStats.mockResolvedValue({ overview: { total: 10 } });
      sh.controlCenterDailySummary.mockResolvedValue({ days: [{ date: '2026-08-17' }] });
      sh.controlCenterProjectPoints.mockResolvedValue({ points: [{ id: 10 }] });
      sh.controlCenterList.mockResolvedValue({ count: 1, results: [{ id: 10 }] });
      sh.chat.mockResolvedValue({ reply: 'ok' });

      const dStats = await orchestrator.dashboardStats();
      expect(sh.dashboardStats).toHaveBeenCalled();
      expect(dStats.kpis.points).toBe(10);

      const gStats = await orchestrator.controlCenterGeneralStats();
      expect(sh.controlCenterGeneralStats).toHaveBeenCalled();
      expect(gStats.overview.total).toBe(10);

      const daily = await orchestrator.controlCenterDailySummary({ start_date: '2026-08-01', end_date: '2026-08-07' });
      expect(sh.controlCenterDailySummary).toHaveBeenCalledWith({ start_date: '2026-08-01', end_date: '2026-08-07' }, undefined);
      expect(daily.days).toHaveLength(1);

      const projPoints = await orchestrator.controlCenterProjectPoints(5);
      expect(sh.controlCenterProjectPoints).toHaveBeenCalledWith(5, undefined);
      expect(projPoints.points).toHaveLength(1);

      const ccList = await orchestrator.controlCenterList({ date: '2026-08-17', project_id: 5 });
      expect(sh.controlCenterList).toHaveBeenCalledWith({ date: '2026-08-17', project_id: 5 }, undefined);
      expect(ccList.count).toBe(1);

      const chatRes = await orchestrator.chat('hola');
      expect(sh.chat).toHaveBeenCalledWith('hola');
      expect(chatRes.reply).toBe('ok');
    });

    it('orchestrator.getSystemEvents and getSystemEventsByPoint', async () => {
      sh.controlCenterSystemEvents.mockResolvedValue({ results: [{ id: 1 }] });
      sh.controlCenterSystemEventsByPoint.mockResolvedValue({ results: [{ id: 2 }] });

      await orchestrator.getSystemEvents({ severity: 'ERROR' });
      expect(sh.controlCenterSystemEvents).toHaveBeenCalledWith({ severity: 'ERROR' }, undefined);

      await orchestrator.getSystemEventsByPoint(10, { severity: 'WARN' });
      expect(sh.controlCenterSystemEventsByPoint).toHaveBeenCalledWith(10, { severity: 'WARN' }, undefined);
    });
  });

  describe('3. Cumplimiento & DGA Queue Orchestration', () => {
    it('orchestrator.compliance, complianceList, toggleCompliance, flowHistory, nearLimitHistory', async () => {
      sh.compliance.mockResolvedValue({ compliant: 15 });
      sh.complianceList.mockResolvedValue({ count: 15, results: [] });
      sh.toggleCompliance.mockResolvedValue({ point_id: 10, enabled: true });
      sh.flowHistory.mockResolvedValue({ results: [] });
      sh.nearLimitHistory.mockResolvedValue({ results: [] });

      const comp = await orchestrator.compliance();
      expect(sh.compliance).toHaveBeenCalled();
      expect(comp.compliant).toBe(15);

      const compList = await orchestrator.complianceList({ page: 1 });
      expect(sh.complianceList).toHaveBeenCalledWith({ page: 1 }, undefined);
      expect(compList.count).toBe(15);

      const toggle = await orchestrator.toggleCompliance(10, true);
      expect(sh.toggleCompliance).toHaveBeenCalledWith(10, true);
      expect(toggle.enabled).toBe(true);

      await orchestrator.flowHistory(10, { days: 30 });
      expect(sh.flowHistory).toHaveBeenCalledWith(10, { days: 30 });

      await orchestrator.nearLimitHistory(10, { days: 30 });
      expect(sh.nearLimitHistory).toHaveBeenCalledWith(10, { days: 30 });
    });

    it('orchestrator.verifyDgaVoucher returns graceful fallback structure', async () => {
      const res = await orchestrator.verifyDgaVoucher('OBRA123', 'COMP456', 'SUBTERRANEA');
      expect(res.status).toBe(200);
      expect(res.valid).toBe(false);
      expect(res.detail).toContain('Servicio de verificación DGA no disponible');
    });

    it('orchestrator.management exposes all 11 management operations including requeueDga & clearDgaQueue', async () => {
      sh.management.systemStatus.mockResolvedValue({ status: 'ok' });
      sh.management.systemMap.mockResolvedValue({ nodes: [] });
      sh.management.resourcesStatus.mockResolvedValue({ memory: 40 });
      sh.management.pointsStatus.mockResolvedValue([]);
      sh.management.telemetryMetrics.mockResolvedValue({});
      sh.management.toggleTelemetry.mockResolvedValue({ enabled: true });
      sh.management.dgaQueueStatus.mockResolvedValue({ pending: 2 });
      sh.management.clearDgaQueue.mockResolvedValue({ cleared: 2 });
      sh.management.requeueDga.mockResolvedValue({ requeued: 2 });
      sh.management.updatePointFrequency.mockResolvedValue({ frequency: 15 });
      sh.management.notificationsSummary.mockResolvedValue({});

      await orchestrator.systemStatus();
      expect(sh.management.systemStatus).toHaveBeenCalled();

      await orchestrator.systemMap();
      expect(sh.management.systemMap).toHaveBeenCalled();

      await orchestrator.resourcesStatus();
      expect(sh.management.resourcesStatus).toHaveBeenCalled();

      await orchestrator.pointsStatus({ active: true });
      expect(sh.management.pointsStatus).toHaveBeenCalledWith({ active: true });

      await orchestrator.telemetryMetrics({ days: 7 });
      expect(sh.management.telemetryMetrics).toHaveBeenCalledWith({ days: 7 });

      await orchestrator.toggleTelemetry(10, false);
      expect(sh.management.toggleTelemetry).toHaveBeenCalledWith(10, false);

      await orchestrator.dgaQueueStatus();
      expect(sh.management.dgaQueueStatus).toHaveBeenCalled();

      await orchestrator.clearDgaQueue({ id: 1 });
      expect(sh.management.clearDgaQueue).toHaveBeenCalledWith({ id: 1 });

      await orchestrator.requeueDga({ queue_id: 99 });
      expect(sh.management.requeueDga).toHaveBeenCalledWith({ queue_id: 99 });

      await orchestrator.updatePointFrequency(10, 30);
      expect(sh.management.updatePointFrequency).toHaveBeenCalledWith(10, 30);

      await orchestrator.management.notificationsSummary(7);
      expect(sh.management.notificationsSummary).toHaveBeenCalledWith(7);
    });
  });

  describe('4. Soporte, Tickets & Alertas Orchestration', () => {
    it('orchestrator.tickets provides full ticket lifecycle operations', async () => {
      sh.tickets.get.mockResolvedValue({ results: [] });
      sh.tickets.getById.mockResolvedValue({ id: 1 });
      sh.tickets.create.mockResolvedValue({ id: 2 });
      sh.tickets.update.mockResolvedValue({ id: 2 });
      sh.tickets.delete.mockResolvedValue({ success: true });
      sh.tickets.assign.mockResolvedValue({ id: 2, assigned_to: 5 });
      sh.tickets.changeStatus.mockResolvedValue({ id: 2, status: 'IN_PROGRESS' });
      sh.tickets.confirmScheduledDate.mockResolvedValue({ id: 2 });
      sh.tickets.cancelScheduledDate.mockResolvedValue({ id: 2 });
      sh.tickets.getComments.mockResolvedValue([]);
      sh.tickets.createComment.mockResolvedValue({ id: 10 });
      sh.tickets.deleteComment.mockResolvedValue({ success: true });
      sh.tickets.updateComment.mockResolvedValue({ id: 10 });
      sh.tickets.likeComment.mockResolvedValue({ likes: 1 });
      sh.tickets.getMentionableUsers.mockResolvedValue([]);
      sh.tickets.getNotifications.mockResolvedValue([]);
      sh.tickets.markNotificationsRead.mockResolvedValue({});
      sh.tickets.getAttachments.mockResolvedValue([]);
      sh.tickets.uploadAttachment.mockResolvedValue({ id: 50 });
      sh.tickets.uploadCommentAttachment.mockResolvedValue({ id: 51 });
      sh.tickets.tasks.get.mockResolvedValue([]);
      sh.tickets.tasks.getById.mockResolvedValue({ id: 1 });
      sh.tickets.tasks.create.mockResolvedValue({ id: 2 });
      sh.tickets.tasks.update.mockResolvedValue({ id: 2 });
      sh.tickets.tasks.delete.mockResolvedValue({ success: true });
      sh.tickets.tasks.uploadAttachment.mockResolvedValue({ id: 52 });
      sh.tickets.files.mockResolvedValue([]);
      sh.tickets.stats.mockResolvedValue({});
      sh.tickets.myDesk.mockResolvedValue([]);
      sh.tickets.dashboard.mockResolvedValue({});
      sh.tickets.ranking.mockResolvedValue([]);
      sh.tickets.categories.get.mockResolvedValue([]);
      sh.tickets.categories.getById.mockResolvedValue({ id: 1 });
      sh.tickets.categories.create.mockResolvedValue({ id: 2 });
      sh.tickets.categories.update.mockResolvedValue({ id: 2 });
      sh.tickets.categories.delete.mockResolvedValue({ success: true });
      sh.tickets.slaConfigs.get.mockResolvedValue([]);
      sh.tickets.slaConfigs.getById.mockResolvedValue({ id: 1 });
      sh.tickets.slaConfigs.create.mockResolvedValue({ id: 2 });
      sh.tickets.slaConfigs.update.mockResolvedValue({ id: 2 });
      sh.tickets.slaConfigs.delete.mockResolvedValue({ success: true });

      await orchestrator.tickets.get({ status: 'OPEN' });
      expect(sh.tickets.get).toHaveBeenCalledWith({ status: 'OPEN' });

      await orchestrator.tickets.assign(2, 5);
      expect(sh.tickets.assign).toHaveBeenCalledWith(2, 5);

      await orchestrator.tickets.changeStatus(2, 'IN_PROGRESS', 'CORRECTIVE');
      expect(sh.tickets.changeStatus).toHaveBeenCalledWith(2, 'IN_PROGRESS', 'CORRECTIVE');

      await orchestrator.tickets.tasks.create(2, { task_name: 'Medir nivel' });
      expect(sh.tickets.tasks.create).toHaveBeenCalledWith(2, { task_name: 'Medir nivel' });
    });

    it('orchestrator.alerts rules, channels, and triggers', async () => {
      sh.alerts.rules.get.mockResolvedValue([]);
      sh.alerts.rules.getById.mockResolvedValue({ id: 1 });
      sh.alerts.rules.create.mockResolvedValue({ id: 2 });
      sh.alerts.rules.update.mockResolvedValue({ id: 2 });
      sh.alerts.rules.delete.mockResolvedValue({ success: true });
      sh.alerts.channels.get.mockResolvedValue([]);
      sh.alerts.channels.create.mockResolvedValue({ id: 1 });
      sh.alerts.channels.update.mockResolvedValue({ id: 1 });
      sh.alerts.channels.delete.mockResolvedValue({ success: true });
      sh.alerts.triggers.get.mockResolvedValue([]);
      sh.alerts.triggers.acknowledge.mockResolvedValue({ is_acknowledged: true });

      await orchestrator.alerts.rules.get();
      expect(sh.alerts.rules.get).toHaveBeenCalled();

      await orchestrator.alerts.channels.create({ channel_type: 'EMAIL' });
      expect(sh.alerts.channels.create).toHaveBeenCalledWith({ channel_type: 'EMAIL' });

      await orchestrator.alerts.triggers.acknowledge(10);
      expect(sh.alerts.triggers.acknowledge).toHaveBeenCalledWith(10);
    });
  });

  describe('5. Admin & Infrastructure Contracts', () => {
    it('orchestrator.admin exposes complete catalog and administration endpoints', async () => {
      sh.admin.clients.mockResolvedValue([]);
      sh.admin.clientsAll.mockResolvedValue([]);
      sh.admin.createClient.mockResolvedValue({ id: 1 });
      sh.admin.updateClient.mockResolvedValue({ id: 1 });
      sh.admin.deleteClient.mockResolvedValue({ success: true });
      sh.admin.projects.mockResolvedValue([]);
      sh.admin.projectsAll.mockResolvedValue([]);
      sh.admin.createProject.mockResolvedValue({ id: 1 });
      sh.admin.updateProject.mockResolvedValue({ id: 1 });
      sh.admin.deleteProject.mockResolvedValue({ success: true });
      sh.admin.clientsWithProjects.mockResolvedValue([]);
      sh.admin.pointsByProject.mockResolvedValue([{ id: 101 }]);
      sh.admin.projectPoints.mockResolvedValue([]);
      sh.admin.staffUsers.mockResolvedValue([]);
      sh.admin.getPointsAll.mockResolvedValue([{ id: 1 }]);

      await orchestrator.admin.clients();
      expect(sh.admin.clients).toHaveBeenCalled();

      await orchestrator.admin.clientsWithProjects();
      expect(sh.admin.clientsWithProjects).toHaveBeenCalled();

      await orchestrator.admin.pointsByProject(1);
      expect(sh.admin.pointsByProject).toHaveBeenCalledWith(1);

      await orchestrator.admin.staffUsers();
      expect(sh.admin.staffUsers).toHaveBeenCalled();
    });

    it('orchestrator exposes PRIORITY constants', () => {
      expect(orchestrator.PRIORITY).toBeDefined();
      expect(orchestrator.PRIORITY.CRITICAL).toBe(0);
      expect(orchestrator.PRIORITY.HIGH).toBe(1);
      expect(orchestrator.PRIORITY.NORMAL).toBe(2);
      expect(orchestrator.PRIORITY.LOW).toBe(3);
    });
  });
});
