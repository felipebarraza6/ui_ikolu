import sh from '../api/sh/endpoints';
import { Axios } from '../api/sh/config';


describe('Tier 1: DRF Endpoints Contract & Feature Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Axios.get.mockResolvedValue({ data: {} });
    Axios.post.mockResolvedValue({ data: {} });
    Axios.patch.mockResolvedValue({ data: {} });
    Axios.delete.mockResolvedValue({ data: {} });
  });

  describe('1. Authentication & User Management Domain', () => {
    it('sh.authenticated (login) successfully processes valid login response and strips catchment_points', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 1,
            email: 'admin@smarthydro.cl',
            username: 'admin',
            catchment_points: [{ id: 101, name: 'Pozo 1' }],
          },
          access_token: 'valid.jwt.token',
        },
      };
      Axios.post.mockResolvedValueOnce(mockResponse);

      const result = await sh.authenticated({ email: 'admin@smarthydro.cl', password: 'secretpassword' });
      
      expect(Axios.post).toHaveBeenCalledWith(
        'ik/login/',
        { email: 'admin@smarthydro.cl', password: 'secretpassword' },
        { _skipAuth: true }
      );
      expect(result.access_token).toBe('valid.jwt.token');
      expect(result.user.id).toBe(1);
      // Verify catchment_points is deleted for lazy loading
      expect(result.user.catchment_points).toBeUndefined();
    });

    it('sh.authenticated throws error when user or token is missing', async () => {
      Axios.post.mockResolvedValueOnce({
        data: { error: 'Invalid credentials' },
      });

      await expect(sh.authenticated({ email: 'bad@smarthydro.cl', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('sh.requestPasswordReset posts to ik/auth/password-reset/', async () => {
      Axios.post.mockResolvedValueOnce({ data: { message: 'Reset email sent' } });
      const res = await sh.requestPasswordReset('user@example.com');
      expect(Axios.post).toHaveBeenCalledWith('ik/auth/password-reset/', { email: 'user@example.com' });
      expect(res.message).toBe('Reset email sent');
    });

    it('sh.confirmPasswordReset posts to ik/auth/password-reset/confirm/', async () => {
      Axios.post.mockResolvedValueOnce({ data: { message: 'Password reset confirmed' } });
      const res = await sh.confirmPasswordReset('token123', 'newpass456');
      expect(Axios.post).toHaveBeenCalledWith('ik/auth/password-reset/confirm/', {
        token: 'token123',
        password: 'newpass456',
      });
      expect(res.message).toBe('Password reset confirmed');
    });

    it('sh.validatePasswordResetToken posts to ik/auth/password-reset/validate/', async () => {
      Axios.post.mockResolvedValueOnce({ data: { valid: true } });
      const res = await sh.validatePasswordResetToken('token-abc');
      expect(Axios.post).toHaveBeenCalledWith('ik/auth/password-reset/validate/', { token: 'token-abc' });
      expect(res.valid).toBe(true);
    });

    it('sh.getPublicAnnouncements fetches public announcements with limit', async () => {
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, title: 'Mantenimiento' }] });
      const res = await sh.getPublicAnnouncements(10);
      expect(Axios.get).toHaveBeenCalledWith('ik/announcements/public/?limit=10');
      expect(res).toHaveLength(1);
    });

    it('sh.me fetches current user profile from users/me/', async () => {
      Axios.get.mockResolvedValueOnce({ data: { id: 42, username: 'operator' } });
      const res = await sh.me();
      expect(Axios.get).toHaveBeenCalledWith('users/me/', {});
      expect(res.id).toBe(42);
    });

    it('sh.changePassword posts current and new password to users/change-password/', async () => {
      Axios.post.mockResolvedValueOnce({ data: { status: 'success' } });
      const res = await sh.changePassword('oldPwd', 'newPwd');
      expect(Axios.post).toHaveBeenCalledWith('users/change-password/', {
        current_password: 'oldPwd',
        new_password: 'newPwd',
      });
      expect(res.status).toBe('success');
    });

    it('sh.getUsers, sh.getUser, sh.createUser, sh.signupUser, sh.updateUser, sh.deleteUser', async () => {
      // getUsers with params
      Axios.get.mockResolvedValueOnce({ data: { results: [{ id: 1, username: 'test' }] } });
      await sh.getUsers({ role: 'admin' });
      expect(Axios.get).toHaveBeenCalledWith('users/?role=admin', {});

      // getUser
      Axios.get.mockResolvedValueOnce({ data: { id: 1, username: 'test' } });
      await sh.getUser('test');
      expect(Axios.get).toHaveBeenCalledWith('users/test/', {});

      // createUser
      Axios.post.mockResolvedValueOnce({ data: { id: 2, username: 'newuser' } });
      await sh.createUser({ username: 'newuser' });
      expect(Axios.post).toHaveBeenCalledWith('users/', { username: 'newuser' });

      // signupUser
      Axios.post.mockResolvedValueOnce({ data: { id: 3, username: 'selfsignup' } });
      await sh.signupUser({ username: 'selfsignup' });
      expect(Axios.post).toHaveBeenCalledWith('users/signup/', { username: 'selfsignup' });

      // updateUser
      Axios.patch.mockResolvedValueOnce({ data: { id: 1, first_name: 'Jane' } });
      await sh.updateUser('test', { first_name: 'Jane' });
      expect(Axios.patch).toHaveBeenCalledWith('users/test/', { first_name: 'Jane' });

      // deleteUser
      Axios.delete.mockResolvedValueOnce({ data: { success: true } });
      await sh.deleteUser('test');
      expect(Axios.delete).toHaveBeenCalledWith('users/test/');
    });

    it('sh.uploadAvatar and sh.updateNotifyEmailPreference', async () => {
      const mockFile = new Blob(['avatar content'], { type: 'image/png' });
      Axios.post.mockResolvedValueOnce({ data: { avatar_url: 'https://cdn.sh.cl/avatar.png' } });
      const avatarRes = await sh.uploadAvatar(mockFile);
      expect(Axios.post).toHaveBeenCalledWith(
        'users/me/avatar/',
        expect.any(FormData),
        expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
      );
      expect(avatarRes.avatar_url).toBe('https://cdn.sh.cl/avatar.png');

      Axios.post.mockResolvedValueOnce({ data: { notify_email: true } });
      const prefRes = await sh.updateNotifyEmailPreference(true);
      expect(Axios.post).toHaveBeenCalledWith('ik/me/notify-email/', { notify_email: true });
      expect(prefRes.notify_email).toBe(true);
    });

    it('sh.admin.staffUsers fetches staff list from ik/staff_users/', async () => {
      Axios.get.mockResolvedValueOnce({ data: [{ id: 5, username: 'tech_support' }] });
      const res = await sh.admin.staffUsers();
      expect(Axios.get).toHaveBeenCalledWith('ik/staff_users/', {});
      expect(res[0].username).toBe('tech_support');
    });
  });

  describe('2. Puntos de Captación Domain', () => {
    it('sh.points.list handles filter params and mine: true redirection', async () => {
      // standard list
      Axios.get.mockResolvedValueOnce({ data: { count: 1, results: [{ id: 10 }] } });
      await sh.points.list({ project: 5, search: 'Pozo', page: 1, page_size: 20 });
      expect(Axios.get).toHaveBeenCalledWith('catchment_point/?project=5&search=Pozo&page=1&page_size=20', {});

      // mine: true
      Axios.get.mockResolvedValueOnce({ data: [{ id: 10, name: 'Mi Pozo' }] });
      const mineRes = await sh.points.list({ mine: true });
      expect(Axios.get).toHaveBeenCalledWith('ik/my_points/', {});
      expect(mineRes).toHaveLength(1);
    });

    it('sh.points.get, create, update, delete perform exact DRF calls', async () => {
      Axios.get.mockResolvedValueOnce({ data: { id: 10, name: 'Pozo Central' } });
      await sh.points.get(10);
      expect(Axios.get).toHaveBeenCalledWith('catchment_point/10/', {});

      Axios.post.mockResolvedValueOnce({ data: { id: 11, name: 'Pozo Nuevo' } });
      await sh.points.create({ name: 'Pozo Nuevo' });
      expect(Axios.post).toHaveBeenCalledWith('catchment_point/', { name: 'Pozo Nuevo' });

      Axios.patch.mockResolvedValueOnce({ data: { id: 11, name: 'Pozo Modificado' } });
      await sh.points.update(11, { name: 'Pozo Modificado' });
      expect(Axios.patch).toHaveBeenCalledWith('catchment_point/11/', { name: 'Pozo Modificado' });

      Axios.delete.mockResolvedValueOnce({ data: { success: true } });
      await sh.points.delete(11);
      expect(Axios.delete).toHaveBeenCalledWith('catchment_point/11/');
    });

    it('sh.points.records and sh.ikPoint.records pass date ranges and limit query parameters', async () => {
      Axios.get.mockResolvedValueOnce({ data: { count: 50, results: [] } });
      await sh.points.records(10, { startDate: '2026-08-01', endDate: '2026-08-10', limit: 50, hours: 24 });
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/records/?start_date=2026-08-01&end_date=2026-08-10&limit=50&hours=24', {});

      Axios.get.mockResolvedValueOnce({ data: { count: 20, results: [] } });
      await sh.ikPoint.records(10, { startDate: '2026-08-01', endDate: '2026-08-02', limit: 20 });
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/records/?start_date=2026-08-01&end_date=2026-08-02&limit=20', {});
    });

    it('sh.points.latest, variables, summary, status, config, configUpdate', async () => {
      Axios.get.mockResolvedValueOnce({ data: { latest_flow: 12.5 } });
      await sh.points.latest(10);
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/summary/', {});

      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Caudal' }] });
      await sh.points.variables(10);
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/variables/', {});

      Axios.get.mockResolvedValueOnce({ data: { id: 10, name: 'Pozo Summary' } });
      await sh.points.summary(10);
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/summary/', {});

      Axios.get.mockResolvedValueOnce({ data: { results: [{ id: 10, online: true }] } });
      await sh.points.status(10, 60);
      expect(Axios.get).toHaveBeenCalledWith('management/points_status/?threshold_minutes=60', {});

      Axios.get.mockResolvedValueOnce({ data: { d1: 100, d2: 80 } });
      await sh.points.config(10);
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/config/', {});

      Axios.patch.mockResolvedValueOnce({ data: { d1: 120 } });
      await sh.points.configUpdate(10, { d1: 120 });
      expect(Axios.patch).toHaveBeenCalledWith('ik/point/10/config/', { d1: 120 });
    });

    it('sh.points.batchStatus handles non-empty and empty lists', async () => {
      // non-empty
      Axios.post.mockResolvedValueOnce({ data: { 10: { online: true }, 20: { online: false } } });
      const res = await sh.points.batchStatus([10, 20], 15);
      expect(Axios.post).toHaveBeenCalledWith('ik/batch/stats/', { point_ids: [10, 20], days: 15 });
      expect(res[10].online).toBe(true);

      // empty
      const emptyRes = await sh.points.batchStatus([]);
      expect(emptyRes).toEqual({ count: 0, statuses: {} });
    });

    it('sh.ikPoint methods: summary, config, variables, calendar, gaps', async () => {
      Axios.get.mockResolvedValueOnce({ data: { id: 10 } });
      await sh.ikPoint.summary(10);
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/summary/', {});

      Axios.get.mockResolvedValueOnce({ data: { d1: 50 } });
      await sh.ikPoint.config(10);
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/config/', {});

      Axios.get.mockResolvedValueOnce({ data: ['flow', 'level'] });
      await sh.ikPoint.variables(10);
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/variables/', {});

      Axios.get.mockResolvedValueOnce({ data: { days: 14, metrics: [] } });
      await sh.ikPoint.calendar(10, 14);
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/calendar/?days=14', {});

      Axios.get.mockResolvedValueOnce({ data: { gaps: [] } });
      await sh.ikPoint.gaps(10, { start_date: '2026-08-01', end_date: '2026-08-15' });
      expect(Axios.get).toHaveBeenCalledWith('ik/point/10/gaps/?start_date=2026-08-01&end_date=2026-08-15', {});
    });
  });

  describe('3. Telemetría & Batch Domain', () => {
    it('sh.batch methods: telemetry, stats, summary call native batch endpoints', async () => {
      Axios.post.mockResolvedValueOnce({ data: { telemetry: {} } });
      await sh.batch.telemetry([1, 2, 3], 6);
      expect(Axios.post).toHaveBeenCalledWith('ik/batch/telemetry/', { point_ids: [1, 2, 3], hours: 6 });

      Axios.post.mockResolvedValueOnce({ data: { stats: {} } });
      await sh.batch.stats([1, 2], 7);
      expect(Axios.post).toHaveBeenCalledWith('ik/batch/stats/', { point_ids: [1, 2], days: 7 });

      Axios.post.mockResolvedValueOnce({ data: { summary: {} } });
      await sh.batch.summary([1, 2]);
      expect(Axios.post).toHaveBeenCalledWith('ik/batch/summary/', { point_ids: [1, 2] });
    });

    it('sh.telemetry.backfill and reprocess', async () => {
      Axios.post.mockResolvedValueOnce({ data: { queued: true } });
      await sh.telemetry.backfill({ point_id: 10, start: '2026-01-01' });
      expect(Axios.post).toHaveBeenCalledWith('ik/telemetry/backfill/', { point_id: 10, start: '2026-01-01' });

      Axios.post.mockResolvedValueOnce({ data: { job_id: 'job-999' } });
      await sh.telemetry.reprocess({ point_id: 10, force: true });
      expect(Axios.post).toHaveBeenCalledWith('telemetry-reprocessor/', { point_id: 10, force: true });
    });

    it('sh.counterResets.list and get', async () => {
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, reset_at: '2026-08-10' }] });
      await sh.counterResets.list({ point_id: 10 });
      expect(Axios.get).toHaveBeenCalledWith('counter_reset_logs/?point_id=10', {});

      Axios.get.mockResolvedValueOnce({ data: { id: 1, reset_at: '2026-08-10' } });
      await sh.counterResets.get(1);
      expect(Axios.get).toHaveBeenCalledWith('counter_reset_logs/1/', {});
    });
  });

  describe('4. Centro de Control Domain', () => {
    it('sh.controlCenter endpoints: dailySummary, dashboardStats, generalStats, projectPoints, list', async () => {
      Axios.get.mockResolvedValueOnce({ data: { kpis: {} } });
      await sh.dailySummary('2026-08-17');
      expect(Axios.get).toHaveBeenCalledWith('ik/daily_summary/?date=2026-08-17', {});

      Axios.get.mockResolvedValueOnce({ data: { total_points: 15 } });
      await sh.dashboardStats();
      expect(Axios.get).toHaveBeenCalledWith('ik/dashboard_stats/', {});

      Axios.get.mockResolvedValueOnce({ data: { overview: {} } });
      await sh.controlCenterGeneralStats();
      expect(Axios.get).toHaveBeenCalledWith('ik/control_center/general_stats/', {});

      Axios.get.mockResolvedValueOnce({ data: { days: [] } });
      await sh.controlCenterDailySummary({ start_date: '2026-08-01', end_date: '2026-08-07', project_id: 2 });
      expect(Axios.get).toHaveBeenCalledWith('ik/control_center/daily_summary/?start_date=2026-08-01&end_date=2026-08-07&project_id=2', {});

      Axios.get.mockResolvedValueOnce({ data: { points: [{ id: 101 }] } });
      await sh.controlCenterProjectPoints(2);
      expect(Axios.get).toHaveBeenCalledWith('ik/control_center/project_points/?project_id=2', {});

      Axios.get.mockResolvedValueOnce({ data: { count: 10, results: [] } });
      await sh.controlCenterList({ date: '2026-08-17', project_id: 2, page: 1, page_size: 15, order_by: 'name' });
      expect(Axios.get).toHaveBeenCalledWith('ik/control_center/list/?date=2026-08-17&project_id=2&page=1&page_size=15&order_by=name', {});
    });

    it('sh.controlCenterSystemEvents and systemEventsByPoint', async () => {
      Axios.get.mockResolvedValueOnce({ data: { results: [] } });
      await sh.controlCenterSystemEvents({ severity: 'ERROR', search: 'pump' });
      expect(Axios.get).toHaveBeenCalledWith('ik/control_center/system_events/?severity=ERROR&search=pump', {});

      Axios.get.mockResolvedValueOnce({ data: { results: [] } });
      await sh.controlCenterSystemEventsByPoint(10, { severity: 'WARN' });
      expect(Axios.get).toHaveBeenCalledWith('ik/control_center/system_events/10/?severity=WARN', {});
    });

    it('sh.chat posts to ik/chat/client/general_stats/', async () => {
      Axios.post.mockResolvedValueOnce({ data: { reply: 'El caudal promedio es 15 l/s' } });
      const res = await sh.chat('¿Cuál es el caudal promedio?');
      expect(Axios.post).toHaveBeenCalledWith('ik/chat/client/general_stats/', { message: '¿Cuál es el caudal promedio?' });
      expect(res.reply).toContain('caudal promedio');
    });
  });

  describe('5. Cumplimiento DGA / SMA Domain', () => {
    it('sh.compliance, complianceList, toggleCompliance, flowHistory, nearLimitHistory', async () => {
      Axios.get.mockResolvedValueOnce({ data: { compliant_points: 18 } });
      await sh.compliance();
      expect(Axios.get).toHaveBeenCalledWith('ik/compliance/', {});

      Axios.get.mockResolvedValueOnce({ data: { count: 3, results: [] } });
      await sh.complianceList({ warning_level: 'HIGH', standard: 'MAYOR' });
      expect(Axios.get).toHaveBeenCalledWith('ik/compliance/?warning_level=HIGH&standard=MAYOR', {});

      Axios.post.mockResolvedValueOnce({ data: { point_id: 10, enabled: true } });
      await sh.toggleCompliance(10, true);
      expect(Axios.post).toHaveBeenCalledWith('ik/management/toggle_compliance/', { point_id: 10, enabled: true });

      Axios.get.mockResolvedValueOnce({ data: { results: [] } });
      await sh.flowHistory(10, { days: 60, page: 2, page_size: 10 });
      expect(Axios.get).toHaveBeenCalledWith('ik/compliance/10/flow_history/?days=60&page=2&page_size=10', {});

      Axios.get.mockResolvedValueOnce({ data: { results: [] } });
      await sh.nearLimitHistory(10, { days: 45, page: 1, page_size: 25 });
      expect(Axios.get).toHaveBeenCalledWith('ik/compliance/10/near_limit/?days=45&page=1&page_size=25', {});
    });

    it('sh.dgaConfigs CRUD operations', async () => {
      Axios.get.mockResolvedValueOnce({ data: { results: [{ id: 1 }] } });
      await sh.dgaConfigs.list({ point_catchment: 10 });
      expect(Axios.get).toHaveBeenCalledWith('dga_data_config_catchment/?point_catchment=10', {});

      Axios.get.mockResolvedValueOnce({ data: { id: 1 } });
      await sh.dgaConfigs.get(1);
      expect(Axios.get).toHaveBeenCalledWith('dga_data_config_catchment/1/', {});

      Axios.post.mockResolvedValueOnce({ data: { id: 2, point_catchment: 12 } });
      await sh.dgaConfigs.create({ point_catchment: 12 });
      expect(Axios.post).toHaveBeenCalledWith('dga_data_config_catchment/', { point_catchment: 12 });

      Axios.patch.mockResolvedValueOnce({ data: { id: 2, code_work: 'OBRA-99' } });
      await sh.dgaConfigs.update(2, { code_work: 'OBRA-99' });
      expect(Axios.patch).toHaveBeenCalledWith('dga_data_config_catchment/2/', { code_work: 'OBRA-99' });

      Axios.delete.mockResolvedValueOnce({ data: { success: true } });
      await sh.dgaConfigs.delete(2);
      expect(Axios.delete).toHaveBeenCalledWith('dga_data_config_catchment/2/');
    });
  });

  describe('6. Motor de Alertas Domain', () => {
    it('sh.alerts.rules CRUD', async () => {
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Regla Caudal Alto' }] });
      await sh.alerts.rules.get({ is_active: true });
      expect(Axios.get).toHaveBeenCalledWith('alert_rules/?is_active=true', {});

      Axios.get.mockResolvedValueOnce({ data: { id: 1 } });
      await sh.alerts.rules.getById(1);
      expect(Axios.get).toHaveBeenCalledWith('alert_rules/1/', {});

      Axios.post.mockResolvedValueOnce({ data: { id: 2, name: 'Regla Nivel Bajo' } });
      await sh.alerts.rules.create({ name: 'Regla Nivel Bajo' });
      expect(Axios.post).toHaveBeenCalledWith('alert_rules/', { name: 'Regla Nivel Bajo' });

      Axios.patch.mockResolvedValueOnce({ data: { id: 2, threshold: 5.0 } });
      await sh.alerts.rules.update(2, { threshold: 5.0 });
      expect(Axios.patch).toHaveBeenCalledWith('alert_rules/2/', { threshold: 5.0 });

      Axios.delete.mockResolvedValueOnce({ data: { success: true } });
      await sh.alerts.rules.delete(2);
      expect(Axios.delete).toHaveBeenCalledWith('alert_rules/2/');
    });

    it('sh.alerts.channels CRUD and triggers acknowledge', async () => {
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, channel_type: 'EMAIL' }] });
      await sh.alerts.channels.get();
      expect(Axios.get).toHaveBeenCalledWith('alert_channels/', {});

      Axios.post.mockResolvedValueOnce({ data: { id: 2, channel_type: 'SMS' } });
      await sh.alerts.channels.create({ channel_type: 'SMS' });
      expect(Axios.post).toHaveBeenCalledWith('alert_channels/', { channel_type: 'SMS' });

      Axios.patch.mockResolvedValueOnce({ data: { id: 2, destination: '+56912345678' } });
      await sh.alerts.channels.update(2, { destination: '+56912345678' });
      expect(Axios.patch).toHaveBeenCalledWith('alert_channels/2/', { destination: '+56912345678' });

      Axios.delete.mockResolvedValueOnce({ data: { success: true } });
      await sh.alerts.channels.delete(2);
      expect(Axios.delete).toHaveBeenCalledWith('alert_channels/2/');

      // triggers
      Axios.get.mockResolvedValueOnce({ data: [{ id: 50, is_acknowledged: false }] });
      await sh.alerts.triggers.get({ is_acknowledged: false });
      expect(Axios.get).toHaveBeenCalledWith('alert_triggers/?is_acknowledged=false', {});

      Axios.patch.mockResolvedValueOnce({ data: { id: 50, is_acknowledged: true } });
      await sh.alerts.triggers.acknowledge(50);
      expect(Axios.patch).toHaveBeenCalledWith('alert_triggers/50/', { is_acknowledged: true });
    });
  });

  describe('7. Soporte Técnico / Tickets Domain', () => {
    it('sh.tickets CRUD, assignment, status change, scheduling', async () => {
      Axios.get.mockResolvedValueOnce({ data: { results: [{ id: 100, title: 'Falla sensor' }] } });
      await sh.tickets.get({ status: ['OPEN', 'IN_PROGRESS'] });
      expect(Axios.get).toHaveBeenCalledWith('ik/tickets/?status=OPEN&status=IN_PROGRESS', {});

      Axios.get.mockResolvedValueOnce({ data: { id: 100 } });
      await sh.tickets.getById(100);
      expect(Axios.get).toHaveBeenCalledWith('ik/tickets/100/', {});

      Axios.post.mockResolvedValueOnce({ data: { id: 101, title: 'Nuevo ticket' } });
      await sh.tickets.create({ title: 'Nuevo ticket' });
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/', { title: 'Nuevo ticket' });

      Axios.patch.mockResolvedValueOnce({ data: { id: 101, priority: 'HIGH' } });
      await sh.tickets.update(101, { priority: 'HIGH' });
      expect(Axios.patch).toHaveBeenCalledWith('ik/tickets/101/', { priority: 'HIGH' });

      Axios.delete.mockResolvedValueOnce({ data: { success: true } });
      await sh.tickets.delete(101);
      expect(Axios.delete).toHaveBeenCalledWith('ik/tickets/101/');

      // assign
      Axios.post.mockResolvedValueOnce({ data: { id: 100, assigned_to: 5 } });
      await sh.tickets.assign(100, 5);
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/100/assign/', { assigned_to: 5 });

      // changeStatus
      Axios.post.mockResolvedValueOnce({ data: { id: 100, status: 'RESOLVED' } });
      await sh.tickets.changeStatus(100, 'RESOLVED', 'CORRECTIVE_MAINTENANCE');
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/100/status/', {
        status: 'RESOLVED',
        work_order_category: 'CORRECTIVE_MAINTENANCE',
      });

      // schedule confirm / cancel
      Axios.post.mockResolvedValueOnce({ data: { id: 100, scheduled_confirmed: true } });
      await sh.tickets.confirmScheduledDate(100);
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/100/confirm-scheduled-date/', undefined);

      Axios.post.mockResolvedValueOnce({ data: { id: 100, scheduled_cancelled: true } });
      await sh.tickets.cancelScheduledDate(100, 'Lluvia intensa');
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/100/cancel-scheduled-date/', { reason: 'Lluvia intensa' });
    });

    it('sh.tickets comments and notifications', async () => {
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, text: 'Revisado en terreno' }] });
      await sh.tickets.getComments(100, 2);
      expect(Axios.get).toHaveBeenCalledWith('ik/tickets/100/comments/?page=2', {});

      Axios.post.mockResolvedValueOnce({ data: { id: 2, text: 'Comentario nuevo' } });
      await sh.tickets.createComment(100, { text: 'Comentario nuevo' });
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/100/comments/', { text: 'Comentario nuevo' });

      Axios.delete.mockResolvedValueOnce({ data: { success: true } });
      await sh.tickets.deleteComment(100, 2);
      expect(Axios.delete).toHaveBeenCalledWith('ik/tickets/100/comments/2/');

      Axios.patch.mockResolvedValueOnce({ data: { id: 2, text: 'Comentario editado' } });
      await sh.tickets.updateComment(100, 2, { text: 'Comentario editado' });
      expect(Axios.patch).toHaveBeenCalledWith('ik/tickets/100/comments/2/', { text: 'Comentario editado' });

      Axios.post.mockResolvedValueOnce({ data: { id: 2, likes_count: 3 } });
      await sh.tickets.likeComment(100, 2);
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/100/comments/2/like/', undefined);

      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Juan' }] });
      await sh.tickets.getMentionableUsers(100);
      expect(Axios.get).toHaveBeenCalledWith('ik/tickets/100/mentionable_users/', {});

      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, unread: true }] });
      await sh.tickets.getNotifications({ unread: true });
      expect(Axios.get).toHaveBeenCalledWith('ik/tickets/notifications/?unread=true', {});

      Axios.post.mockResolvedValueOnce({ data: { marked: 2 } });
      await sh.tickets.markNotificationsRead({ ids: [1, 2] });
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/notifications/mark-read/', { ids: [1, 2] });
    });

    it('sh.tickets tasks CRUD, categories, slaConfigs, convertToClient', async () => {
      // tasks
      Axios.get.mockResolvedValueOnce({ data: { results: [{ id: 1, task_name: 'Calibrar' }] } });
      await sh.tickets.tasks.get(100, 1);
      expect(Axios.get).toHaveBeenCalledWith('ik/tickets/100/tasks/?page=1', {});

      Axios.post.mockResolvedValueOnce({ data: { id: 2, task_name: 'Revisar cable' } });
      await sh.tickets.tasks.create(100, { task_name: 'Revisar cable' });
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/100/tasks/', { task_name: 'Revisar cable' });

      Axios.get.mockResolvedValueOnce({ data: { id: 2, task_name: 'Revisar cable' } });
      await sh.tickets.tasks.getById(2);
      expect(Axios.get).toHaveBeenCalledWith('ik/tasks/2/', {});

      Axios.patch.mockResolvedValueOnce({ data: { id: 2, is_completed: true } });
      await sh.tickets.tasks.update(2, { is_completed: true });
      expect(Axios.patch).toHaveBeenCalledWith('ik/tasks/2/', { is_completed: true });

      Axios.delete.mockResolvedValueOnce({ data: { success: true } });
      await sh.tickets.tasks.delete(2);
      expect(Axios.delete).toHaveBeenCalledWith('ik/tasks/2/');

      // categories
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Hardware' }] });
      await sh.tickets.categories.get();
      expect(Axios.get).toHaveBeenCalledWith('ik/ticket-categories/', {});

      // slaConfigs
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, priority: 'CRITICAL', response_time_hours: 2 }] });
      await sh.tickets.slaConfigs.get();
      expect(Axios.get).toHaveBeenCalledWith('ik/sla-configs/', {});

      // convertToClient
      Axios.post.mockResolvedValueOnce({ data: { client_id: 88, success: true } });
      const convRes = await sh.tickets.convertToClient(100);
      expect(Axios.post).toHaveBeenCalledWith('ik/tickets/100/convert-to-client/', undefined);
      expect(convRes.client_id).toBe(88);
    });
  });

  describe('8. Gestión del Sistema, Catálogos & Reportes Domain', () => {
    it('sh.management endpoints execute correct backend paths', async () => {
      Axios.get.mockResolvedValueOnce({ data: { healthy: true } });
      await sh.management.systemStatus();
      expect(Axios.get).toHaveBeenCalledWith('management/system_status/', {});

      Axios.get.mockResolvedValueOnce({ data: { nodes: [] } });
      await sh.management.systemMap();
      expect(Axios.get).toHaveBeenCalledWith('management/system_map/', {});

      Axios.get.mockResolvedValueOnce({ data: { cpu: 12, memory: 45 } });
      await sh.management.resourcesStatus();
      expect(Axios.get).toHaveBeenCalledWith('management/resources_status/', {});

      Axios.get.mockResolvedValueOnce({ data: { results: [] } });
      await sh.management.telemetryMetrics({ days: 7 });
      expect(Axios.get).toHaveBeenCalledWith('management/telemetry_metrics/?days=7', {});

      Axios.post.mockResolvedValueOnce({ data: { point_id: 10, enabled: true } });
      await sh.management.toggleTelemetry(10, true);
      expect(Axios.post).toHaveBeenCalledWith('management/toggle_telemetry/', { point_id: 10, enabled: true });

      Axios.get.mockResolvedValueOnce({ data: { pending_count: 5 } });
      await sh.management.dgaQueueStatus();
      expect(Axios.get).toHaveBeenCalledWith('management/dga_queue_status/', {});

      Axios.post.mockResolvedValueOnce({ data: { cleared: 5 } });
      await sh.management.clearDgaQueue({ older_than_days: 30 });
      expect(Axios.post).toHaveBeenCalledWith('management/clear_dga_queue/', { older_than_days: 30 });

      Axios.post.mockResolvedValueOnce({ data: { requeued: 3 } });
      await sh.management.requeueDga({ queue_ids: [1, 2, 3] });
      expect(Axios.post).toHaveBeenCalledWith('management/requeue_dga/', { queue_ids: [1, 2, 3] });

      Axios.post.mockResolvedValueOnce({ data: { point_id: 10, frequency: 15 } });
      await sh.management.updatePointFrequency(10, 15);
      expect(Axios.post).toHaveBeenCalledWith('management/update_point_frequency/', { point_id: 10, frequency: 15 });

      Axios.get.mockResolvedValueOnce({ data: { summary: {} } });
      await sh.management.notificationsSummary(14);
      expect(Axios.get).toHaveBeenCalledWith('management/notifications_summary/?days=14', {});
    });

    it('sh.reports JSON formats call correct endpoints', async () => {
      Axios.get.mockResolvedValueOnce({ data: { project_report: [] } });
      await sh.reports.jsonByProject(5, '10,11');
      expect(Axios.get).toHaveBeenCalledWith('reports/json/by-project/?project_id=5&point_ids=10%2C11', {});

      Axios.get.mockResolvedValueOnce({ data: { point_report: [] } });
      await sh.reports.jsonByPoint(10, 2026, 8);
      expect(Axios.get).toHaveBeenCalledWith('reports/json/by-point/?point_id=10&year=2026&month=8', {});

      Axios.get.mockResolvedValueOnce({ data: { last_month: [] } });
      await sh.reports.jsonLastMonth();
      expect(Axios.get).toHaveBeenCalledWith('reports/json/last-month/', {});

      Axios.get.mockResolvedValueOnce({ data: { last_year: [] } });
      await sh.reports.jsonLastYear();
      expect(Axios.get).toHaveBeenCalledWith('reports/json/last-year/', {});

      Axios.get.mockResolvedValueOnce({ data: { annual: [] } });
      await sh.reports.jsonAnnualCompressed();
      expect(Axios.get).toHaveBeenCalledWith('reports/json/annual-compressed/', {});
    });

    it('Master catalogs: clients, projects, variables, schemes, providers', async () => {
      // clients
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Agrícola Norte' }] });
      await sh.admin.clients();
      expect(Axios.get).toHaveBeenCalledWith('client/', {});

      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Client with project' }] });
      await sh.admin.clientsWithProjects();
      expect(Axios.get).toHaveBeenCalledWith('client/with-projects/', {});

      // projects
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Fundo 1' }] });
      await sh.admin.projects();
      expect(Axios.get).toHaveBeenCalledWith('project_catchments/', {});

      Axios.get.mockResolvedValueOnce({ data: [{ id: 10, name: 'Pozo Proyecto' }] });
      await sh.admin.pointsByProject(1);
      expect(Axios.get).toHaveBeenCalledWith('catchment_point/all/?project=1', {});

      // variables
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Nivel Freático' }] });
      await sh.getVariables();
      expect(Axios.get).toHaveBeenCalledWith('variable/', {});

      // schemes
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Esquema Estándar' }] });
      await sh.getSchemes();
      expect(Axios.get).toHaveBeenCalledWith('schemes_catchment/', {});

      // providers
      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Entel IoT' }] });
      await sh.getTelemetryProviders();
      expect(Axios.get).toHaveBeenCalledWith('telemetry_providers/', {});

      Axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'DGA Direct' }] });
      await sh.getComplianceProviders();
      expect(Axios.get).toHaveBeenCalledWith('compliance_providers/', {});
    });
  });
});
