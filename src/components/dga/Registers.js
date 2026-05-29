import React, { useContext, useState } from "react";
import {
  Table,
  Tooltip,
  Button,
  Typography,
  DatePicker,
  Form,
  Flex,
  Tag,
  message,
  Drawer,
  Empty,
  theme,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ExportOutlined,
  FileTextOutlined,
  CopyOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";
import { formatInteger, formatFlow } from "../../utils/numberFormatter";
import { PageContainer, SectionCard } from "../common/LayoutPrimitives";

dayjs.locale("es");

const { Text, Title } = Typography;

// ── Drawer de detalle ──
const DetailDrawer = ({ open, onClose, record }) => {
  const { token } = theme.useToken();
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Comprobante copiado");
  };

  if (!record) return null;

  const statusColor =
    record.is_error || (record.return_dga && record.return_dga.toLowerCase().includes("error"))
      ? "#FF4D4F"
      : record.n_voucher && record.n_voucher !== "..."
      ? "#52C41A"
      : "#faad14";

  const statusText =
    record.is_error || (record.return_dga && record.return_dga.toLowerCase().includes("error"))
      ? "Error"
      : record.n_voucher && record.n_voucher !== "..."
      ? "Completado"
      : "En Cola";

  return (
    <Drawer
      title={
        <span style={{ color: token.colorTextHeading, fontWeight: 700, fontSize: 16 }}>
          Detalle del Envío DGA
        </span>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={480}
      styles={{ body: { padding: 24 } }}
    >
      <Flex vertical gap="middle">
        <div style={{ 
          padding: 12, 
          borderRadius: token.borderRadiusLG, 
          background: token.colorBgLayout,
        }}>
          <Flex justify="space-between" align="center">
            <Text strong>Estado</Text>
            <Tag
              color={statusColor}
              style={{ fontWeight: 600, fontSize: 13, margin: 0 }}
            >
              {statusText}
            </Tag>
          </Flex>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Fecha / Hora</Text>
          <div style={{ fontSize: 15, fontWeight: 600, color: token.colorText }}>
            {record.date_time_medition
              ? dayjs(record.date_time_medition).format("DD/MM/YYYY HH:mm")
              : "—"}
          </div>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Caudal</Text>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {record.flow !== undefined ? `${formatFlow(record.flow)} lt/s` : "—"}
          </div>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Total</Text>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {record.total !== undefined ? `${formatInteger(record.total)} m³` : "—"}
          </div>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Nivel Freático</Text>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {record.water_table !== undefined ? `${formatFlow(record.water_table)} m` : "—"}
          </div>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Respuesta del servidor</Text>
          <div
            style={{
              background: "#f5f5f5",
              padding: 12,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              color: "#555",
              marginTop: 4,
            }}
          >
            {record.return_dga || "Sin respuesta registrada."}
          </div>
        </div>

        {record.n_voucher && record.n_voucher !== "..." && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Comprobante</Text>
            <Flex
              align="center"
              justify="space-between"
              style={{
                background: "#f5f5f5",
                padding: "10px 12px",
                borderRadius: 8,
                marginTop: 4,
              }}
            >
              <Text strong copyable>
                {record.n_voucher}
              </Text>
              <Button
                icon={<CopyOutlined />}
                size="small"
                onClick={() => copyToClipboard(record.n_voucher)}
              />
            </Flex>
          </div>
        )}
      </Flex>
    </Drawer>
  );
};

// ── Modal de exportación ──
const ExportModal = ({ open, onCancel, profile }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const disabledDate = (current) => {
    const startLimit = dayjs().subtract(1, "year").startOf("year");
    const endLimit = dayjs().endOf("year");
    return current && (current < startLimit || current > endLimit);
  };

  const handleDownload = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const selectedMonth = values.month;
      const initialDate = selectedMonth.startOf("month").format("YYYY-MM-DD");
      const finishDate = selectedMonth.endOf("month").format("YYYY-MM-DD");
      const codeDga = profile?.dga?.code_dga || "SinCodigo";
      const title = `Reporte_MEE_${codeDga}_${selectedMonth.format("YYYY-MM")}`;

      await sh.get_data_sh_range_to_excel_dga(
        profile.id,
        initialDate,
        finishDate,
        title
      );

      message.success(`Archivo "${title}.xlsx" descargado correctamente.`);
      onCancel();
    } catch (error) {
      console.error("Error en la descarga:", error);
      message.error("No se pudo generar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" name="export_form">
        <p style={{ marginBottom: 16 }}>
          Selecciona un mes para generar el reporte DGA. Puedes exportar
          <strong> un mes a la vez</strong> del año actual o anterior.
        </p>
        <Form.Item
          name="month"
          label="Mes a exportar"
          rules={[{ required: true, message: "Selecciona un mes." }]}
        >
          <DatePicker
            picker="month"
            style={{ width: "100%" }}
            disabledDate={disabledDate}
            placeholder="Seleccionar mes"
          />
        </Form.Item>
        <Flex justify="flex-end" gap="small" style={{ marginTop: 16 }}>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleDownload}
            icon={<DownloadOutlined />}
          >
            Descargar
          </Button>
        </Flex>
      </Form>
  );
};

