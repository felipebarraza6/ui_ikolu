import React, { useContext, useState, useEffect } from "react";
import {
  Table,
  Tooltip,
  Button,
  Typography,
  DatePicker,
  Form,
  ConfigProvider,
  Space,
  Tag,
  notification,
  Modal,
  Row,
  Col,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ExportOutlined,
  WarningOutlined,
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
import QueueAnim from "rc-queue-anim";

dayjs.locale("es");

const { Text, Title } = Typography;

// --- Componente del Modal de Exportación ---
const ExportModal = ({ open, onCancel, profile }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const disabledDate = (current) => {
    const startOfYear = dayjs().startOf("year");
    const endOfYear = dayjs().endOf("year");
    return current && (current < startOfYear || current > endOfYear);
  };

  const handleDownload = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const initialDate = values.range[0].format("YYYY-MM-DD");
      const finishDate = values.range[1].format("YYYY-MM-DD");
      const codeDga = profile?.dga?.code_dga || "SinCodigo";
      const title = `Reporte_MEE_${codeDga}`;

      await sh.get_data_sh_range_to_excel_dga(
        profile.id,
        initialDate,
        finishDate,
        title
      );

      notification.success({
        message: "Descarga Exitosa",
        description: `Archivo "${title}.xlsx" descargado correctamente.`,
      });

      onCancel();
    } catch (error) {
      console.error("Error en la descarga:", error);
      notification.error({
        message: "Error en la Descarga",
        description:
          error.response?.data?.message ||
          "No se pudo generar el reporte. Por favor, inténtelo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Exportar Registros DGA"
      open={open}
      onCancel={onCancel}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleDownload}
          icon={<DownloadOutlined />}
        >
          Descargar
        </Button>,
      ]}
    >
      <ConfigProvider locale={locale}>
        <Form form={form} layout="vertical" name="export_form">
          <p>
            Seleccione el rango de fechas para generar el reporte de la DGA.
            Solo se pueden seleccionar días dentro del año en curso.
          </p>
          <Form.Item
            name="range"
            label="Rango de Fechas"
            rules={[
              {
                required: true,
                message: "Por favor, seleccione un rango de fechas.",
              },
            ]}
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              disabledDate={disabledDate}
            />
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Modal>
  );
};

// --- Componente Principal de Registros ---
const Registers = () => {
  const { state } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const m2_permission = state.selected_profile?.profile_ikolu?.m2 || false;

  // Obtener datos desde el perfil (módulo m2)
  const dataDga = state.selected_profile?.modules?.m2 || [];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notification.success({
      message: "Copiado",
      description: "Número de comprobante copiado al portapapeles.",
      placement: "bottomRight",
    });
  };

  const renderValidatedValue = (value, limit, formatterFn) => {
    if (limit === null || limit === undefined || limit === 0) {
      return <Text>{formatterFn(value)}</Text>;
    }
    const numericValue = Number(value);
    const percentage = (numericValue / limit) * 100;
    let color;
    let tooltipTitle;

    if (percentage > 100) {
      color = "red";
      tooltipTitle = `Valor excede el límite autorizado (${formatterFn(
        limit
      )})`;
    } else if (percentage >= 90) {
      color = "orange";
      tooltipTitle = `Valor se acerca al límite autorizado (${formatterFn(
        limit
      )})`;
    } else {
      color = "green";
      tooltipTitle = `Valor dentro del límite autorizado (${formatterFn(
        limit
      )})`;
    }

    return (
      <Tooltip title={tooltipTitle}>
        <Tag color={color} style={{ fontSize: "14px", padding: "2px 8px" }}>
          {formatterFn(value)}
        </Tag>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "Estado",
      dataIndex: "send_dga",
      key: "send_dga",
      width: 120,
      render: (send_dga, record) => {
        const hasVoucher = record.n_voucher && record.n_voucher !== "...";
        const hasError =
          record.return_dga &&
          record.return_dga.toLowerCase().includes("error");

        if (hasError) {
          return (
            <Tag icon={<CloseCircleOutlined />} color="error">
              Error
            </Tag>
          );
        }
        if (hasVoucher) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Completado
            </Tag>
          );
        }
        return (
          <Tag icon={<SyncOutlined spin />} color="processing">
            En Cola
          </Tag>
        );
      },
    },
    {
      title: "Fecha/Hora Medición",
      dataIndex: "date_time_medition",
      key: "date_time_medition",
      width: 180,
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Caudal (L/s)",
      dataIndex: "flow",
      key: "flow",
      width: 120,
      align: "right",
      render: (flow) =>
        renderValidatedValue(
          flow,
          state.selected_profile?.dga?.flow_granted_dga,
          formatFlow
        ),
    },
    {
      title: "Total (m³)",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: "right",
      render: (total) =>
        renderValidatedValue(
          total,
          state.selected_profile?.dga?.total_granted_dga,
          formatInteger
        ),
    },
    {
      title: "Nivel Freático",
      dataIndex: "water_table",
      key: "water_table",
      width: 120,
      align: "right",
      render: (water_table) => renderValidatedValue(water_table, 0, formatFlow),
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Ver detalle del envío DGA">
          <Button
            shape="circle"
            icon={<FileTextOutlined />}
            onClick={() => {
              Modal.info({
                title: "Detalle del Envío a la DGA",
                content: (
                  <div>
                    <p>
                      <strong>Respuesta del servidor:</strong>
                    </p>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        background: "#f5f5f5",
                        padding: "10px",
                        borderRadius: "4px",
                      }}
                    >
                      {record.return_dga || "Sin respuesta registrada."}
                    </pre>
                    {record.n_voucher && record.n_voucher !== "..." && (
                      <>
                        <p style={{ marginTop: "10px" }}>
                          <strong>Número de Comprobante:</strong>
                        </p>
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            background: "#f5f5f5",
                            padding: "10px",
                            borderRadius: "4px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {record.n_voucher}
                          <Tooltip title="Copiar comprobante">
                            <Button
                              icon={<CopyOutlined />}
                              onClick={() => copyToClipboard(record.n_voucher)}
                              size="small"
                              type="text"
                            />
                          </Tooltip>
                        </pre>
                      </>
                    )}
                  </div>
                ),
                onOk() {},
              });
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <QueueAnim type="right" duration={500}>
      <div key="registers">
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Col>
            <Title level={4}>Registros de las últimas 48 horas</Title>
          </Col>
          <Col>
            <Tooltip
              title={
                !m2_permission
                  ? "No tienes permisos para exportar."
                  : "Exportar registros a Excel para la DGA"
              }
            >
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={() => setIsModalOpen(true)}
                disabled={!m2_permission}
              >
                Exportar
              </Button>
            </Tooltip>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={dataDga}
          bordered
          loading={loading}
          size="small"
          rowKey="id"
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 10,
            responsive: true,
            showSizeChanger: false,
          }}
          style={{ overflowX: "auto" }}
        />
        <ExportModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          profile={state.selected_profile}
        />
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <strong>Leyenda de Validación:</strong>{" "}
            <Tag color="green">Normal</Tag> <Tag color="orange">Alerta</Tag>{" "}
            <Tag color="red">Excedido</Tag>
          </Text>
        </div>
      </div>
    </QueueAnim>
  );
};

export default Registers;
