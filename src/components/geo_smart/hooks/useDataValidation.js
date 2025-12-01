import { useMemo } from "react";
import moment from "moment";

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
      isValidProfile: (profile) => {
        return (
          profile &&
          typeof profile === "object" &&
          profile.title &&
          profile.modules &&
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
      getTodayData: (profile) => {
        try {
          if (!validators.isValidProfile(profile)) {
            return [];
          }

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

            return record.date_time_medition.slice(0, 10) === todayStr;
          });
        } catch (error) {
          console.error("Error al obtener datos de hoy:", error);
          return [];
        }
      },

      // Obtiene datos de ayer de forma segura
      getYesterdayData: (profile) => {
        try {
          if (!validators.isValidProfile(profile)) {
            return [];
          }

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

        // Si el backend entrega total_consumed_today, úsalo directamente para evitar reprocesar
        // y mantener consistencia con otros módulos. Si no, se calcula desde todayData.
        const todaySum =
          validators.getSafeNumber(profile.modules?.total_consumed_today, null) !== null
            ? validators.getSafeNumber(profile.modules.total_consumed_today, 0)
            : validators.calculateTotalConsumption(todayData);
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

        // Estado de los loggers
        if (todayData.length > 0) {
          const lastRecord = todayData[todayData.length - 1];
          const lastUpdated = lastRecord?.date_time_medition;

          stats.loggerStatuses.push({
            name: profile.title,
            last_updated: lastUpdated ? moment(lastUpdated) : null,
            is_today: lastUpdated
              ? moment(lastUpdated).isSame(moment(), "day")
              : false,
            is_telemetry: profile.config_data?.is_telemetry === true,
            dataPoints: todayData.length,
          });
        }
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
