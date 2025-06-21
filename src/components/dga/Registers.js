import React, { useContext, useState, useEffect } from "react";
import {
  Table,
  Tooltip,
  Flex,
  Button,
  Typography,
  Alert,
  DatePicker,
  Form,
  ConfigProvider,
} from "antd";
import QueueAnim from "rc-queue-anim";
import {
  WarningFilled,
  CheckCircleFilled,
  FileExcelFilled,
  LoadingOutlined,
  FileExcelOutlined,
  CopyOutlined,
  CloudDownloadOutlined,
  ConsoleSqlOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";

// Configurar dayjs para español
dayjs.locale("es");

const Registers = ({ dataDga }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { Text } = Typography;
  const { state } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const selected = state.selected_profile.id;
  const profile_ikolu = state.selected_profile.profile_ikolu;
  const profile_dga = state.selected_profile.dga;
  const catchment_points = state.profile_client;

  // Detectar cambios de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columns = [
    {
      title: "Fecha/hora",
      dataIndex: "date_time_medition",
      key: "date",
      align: "center",
      width: isMobile ? 100 : 140,
      fixed: isMobile ? "left" : false,
      render: (date) => {
        return (
          <Text style={{ fontSize: isMobile ? "11px" : "14px" }}>
            {date.slice(5, 10)}
            <br />
            {date.slice(11, 16)} hrs
          </Text>
        );
      },
    },
    {
      title: "Caudal (L/s)",
      dataIndex: "flow",
      key: "flow",
      align: "center",
      width: isMobile ? 90 : 120,
      render: (flow) => {
        return (
          <Text style={{ fontSize: isMobile ? "12px" : "14px" }}>{flow}</Text>
        );
      },
    },
    {
      title: "Total (m³)",
      key: "total",
      align: "center",
      width: isMobile ? 100 : 120,
      render: (record) => (
        <Text style={{ fontSize: isMobile ? "12px" : "14px" }}>
          {record.total.toLocaleString("es-CL")}
        </Text>
      ),
    },
    {
      title: "Nivel Freático (m)",
      hidden: state.user.id === 59,
      dataIndex: "water_table",
      key: "water_table",
      align: "center",
      width: isMobile ? 110 : 140,
      render: (water_table) => (
        <Text style={{ fontSize: isMobile ? "12px" : "14px" }}>
          {water_table}
        </Text>
      ),
    },
    {
      title: "MEE",
      align: "center",
      key: "proof",
      width: isMobile ? 120 : 200,
      render: (obj) => {
        if (obj.n_voucher !== "No se pudo obtener el comprobante") {
          return (
            <div
              style={{
                backgroundColor: "#1F3461",
                color: "white",
                padding: isMobile ? "3px" : "5px",
                cursor: "pointer",
                borderRadius: "4px",
                fontSize: isMobile ? "10px" : "12px",
              }}
            >
              <Tooltip
                title={obj.return_dga}
                color={"green"}
                trigger={["click"]}
                placement={isMobile ? "top" : "left"}
              >
                <Flex
                  justify="center"
                  align="center"
                  gap="4px"
                  vertical={isMobile}
                >
                  <CheckCircleFilled
                    style={{ fontSize: isMobile ? "10px" : "12px" }}
                  />
                  <Text
                    style={{
                      fontSize: isMobile ? "9px" : "12px",
                      color: "white",
                      textAlign: "center",
                    }}
                    copyable={{
                      text: obj.n_voucher,
                      icon: [
                        <CopyOutlined
                          key="copy-icon"
                          style={{
                            color: "white",
                            fontSize: isMobile ? "8px" : "10px",
                          }}
                        />,
                        <CheckCircleFilled
                          key="copied-icon"
                          style={{
                            color: "white",
                            fontSize: isMobile ? "8px" : "10px",
                          }}
                        />,
                      ],
                    }}
                  >
                    {isMobile
                      ? obj.n_voucher.slice(0, 6) + "..."
                      : obj.n_voucher.slice(0, 10) + "..."}
                  </Text>
                </Flex>
              </Tooltip>
            </div>
          );
        } else {
          return (
            <Flex gap="4px" vertical={isMobile} align="center">
              <LoadingOutlined
                style={{
                  color: "#1F3461",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              />
              <Text
                style={{
                  fontSize: isMobile ? "10px" : "12px",
                  textAlign: "center",
                }}
              >
                {isMobile ? "En cola" : "En cola de envío a DGA"}
              </Text>
              <Tooltip
                title={<span style={{ color: "black" }}>{obj.return_dga}</span>}
                color="#fa8c16"
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<WarningFilled />}
                  style={{
                    backgroundColor: "#fa8c16",
                    borderColor: "#fa8c16",
                    fontSize: isMobile ? "10px" : "12px",
                    height: isMobile ? "20px" : "auto",
                  }}
                >
                  {isMobile ? "!" : "estado"}
                </Button>
              </Tooltip>
            </Flex>
          );
        }
      },
    },
  ];

  const getReport = async (values) => {
    var datei = new Date(values.initialDate);
    var datef = new Date(values.finishDate);
    values = {
      ...values,
      initialDate: datei.toISOString().split("T")[0],
      finishDate: datef.toISOString().split("T")[0],
    };
    setLoading(true);

    const getReport = await sh
      .get_data_sh_range_to_excel_dga(
        selected,
        values.initialDate,
        values.finishDate,
        profile_dga.code_dga
      )
      .then((res) => {
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
      });
  };

  return (
    <QueueAnim delay={500} type={["top", "bottom"]}>
      <div key={"registers"} style={{ width: "100%" }}>
        {/* CSS para ocultar scrollbar pero mantener funcionalidad */}

        <Table
          style={{
            width: isMobile ? "100%" : "800px",
            borderRadius: "0px",
          }}
          title={() => (
            <Flex
              justify="center"
              align="center"
              vertical={isMobile}
              style={{ width: "100%", height: "100%" }}
              gap={isMobile ? "8px" : "small"}
            >
              <Form
                layout={isMobile ? "vertical" : "inline"}
                style={{ width: "100%" }}
                onFinish={getReport}
              >
                <Flex
                  gap={isMobile ? "8px" : "middle"}
                  vertical={isMobile}
                  align={isMobile ? "stretch" : "center"}
                  justify="center"
                >
                  <Form.Item
                    name={"initialDate"}
                    rules={[{ required: true, message: "" }]}
                    style={{ marginBottom: isMobile ? "8px" : "0" }}
                  >
                    <ConfigProvider locale={locale}>
                      <DatePicker
                        placeholder="Desde"
                        disabled={!profile_ikolu.m2}
                        format="DD/MM/YYYY"
                        style={{ width: isMobile ? "100%" : "auto" }}
                      />
                    </ConfigProvider>
                  </Form.Item>
                  <Form.Item
                    name={"finishDate"}
                    rules={[{ required: true, message: "" }]}
                    style={{ marginBottom: isMobile ? "8px" : "0" }}
                  >
                    <ConfigProvider locale={locale}>
                      <DatePicker
                        placeholder="Hasta"
                        disabled={!profile_ikolu.m2}
                        format="DD/MM/YYYY"
                        style={{ width: isMobile ? "100%" : "auto" }}
                      />
                    </ConfigProvider>
                  </Form.Item>
                  <Form.Item style={{ marginBottom: "0" }}>
                    <Button
                      htmlType="submit"
                      type="primary"
                      shape="round"
                      icon={<FileExcelOutlined />}
                      loading={loading}
                      disabled={!profile_ikolu.m2}
                      style={{
                        width: isMobile ? "100%" : "auto",
                        background: "#1F3461",
                        borderColor: "#1F3461",
                      }}
                    >
                      Descargar
                    </Button>
                  </Form.Item>
                </Flex>
              </Form>
            </Flex>
          )}
          size="small"
          dataSource={dataDga}
          bordered
          columns={columns}
          pagination={{
            defaultPageSize: isMobile ? 5 : 10,
            position: ["bottomCenter"],
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} registros`,
          }}
          scroll={
            isMobile
              ? {
                  x: 520, // Solo scroll horizontal en móvil
                  y: 300,
                }
              : {
                  y: 400, // Solo scroll vertical en desktop
                  x: 520,
                }
          }
        />
      </div>
    </QueueAnim>
  );
};

export default Registers;
