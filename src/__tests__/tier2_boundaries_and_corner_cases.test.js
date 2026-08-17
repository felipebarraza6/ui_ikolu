import { getAuthHeader, parseApiError } from '../api/sh/config';
import { dataCache, CacheKeys, withCache } from '../utils/dataCache';
import orchestrator from '../api/orchestrator';
import sh from '../api/sh/endpoints';

describe('Tier 2: Boundary, Corner Cases & Defensive Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataCache.clear();
  });

  describe('1. Authentication Header Parsing (JWT vs Token)', () => {
    it('returns empty string for null, undefined, or empty string token', () => {
      expect(getAuthHeader(null)).toBe('');
      expect(getAuthHeader(undefined)).toBe('');
      expect(getAuthHeader('')).toBe('');
    });

    it('identifies JWT format starting with eyJ and prefixes Bearer', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgN_pGMstzsS';
      expect(getAuthHeader(jwt)).toBe(`Bearer ${jwt}`);
    });

    it('identifies 3-segment dot-separated tokens as JWT and prefixes Bearer', () => {
      const customJwt = 'header.payload.signature';
      expect(getAuthHeader(customJwt)).toBe(`Bearer ${customJwt}`);
    });

    it('formats standard DRF alphanumeric tokens with Token prefix', () => {
      const drfToken = '9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b';
      expect(getAuthHeader(drfToken)).toBe(`Token ${drfToken}`);
    });

    it('cleanses surrounding quotes and whitespace from tokens', () => {
      const quotedJwt = '  "eyJhbGciOiJIUzI1NiJ9.payload.sig"  ';
      expect(getAuthHeader(quotedJwt)).toBe('Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig');

      const singleQuotedToken = "  'token12345' ";
      expect(getAuthHeader(singleQuotedToken)).toBe('Token token12345');
    });
  });

  describe('2. DRF Error Parsing (parseApiError)', () => {
    it('returns "Error desconocido" for empty error', () => {
      expect(parseApiError(null)).toBe('Error desconocido');
      expect(parseApiError(undefined)).toBe('Error desconocido');
    });

    it('handles network disconnection flag', () => {
      const netError = { isNetworkError: true };
      expect(parseApiError(netError)).toBe('Error de red: No se pudo conectar al servidor. Revisa tu conexión.');
    });

    it('handles authentication error flag', () => {
      const authError = { isAuthError: true };
      expect(parseApiError(authError)).toBe('Sesión expirada. Por favor, inicia sesión nuevamente.');
    });

    it('returns plain string response data directly', () => {
      const strError = { response: { data: '502 Bad Gateway: Proxy Timeout' } };
      expect(parseApiError(strError)).toBe('502 Bad Gateway: Proxy Timeout');
    });

    it('extracts detail, error, and message fields from DRF JSON responses', () => {
      expect(parseApiError({ response: { data: { detail: 'No tienes permisos.' } } })).toBe('No tienes permisos.');
      expect(parseApiError({ response: { data: { error: 'Punto no encontrado' } } })).toBe('Punto no encontrado');
      expect(parseApiError({ response: { data: { message: 'Operación no válida' } } })).toBe('Operación no válida');
    });

    it('formats field validation error arrays cleanly', () => {
      const fieldError = {
        response: {
          data: {
            email: ['Este campo es requerido.', 'Debe ser un email válido.'],
          },
        },
      };
      expect(parseApiError(fieldError)).toBe('email: Este campo es requerido., Debe ser un email válido.');
    });

    it('formats non_field_errors with "Error" prefix', () => {
      const nonFieldError = {
        response: {
          data: {
            non_field_errors: ['Credenciales inválidas para este usuario.'],
          },
        },
      };
      expect(parseApiError(nonFieldError)).toBe('Error: Credenciales inválidas para este usuario.');
    });

    it('falls back to error.message if no response data exists', () => {
      const genericError = new Error('Client timeout');
      expect(parseApiError(genericError)).toBe('Client timeout');
    });
  });

  describe('3. Batch Boundaries & Fallbacks', () => {
    it('returns empty result immediately for empty or null pointIds', async () => {
      const resEmpty = await orchestrator.getBatchTelemetry([]);
      expect(resEmpty).toEqual({ data: {}, meta: { requested: 0, returned: 0 } });

      const resNull = await orchestrator.getBatchTelemetry(null);
      expect(resNull).toEqual({ data: {}, meta: { requested: 0, returned: 0 } });

      const statsEmpty = await orchestrator.getBatchStats([]);
      expect(statsEmpty).toEqual({ data: {}, meta: { requested: 0, returned: 0 } });

      const summaryEmpty = await orchestrator.getBatchSummary([]);
      expect(summaryEmpty).toEqual({ data: {} });
    });

    it('slices pointIds to MAX_BATCH_SIZE (50) when requesting large batches', async () => {
      const manyPoints = Array.from({ length: 75 }, (_, i) => i + 1);
      const batchSpy = jest.spyOn(sh.batch, 'telemetry').mockResolvedValueOnce({
        data: {},
        meta: { requested: 50, returned: 50 },
      });

      await orchestrator.getBatchTelemetry(manyPoints, { useCache: false });
      expect(batchSpy).toHaveBeenCalledWith(manyPoints.slice(0, 50), 1);
      batchSpy.mockRestore();
    });

    it('falls back to individual summary calls if batch telemetry fails', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const batchSpy = jest.spyOn(sh.batch, 'telemetry').mockRejectedValueOnce(new Error('Batch 500 error'));
      const summarySpy = jest.spyOn(sh.ikPoint, 'summary').mockImplementation((id) =>
        Promise.resolve({ id, latest: { flow: id * 2 } })
      );

      const result = await orchestrator.getBatchTelemetry([101, 102], { useCache: false });
      expect(summarySpy).toHaveBeenCalledWith(101);
      expect(summarySpy).toHaveBeenCalledWith(102);
      expect(result.data[101].latest.flow).toBe(202);
      expect(result.data[102].latest.flow).toBe(204);
      expect(result.meta.requested).toBe(2);
      expect(result.meta.returned).toBe(2);

      batchSpy.mockRestore();
      summarySpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('4. Ticket Attachment Validation Boundaries', () => {
    it('throws error when no file is provided', async () => {
      await expect(sh.tickets.uploadAttachment(1, null)).rejects.toThrow('No se proporcionó ningún archivo.');
    });

    it('throws error for forbidden file extensions (.exe, .sh, .bat)', async () => {
      const invalidFile = { name: 'virus.exe', size: 1024 };
      await expect(sh.tickets.uploadAttachment(1, invalidFile)).rejects.toThrow(/Extensión no permitida: \.exe/);

      const scriptFile = { name: 'script.sh', size: 500 };
      await expect(sh.tickets.uploadAttachment(1, scriptFile)).rejects.toThrow(/Extensión no permitida: \.sh/);
    });

    it('throws error when file size exceeds 10MB limit', async () => {
      const oversizedFile = { name: 'manual_gigante.pdf', size: 11 * 1024 * 1024 };
      await expect(sh.tickets.uploadAttachment(1, oversizedFile)).rejects.toThrow(/El archivo excede el tamaño máximo permitido de 10 MB/);
    });
  });

  describe('5. DataCache TTL & Eviction Boundaries', () => {
    it('correctly manages TTL expiration and cache eviction', () => {
      const originalNow = Date.now;
      let currentTime = 1000000;
      global.Date.now = jest.fn(() => currentTime);

      // Store with 5000ms TTL
      dataCache.set('test_key', { data: 'sample' }, 5000);
      expect(dataCache.has('test_key')).toBe(true);
      expect(dataCache.get('test_key')).toEqual({ data: 'sample' });

      // Advance time past TTL
      currentTime += 5001;
      expect(dataCache.has('test_key')).toBe(false);
      expect(dataCache.get('test_key')).toBeNull();

      global.Date.now = originalNow;
    });

    it('invalidatePattern deletes only matching keys', () => {
      dataCache.set('profile_user_1', { name: 'User 1' });
      dataCache.set('profile_user_2', { name: 'User 2' });
      dataCache.set('settings_global', { theme: 'dark' });

      dataCache.invalidatePattern('profile_');
      expect(dataCache.get('profile_user_1')).toBeNull();
      expect(dataCache.get('profile_user_2')).toBeNull();
      expect(dataCache.get('settings_global')).toEqual({ theme: 'dark' });
    });

    it('getStats correctly reports valid and expired counts', () => {
      const originalNow = Date.now;
      let currentTime = 1000;
      global.Date.now = jest.fn(() => currentTime);

      dataCache.set('key1', 'v1', 5000); // valid until 6000
      dataCache.set('key2', 'v2', 2000); // valid until 3000

      currentTime = 4000; // key2 is expired, key1 is valid
      const stats = dataCache.getStats();
      expect(stats.total).toBe(2);
      expect(stats.valid).toBe(1);
      expect(stats.expired).toBe(1);

      global.Date.now = originalNow;
    });

    it('withCache executes fetcher only on cache miss and reuses cached value', async () => {
      const fetcher = jest.fn().mockResolvedValue({ id: 100 });
      const res1 = await withCache('user_100', fetcher, 10000);
      expect(res1).toEqual({ id: 100 });
      expect(fetcher).toHaveBeenCalledTimes(1);

      const res2 = await withCache('user_100', fetcher, 10000);
      expect(res2).toEqual({ id: 100 });
      expect(fetcher).toHaveBeenCalledTimes(1); // Not called again
    });

    it('withCache propagates errors and does not store bad values in cache', async () => {
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const failingFetcher = jest.fn().mockRejectedValue(new Error('DB Failed'));
      await expect(withCache('fail_key', failingFetcher)).rejects.toThrow('DB Failed');
      expect(dataCache.get('fail_key')).toBeNull();
      errSpy.mockRestore();
    });
  });
});
