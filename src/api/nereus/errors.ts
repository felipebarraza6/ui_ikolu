import axios from "axios";

export const UNAVAILABLE_MESSAGE = "No disponible aún";

export class UnavailableError extends Error {
  status = 404;

  constructor(message = UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "UnavailableError";
  }
}

export function isUnavailable(error: unknown): boolean {
  if (error instanceof UnavailableError) return true;
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function retryUnlessMissing(failureCount: number, error: unknown) {
  if (isUnavailable(error)) return false;
  return failureCount < 1;
}

export function errorText(error: unknown, fallback = "No se pudo completar la operación."): string {
  if (isUnavailable(error)) return UNAVAILABLE_MESSAGE;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; error?: string; message?: string } | undefined;
    if (typeof data?.detail === "string" && data.detail) return data.detail;
    if (typeof data?.error === "string" && data.error) return data.error;
    if (typeof data?.message === "string" && data.message) return data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
