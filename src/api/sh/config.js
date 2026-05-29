import axios from "axios";

import { notification } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
const BASE_URL = "https://api.smarthydro.app/api/";
//const BASE_URL = 'http://localhost:8000/api/'

export const Axios = axios.create({
  baseURL: BASE_URL,
});

export const POST_LOGIN = async (endpoint, data) => {
  try {
    const request = await Axios.post(endpoint, data);
    // Solo validar errores si NO tiene los campos de éxito
    // Una respuesta exitosa de login debe tener user y access_token
    if (request.data) {
      const hasError =
        request.data.error && !request.data.user && !request.data.access_token;
      // Si tiene error pero no tiene los campos de éxito, es un error real
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
    // Si es un error de axios (status != 200), propagarlo
    if (error.response) {
      throw error;
    }
    // Si es un error que lanzamos nosotros, propagarlo
    throw error;
  }
};

export const GET = async (endpoint, token = null, options = {}) => {
  // Si se proporciona token, usarlo; si no, intentar obtenerlo de localStorage
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

  // Configuración para la descarga con tipo blob
  const download = {
    responseType: "blob",
    headers: {
      Authorization: `Token ${token}`,
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  };

  const request = await Axios.get(endpoint, download).then((response) => {
    // Crear el blob con el tipo MIME correcto para archivos Excel
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", name_file);
    document.body.appendChild(link);
    link.click();

    // Limpiar después de la descarga
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  });

  notification.open({
    message: `${name_file}`,
    description: `Archivo descargado exitosamente!`,
    placement: "topRight",
    icon: <CloudDownloadOutlined style={{ color: "#69802A" }} />,
  });

  return request;
};
