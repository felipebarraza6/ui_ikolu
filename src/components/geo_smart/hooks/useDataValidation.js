import { useMemo } from "react";
import moment from "moment";
import { parseSafeDate, formatSafeDate, FLEXIBLE_DATE_FORMATS } from "../../../utils/dateFormatter";

/**
 * Hook personalizado para validación y procesamiento seguro de datos de perfiles
 * Previene errores comunes con modules.today y modules.yesterday
 */
export const useDataValidation = () => {
  const validators = useMemo(
    () => ({
      // Valida si un valor es numérico y válido
      isValidNumber: (value) => {
        if (value === null || value === undefined || value === "") {
          return false;
        }
        const num = Number(value);
        return !isNaN(num) && isFinite(num);
      },

      // Obtiene el valor numérico seguro con valor por defecto
      getSafeNumber: (value, defaultValue = 0) => {
        return validators.isValidNumber(value) ? Number(value) : defaultValue;
      },

      // Valida si un objeto tiene la estructura esperada de perfil
      // 🆕 Acepta tanto formato antiguo (modules) como nuevo (latest_telemetry)
      isValidProfile: (profile) => {
        return (
          profile &&
          typeof profile === "object" &&
          profile.title &&
          typeof profile.title === "string" &&
          profile.title.trim() !== ""
        );
      },

      // Valida si un registro de datos es válido
      isValidRecord: (record) => {
        return (
          record &&
          typeof record === "object" &&
          record.date_time_medition &&
          typeof record.date_time_medition === "string"
        );
      },

      // Obtiene datos de hoy de forma segura con validación estricta
      // 🆕 Si no hay modules.today, usa latest_telemetry como único registro
      getTodayData: (profile) => {
        try {
          if (!validators.isValidProfile(profile)) {
            return [];
          }

          // Formato nuevo: points_summary con latest_telemetry
          if (profile.latest_telemetry && profile.latest_telemetry.date_time_medition) {
            const todayStr = moment().format("YYYY-MM-DD");
            const recordDate = moment(profile.latest_telemetry.date_time_medition, [
              moment.ISO_8601,
              "YYYY-MM-DD",
            ]);
            if (recordDate.isValid() && recordDate.isSame(moment(), "day")) {
              return [profile.latest_telemetry];
            }
            return [];
          }

          // Formato antiguo: modules.today
          if (
            !profile.modules?.today ||
            !Array.isArray(profile.modules.today)
          ) {
            return [];
          }

          const todayStr = moment().format("YYYY-MM-DD");
          return profile.modules.today.filter((record) => {
            if (!validators.isValidRecord(record)) {
              return false;
            }

            // Usar moment para comparar fechas de forma flexible (soporta YYYY-MM-DD y YYYY-DD-MM)
            const recordDate = moment(record.date_time_medition, [
              moment.ISO_8601,
              "YYYY-DD-MM",
              "YYYY-MM-DD",
              "YYYY-DD-MM HH:mm",
              "YYYY-MM-DD HH:mm",
            ]);

            return recordDate.isValid() && recordDate.isSame(moment(), "day");
          });
        } catch (error) {
          console.error("Error al obtener datos de hoy:", error);
          return [];
        }
      },

      // Obtiene datos de ayer de forma segura
      // 🆕 Si no hay modules.yesterday, retorna vacío (latest_telemetry solo tiene el último)
      getYesterdayData: (profile) => {
        try {
          if (!validators.isValidProfile(profile)) {
            return [];
          }

          // Formato nuevo: no tenemos datos de ayer en points_summary
          if (profile.latest_telemetry && !profile.modules?.yesterday) {
            return [];
          }

          // Formato antiguo: modules.yesterday
          if (
            !profile.modules?.yesterday ||
            !Array.isArray(profile.modules.yesterday)
          ) {
            return [];
          }

          return profile.modules.yesterday.filter((record) => {
            return (
              validators.isValidRecord(record) &&
              validators.isValidNumber(record.total_diff)
            );
          });
        } catch (error) {
          console.error("Error al obtener datos de ayer:", error);
          return [];
        }
      },

      // Calcula el consumo total de un array de datos de forma segura
      calculateTotalConsumption: (data) => {
        try {
          if (!Array.isArray(data)) {
            return 0;
          }

          return data.reduce((acc, record) => {
            if (!validators.isValidRecord(record)) {
              return acc;
            }
            return acc + validators.getSafeNumber(record.total_diff);
          }, 0);
        } catch (error) {
          console.error("Error al calcular consumo total:", error);
          return 0;
        }
      },

      // Obtiene el nivel de agua de un registro de forma segura
      getWaterLevel: (record) => {
        try {
          if (!validators.isValidRecord(record)) {
            return null;
          }

          const waterLevel =
            record.water_table !== undefined && record.water_table !== null
              ? record.water_table
              : record.water_level;

          return validators.isValidNumber(waterLevel)
            ? Number(waterLevel)
            : null;
        } catch (error) {
          console.error("Error al obtener nivel de agua:", error);
          return null;
        }
      },

      // Obtiene el caudal de un registro de forma segura
      getFlow: (record) => {
        try {
          if (!validators.isValidRecord(record)) {
            return null;
          }

          return validators.isValidNumber(record.flow)
            ? Number(record.flow)
            : null;
        } catch (error) {
          console.error("Error al obtener caudal:", error);
          return null;
        }
      },

      // Valida y procesa un array de perfiles
      validateProfiles: (profiles) => {
        try {
          if (!Array.isArray(profiles)) {
            return [];
          }

          return profiles.filter((profile) =>
            validators.isValidProfile(profile)
          );
        } catch (error) {
          console.error("Error al validar perfiles:", error);
          return [];
        }
      },

      // Obtiene el registro más reciente de cualquier módulo
      // 🆕 Si no hay modules, usa latest_telemetry
      getLatestRecord: (profile) => {
        if (!validators.isValidProfile(profile)) return null;
        
        // Formato nuevo: latest_telemetry directamente
        if (profile.latest_telemetry && profile.latest_telemetry.date_time_medition) {
          return profile.latest_telemetry;
        }
        
        const candidateRecords = [];
        
        // Candidato 1: m1
        if (profile.modules?.m1 && profile.modules.m1.date_time_medition) {
          candidateRecords.push(profile.modules.m1);
        }
        
        // Candidato 2: Último de today
        if (Array.isArray(profile.modules?.today) && profile.modules.today.length > 0) {
          candidateRecords.push(profile.modules.today[profile.modules.today.length - 1]);
        }
        
        // Candidato 3: Último de yesterday
        if (Array.isArray(profile.modules?.yesterday) && profile.modules.yesterday.length > 0) {
          candidateRecords.push(profile.modules.yesterday[profile.modules.yesterday.length - 1]);
        }

        if (candidateRecords.length === 0) return null;

        // Ordenar por fecha descendente
        return candidateRecords.sort((a, b) => {
          const dateA = parseSafeDate(a.date_time_medition || a.created);
          const dateB = parseSafeDate(b.date_time_medition || b.created);
          return dateB.valueOf() - dateA.valueOf();
        })[0];
      },

      // Obtiene el total histórico y su fecha de forma robusta
      // 🆕 Si no hay modules, usa latest_telemetry
      getHistoricalSummary: (profile) => {
        if (!validators.isValidProfile(profile)) return { total: 0, date: "" };

        let total = 0;
        let date = "";

        // Formato nuevo: latest_telemetry
        if (profile.latest_telemetry) {
          total = Number(profile.latest_telemetry.total) || 0;
          date = profile.latest_telemetry.date_time_medition || "";
          return {
            total,
            date: date ? formatSafeDate(date, "YYYY-MM-DD") : "",
          };
        }

        // Preferencia 1: m1 (si tiene total y fecha)
        if (profile.modules?.m1 && profile.modules.m1.total) {
          total = Number(profile.modules.m1.total) || 0;
          date = profile.modules.m1.date_time_medition || "";
        }

        // Si no hay fecha en m1, buscar en el último registro disponible para la FECHA
        if (!date || date === "") {
          const latest = validators.getLatestRecord(profile);
          if (latest) {
            date = latest.date_time_medition || "";
            // Si el total de m1 era 0 o no existía, usar el del registro más reciente
            if (total === 0 && latest.total) {
              total = Number(latest.total) || 0;
            }
          }
        }

        return { 
          total, 
          date: date ? formatSafeDate(date, "YYYY-MM-DD") : "" 
        };
      },
    }),
    []
  );

  return validators;
};

