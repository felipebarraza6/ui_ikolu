import axios from "axios";

const BASE_URL = "https://api.smarthydro.app/api/";
//const BASE_URL = 'http://localhost:8000/api/'

export const Axios = axios.create({
  baseURL: BASE_URL,
});

// ── Interceptor de request: inyecta token automáticamente ──
Axios.interceptors.request.use((config) => {
  // POST_LOGIN no lleva token
  if (config._skipAuth) return config;

  try {
    const token = JSON.parse(localStorage.getItem("token") || "null");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  } catch {
    // no token disponible
  }
  return config;
});

// ── Descargas: callback opcional para notificación UI ──
let downloadCallback = null;
export const setDownloadCallback = (cb) => { downloadCallback = cb; };

const triggerDownloadNotification = (filename) => {
  if (typeof downloadCallback === "function") {
    downloadCallback(filename);
  }
};

export const POST_LOGIN = async (endpoint, data) => {
  try {
    const request = await Axios.post(endpoint, data, { _skipAuth: true });
    if (request.data) {
      const hasError =
        request.data.error && !request.data.user && !request.data.access_token;
      if (hasError) {
        const error = new Error(
          request.data.error || request.data.message || "Error de autenticación"
        );
        error.response = { data: request.data };
        throw error;
      }
    }
    return request;
  } catch (error) {
    if (error.response) throw error;
    throw error;
  }
};

export const GET = async (endpoint, token = null, options = {}) => {
  let authToken = token;
  if (!authToken) {
    authToken = JSON.parse(localStorage.getItem("token") || "null");
  }

  if (!authToken) {
    throw new Error(
      "No se encontró token de autenticación. Por favor, inicia sesión nuevamente."
    );
  }

  const requestOptions = {
    headers: {
      Authorization: `Token ${authToken}`,
    },
    ...options,
  };
  const request = await Axios.get(endpoint, requestOptions);
  return request;
};

export const POST = async (endpoint, data) => {
  const token = JSON.parse(localStorage.getItem("token"));
  const options = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };
  const request = await Axios.post(endpoint, data, options);
  return request;
};

export const DELETE = async (endpoint) => {
  const token = JSON.parse(localStorage.getItem("token"));
  const options = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };
  const request = await Axios.delete(endpoint, options);
  return request;
};

export const PATCH = async (endpoint, data) => {
  const token = JSON.parse(localStorage.getItem("token"));
  const options = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };
  const request = await Axios.patch(endpoint, data, options);
  return request;
};

export const DOWNLOAD = async (endpoint, name_file) => {
  const token = JSON.parse(localStorage.getItem("token"));

  const download = {
    responseType: "blob",
    headers: {
      Authorization: `Token ${token}`,
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  };

  const request = await Axios.get(endpoint, download).then((response) => {
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
  });

  triggerDownloadNotification(name_file);

  return request;
};
