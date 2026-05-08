import React, { useRef } from "react";
import { Flex, QRCode, Button, Drawer, Typography, Card, Row, Col } from "antd";
import logo from "../../assets/images/channels4_profile.jpg";
import logoSh from "../../assets/images/logo-blanco.png";
import { DownloadOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import dayjs from "dayjs";

const { Text } = Typography;

const ModalQR = ({ isModalVisible, handleCancel, codeDga, profile }) => {
  const captureRef = useRef(null);

  const {
    type_dga,
    flow_granted_dga,
    total_granted_dga,
    shac,
    date_created_code,
    date_start_compliance,
    region,
    standard,
  } = profile?.dga || {};

  const profileTitle = profile?.title || "Sin nombre";

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

  const getFrequencyByStandard = () => {
    if (!standard) return "N/A";
    if (standard === "MAYOR") return "1 registro cada hora";
    if (standard === "MEDIO") return "1 registro cada día";
    if (standard === "MENOR") return "1 registro cada mes";
    if (standard === "CAUDALES_MUY_PEQUENOS" || standard === "CMP")
      return "1 registro cada año";
    const originalFrequency = profile?.dga?.compliance_days;
    return originalFrequency
      ? `1 registro cada ${originalFrequency} días`
      : "N/A";
  };

  const frequency = getFrequencyByStandard();
  const measurementSystem = getMeasurementSystem();

  const handleDownloadImage = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `Ficha_DGA_${codeDga || "SinCodigo"}_${dayjs().format(
        "YYYYMMDD"
      )}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Error generando imagen:", err);
    }
  };

  return (
    <Drawer
      title={
        <span style={{ color: "#BDC00C", fontWeight: 700, fontSize: 17 }}>
          FICHA DGA - QR
        </span>
      }
      placement="right"
      onClose={handleCancel}
      open={isModalVisible}
      width={640}
      styles={{
        body: { background: "#0a0e27", padding: "24px" },
        header: {
          background: "#0f152e",
          borderBottom: "1px solid rgba(255,107,53,0.25)",
        },
        mask: { background: "rgba(0,0,0,0.75)" },
      }}
      closeIcon={<span style={{ color: "#BDC00C", fontSize: 18 }}>✕</span>}
      extra={
        <Button
          type="primary"
          onClick={handleDownloadImage}
          icon={<DownloadOutlined />}
          style={{
            background: "#FF6B35",
            borderColor: "#FF6B35",
            fontWeight: 600,
          }}
        >
          Descargar Ficha
        </Button>
      }
    >
      <div
        ref={captureRef}
        style={{
          background: "linear-gradient(135deg, #1F3461 0%, #2a4a7f 100%)",
          padding: "32px",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <Flex align="center" justify="center" vertical gap="small" style={{ marginBottom: 20 }}>
          <img
            src={logoSh}
            alt="Smart Hydro"
            style={{ width: 120, marginBottom: 8 }}
          />
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Servicio de Monitoreo de agua subterránea
            <br />
            para cumplimiento RES_DGA_1.238_MEE
          </Text>
        </Flex>

        <Card
          style={{
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <Flex vertical align="center" gap="middle">
            <div
              style={{
                background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
                padding: "20px",
                borderRadius: 12,
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
                iconSize={50}
                bordered={false}
              />
            </div>

            <div style={{ textAlign: "center", width: "100%" }}>
              <Text strong style={{ fontSize: 16, color: "#1F3461" }}>
                {profileTitle}
              </Text>
              <div
                style={{
                  marginTop: 8,
                  padding: "10px 20px",
                  background: "#f5f7fa",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1F3461",
                  letterSpacing: 1.5,
                }}
              >
                {codeDga || "N/A"}
              </div>
            </div>

            <div style={{ width: "100%" }}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <InfoBox
                    label="Fecha Creación"
                    value={
                      date_created_code
                        ? dayjs(date_created_code).format("DD/MM/YYYY")
                        : "N/A"
                    }
                  />
                </Col>
                <Col span={12}>
                  <InfoBox
                    label="Inicio Cumplimiento"
                    value={
                      date_start_compliance
                        ? dayjs(date_start_compliance).format("DD/MM/YYYY")
                        : "N/A"
                    }
                  />
                </Col>
                <Col span={12}>
                  <InfoBox
                    label="Tipo de Captación"
                    value={type_dga || "N/A"}
                  />
                </Col>
                <Col span={12}>
                  <InfoBox
                    label="Sistema de Medición"
                    value={measurementSystem}
                  />
                </Col>
                <Col span={12}>
                  <InfoBox
                    label="Caudal Autorizado"
                    value={
                      flow_granted_dga
                        ? `${flow_granted_dga} lt/s`
                        : "N/A"
                    }
                  />
                </Col>
                <Col span={12}>
                  <InfoBox
                    label="Volumen Autorizado"
                    value={
                      total_granted_dga
                        ? `${total_granted_dga.toLocaleString("es-CL")} m³`
                        : "N/A"
                    }
                  />
                </Col>
                <Col span={12}>
                  <InfoBox label="SHAC" value={shac || "N/A"} />
                </Col>
                <Col span={12}>
                  <InfoBox
                    label="Estándar"
                    value={
                      standard === "CAUDALES_MUY_PEQUENOS"
                        ? "Muy Pequeños"
                        : standard || "N/A"
                    }
                  />
                </Col>
                <Col span={12}>
                  <InfoBox label="Frecuencia de Envío" value={frequency} />
                </Col>
                <Col span={12}>
                  <InfoBox
                    label="Región"
                    value={region ? region.toUpperCase() : "N/A"}
                  />
                </Col>
              </Row>

              <div
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  background: "#f0f5ff",
                  borderRadius: 8,
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

        <Flex align="center" vertical gap="small" style={{ marginTop: 16 }}>
          <Text style={{ color: "white", textAlign: "center", fontSize: 12 }}>
            Si requiere intervenir el pozo, o tiene problemas de Hardware o
            Software, contáctese con soporte@smarthydro.cl
          </Text>
          <Text style={{ color: "white", fontSize: 12 }}>
            https://smarthydro.cl
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
            Documento generado por Ikolu App •{" "}
            {dayjs().format("DD/MM/YYYY HH:mm")}
          </Text>
        </Flex>
      </div>
    </Drawer>
  );
};

const InfoBox = ({ label, value }) => (
  <div
    style={{
      background: "#f5f7fa",
      padding: "10px 12px",
      borderRadius: 8,
      borderLeft: "3px solid #1F3461",
      minHeight: 56,
    }}
  >
    <Text
      type="secondary"
      style={{ fontSize: 11, fontWeight: 600, color: "#1F3461" }}
    >
      {label}
    </Text>
    <div style={{ marginTop: 4 }}>
      <Text strong style={{ fontSize: 13, lineHeight: 1.4 }}>
        {value}
      </Text>
    </div>
  </div>
);

export default ModalQR;