/**
 * Hook para obtener estadísticas de datos procesados de forma segura
 */
export const useDataStatistics = (profiles) => {
  const validators = useDataValidation();

  return useMemo(() => {
    const validProfiles = validators.validateProfiles(profiles);

    if (validProfiles.length === 0) {
      return {
        hasData: false,
        totalProfiles: 0,
        validProfiles: 0,
        invalidProfiles: profiles ? profiles.length : 0,
      };
    }

    const stats = {
      todayConsumers: [],
      yesterdayConsumers: [],
      loggerStatuses: [],
      highestFlows: [],
      waterLevelAnalysis: [],
      consumptionChanges: [],
      stoppedConsuming: [],
      totals: {
        today: 0,
        yesterday: 0,
        activeToday: 0,
        activeYesterday: 0,
      },
      errors: [],
    };

    validProfiles.forEach((profile, index) => {
      try {
        const todayData = validators.getTodayData(profile);
        const yesterdayData = validators.getYesterdayData(profile);

        // Priorizar el cálculo basado en registros individuales (telemetría) si hay datos disponibles,
        // ya que el campo total_consumed_today puede estar desincronizado o con formato inconsistente.
        const telemetrySum = validators.calculateTotalConsumption(todayData);
        const todaySum = todayData.length > 0 
          ? telemetrySum 
          : validators.getSafeNumber(profile.modules?.total_consumed_today, 0);
        const yesterdaySum =
          validators.calculateTotalConsumption(yesterdayData);
        const todayHasData = todayData.length > 0;

        // Actualizar totales
        stats.totals.today += todaySum;
        stats.totals.yesterday += yesterdaySum;

        // Consumidores activos hoy
        if (todayHasData) {
          stats.totals.activeToday++;
          stats.todayConsumers.push({
            name: profile.title,
            value: todaySum,
            dataPoints: todayData.length,
          });
        }

        // Consumidores activos ayer
        if (yesterdaySum > 0) {
          stats.totals.activeYesterday++;
          if (!todayHasData) {
            stats.stoppedConsuming.push(profile.title);
          }
        }

        // Cambios en el consumo
        if (yesterdaySum > 0) {
          const change = ((todaySum - yesterdaySum) / yesterdaySum) * 100;
          stats.consumptionChanges.push({
            name: profile.title,
            change: change,
            todaySum,
            yesterdaySum,
          });
        } else if (todayHasData) {
          stats.consumptionChanges.push({
            name: profile.title,
            change: Infinity,
            todaySum,
            yesterdaySum: 0,
          });
        }

        // Análisis de caudales
        if (todayData.length > 0) {
          const flows = todayData
            .map((record) => validators.getFlow(record))
            .filter((flow) => flow !== null && flow > 0);

          if (flows.length > 0) {
            const maxFlow = Math.max(...flows);
            stats.highestFlows.push({
              name: profile.title,
              value: maxFlow,
              flowCount: flows.length,
            });
          }
        }

        // Análisis de nivel de agua
        const waterLevels = todayData
          .map((record) => {
            const level = validators.getWaterLevel(record);
            return level !== null
              ? {
                  level,
                  time: record.date_time_medition,
                  record,
                }
              : null;
          })
          .filter((item) => item !== null);

        if (waterLevels.length > 0) {
          waterLevels.sort((a, b) => b.level - a.level);
          stats.waterLevelAnalysis.push({
            name: profile.title,
            deepestLevel: waterLevels[0],
            shallowestLevel: waterLevels[waterLevels.length - 1],
            totalReadings: waterLevels.length,
            allLevels: waterLevels,
          });
        }

        // Estado de los loggers (Incluimos TODOS los puntos)
        const latestRecord = validators.getLatestRecord(profile);
        const lastUpdatedDate = latestRecord?.date_time_medition;
        const lastMoment = lastUpdatedDate ? parseSafeDate(lastUpdatedDate) : null;

        stats.loggerStatuses.push({
          name: profile.title,
          last_updated: lastMoment,
          is_today: lastMoment ? lastMoment.isSame(moment(), "day") : false,
          // 🆕 Acepta is_telemetry tanto en root como en config_data
          is_telemetry: profile.is_telemetry === true || profile.config_data?.is_telemetry === true,
          dataPoints: todayData.length,
        });

        // Almacenar resumen histórico calculado robustamente
        const histSummary = validators.getHistoricalSummary(profile);
        const profileClone = { ...profile };
        if (!profileClone._computed) profileClone._computed = {};
        profileClone._computed.historical = histSummary;
        // Reemplazar en el array original para no mutar el estado global
        profiles[index] = profileClone;
      } catch (error) {
        console.error(`Error procesando perfil ${profile.title}:`, error);
        stats.errors.push({
          profile: profile.title,
          error: error.message,
          index,
        });
      }
    });

    // Ordenar resultados
    stats.todayConsumers.sort((a, b) => b.value - a.value);
    stats.consumptionChanges.sort((a, b) => b.change - a.change);
    stats.loggerStatuses.sort(
      (a, b) =>
        (b.last_updated?.valueOf?.() || 0) - (a.last_updated?.valueOf?.() || 0)
    );
    stats.highestFlows.sort((a, b) => b.value - a.value);

    // Calcular cambio general
    const overallChange =
      stats.totals.yesterday > 0
        ? ((stats.totals.today - stats.totals.yesterday) /
            stats.totals.yesterday) *
          100
        : stats.totals.today > 0
        ? Infinity
        : 0;

    return {
      ...stats,
      biggestDecreases: stats.consumptionChanges
        .filter((c) => c.change < 0)
        .sort((a, b) => a.change - b.change),
      overallChange,
      totalProfiles: profiles ? profiles.length : 0,
      validProfiles: validProfiles.length,
      invalidProfiles: (profiles ? profiles.length : 0) - validProfiles.length,
      hasData: stats.totals.today > 0 || stats.totals.yesterday > 0,
    };
  }, [profiles, validators]);
};
