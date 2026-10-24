import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Santiago";

/**
 * Formatea una fecha como YYYY-MM-DD en zona America/Santiago.
 * Evita el bug de toISOString() que tras ~21:00 Chile pide el día siguiente (UTC).
 */
export const formatDateSantiago = (date) => {
  if (!date) return null;
  return dayjs(date).tz(TZ).format("YYYY-MM-DD");
};

export const SANTIAGO_TZ = TZ;
