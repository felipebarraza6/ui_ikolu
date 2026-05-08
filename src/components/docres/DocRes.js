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
  Card,
  Statistic,
  Drawer,
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
  PlusOutlined,
  CloseOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import { useResponsive } from "../../hooks/useResponsive";

const { Option } = Select;
const { Title, Text } = Typography;

// Mapeo de IDs de tipo a nombres legibles
const typeMap = {
  1: { label: "Plano", color: "blue" },
  2: { label: "Memoria", color: "purple" },
  3: { label: "Certificado", color: "green" },
  4: { label: "Otro", color: "default" },
};

const KPI_CARD_STYLES = {
  total: {
    borderColor: "#1F3461",
    iconColor: "#1F3461",
    bg: "#F2F5FA",
  },
  plano: {
    borderColor: "#1890FF",
    iconColor: "#1890FF",
    bg: "#F0F7FF",
  },
  memoria: {
    borderColor: "#722ED1",
    iconColor: "#722ED1",
    bg: "#F9F0FF",
  },
  certificado: {
    borderColor: "#52C41A",
    iconColor: "#52C41A",
    bg: "#F6FFF0",
  },
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
  const [drawerVisible, setDrawerVisible] = useState(false);

  const selectedProfileId = state.selected_profile?.id;

  const getDocuments = async () => {
    if (!selectedProfileId) return;
    try {
      const response = await sh.getFiles(selectedProfileId);
      setDocuments(response.results || []);
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
      setDrawerVisible(false);
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
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  // KPIs
  const totalDocs = documents.length;
  const planosCount = documents.filter((d) => d.type_file === 1).length;
  const memoriasCount = documents.filter((d) => d.type_file === 2).length;
  const certificadosCount = documents.filter((d) => d.type_file === 3).length;

  const renderKPIs = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      <Col xs={12} sm={6} md={6} lg={6}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.total.borderColor}`,
            background: KPI_CARD_STYLES.total.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="middle">
            <FolderOpenOutlined
              style={{
                fontSize: 24,
                color: KPI_CARD_STYLES.total.iconColor,
              }}
            />
            <Statistic
              title={
                <span style={{ fontSize: 12, color: "#888" }}>Total</span>
              }
              value={totalDocs}
              valueStyle={{ color: "#1F3461", fontSize: 22, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>

      <Col xs={12} sm={6} md={6} lg={6}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.plano.borderColor}`,
            background: KPI_CARD_STYLES.plano.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="middle">
            <FileTextOutlined
              style={{
                fontSize: 24,
                color: KPI_CARD_STYLES.plano.iconColor,
              }}
            />
            <Statistic
              title={
                <span style={{ fontSize: 12, color: "#888" }}>Planos</span>
              }
              value={planosCount}
              valueStyle={{ color: "#1F3461", fontSize: 22, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>

      <Col xs={12} sm={6} md={6} lg={6}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.memoria.borderColor}`,
            background: KPI_CARD_STYLES.memoria.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="middle">
            <FileTextOutlined
              style={{
                fontSize: 24,
                color: KPI_CARD_STYLES.memoria.iconColor,
              }}
            />
            <Statistic
              title={
                <span style={{ fontSize: 12, color: "#888" }}>Memorias</span>
              }
              value={memoriasCount}
              valueStyle={{ color: "#1F3461", fontSize: 22, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>

      <Col xs={12} sm={6} md={6} lg={6}>
        <Card
          size="small"
          bordered
          style={{
            borderRadius: 12,
            borderLeft: `4px solid ${KPI_CARD_STYLES.certificado.borderColor}`,
            background: KPI_CARD_STYLES.certificado.bg,
            borderColor: "transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Flex align="center" gap="middle">
            <FileTextOutlined
              style={{
                fontSize: 24,
                color: KPI_CARD_STYLES.certificado.iconColor,
              }}
            />
            <Statistic
              title={
                <span style={{ fontSize: 12, color: "#888" }}>
                  Certificados
                </span>
              }
              value={certificadosCount}
              valueStyle={{ color: "#1F3461", fontSize: 22, fontWeight: 700 }}
            />
          </Flex>
        </Card>
      </Col>
    </Row>
  );

  const columns = [
    {
      title: (
        <>
          <FileTextOutlined /> Nombre
        </>
      ),
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <Text ellipsis style={{ maxWidth: 200 }} title={name}>
          {name}
        </Text>
      ),
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
        const type = typeMap[typeId] || { label: "Desconocido", color: "default" };
        return <Tag color={type.color}>{type.label}</Tag>;
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
      render: (date) => new Date(date).toLocaleDateString("es-CL"),
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
            size="small"
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
            <Button icon={<DeleteOutlined />} danger size="small">
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
        maxWidth: "1600px",
        margin: isMobile ? "12px auto" : "0 auto",
        padding: isMobile ? "0 8px" : "0",
        minHeight: "90vh",
      }}
    >
      <Flex justify="flex-end" style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawerVisible(true)}
          style={{
            background: "#1F3461",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Nuevo Documento
        </Button>
      </Flex>

      {/* KPIs */}
      {renderKPIs()}

      {/* Tabla de documentos */}
      <Card
        style={{
          borderRadius: "12px",
          background: "white",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "none",
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
      >
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: "20px" }}
        >
          <span
            style={{
              margin: 0,
              color: "#1F3461",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            <FolderOpenOutlined style={{ marginRight: 8 }} />
            Documentos Cargados
          </span>
          <Tag
            style={{
              fontWeight: 600,
              fontSize: "12px",
              padding: "4px 12px",
              borderRadius: "6px",
              borderColor: "#1F3461",
              color: "#1F3461",
              background: "#f2f5fa",
            }}
          >
            {totalDocs} documentos
          </Tag>
        </Flex>
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: isMobile ? 800 : true }}
          locale={{ emptyText: "No hay documentos cargados" }}
        />
      </Card>

      {/* Drawer para subir documentos */}
      <Drawer
        title={
          <span
            style={{ color: "#BDC00C", fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}
          >
            SUBIR NUEVO DOCUMENTO
          </span>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={isMobile ? "100%" : 520}
        styles={{
          body: { background: "#0a0e27", padding: "24px" },
          header: {
            background: "#0f152e",
            borderBottom: "1px solid rgba(255,107,53,0.25)",
          },
          mask: { background: "rgba(0,0,0,0.75)" },
        }}
        closeIcon={<span style={{ color: "#BDC00C", fontSize: 18 }}>✕</span>}
        destroyOnClose
        extra={
          <Button
            icon={<CloseOutlined />}
            onClick={() => setDrawerVisible(false)}
            style={{
              background: "transparent",
              borderColor: "rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Cerrar
          </Button>
        }
      >
        <Space
          direction="vertical"
          style={{ width: "100%" }}
          size="large"
        >
          <div>
            <Text style={{ color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 8 }}>
              Tipo de documento
            </Text>
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
          </div>

          <div>
            <Text style={{ color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 8 }}>
              Descripción
            </Text>
            <Input.TextArea
              rows={3}
              placeholder="Descripción del archivo (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ background: "rgba(255,255,255,0.05)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}
            />
          </div>

          <div>
            <Text style={{ color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 8 }}>
              Archivo
            </Text>
            <Upload.Dragger
              {...props}
              maxCount={1}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#BDC00C" }} />
              </p>
              <p style={{ color: "rgba(255,255,255,0.85)" }}>
                Haz clic o arrastra un archivo aquí
              </p>
              <p style={{ color: "rgba(255,255,255,0.45)" }}>
                Soporte para un solo archivo
              </p>
            </Upload.Dragger>
          </div>

          <Button
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            style={{
              width: "100%",
              background: "#1F3461",
              borderColor: "#1F3461",
              height: 44,
              fontWeight: 600,
            }}
            disabled={fileList.length === 0 || !docType}
          >
            {uploading ? "Subiendo..." : "Subir Archivo"}
          </Button>
        </Space>
      </Drawer>
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
