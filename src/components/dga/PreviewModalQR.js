import React, { useState } from "react";
import { Button, Space, Card, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import ModalQR from "./ModalQR";
import dayjs from "dayjs";

const { Title, Text } = Typography;

/**
 * Componente de prueba para visualizar el ModalQR sin necesidad de autenticación
 * Este componente muestra el certificado DGA con datos de ejemplo
 */
const PreviewModalQR = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Datos de ejemplo para el certificado
  const mockProfile = {
    title: "Pozo de Prueba - Ejemplo DGA",
    dga: {
      type_dga: "SUBTERRANEO",
      flow_granted_dga: 25.5,
      total_granted_dga: 50000,
      shac: "SHAC-2024-001234",
      date_created_code: dayjs().subtract(30, "days").toISOString(),
      date_start_compliance: dayjs().subtract(15, "days").toISOString(),
      region: "Metropolitana",
      commune: "Santiago",
      standard: "MAYOR",
    },
  };

  const mockCodeDga = "DGA-2024-001234";

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div
      style={{
        padding: "40px",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
      }}
    >
      <Card
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={2} style={{ color: "#1F3461" }}>
              Vista Previa del Certificado DGA
            </Title>
            <Text type="secondary">
              Este es un componente de prueba para visualizar el certificado en
              PDF sin necesidad de autenticación
            </Text>
          </div>

          <Card
            type="inner"
            title="Datos de Ejemplo"
            style={{ background: "#f9f9f9" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Código DGA: </Text>
                <Text>{mockCodeDga}</Text>
              </div>
              <div>
                <Text strong>Nombre: </Text>
                <Text>{mockProfile.title}</Text>
              </div>
              <div>
                <Text strong>Tipo: </Text>
                <Text>{mockProfile.dga.type_dga}</Text>
              </div>
              <div>
                <Text strong>Estándar: </Text>
                <Text>{mockProfile.dga.standard}</Text>
              </div>
              <div>
                <Text strong>Región: </Text>
                <Text>{mockProfile.dga.region}</Text>
              </div>
              <div>
                <Text strong>Comuna: </Text>
                <Text>{mockProfile.dga.commune}</Text>
              </div>
            </Space>
          </Card>

          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              size="large"
              icon={<EyeOutlined />}
              onClick={handleOpenModal}
              style={{
                background: "#1F3461",
                borderColor: "#1F3461",
                height: "50px",
                fontSize: "16px",
                padding: "0 40px",
              }}
            >
              Ver Certificado y Descargar PDF
            </Button>
          </div>

          <div
            style={{
              padding: "16px",
              background: "#f0f5ff",
              borderRadius: "8px",
              border: "1px solid #d6e4ff",
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              💡 <strong>Nota:</strong> Al hacer clic en "Descargar Ficha" en el
              modal, se generará un archivo PDF con el certificado completo.
              Puedes usar este componente para verificar cómo se ve el
              certificado antes de integrarlo en producción.
            </Text>
          </div>
        </Space>
      </Card>

      <ModalQR
        isModalVisible={isModalVisible}
        handleCancel={handleCloseModal}
        codeDga={mockCodeDga}
        profile={mockProfile}
      />
    </div>
  );
};

export default PreviewModalQR;

