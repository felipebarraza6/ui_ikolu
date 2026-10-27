import { notification } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { api, API_BASE_URL } from "../nereus/client";

export const BASE_URL = `${API_BASE_URL}/`;
export const Axios = api;

function readToken() {
  const raw = localStorage.getItem("token");
  if (!raw || raw === "undefined" || raw === "null") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export const POST_LOGIN = async (endpoint, data) => {
  const request = await api.post(endpoint, data, {
    skipAuthHandler: true,
    skipAuthHeader: true,
  });
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
};

export const GET = async (endpoint, token = null) => {
  const authToken = token || readToken();
  if (!authToken) {
    throw new Error(
      "No se encontró token de autenticación. Por favor, inicia sesión nuevamente."
    );
  }
  const headers = token ? { Authorization: `Token ${token}` } : undefined;
  return api.get(endpoint, { headers });
};

export const POST = async (endpoint, data) => {
  const token = readToken();
  const headers = token ? { Authorization: `Token ${token}` } : undefined;
  return api.post(endpoint, data, { headers });
};

export const DELETE = async (endpoint) => {
  const token = readToken();
  const headers = token ? { Authorization: `Token ${token}` } : undefined;
  return api.delete(endpoint, { headers });
};

export const PATCH = async (endpoint, data) => {
  const token = readToken();
  const headers = token ? { Authorization: `Token ${token}` } : undefined;
  return api.patch(endpoint, data, { headers });
};

export const DOWNLOAD = async (endpoint, name_file) => {
  const token = readToken();
  const response = await api.get(endpoint, {
    responseType: "blob",
    headers: {
      ...(token ? { Authorization: `Token ${token}` } : {}),
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

  notification.open({
    message: `${name_file}`,
    description: "Archivo descargado exitosamente!",
    placement: "topRight",
    icon: <CloudDownloadOutlined style={{ color: "#CCCF07" }} />,
  });

  return response;
};
