import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import sh from '../../../api/sh/endpoints';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Hook para gestionar tickets de soporte en modo admin (SLA Dashboard)
 *
 * IMPORTANTE: Solo trabaja con type_notification="SUPPORT".
 * Las notificaciones type="WARNING" son advertencias y se ignoran aqui.
 *
 * Endpoints usados segun MANUAL_API_FRONTEND.md:
 * - GET /api/notifications_catchment/?type_notification=SUPPORT
 * - GET /api/notifications_catchment/{id}/ (incluye stats)
 * - POST /api/response_notifications_catchment/ (comentarios)
 * - PATCH /api/notifications_catchment/{id}/ (actualizar estado)
 */

const TYPE_SUPPORT = 'SUPPORT';

// Mock data realista para demostracion (ultimo recurso)
const generateMockTickets = () => {
  const now = dayjs();
  const points = [
    { id: 1, title: 'Pozo A', project: 'Proyecto Norte', client: 'Minera Valle' },
    { id: 2, title: 'Pozo B', project: 'Proyecto Norte', client: 'Minera Valle' },
    { id: 3, title: 'Captacion Rio', project: 'Proyecto Sur', client: 'AgroSur' },
    { id: 4, title: 'Pozo C', project: 'Proyecto Este', client: 'AguaClara' },
    { id: 5, title: 'Pozo D', project: 'Proyecto Oeste', client: 'Minera Valle' },
    { id: 6, title: 'Captacion Lago', project: 'Proyecto Sur', client: 'AgroSur' },
    { id: 7, title: 'Pozo E', project: 'Proyecto Este', client: 'AguaClara' },
    { id: 8, title: 'Pozo F', project: 'Proyecto Norte', client: 'Minera Valle' },
  ];

  const titles = [
    'Caudal irregular detectado',
    'Sensor de nivel desconectado',
    'No hay datos desde ayer',
    'Error en envio DGA',
    'Solicitud de ajuste de frecuencia',
    'Alerta de caudal excedido',
    'Problema con totalizador',
    'GPS sin senal',
    'Duda sobre lectura de caudal medio',
    'Solicitud de reporte mensual',
    'Error en calculo de consumo',
    'Nivel freatico bajo umbral',
  ];

  const messages = [
    'El caudal muestra valores inconsistentes desde las 14:00 hrs.',
    'El sensor no ha enviado datos en las ultimas 6 horas.',
    'No se registran datos desde el dia anterior. Verificar conectividad.',
    'El ultimo envio a la DGA fallo con error 500.',
    'Se requiere cambiar la frecuencia de medicion a 5 minutos.',
    'El caudal actual supera el maximo autorizado por la DGA.',
    'El valor del totalizador no coincide con el calculo manual.',
    'Las coordenadas GPS no se han actualizado en 48 horas.',
    'Necesito entender por que el caudal medio es diferente al instantaneo.',
    'Por favor generar el reporte de consumo del mes de abril.',
    'La suma de consumos del dia no coincide con el totalizador.',
    'El nivel freatico ha bajado por debajo del umbral establecido.',
  ];

  const variables = ['NIVEL', 'CAUDAL', 'CAUDAL PROMEDIO', 'TOTALIZADO', 'TODOS'];

  const tickets = [];

  const configs = [
    { count: 4, is_read: false, is_wait: false, is_active: true, is_finish: false, daysAgoRange: [0, 2] },
    { count: 3, is_read: true, is_wait: true, is_active: true, is_finish: false, daysAgoRange: [1, 5] },
    { count: 5, is_read: true, is_wait: false, is_active: true, is_finish: false, daysAgoRange: [2, 10] },
    { count: 6, is_read: true, is_wait: false, is_active: false, is_finish: true, daysAgoRange: [5, 30] },
  ];

  const priorities = ['low', 'medium', 'high', 'critical'];
  const categories = ['back', 'hard'];
  const sources = ['internal', 'client'];
  const mockUsers = [
    { id: 1, username: 'soporte.ikolu' },
    { id: 2, username: 'admin' },
    { id: 3, username: 'tecnico1' },
  ];

  let idCounter = 100;

  configs.forEach((config) => {
    for (let i = 0; i < config.count; i++) {
      const point = points[Math.floor(Math.random() * points.length)];
      const titleIdx = Math.floor(Math.random() * titles.length);
      const daysAgo = config.daysAgoRange[0] + Math.floor(Math.random() * (config.daysAgoRange[1] - config.daysAgoRange[0] + 1));
      const created = now.subtract(daysAgo, 'day').subtract(Math.floor(Math.random() * 24), 'hour').toISOString();

      const responses = [];
      if (config.is_read) {
        const firstResponseAt = dayjs(created).add(Math.floor(Math.random() * 24) + 1, 'hour').toISOString();
        responses.push({
          id: idCounter + 1000,
          response: 'Hemos recibido su ticket y estamos revisando el problema.',
          user: { id: 1, username: 'soporte.ikolu' },
          created: firstResponseAt,
          is_email: Math.random() > 0.5,
        });
      }
      if (config.is_finish) {
        const resolvedAt = dayjs(created).add(daysAgo * 0.7, 'day').toISOString();
        responses.push({
          id: idCounter + 1001,
          response: 'Problema resuelto. Por favor verificar y confirmar.',
          user: { id: 1, username: 'soporte.ikolu' },
          created: resolvedAt,
          is_email: false,
        });
      }

      const responseCount = responses.length + Math.floor(Math.random() * 15);
      const assignedUser = Math.random() > 0.3 ? mockUsers[Math.floor(Math.random() * mockUsers.length)] : null;
      tickets.push({
        id: idCounter++,
        title: titles[titleIdx],
        message: messages[titleIdx],
        point_catchment: point.id,
        point_title: point.title,
        project: point.project,
        client: point.client,
        type_notification: TYPE_SUPPORT,
        type_variable: variables[Math.floor(Math.random() * variables.length)],
        type_alert: 'SOPORTE',
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        assigned_to: assignedUser,
        is_periodic: false,
        is_read: config.is_read,
        is_wait: config.is_wait,
        is_active: config.is_active,
        is_finish: config.is_finish,
        is_response: responses.length > 0,
        status_dga: 'PENDING',
        status_sma: 'PENDING',
        emails: [],
        start_date: dayjs(created).format('YYYY-MM-DD'),
        end_date: null,
        created: created,
        modified: created,
        user: { id: Math.floor(Math.random() * 10) + 1, username: `cliente${Math.floor(Math.random() * 10) + 1}` },
        responses: responses,
        response_count: responseCount,
      });
    }
  });

  return tickets;
};

