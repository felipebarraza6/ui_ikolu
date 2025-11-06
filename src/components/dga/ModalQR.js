import React from "react";
import {
  Flex,
  QRCode,
  Button,
  Modal,
  Descriptions,
  Typography,
  Card,
  Divider,
  Row,
  Col,
  Tag,
} from "antd";
import logo from "../../assets/images/channels4_profile.jpg";
import logoDga from "../../assets/images/logo_dga.png";
import logoSh from "../../assets/images/logo-blanco.png";
import {
  ArrowRightOutlined,
  DownloadOutlined,
  QrcodeOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ModalQR = ({ isModalVisible, handleCancel, codeDga, profile }) => {
  // Extraer datos del perfil de forma segura
  const {
    type_dga,
    flow_granted_dga,
    total_granted_dga,
    shac,
    date_created_code,
    date_start_compliance,
    standard,
  } = profile?.dga || {};

  const profileTitle = profile?.title || "Sin nombre";

  // Determinar el sistema de medición según el estándar
  const getMeasurementSystem = () => {
    if (!standard) return "No especificado";

    if (standard === "CAUDALES_MUY_PEQUENOS" || standard === "CMP") {
      return "Caudales Muy Pequeños";
    } else if (standard === "MAYOR" || standard === "MEDIO") {
      return "Sistema General";
    } else if (standard === "MENOR") {
      return "Sistema Básico";
    }
    return standard;
  };

  // Validar la frecuencia según el estándar según el estándar DGA
  // MAYOR: 1 registro cada hora, MEDIO: 1 registro cada día, MENOR: 1 registro cada mes, CMP: 1 registro cada año
  const getFrequencyByStandard = () => {
    if (!standard) return "N/A";

    if (standard === "MAYOR") {
      return "1 registro cada hora";
    } else if (standard === "MEDIO") {
      return "1 registro cada día";
    } else if (standard === "MENOR") {
      return "1 registro cada mes";
    } else if (standard === "CAUDALES_MUY_PEQUENOS" || standard === "CMP") {
      return "1 registro cada año";
    }

    // Si no coincide con ningún estándar conocido, usar el valor original
    const originalFrequency = profile?.dga?.compliance_days;
    return originalFrequency
      ? `1 registro cada ${originalFrequency} días`
      : "N/A";
  };

  const frequency = getFrequencyByStandard();

  const measurementSystem = getMeasurementSystem();

  const handleDownload = () => {
    const input = document.getElementById("qr-and-table");
    html2canvas(input, { padding: 10 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `Ficha_DGA_${codeDga || "SinCodigo"}.png`;
      link.click();
    });
  };

  return (
    <Modal
      title={null}
      open={isModalVisible}
      width="660px"
      centered
      footer={[
        <Button key="back" onClick={handleCancel} icon={<ArrowRightOutlined />}>
          Cerrar
        </Button>,
        <Button
          key="download"
          type="primary"
          onClick={handleDownload}
          icon={<DownloadOutlined />}
        >
          Descargar Ficha
        </Button>,
      ]}
      onCancel={handleCancel}
      bodyStyle={{ padding: 0, maxHeight: "90vh", overflowY: "auto" }}
    >
      <div
        id="qr-and-table"
        style={{
          background: "linear-gradient(135deg, #1F3461 0%, #2a4a7f 100%)",
          padding: "40px ",
          width: "595px",
          minHeight: "842px",
          position: "relative",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header de la ficha */}
        <Flex align="center" style={{ marginBottom: 24 }}>
          <Flex justify="space-around" align="center" gap="middle" vertical>
            <img
              src={logoSh}
              alt="Logo DGA"
              style={{
                width: "42%",
              }}
            />
            <div>
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                Servicio de Monitoreo de agua subterránea
                <br /> para cumplimiento RES_DGA_1.238_MEE y 50
              </Text>
            </div>
          </Flex>
        </Flex>

        <Card
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            flex: 1,
          }}
          bodyStyle={{ padding: "32px" }}
        >
          {/* QR Code centrado arriba */}
          <Flex vertical align="center" gap="large">
            <div
              style={{
                background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <QRCode
                value={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${
                  codeDga || "SinCodigo"
                }`}
                color="#1F3461"
                size={150}
                icon={logo}
                iconSize={55}
                bordered={false}
              />
            </div>

            <div style={{ textAlign: "center", width: "100%" }}>
              <Text strong style={{ fontSize: 16, color: "#1F3461" }}>
                <QrcodeOutlined style={{ marginRight: 8 }} />

                {profileTitle}
              </Text>
              <div
                style={{
                  marginTop: 10,
                  padding: "12px 24px",
                  background: "#f5f7fa",
                  borderRadius: "8px",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1F3461",
                  letterSpacing: "1.5px",
                }}
              >
                {codeDga || "N/A"}
              </div>
            </div>

            <div style={{ width: "100%" }}>
              <Row gutter={[14, 14]}>
                <Col span={12}>
                  <div
                    style={{
                      background: "#f5f7fa",
                      padding: "5px 15px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F3461",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1F3461",
                      }}
                    >
                      Fecha Creación
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {date_created_code
                          ? dayjs(date_created_code).format("DD/MM/YYYY")
                          : "N/A"}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "#f5f7fa",
                      padding: "5px 15px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F3461",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1F3461",
                      }}
                    >
                      Inicio Cumplimiento
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {date_start_compliance
                          ? dayjs(date_start_compliance).format("DD/MM/YYYY")
                          : "N/A"}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "#f5f7fa",
                      padding: "5px 15px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F3461",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1F3461",
                      }}
                    >
                      Tipo de Captación
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {type_dga || "N/A"}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "#f5f7fa",
                      padding: "5px 15px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F3461",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1F3461",
                      }}
                    >
                      Sistema de Medición
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {measurementSystem}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "#f5f7fa",
                      padding: "5px 15px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F3461",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1F3461",
                      }}
                    >
                      Caudal Autorizado
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {flow_granted_dga || "N/A"}{" "}
                        <span style={{ fontSize: 12 }}>lt/s</span>
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "#f5f7fa",
                      padding: "5px 15px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F3461",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1F3461",
                      }}
                    >
                      Volumen Autorizado
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {total_granted_dga
                          ? total_granted_dga.toLocaleString("es-CL")
                          : "N/A"}{" "}
                        <span style={{ fontSize: 12 }}>m³</span>
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "#f5f7fa",
                      padding: "5px 15px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F3461",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1F3461",
                      }}
                    >
                      SHAC
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {shac || "N/A"}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "#f5f7fa",
                      padding: "5px 15px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F3461",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1F3461",
                      }}
                    >
                      Estándar
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {standard === "CAUDALES_MUY_PEQUENOS"
                          ? "Muy Pequeños"
                          : standard || "N/A"}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <div
                    style={{
                      background: "#f5f7fa",
                      padding: "5px 15px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #1F3461",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1F3461",
                      }}
                    >
                      Frecuencia de Envío
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {frequency}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>

              <div
                style={{
                  marginTop: 20,
                  padding: "12px 14px",
                  background: "#f0f5ff",
                  borderRadius: "8px",
                  border: "1px solid #d6e4ff",
                  textAlign: "center",
                }}
              >
                <Text type="secondary" style={{ fontSize: 11 }}>
                  📱 Escanee el código QR para acceder al portal oficial SNIA de
                  la DGA
                </Text>
              </div>
            </div>
          </Flex>
        </Card>

        {/* Footer */}
        <Flex align="center" style={{ marginTop: 16 }} vertical gap="small">
          <Text style={{ color: "white", textAlign: "center" }}>
            Si requiere intervenir el pozo, o tiene problemas de Harware o
            Software, contáctese con soporte@smarthydro.cl
          </Text>
          <Text style={{ color: "white", fontSize: 12 }}>
            https://smarthydro.cl
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            Documento generado por Ikolu App •{" "}
            {dayjs().format("DD/MM/YYYY HH:mm")}
          </Text>
        </Flex>
      </div>
    </Modal>
  );
};

export default ModalQR;
