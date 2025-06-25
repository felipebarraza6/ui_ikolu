import React from "react";
import { Flex, QRCode, Button, Modal, Descriptions } from "antd";
import logo from "../../assets/images/channels4_profile.jpg";
import { ArrowRightOutlined, DownloadOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";

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
      title={"Ficha DGA MEE"}
      open={isModalVisible}
      width={800}
      footer={[
        <Button key="back" onClick={handleCancel} icon={<ArrowRightOutlined />}>
          Volver
        </Button>,
        <Button
          key="download"
          type="primary"
          onClick={handleDownload}
          icon={<DownloadOutlined />}
        >
          Descargar
        </Button>,
      ]}
      onCancel={handleCancel}
    >
      <div id="qr-and-table" style={{ padding: "20px" }}>
        <Flex
          style={{ width: "100%", height: "100%", margin: "20px" }}
          justify="space-around"
          align="center"
        >
          <QRCode
            value={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${
              codeDga || "SinCodigo"
            }`}
            color="black"
            size={300}
            icon={logo}
            style={{
              borderColor: "transparent",
            }}
            iconSize={100}
          />
          <Descriptions
            style={{
              width: "50%",
              marginLeft: "10px",
              backgroundColor: "rgb(0, 111, 179)",
              borderRadius: "10px",
              color: "white",
            }}
            labelStyle={{ color: "white" }}
            layout="horizontal"
            size="small"
            bordered
          >
            <Descriptions.Item
              label="Código DGA"
              span={3}
              style={{ color: "white" }}
            >
              {codeDga || "Sin código"}
            </Descriptions.Item>
            <Descriptions.Item
              label="Fecha Creación"
              span={3}
              style={{ color: "white" }}
            >
              {date_created_code || "Sin fecha"}
            </Descriptions.Item>
            <Descriptions.Item
              label="Tipo DGA"
              span={3}
              style={{ color: "white" }}
            >
              {type_dga || "Sin tipo"}
            </Descriptions.Item>
            <Descriptions.Item
              label="Caudal Otorgado (lt/s)"
              span={3}
              style={{ color: "white" }}
            >
              {flow_granted_dga || "Sin caudal"}
            </Descriptions.Item>
            <Descriptions.Item
              label="Total Otorgado (m³)"
              span={3}
              style={{ color: "white" }}
            >
              {total_granted_dga
                ? total_granted_dga.toLocaleString("es-CL")
                : "Sin total"}
            </Descriptions.Item>
            <Descriptions.Item label="SHAC" span={3} style={{ color: "white" }}>
              {shac || "Sin SHAC"}
            </Descriptions.Item>
            <Descriptions.Item
              label="Estándar"
              span={3}
              style={{ color: "white" }}
            >
              {standard
                ? standard === "CAUDALES_MUY_PEQUENOS"
                  ? "Muy pequeños"
                  : standard
                : "Sin registro"}
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      </div>
    </Modal>
  );
};

export default ModalQR;