export const useSlaTickets = (options = {}) => {
  const { autoRefresh = false, refreshInterval = 60000 } = options;

  const [tickets, setTickets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      let allTickets = [];
      let usedRealData = false;

      // ESTRATEGIA 1: Cargar SOLO tickets SUPPORT (ignorar ALERT)
      try {
        const allSupport = await sh.notifications.getAllByType(TYPE_SUPPORT, 1);
        if (allSupport?.results?.length > 0) {
          // Doble filtro: asegurar que solo sean SUPPORT
          allTickets = allSupport.results
            .filter(t => t.type_notification === TYPE_SUPPORT)
            .map(t => enrichTicket(t));
          usedRealData = true;
          // Guardar count real del backend (total paginado)
          if (isMountedRef.current) setTotalCount(allSupport.count || allTickets.length);
          console.log('[SLA] Tickets SUPPORT reales cargados:', allTickets.length, 'de', allSupport.count || allTickets.length);
        }
      } catch (e) {
        console.log('[SLA] getAllByType no disponible, intentando por punto...');
      }

      // ESTRATEGIA 2: Obtener puntos y cargar por cada uno
      if (!usedRealData || allTickets.length === 0) {
        let systemPoints = [];
        try {
          const pointsRes = await sh.admin.catchmentPoints();
          systemPoints = pointsRes.results || pointsRes || [];
        } catch (e) {
          try {
            const statusRes = await sh.management.pointsStatus();
            systemPoints = statusRes.points || statusRes.results || [];
          } catch (e2) {
            console.warn('[SLA] No se pudieron obtener puntos');
          }
        }

        if (systemPoints.length > 0) {
          const ticketMap = new Map();

          for (const point of systemPoints.slice(0, 20)) {
            try {
              const res = await sh.notifications.getByPoint(point.id, TYPE_SUPPORT, 1);
              (res.results || [])
                .filter(t => t.type_notification === TYPE_SUPPORT)
                .forEach(t => {
                  if (!ticketMap.has(t.id)) ticketMap.set(t.id, enrichTicket(t, point));
                });
            } catch (err) { /* ignore */ }
          }

          allTickets = Array.from(ticketMap.values());
          if (allTickets.length > 0) usedRealData = true;
        }
      }

      // ESTRATEGIA 3: Mock como ultimo recurso
      if (!usedRealData || allTickets.length === 0) {
        console.log('[SLA] Usando mock data para demostracion');
        allTickets = generateMockTickets();
        if (isMountedRef.current) setTotalCount(allTickets.length);
      }

      if (isMountedRef.current) {
        setTickets(allTickets);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('[SLA] Error fetching tickets:', err);
      if (isMountedRef.current) {
        setError(err);
        const mocks = generateMockTickets();
        setTickets(mocks);
        setTotalCount(mocks.length);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  const enrichTicket = (ticket, pointData = null) => {
    const validResponses = (ticket.responses || []).filter(r => r.response && r.response.trim().length > 0);
    return {
      ...ticket,
      point_title: pointData?.title || ticket.point_catchment_title || `Punto ${ticket.point_catchment}`,
      project: pointData?.project_name || pointData?.project || ticket.project || '-',
      client: pointData?.client_name || pointData?.client || ticket.client || '-',
      // Filtrar respuestas vacias
      responses: validResponses,
      // Usar response_count del backend si existe, sino calcular del array disponible
      response_count: ticket.response_count ?? validResponses.length,
    };
  };

  const updateTicketStatus = useCallback(async (ticketId, newStatus) => {
    const updates = {};
    switch (newStatus) {
      case 'nuevo':
        updates.is_read = false;
        updates.is_wait = false;
        updates.is_active = true;
        updates.is_finish = false;
        break;
      case 'revision':
        updates.is_read = true;
        updates.is_wait = true;
        updates.is_active = true;
        updates.is_finish = false;
        break;
      case 'desarrollo':
        updates.is_read = true;
        updates.is_wait = false;
        updates.is_active = true;
        updates.is_finish = false;
        break;
      case 'resuelto':
        updates.is_read = true;
        updates.is_wait = false;
        updates.is_active = false;
        updates.is_finish = true;
        break;
      default:
        return;
    }

    try {
      await sh.notifications.update(ticketId, updates);
      setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, ...updates } : t)));
    } catch (err) {
      console.error('[SLA] Error actualizando ticket:', err);
      setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, ...updates } : t)));
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId) => {
    try {
      await sh.notifications.delete(ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      return true;
    } catch (err) {
      console.error('[SLA] Error eliminando ticket:', err);
      return false;
    }
  }, []);

  const convertAlertToTicket = useCallback(async (alertId) => {
    try {
      await sh.notifications.update(alertId, { type_notification: TYPE_SUPPORT });
      // Refrescar tickets para que aparezca el nuevo ticket
      fetchTickets(true);
      return true;
    } catch (err) {
      console.error('[SLA] Error convirtiendo alerta a ticket:', err);
      return false;
    }
  }, [fetchTickets]);

  const addComment = useCallback(async (ticketId, message, isEmail = false) => {
    if (!message || !message.trim()) return;
    try {
      await sh.notifications.responses.create({
        notification: ticketId,
        response: message.trim(),
      });
      // Optimistic update: agregar la respuesta localmente con flag is_email
      setTickets(prev => prev.map(t => {
        if (t.id !== ticketId) return t;
        const newResponse = {
          id: `temp-${Date.now()}`,
          response: message.trim(),
          user: { username: 'admin' },
          created: new Date().toISOString(),
          is_email: isEmail,
        };
        return { ...t, responses: [...(t.responses || []), newResponse] };
      }));
      fetchTickets(true);
    } catch (err) {
      console.error('[SLA] Error agregando comentario:', err);
    }
  }, [fetchTickets]);

  useEffect(() => {
    fetchTickets(false);
    if (autoRefresh) {
      intervalRef.current = setInterval(() => fetchTickets(true), refreshInterval);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, refreshInterval, fetchTickets]);

  const columns = useMemo(() => {
    const nuevos = tickets.filter(t => !t.is_read);
    const revision = tickets.filter(t => t.is_read && t.is_wait);
    const desarrollo = tickets.filter(t => t.is_read && !t.is_wait && t.is_active);
    const resueltos = tickets.filter(t => !t.is_active || t.is_finish);
    return { nuevos, revision, desarrollo, resueltos };
  }, [tickets]);

  const metrics = useMemo(() => {
    if (tickets.length === 0) {
      return {
        total: 0, activos: 0, resueltos: 0, tasaResolucion: 0,
        tiempoPromedioRespuesta: 0, tiempoPromedioResolucion: 0, porVencer: 0,
      };
    }

    const activos = tickets.filter(t => t.is_active);
    const resueltos = tickets.filter(t => !t.is_active || t.is_finish);

    const ticketsConRespuesta = tickets.filter(t => t.responses && t.responses.length > 0);
    const tiempoRespuesta = ticketsConRespuesta.reduce((sum, t) => {
      const created = dayjs(t.created);
      const firstResponse = dayjs(t.responses[0].created);
      return sum + firstResponse.diff(created, 'hour', true);
    }, 0);

    const tiempoResolucion = resueltos.reduce((sum, t) => {
      if (t.responses && t.responses.length > 1) {
        const created = dayjs(t.created);
        const resolved = dayjs(t.responses[t.responses.length - 1].created);
        return sum + resolved.diff(created, 'hour', true);
      }
      return sum;
    }, 0);

    const ahora = dayjs();
    const porVencer = activos.filter(t => {
      const horasSinRespuesta = ahora.diff(dayjs(t.created), 'hour');
      return horasSinRespuesta > 48 && !t.is_read;
    }).length;

    return {
      total: totalCount || tickets.length,
      activos: activos.length,
      resueltos: resueltos.length,
      tasaResolucion: totalCount > 0 ? Math.round((resueltos.length / totalCount) * 100) : 0,
      tiempoPromedioRespuesta: ticketsConRespuesta.length > 0 ? Math.round(tiempoRespuesta / ticketsConRespuesta.length) : 0,
      tiempoPromedioResolucion: resueltos.length > 0 ? Math.round(tiempoResolucion / resueltos.length) : 0,
      porVencer,
    };
  }, [tickets, totalCount]);

  return {
    tickets, columns, metrics, loading, error, lastRefresh,
    refresh: fetchTickets, updateTicketStatus, addComment, convertAlertToTicket, deleteTicket,
  };
};

export default useSlaTickets;
