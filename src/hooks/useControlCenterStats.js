import { useMemo } from "react";

export const useControlCenterStats = (profiles) => {
  // Función auxiliar para obtener datos del punto
  const getPointData = (profile) => {
    if (Array.isArray(profile.catchment_points)) {
      return profile.catchment_points[0] || {};
    }
    if (
      profile.catchment_points &&
      typeof profile.catchment_points === "object"
    ) {
      return profile.catchment_points;
    }
    return profile;
  };

  // Función para verificar si el punto está activo (telemetría o ingreso manual)
  const isPointActive = (point) => {
    const pointData = getPointData(point);
    const isTelemetry = pointData.config_data?.is_telemetry === true;
    const isManualEntry = pointData.config_data?.is_telemetry === false;

    return isTelemetry || isManualEntry;
  };

  const stats = useMemo(() => {
    return {
      totalPoints: profiles.length,
      activePoints: profiles.filter((p) => isPointActive(p)).length,
      telemetryPoints: profiles.filter((p) => {
        const point = getPointData(p);
        return point.config_data?.is_telemetry === true;
      }).length,
      manualEntryPoints: profiles.filter((p) => {
        const point = getPointData(p);
        // Ingreso manual son los que NO tienen telemetría
        return point.config_data?.is_telemetry === false;
      }).length,
      dgaPoints: profiles.filter((p) => {
        const point = getPointData(p);
        const dga = point.dga || p.dga;
        const code = dga?.code_dga;
        return code && code.startsWith("OB");
      }).length,
      smaPoints: profiles.filter((p) => {
        const point = getPointData(p);
        const dga = point.dga || p.dga;
        const code = dga?.code_dga;
        return code && !code.startsWith("OB");
      }).length,
      dgaSending: profiles.filter((p) => {
        const point = getPointData(p);
        const dga = point.dga || p.dga;
        const code = dga?.code_dga;
        const sendDga = dga?.send_dga === true;
        return code && code.startsWith("OB") && sendDga;
      }).length,
      totalWithCode: profiles.filter((p) => {
        const point = getPointData(p);
        const dga = point.dga || p.dga;
        return !!dga?.code_dga;
      }).length,
      connectedPoints: profiles.filter((p) => {
        const point = getPointData(p);
        const isTelemetry = point.config_data?.is_telemetry === true;
        const m1 = point.modules?.m1;
        return isTelemetry && m1 && m1.days_not_conection === 0;
      }).length,
      // Puntos con telemetría que tienen problemas de conexión (más de 1 día sin conexión)
      telemetryWithConnectionIssues: profiles.filter((p) => {
        const point = getPointData(p);
        const isTelemetry = point.config_data?.is_telemetry === true;
        const m1 = point.modules?.m1;
        const daysNotConnected = m1?.days_not_conection;
        // Solo validar puntos con telemetría y que tengan más de 1 día sin conexión
        return isTelemetry && daysNotConnected !== null && daysNotConnected > 1;
      }).length,
      withErrors: profiles.filter((p) => {
        const point = getPointData(p);
        const m1 = point.modules?.m1;
        return m1?.is_error === true;
      }).length,
    };
  }, [profiles]);

  const standardStats = useMemo(() => {
    return {
      MAYOR: profiles.filter((p) => {
        const point = getPointData(p);
        const dga = point.dga || p.dga;
        return dga?.standard === "MAYOR";
      }).length,
      MEDIO: profiles.filter((p) => {
        const point = getPointData(p);
        const dga = point.dga || p.dga;
        return dga?.standard === "MEDIO";
      }).length,
      MENOR: profiles.filter((p) => {
        const point = getPointData(p);
        const dga = point.dga || p.dga;
        return dga?.standard === "MENOR";
      }).length,
      CAUDALES_MUY_PEQUENOS: profiles.filter((p) => {
        const point = getPointData(p);
        const dga = point.dga || p.dga;
        return dga?.standard === "CAUDALES_MUY_PEQUENOS";
      }).length,
    };
  }, [profiles]);

  const percentages = useMemo(() => {
    return {
      active:
        profiles.length > 0
          ? Math.round((stats.activePoints / stats.totalPoints) * 100)
          : 0,
      telemetry:
        profiles.length > 0
          ? Math.round((stats.telemetryPoints / stats.totalPoints) * 100)
          : 0,
      connected:
        profiles.length > 0
          ? Math.round((stats.connectedPoints / stats.totalPoints) * 100)
          : 0,
      dgaSending:
        profiles.length > 0
          ? Math.round((stats.dgaSending / stats.totalPoints) * 100)
          : 0,
    };
  }, [profiles, stats]);

  // Obtener lista de puntos con problemas de conexión
  const pointsWithConnectionIssues = useMemo(() => {
    return profiles
      .filter((p) => {
        const point = getPointData(p);
        const isTelemetry = point.config_data?.is_telemetry === true;
        const m1 = point.modules?.m1;
        const daysNotConnected = m1?.days_not_conection;
        return isTelemetry && daysNotConnected !== null && daysNotConnected > 1;
      })
      .map((p) => {
        const point = getPointData(p);
        return {
          id: point.id || p.id,
          title: point.title || p.title,
          daysNotConnected: point.modules?.m1?.days_not_conection,
        };
      });
  }, [profiles]);

  return {
    stats,
    standardStats,
    percentages,
    getPointData,
    pointsWithConnectionIssues,
  };
};