// ── Componente principal ──
const Registers = ({ dataDga = [], loading: externalLoading = false }) => {
  const { state } = useContext(AppContext);
  const { token } = theme.useToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  const m2_permission = state.selected_profile?.profile_ikolu?.m2 || false;
  // Exportar habilitado para todos; lógica de restricción removida a petición
  const flowLimit = state.selected_profile?.dga?.flow_granted_dga;

  const openDetail = (record) => {
    setDetailRecord(record);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailRecord(null);
  };

  const renderFlowValue = (value) => {
    if (flowLimit === null || flowLimit === undefined || flowLimit === 0) {
      return <span style={{ fontWeight: 500 }}>{formatFlow(value)}</span>;
    }
    const numericValue = Number(value);
    const percentage = (numericValue / Number(flowLimit)) * 100;
    let color;
    let tooltipTitle;

    if (percentage > 100) {
      color = "#FF4D4F";
      tooltipTitle = `Excede el límite autorizado (${formatFlow(flowLimit)} lt/s)`;
    } else if (percentage >= 90) {
      color = "#faad14";
      tooltipTitle = `Se acerca al límite autorizado (${formatFlow(flowLimit)} lt/s)`;
    } else {
      color = "#52C41A";
      tooltipTitle = `Dentro del límite autorizado (${formatFlow(flowLimit)} lt/s)`;
    }

    return (
      <Tooltip title={tooltipTitle}>
        <Tag
          style={{
            fontSize: 13,
            padding: "2px 10px",
            fontWeight: 600,
            margin: 0,
            borderColor: color + "40",
            background: color + "10",
            color,
          }}
        >
          {formatFlow(value)}
        </Tag>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "Estado",
      dataIndex: "send_dga",
      key: "send_dga",
      width: 130,
      render: (_, record) => {
        const hasError =
          record.is_error === true ||
          (record.return_dga && record.return_dga.toLowerCase().includes("error"));
        const hasVoucher = record.n_voucher && record.n_voucher !== "...";

        if (hasError) {
          return (
            <Tag
              icon={<CloseCircleOutlined />}
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                background: "#FFF2F0",
                borderColor: "#FFCCC7",
                color: "#FF4D4F",
              }}
            >
              Error
            </Tag>
          );
        }
        if (hasVoucher) {
          return (
            <Tag
              icon={<CheckCircleOutlined />}
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                background: "#F6FFED",
                borderColor: "#B7EB8F",
                color: "#52C41A",
              }}
            >
              Completado
            </Tag>
          );
        }
        return (
          <Tag
            icon={<SyncOutlined spin />}
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 600,
              background: "#FFFBE6",
              borderColor: "#FFE58F",
              color: "#D48806",
            }}
          >
            En Cola
          </Tag>
        );
      },
    },
    {
      title: "Fecha / Hora",
      dataIndex: "date_time_medition",
      key: "date_time_medition",
      width: 150,
      render: (text) => (
        <span style={{ fontSize: 13, color: "#1F3461", fontWeight: 500 }}>
          {dayjs(text).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
    {
      title: "Caudal (lt/s)",
      dataIndex: "flow",
      key: "flow",
      width: 120,
      align: "right",
      render: renderFlowValue,
    },
    {
      title: "Total (m³)",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: "right",
      render: (total) => (
        <span style={{ fontWeight: 500 }}>
          {total !== undefined ? formatInteger(total) : "—"}
        </span>
      ),
    },
    {
      title: "Nivel (m)",
      dataIndex: "water_table",
      key: "water_table",
      width: 100,
      align: "right",
      render: (water_table) => (
        <span style={{ fontWeight: 500 }}>
          {water_table !== undefined ? formatFlow(water_table) : "—"}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 70,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<FileTextOutlined />}
          style={{
            color: "#1F3461",
            background: "#f2f5fa",
            borderRadius: 6,
          }}
          onClick={() => openDetail(record)}
        />
      ),
    },
  ];

  return (
    <PageContainer>
      <SectionCard
        title="Registros DGA"
        extra={
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{
              borderRadius: token.borderRadiusLG,
            }}
          >
            Exportar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataDga}
          loading={externalLoading}
          size="small"
          rowKey="id"
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            size: "small",
          }}
          locale={{ emptyText: <Empty description="Sin registros DGA" /> }}
        />

        <div style={{ marginTop: 12, textAlign: "right" }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <Tag style={{ margin: 0, fontSize: 10, padding: "0 6px" }} color="#52C41A">Normal</Tag>{" "}
            <Tag style={{ margin: 0, fontSize: 10, padding: "0 6px" }} color="#faad14">Alerta</Tag>{" "}
            <Tag style={{ margin: 0, fontSize: 10, padding: "0 6px" }} color="#FF4D4F">Excedido</Tag>
            {" "}— Validación de caudal vs límite autorizado
          </Text>
        </div>
      </SectionCard>

      {/* Export modal como drawer pequeño */}
      <Drawer
        title="Exportar Registros DGA"
        placement="right"
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        width={420}
        destroyOnClose
      >
        <ExportModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          profile={state.selected_profile}
        />
      </Drawer>

      <DetailDrawer open={detailOpen} onClose={closeDetail} record={detailRecord} />
    </PageContainer>
  );
};

export default Registers;
