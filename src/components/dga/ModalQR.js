import React from "react";
import { Flex, QRCode, Button, Modal, Descriptions } from "antd";
import logo from "../../assets/images/channels4_profile.jpg";
import {
  QrcodeOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ModalQR = ({ data }) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  var {
    type_dga,
    code_dga,
    flow_granted_dga,
    total_granted_dga,
    shac,
    date_created_code,
    date_start_compliance,
    standard,
  } = data;

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleDownload = () => {
    const input = document.getElementById("qr-and-table");
    html2canvas(input, { padding: 10 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `Ficha_DGA_${code_dga}.png`;
      link.click();
    });
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<QrcodeOutlined />}
        style={{ width: "70px" }}
        onClick={showModal}
        shape="round"
      ></Button>
      <Modal
        title={"Ficha DGA MEE"}
        open={isModalVisible}
        width={800}
        footer={[
          <Button
            key="back"
            onClick={handleCancel}
            icon={<ArrowRightOutlined />}
          >
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
              value={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${data.code_dga}`}
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
                {code_dga}
              </Descriptions.Item>
              <Descriptions.Item
                label="Fecha Creación"
                span={3}
                style={{ color: "white" }}
              >
                {date_created_code}
              </Descriptions.Item>

              <Descriptions.Item
                label="Tipo DGA"
                span={3}
                style={{ color: "white" }}
              >
                {type_dga}
              </Descriptions.Item>
              <Descriptions.Item
                label="Caudal Otorgado (lt/s)"
                span={3}
                style={{ color: "white" }}
              >
                {flow_granted_dga}
              </Descriptions.Item>
              <Descriptions.Item
                label="Total Otorgado (m³)"
                span={3}
                style={{ color: "white" }}
              >
                {total_granted_dga && total_granted_dga.toLocaleString("es-CL")}
              </Descriptions.Item>
              <Descriptions.Item
                label="SHAC"
                span={3}
                style={{ color: "white" }}
              >
                {shac}
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
    </div>
  );
};

export default ModalQR;
