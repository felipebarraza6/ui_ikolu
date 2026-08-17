import orchestrator from '../api/orchestrator';
import sh from '../api/sh/endpoints';
import { dataCache } from '../utils/dataCache';
import { clearPendingRequests } from '../utils/requestDeduplication';

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

describe('Tier 4: Real-World Business & Application Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataCache.clear();
    clearPendingRequests();
  });

  describe('Scenario 1: Control Center Full Dashboard Load & Project Switching', () => {
    it('executes complete dashboard initialization and reactive project filtering', async () => {
      // 1. Initial Dashboard Load Mock Data
      sh.dashboardStats.mockResolvedValue({
        total_points: 24,
        online_points: 22,
        total_flow_today: 1450.5,
      });

      sh.controlCenterGeneralStats.mockResolvedValue({
        overview: { active_projects: 4, compliance_rate: 98.5 },
        chat_quota: { remaining: 50 },
      });

      sh.controlCenterDailySummary.mockResolvedValue({
        days: [
          { date: '2026-08-16', total_volume: 34500, average_flow: 14.2 },
          { date: '2026-08-17', total_volume: 36200, average_flow: 15.1 },
        ],
      });

      sh.controlCenterList.mockResolvedValue({
        count: 24,
        results: [
          { id: 101, name: 'Pozo Agrícola 1', project_id: 1, flow: 12.4, status: 'ONLINE' },
          { id: 102, name: 'Pozo Agrícola 2', project_id: 4, flow: 18.1, status: 'ONLINE' },
        ],
      });

      sh.controlCenterSystemEvents.mockResolvedValue({
        results: [
          { id: 1, severity: 'INFO', message: 'DGA Daily Sync Completed', timestamp: '2026-08-17T09:00:00Z' },
        ],
      });

      sh.chat.mockResolvedValue({
        reply: 'El pozo 101 se encuentra operando normalmente a 12.4 L/s.',
      });

      // Step 1: Initial Load
      const [dStats, gStats, daily, pointList, events] = await Promise.all([
        orchestrator.dashboardStats(),
        orchestrator.controlCenterGeneralStats(),
        orchestrator.controlCenterDailySummary({ start_date: '2026-08-16', end_date: '2026-08-17' }),
        orchestrator.controlCenterList({ date: '2026-08-17', page: 1, page_size: 20 }),
        orchestrator.getSystemEvents({ severity: 'INFO' }),
      ]);

      expect(dStats.total_points).toBe(24);
      expect(gStats.overview.active_projects).toBe(4);
      expect(daily.days).toHaveLength(2);
      expect(pointList.results).toHaveLength(2);
      expect(events.results).toHaveLength(1);

      // Step 2: Switch to Project 4
      sh.controlCenterProjectPoints.mockResolvedValue({
        points: [{ id: 102, name: 'Pozo Agrícola 2' }],
      });

      const projPoints = await orchestrator.controlCenterProjectPoints(4);
      expect(projPoints.points[0].id).toBe(102);

      // Step 3: Interactive Assistant Query
      const chatReply = await orchestrator.chat('Estado del pozo 101');
      expect(chatReply.reply).toContain('12.4 L/s');
    });
  });

  describe('Scenario 2: DGA Compliance Monitoring, Flow Analysis & Queue Recovery', () => {
    it('executes full compliance audit, flow drilldown, and DGA queue recovery cycle', async () => {
      // Step 1: Inspect Compliance Overview
      sh.compliance.mockResolvedValue({
        total_regulated: 15,
        compliant: 14,
        warnings: 1,
      });
      const compOverview = await orchestrator.compliance();
      expect(compOverview.warnings).toBe(1);

      // Step 2: Filter Non-Compliant / Critical Warning Points
      sh.complianceList.mockResolvedValue({
        count: 1,
        results: [
          { point_id: 205, name: 'Pozo San Pedro', warning_level: 'CRITICAL', flow_rate_exceeded: true },
        ],
      });
      const criticalPoints = await orchestrator.complianceList({ warning_level: 'CRITICAL' });
      expect(criticalPoints.results[0].point_id).toBe(205);

      // Step 3: Drilldown into Flow & Near-Limit History
      sh.flowHistory.mockResolvedValue({
        count: 5,
        results: [{ date: '2026-08-15', max_flow: 45.2, authorized_limit: 40.0 }],
      });
      sh.nearLimitHistory.mockResolvedValue({
        count: 8,
        results: [{ date: '2026-08-16', percentage_of_limit: 96.5 }],
      });

      const flowHistoryRes = await orchestrator.flowHistory(205, { days: 90 });
      const nearLimitRes = await orchestrator.nearLimitHistory(205, { days: 90 });

      expect(flowHistoryRes.results[0].max_flow).toBeGreaterThan(40.0);
      expect(nearLimitRes.results[0].percentage_of_limit).toBe(96.5);

      // Step 4: Maintenance - Toggle Compliance & Update Frequency
      sh.toggleCompliance.mockResolvedValue({ point_id: 205, enabled: false });
      sh.management.updatePointFrequency.mockResolvedValue({ point_id: 205, frequency: 15 });

      const toggleRes = await orchestrator.toggleCompliance(205, false);
      const freqRes = await orchestrator.updatePointFrequency(205, 15);
      expect(toggleRes.enabled).toBe(false);
      expect(freqRes.frequency).toBe(15);

      // Step 5: DGA Transmission Queue Recovery
      sh.management.dgaQueueStatus.mockResolvedValue({
        pending: 3,
        failed: 2,
        failed_ids: [901, 902],
      });
      sh.management.requeueDga.mockResolvedValue({ requeued_count: 2 });
      sh.management.clearDgaQueue.mockResolvedValue({ cleared_count: 10 });

      const qStatus = await orchestrator.dgaQueueStatus();
      expect(qStatus.failed).toBe(2);

      const requeueRes = await orchestrator.requeueDga({ queue_ids: qStatus.failed_ids });
      expect(requeueRes.requeued_count).toBe(2);

      const clearRes = await orchestrator.clearDgaQueue({ older_than_days: 90 });
      expect(clearRes.cleared_count).toBe(10);
    });
  });

  describe('Scenario 3: Field Support Ticket Lifecycle & SLA Escalation', () => {
    it('manages complete support ticket creation, assignment, task execution, and client conversion', async () => {
      // Step 1: Browse SLA Configurations & Categories
      sh.tickets.categories.get.mockResolvedValue([
        { id: 1, name: 'Sensor Telemetría' },
        { id: 2, name: 'Conectividad DGA' },
      ]);
      sh.tickets.slaConfigs.get.mockResolvedValue([
        { id: 1, priority: 'HIGH', max_response_hours: 4 },
      ]);
      sh.tickets.create.mockResolvedValue({
        id: 5001,
        title: 'Falla sensor de nivel pozo 3',
        priority: 'HIGH',
        status: 'OPEN',
      });
      sh.tickets.assign.mockResolvedValue({
        id: 5001,
        assigned_to: 12,
        status: 'ASSIGNED',
      });
      sh.tickets.changeStatus.mockResolvedValue({
        id: 5001,
        status: 'IN_PROGRESS',
        work_order_category: 'CORRECTIVE',
      });
      sh.tickets.confirmScheduledDate.mockResolvedValue({
        id: 5001,
        scheduled_confirmed: true,
      });
      sh.tickets.createComment.mockResolvedValue({
        id: 88,
        ticket: 5001,
        text: 'Técnico en ruta al punto de captación.',
      });
      sh.tickets.tasks.create.mockResolvedValue({
        id: 991,
        ticket: 5001,
        task_name: 'Revisión transductor de presión',
        is_completed: false,
      });
      sh.tickets.tasks.update.mockResolvedValue({
        id: 991,
        is_completed: true,
      });
      sh.tickets.convertToClient.mockResolvedValue({
        ticket_id: 5001,
        client_id: 42,
        success: true,
      });

      // 1. Fetch metadata
      const categories = await orchestrator.tickets.categories.get();
      const slaList = await orchestrator.tickets.slaConfigs.get();
      expect(categories).toHaveLength(2);
      expect(slaList[0].max_response_hours).toBe(4);

      // 2. File Ticket
      const ticket = await orchestrator.tickets.create({
        title: 'Falla sensor de nivel pozo 3',
        priority: 'HIGH',
        category: categories[0].id,
      });
      expect(ticket.id).toBe(5001);

      // 3. Assign & Update Status
      const assigned = await orchestrator.tickets.assign(ticket.id, 12);
      expect(assigned.assigned_to).toBe(12);

      const inProgress = await orchestrator.tickets.changeStatus(ticket.id, 'IN_PROGRESS', 'CORRECTIVE');
      expect(inProgress.status).toBe('IN_PROGRESS');

      // 4. Schedule & Comment
      const confirmed = await orchestrator.tickets.confirmScheduledDate(ticket.id);
      expect(confirmed.scheduled_confirmed).toBe(true);

      const comment = await orchestrator.tickets.createComment(ticket.id, {
        text: 'Técnico en ruta al punto de captación.',
      });
      expect(comment.id).toBe(88);

      // 5. Create and Complete Subtask
      const task = await orchestrator.tickets.tasks.create(ticket.id, {
        task_name: 'Revisión transductor de presión',
      });
      expect(task.id).toBe(991);

      const completedTask = await orchestrator.tickets.tasks.update(task.id, { is_completed: true });
      expect(completedTask.is_completed).toBe(true);

      // 6. Close Ticket with Resolved Status
      sh.tickets.changeStatus.mockResolvedValueOnce({
        id: 5001,
        status: 'RESOLVED',
        work_order_category: 'CORRECTIVE',
      });
      const resolved = await orchestrator.tickets.changeStatus(ticket.id, 'RESOLVED', 'CORRECTIVE');
      expect(resolved.status).toBe('RESOLVED');
    });
  });

  describe('Scenario 4: Telemetry Batch Ingestion, Gap Detection & Reprocessing Pipeline', () => {
    it('ingests batch telemetry, detects transmission gaps, triggers reprocessor, and checks reset logs', async () => {
      // 1. Batch Telemetry Ingestion
      sh.batch.telemetry.mockResolvedValue({
        data: {
          1: { latest: { flow: 15.2, level: 8.4 } },
          2: { latest: { flow: 22.0, level: 14.1 } },
        },
        meta: { requested: 2, returned: 2 },
      });

      const batchRes = await orchestrator.getBatchTelemetry([1, 2], { hours: 24 });
      expect(batchRes.data[1].latest.flow).toBe(15.2);

      // 2. Point Summary & Calendar View
      sh.ikPoint.summary.mockResolvedValue({
        id: 1,
        name: 'Pozo Principal',
        last_telemetry: { flow: 15.2, timestamp: '2026-08-17T12:00:00Z' },
      });
      sh.ikPoint.calendar.mockResolvedValue({
        days: 7,
        records_per_day: [24, 24, 24, 18, 24, 24, 24], // day 4 has missing records
      });
      sh.ikPoint.gaps.mockResolvedValue([
        { start: '2026-08-13T10:00:00Z', end: '2026-08-13T16:00:00Z', missing_hours: 6 },
      ]);
      sh.ikPoint.records.mockResolvedValue({
        count: 100,
        results: [{ id: 1, flow: 15.2, timestamp: '2026-08-17T12:00:00Z' }],
      });

      const summary = await orchestrator.ikPointSummary(1);
      const calendar = await orchestrator.ikPointCalendar(1, 7);
      const gaps = await orchestrator.ikPointGaps(1, { start_date: '2026-08-10', end_date: '2026-08-17' });

      expect(summary.name).toBe('Pozo Principal');
      expect(calendar.records_per_day[3]).toBe(18);
      expect(gaps).toHaveLength(1);
      expect(gaps[0].missing_hours).toBe(6);

      // 3. Trigger Reprocessor & Backfill
      sh.telemetry.reprocess.mockResolvedValue({
        status: 'QUEUED',
        job_id: 'reprocess-20260817-001',
      });
      sh.telemetry.backfill.mockResolvedValue({
        status: 'SUCCESS',
        recovered_points: 24,
      });

      const reprocessRes = await orchestrator.telemetryReprocess({
        point_id: 1,
        start_date: gaps[0].start,
        end_date: gaps[0].end,
      });
      expect(reprocessRes.job_id).toBe('reprocess-20260817-001');

      // 4. Verify Counter Reset Logs
      sh.counterResets.list.mockResolvedValue([
        { id: 1, point_id: 1, reason: 'Power outage recovery', timestamp: '2026-08-13T09:55:00Z' },
      ]);

      const resetLogs = await orchestrator.counterResets.list({ point_id: 1 });
      expect(resetLogs).toHaveLength(1);
      expect(resetLogs[0].reason).toBe('Power outage recovery');

      // 5. Invalidate Cache & Fetch Fresh Records
      orchestrator.invalidatePointCache(1);
      const records = await orchestrator.ikPointRecords(1, { limit: 100 });
      expect(records.count).toBe(100);
    });
  });
});
