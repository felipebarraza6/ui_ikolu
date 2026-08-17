import axios from "axios";

// En desarrollo local usamos ruta relativa para que el proxy de React Scripts
// reenvíe las peticiones a la API y evitemos errores de CORS en el navegador.
// En producción seguimos apuntando directamente al dominio de la API.
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const BASE_URL = isLocalhost
  ? "/api/"
  : "https://api.smarthydro.app/api/";

export const Axios = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 segundos máximo por petición
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper para determinar el tipo de cabecera según el formato del token
export const getAuthHeader = (token) => {
  if (!token) return "";
  const cleanToken = token.replace(/['"]/g, "").trim();
  // Si parece un JWT (empieza con eyJ o tiene 3 segmentos separados por punto)
  if (cleanToken.startsWith("eyJ") || cleanToken.split(".").length === 3) {
    return `Bearer ${cleanToken}`;
  }
  return `Token ${cleanToken}`;
};

// ── Interceptor de request: inyecta token automáticamente ──
Axios.interceptors.request.use((config) => {
  // POST_LOGIN no lleva token
  if (config._skipAuth) return config;

  try {
    const rawToken = localStorage.getItem("token");
    if (rawToken) {
      const token = JSON.parse(rawToken || "null");
      if (token) {
        config.headers.Authorization = getAuthHeader(token);
      }
    }
  } catch {
    // no token disponible
  }
  return config;
});

// ── Interceptor de response: normaliza errores y evita logs ruidosos ──
Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
      error.isNetworkError = true;
    }
    if (error.response?.status === 401) {
      error.isAuthError = true;
      // Disparar evento global para desloguear al usuario automáticamente
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sh-auth-unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

// ── Descargas: callback opcional para notificación UI ──
let downloadCallback = null;
export const setDownloadCallback = (cb) => {
  downloadCallback = cb;
};

const triggerDownloadNotification = (filename) => {
  if (typeof downloadCallback === "function") {
    downloadCallback(filename);
  }
};

// ── Parseador universal de errores de Django Rest Framework ──
export const parseApiError = (error) => {
  if (!error) return "Error desconocido";
  if (error.isNetworkError) {
    return "Error de red: No se pudo conectar al servidor. Revisa tu conexión.";
  }
  if (error.isAuthError) {
    return "Sesión expirada. Por favor, inicia sesión nuevamente.";
  }

  const responseData = error.response?.data;
  if (responseData) {
    if (typeof responseData === "string") return responseData;

    // Errores comunes de DRF
    if (responseData.detail) return responseData.detail;
    if (responseData.error) return responseData.error;
    if (responseData.message) return responseData.message;

    // Errores de validación de campos ({ email: ["Este campo es requerido"] })
    if (typeof responseData === "object") {
      const keys = Object.keys(responseData);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const value = responseData[firstKey];
        const displayKey = firstKey === "non_field_errors" ? "Error" : firstKey;
        if (Array.isArray(value)) {
          return `${displayKey}: ${value.join(", ")}`;
        }
        if (typeof value === "string") {
          return `${displayKey}: ${value}`;
        }
      }
    }
  }

  return error.message || "Ocurrió un error inesperado";
};

export const POST_LOGIN = async (endpoint, data) => {
  try {
    const request = await Axios.post(endpoint, data, { _skipAuth: true });
    if (request.data) {
      const hasError =
        request.data.error && !request.data.user && !request.data.access_token;
      if (hasError) {
        const error = new Error(
          request.data.error ||
            request.data.message ||
            "Error de autenticación",
        );
        error.response = { data: request.data };
        throw error;
      }
    }
    return request;
  } catch (error) {
    throw error;
  }
};

export const GET = async (endpoint, token = null, options = {}) => {
  let requestOptions = { ...options };
  
  // Si se pasa token explícito, usarlo directamente en headers
  if (token) {
    requestOptions.headers = {
      ...requestOptions.headers,
      Authorization: getAuthHeader(token),
    };
  } else {
    // Si no hay token, el interceptor inyectará el token de localStorage automáticamente.
    // Dejamos que el interceptor haga su trabajo en lugar de inyectar estáticamente.
  }

  const request = await Axios.get(endpoint, requestOptions);
  return request;
};

export const POST = async (endpoint, data) => {
  const request = await Axios.post(endpoint, data);
  return request;
};

export const DELETE = async (endpoint) => {
  const request = await Axios.delete(endpoint);
  return request;
};

export const PATCH = async (endpoint, data) => {
  const request = await Axios.patch(endpoint, data);
  return request;
};

export const DOWNLOAD = async (endpoint, name_file) => {
  const response = await Axios.get(endpoint, {
    responseType: "blob",
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", name_file);
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);

  triggerDownloadNotification(name_file);
};
