import React, { useState, useEffect, useContext } from "react";
import {
  App,
  Row,
  Col,
  Input,
  Select,
  Button,
  Upload,
  Table,
  Tag,
  Space,
  Typography,
  Flex,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  TagOutlined,
  CalendarOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import { useResponsive } from "../../hooks/useResponsive";

const { Option } = Select;
const { Title } = Typography;

// Mapeo de IDs de tipo a nombres legibles
const typeMap = {
  1: "Plano",
  2: "Memoria",
  3: "Certificado",
  4: "Otro",
};

const DocResContent = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const { message } = App.useApp();

  const [documents, setDocuments] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState(null);
  const [description, setDescription] = useState("");
  const [update, setUpdate] = useState(false);

  const selectedProfileId = state.selected_profile?.id;

  const getDocuments = async () => {
    if (!selectedProfileId) return;
    try {
      const response = await sh.getFiles(selectedProfileId);
      setDocuments(response.results);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
      message.error("No se pudieron cargar los documentos.");
    }
  };

  useEffect(() => {
    getDocuments();
  }, [selectedProfileId, update]);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Por favor, seleccione un archivo para subir.");
      return;
    }
    if (!docType) {
      message.warning("Por favor, seleccione un tipo de documento.");
      return;
    }

    setUploading(true);

    const values = {
      file: { originFileObj: fileList[0] },
      type_file: docType,
      description: description,
      point_catchment: selectedProfileId,
      name: fileList[0].name,
    };

    try {
      await sh.uploadFile(values);
      message.success("Archivo subido exitosamente.");
      setFileList([]);
      setDocType(null);
      setDescription("");
      setUpdate(!update);
    } catch (error) {
      console.error("Error al subir archivo:", error);
      message.error("La subida del archivo falló.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await sh.deleteFile(fileId);
      message.success("Archivo eliminado exitosamente.");
      setUpdate(!update);
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      message.error("No se pudo eliminar el archivo.");
    }
  };

  const props = {
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const columns = [
    {
      title: (
        <>
          <FileTextOutlined /> Nombre
        </>
      ),
      dataIndex: "name",
      key: "name",
    },
    {
      title: (
        <>
          <TagOutlined /> Tipo
        </>
      ),
      dataIndex: "type_file",
      key: "type_file",
      render: (typeId) => {
        const typeName = typeMap[typeId] || "Desconocido";
        return <Tag>{typeName}</Tag>;
      },
    },
    {
      title: (
        <>
          <CalendarOutlined /> Fecha
        </>
      ),
      dataIndex: "created",
      key: "created",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: (
        <>
          <SettingOutlined /> Acciones
        </>
      ),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<DownloadOutlined />}
            href={record.file}
            target="_blank"
            rel="noopener noreferrer"
          >
            Descargar
          </Button>
          <Popconfirm
            title="Eliminar el archivo"
            description="¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer."
            onConfirm={() => handleDelete(record.id)}
            okText="Sí, eliminar"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: isMobile ? "16px" : "24px",
        minHeight: "90vh",
      }}
    >
      {/* Header del módulo */}
      <div
        style={{
          borderRadius: "12px",
          background: "linear-gradient(135deg, #1F3461 0%, #2A4B8D 100%)",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          padding: "24px",
        }}
      >
        <Flex align="center" gap="middle">
          <FileTextOutlined style={{ fontSize: 32, color: "white" }} />
          <Title level={3} style={{ margin: 0, color: "white" }}>
            Gestor de Documentos
          </Title>
        </Flex>
      </div>

      <div
        style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Formulario de subida */}
          <Col xs={24} sm={24} md={9} lg={9} xl={7}>
            <Title level={5}>
              <FileAddOutlined /> Subir Nuevo Documento
            </Title>
            <Space
              direction="vertical"
              style={{ width: "100%", marginTop: 16 }}
              size="middle"
            >
              <Select
                placeholder="Seleccione tipo de documento"
                onChange={(value) => setDocType(value)}
                value={docType}
                style={{ width: "100%" }}
              >
                <Option value={1}>Plano</Option>
                <Option value={2}>Memoria</Option>
                <Option value={3}>Certificado</Option>
                <Option value={4}>Otro</Option>
              </Select>
              <Input.TextArea
                rows={3}
                placeholder="Descripción del archivo (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Upload {...props} maxCount={1}>
                <Button icon={<UploadOutlined />} style={{ width: "100%" }}>
                  Seleccionar Archivo
                </Button>
              </Upload>
              <Button
                type="primary"
                onClick={handleUpload}
                loading={uploading}
                style={{ width: "100%" }}
                disabled={fileList.length === 0}
              >
                {uploading ? "Subiendo..." : "Subir Archivo"}
              </Button>
            </Space>
          </Col>

          {/* Documentos cargados */}
          <Col xs={24} sm={24} md={15} lg={15} xl={17}>
            <Title level={5}>
              <FolderOpenOutlined /> Documentos Cargados
            </Title>
            <Table
              style={{ marginTop: 16 }}
              columns={columns}
              dataSource={documents}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: isMobile ? 800 : true }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

// Envoltura principal que provee el contexto de App
const DocRes = () => (
  <App>
    <DocResContent />
  </App>
);

export default DocRes;
