import axios from "axios";

import { notification } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
const BASE_URL = "https://api.smarthydro.app/api/";
//const BASE_URL = 'http://localhost:8000/api/'

export const Axios = axios.create({
  baseURL: BASE_URL,
});

export const POST_LOGIN = async (endpoint, data) => {
  const request = await Axios.post(endpoint, data);
  console.log(request);
  return request;
};

export const GET = async (endpoint) => {
  const token = JSON.parse(localStorage.getItem("token"));
  const options = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };
  const request = await Axios.get(endpoint, options);
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

export const DOWNLOAD = async (endpoint, name_file) => {
  const token = JSON.parse(localStorage.getItem("token"));
  
  // Configuración para la descarga con tipo blob
  const download = {
    responseType: "blob",
    headers: {
      Authorization: `Token ${token}`,
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
