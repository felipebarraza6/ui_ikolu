import React from "react";
import {
  Typography,
  Collapse,
  Row,
  Col,
  Card,
  Flex,
  List,
  Avatar,
  Tag,
  Space,
} from "antd";
import {
  QuestionCircleOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  FolderOpenOutlined,
  FileExcelOutlined,
  MessageOutlined,
  HeartOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import { useResponsive } from "../../hooks/useResponsive";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// Estilos compartidos para los paneles del acordeón
const panelStyle = {
  marginBottom: 24,
  background: "#ffffff",
  borderRadius: 8,
  border: "1px solid #f0f0f0",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const DGA_COLOR = "#237804"; // Verde para cumplimiento

const UserDocumentation = () => {
  const { isMobile } = useResponsive();

  // --- CONTENIDO DETALLADO POR MÓDULO ---

  const dgaContent = (
    <Space direction="vertical" size="middle">
      <Paragraph>
        Este módulo es su central para mantener los reportes a la DGA en orden y
        al día. Nos encargamos de la parte técnica para que usted cumpla con la
        normativa sin complicaciones.
      </Paragraph>
      <Card type="inner" title="Diagnóstico Inteligente: Su resumen en un clic">
        <Paragraph>
          Con un solo clic, esta herramienta le muestra un resumen claro del
          estado de sus reportes:
        </Paragraph>
        <List
          dataSource={[
            "✅ Registros Completados: Los que la DGA ya aceptó.",
            "⏳ Registros Pendientes: Los que están en camino a ser informados.",
            "❌ Registros con Error: Si alguno necesita su atención por algún motivo.",
          ]}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Card>
      <Card type="inner" title="Gráficos de Cumplimiento">
        <Paragraph>
          Vea de forma muy visual si su consumo de agua se mantiene dentro de lo
          autorizado. Una línea roja le indicará su límite para que nunca se
          pase por accidente y pueda tomar acciones a tiempo.
        </Paragraph>
      </Card>
    </Space>
  );

  const smartAnalysisContent = (
    <Space direction="vertical" size="middle">
      <Paragraph>
        Este es el cerebro de la plataforma. Le ayuda a entender el
        comportamiento de su pozo a lo largo del tiempo, respondiendo preguntas
        importantes con gráficos fáciles de entender.
      </Paragraph>
      <Card type="inner" title="¿Qué puedo descubrir aquí?">
        <List
          dataSource={[
            "¿Cómo cambia el nivel de mi pozo a través de las estaciones?",
            "¿En qué meses del año extraigo más agua?",
            "Entender si extraer más agua afecta mucho el nivel de mi pozo.",
          ]}
          renderItem={(item) => (
            <List.Item>
              <HeartOutlined style={{ color: "#1890ff", marginRight: 8 }} />
              {item}
            </List.Item>
          )}
        />
      </Card>
      <Paragraph>
        Use los filtros de fecha para analizar un período específico, como el
        último verano o el año pasado completo. ¡Explore sus datos!
      </Paragraph>
    </Space>
  );

  const downloadContent = (
    <Space direction="vertical" size="middle">
      <Paragraph>
        ¿Necesita tener una copia de sus datos en su computador? Desde aquí
        puede descargar todo su historial de mediciones de forma sencilla.
      </Paragraph>
      <Card type="inner" title="¿Para qué me sirve?">
        <List
          dataSource={[
            "Para guardar un respaldo seguro de toda su información.",
            "Si necesita hacer sus propios cálculos o gráficos en Excel.",
            "Para compartir la información con un asesor o para un informe.",
          ]}
          renderItem={(item) => (
            <List.Item>
              <FileExcelOutlined style={{ color: "green", marginRight: 8 }} />
              {item}
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );

  const docResContent = (
    <Space direction="vertical" size="middle">
      <Paragraph>
        Un lugar único y seguro para guardar todos los documentos importantes de
        su pozo, como planos, certificados o resoluciones.
      </Paragraph>
      <List
        dataSource={[
          "Suba archivos fácilmente desde su computador.",
          "Descárguelos en cualquier momento que los necesite.",
          "Elimine archivos de forma segura con una confirmación para evitar accidentes.",
        ]}
        renderItem={(item) => (
          <List.Item>
            <LikeOutlined style={{ marginRight: 8 }} />
            {item}
          </List.Item>
        )}
      />
    </Space>
  );

  const alertsContent = (
    <Space direction="vertical" size="middle">
      <Paragraph>
        Piense en las alertas como un guardián que vigila su pozo 24/7. Le
        avisará si algo importante ocurre, para que usted pueda revisar qué
        pasa.
      </Paragraph>
      <Card type="inner" title="¿De qué me puede avisar el sistema?">
        <List
          dataSource={[
            "Si el nivel del agua de su pozo baja más de lo normal.",
            "Si el consumo de agua está superando los límites que usted considera seguros.",
            "Si por alguna razón se pierde la comunicación con los equipos en terreno.",
          ]}
          renderItem={(item) => (
            <List.Item>
              <Tag color="orange">AVISO</Tag> {item}
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );

  const supportContent = (
    <Space direction="vertical" size="middle">
      <Paragraph>
        Si alguna vez tiene una duda o algo no funciona como esperaba, nuestro
        equipo de especialistas está a un solo clic de distancia para ayudarle.
      </Paragraph>
      <Card type="inner" title="¿Cómo funciona?">
        <List
          size="small"
          dataSource={[
            "1. Vaya a 'Soporte' y haga clic en 'Nuevo Ticket' para escribirnos su consulta.",
            "2. Uno de nuestros especialistas le responderá directamente en la plataforma.",
            "3. Podrá seguir toda la conversación y ver cuándo su solicitud esté resuelta. ¡Así de fácil!",
          ]}
          renderItem={(item) => (
            <List.Item>
              <MessageOutlined style={{ marginRight: 8 }} /> {item}
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: isMobile ? "16px" : "24px",
        minHeight: "90vh",
      }}
    >
      <div
        style={{
          borderRadius: "12px",
          background: "linear-gradient(135deg, #1F3461 0%, #2A4B8D 100%)",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <Flex align="center" gap="middle">
          <QuestionCircleOutlined style={{ fontSize: 32, color: "white" }} />
          <Title level={3} style={{ margin: 0, color: "white" }}>
            Guía de Usuario y Novedades
          </Title>
        </Flex>
      </div>

      <Collapse accordion defaultActiveKey={["1"]} ghost>
        <Panel
          header={
            <Text strong style={{ color: DGA_COLOR }}>
              <FileTextOutlined /> Módulo DGA - MEE
            </Text>
          }
          key="1"
          style={panelStyle}
        >
          {dgaContent}
        </Panel>

        <Panel
          header={
            <Text strong>
              <BarChartOutlined /> Smart Análisis
            </Text>
          }
          key="2"
          style={panelStyle}
        >
          {smartAnalysisContent}
        </Panel>

        <Panel
          header={
            <Text strong>
              <DownloadOutlined /> Descarga de Datos
            </Text>
          }
          key="3"
          style={panelStyle}
        >
          {downloadContent}
        </Panel>

        <Panel
          header={
            <Text strong>
              <FolderOpenOutlined /> Gestor de Documentos
            </Text>
          }
          key="4"
          style={panelStyle}
        >
          {docResContent}
        </Panel>

        <Panel
          header={
            <Text strong>
              <AlertOutlined /> Sistema de Alertas
            </Text>
          }
          key="5"
          style={panelStyle}
        >
          {alertsContent}
        </Panel>

        <Panel
          header={
            <Text strong>
              <CustomerServiceOutlined /> Soporte Técnico
            </Text>
          }
          key="6"
          style={panelStyle}
        >
          {supportContent}
        </Panel>
      </Collapse>
    </div>
  );
};

export default UserDocumentation;
