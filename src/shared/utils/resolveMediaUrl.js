const API_ORIGIN = "https://api.smarthydro.app";
const MEDIA_PREFIX = "/media/";

export const resolveMediaUrl = (url) => {
  if (!url) return url;

  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.pathname.startsWith(MEDIA_PREFIX)) {
      return `${API_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return url;
  }
  return url;
};
