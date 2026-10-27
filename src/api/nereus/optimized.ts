import portal from "./portal";
import { deduplicateRequest, DedupKeys } from "@/utils/requestDeduplication";
import { withCache, CacheKeys } from "@/utils/dataCache";

export const getProfileOptimized = async (username: string | null = null, token: string | null = null) => {
  const key = DedupKeys.profile(username);
  return deduplicateRequest(key, () =>
    withCache(CacheKeys.profile(username || "current"), () => portal.get_profile(username, token), 2 * 60 * 1000)
  );
};

export const getTelemetryOptimized = async (profileId: string | number) => {
  const key = DedupKeys.telemetry(profileId);
  return deduplicateRequest(key, () =>
    withCache(CacheKeys.telemetry(profileId), () => portal.get_data_sh(profileId), 60 * 1000)
  );
};

export const getBatchTelemetryOptimized = async (profileIds: Array<string | number>) => {
  const results = await Promise.all(profileIds.map((id) => getTelemetryOptimized(id)));
  return profileIds.reduce<Record<string, unknown>>((acc, id, index) => {
    acc[String(id)] = results[index];
    return acc;
  }, {});
};

export const getDayDataOptimized = async (
  profileId: string | number,
  initialDate: string,
  finishDate: string
) =>
  withCache(
    CacheKeys.dayData(profileId, `${initialDate}_${finishDate}`),
    () => portal.get_data_day(profileId, initialDate, finishDate),
    5 * 60 * 1000
  );

export const getMonthDataOptimized = async (
  profileId: string | number,
  initialDate: string,
  finishDate: string
) =>
  withCache(
    CacheKeys.monthData(profileId, initialDate.slice(0, 7)),
    () => portal.get_data_month(profileId, initialDate, finishDate),
    10 * 60 * 1000
  );

export const getNotificationsOptimized = async (
  profileId: string | number,
  page: number | string,
  type: string
) =>
  withCache(
    CacheKeys.notifications(profileId, type),
    () => portal.notifications.get(profileId, page, type),
    2 * 60 * 1000
  );

export const getActiveNotificationsOptimized = async (
  profileId: string | number,
  page: number | string,
  type: string
) =>
  withCache(
    `${CacheKeys.notifications(profileId, type)}_active`,
    () => portal.notifications.actives(profileId, page, type),
    60 * 1000
  );

const optimized = {
  get_profile: getProfileOptimized,
  get_data_sh: getTelemetryOptimized,
  get_batch_telemetry: getBatchTelemetryOptimized,
  get_data_day: getDayDataOptimized,
  get_data_month: getMonthDataOptimized,
  notifications: {
    get: getNotificationsOptimized,
    actives: getActiveNotificationsOptimized,
  },
  _original: portal,
};

export default optimized;
