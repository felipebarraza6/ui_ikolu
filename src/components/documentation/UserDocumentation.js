import React from "react";
import {
  Card,
  Typography,
  Divider,
  List,
  Avatar,
  Space,
  Collapse,
  Tag,
} from "antd";
import {
  BookOutlined,
  WifiOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AlertOutlined,
  DownloadOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const UserDocumentation = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto" }}>
      <Card>
        <Title level={2}>
          <UserOutlined /> Documentación de Usuario - Ikoku
        </Title>
        <Paragraph>
          Bienvenido a la guía de usuario de Ikoku. Esta documentación te
          ayudará a entender qué mide cada módulo y cómo utilizar la aplicación
          de manera efectiva.
        </Paragraph>
        <Divider />

        <Title level={3}>📊 Módulos y Funcionalidades</Title>

        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Card
            type="inner"
            title={
              <span>
                <WifiOutlined style={{ color: "#1890ff" }} /> Telemetría
              </span>
            }
          >
            <Paragraph>
              <Text strong>¿Qué mide?</Text> Este módulo muestra datos en tiempo
              real de los pozos y puntos de captación.
            </Paragraph>
            <List
              size="small"
              dataSource={[
                "Nivel de agua en tiempo real",
                "Caudal instantáneo",
                "Caudal promedio",
                "Estado de la telemetría (conectado/desconectado)",
                "Últimos registros de medición",
                "Alertas de estado del sistema",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {item}
                </List.Item>
              )}
            />

            <Divider />

            <Title level={4}>📊 Tipos de Caudal</Title>

            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Card type="inner" size="small" title="🌊 Caudal Instantáneo">
                <Paragraph>
                  <Text strong>Descripción:</Text> Es la medición del caudal en
                  el momento exacto de la lectura.
                </Paragraph>
                <Paragraph>
                  <Text strong>Características:</Text>
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Se actualiza en tiempo real",
                    "Puede variar significativamente entre lecturas",
                    "Útil para detectar picos o caídas súbitas",
                    "Se muestra en litros por segundo (L/s)",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>

              <Card type="inner" size="small" title="📈 Caudal Promedio">
                <Paragraph>
                  <Text strong>Descripción:</Text> Es el caudal calculado como
                  promedio en un período determinado.
                </Paragraph>
                <Paragraph>
                  <Text strong>Fórmula de Cálculo:</Text>
                </Paragraph>
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 16,
                    borderRadius: 8,
                    margin: "8px 0",
                    fontFamily: "monospace",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  <Text strong>
                    Caudal Promedio = (Total₁ - Total₂) / (Frecuencia en
                    segundos) × 1000
                  </Text>
                </div>
                <Paragraph>
                  <Text strong>Donde:</Text>
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Total₁: Lectura actual del medidor",
                    "Total₂: Lectura anterior del medidor",
                    "Frecuencia: Intervalo de tiempo entre lecturas (en segundos)",
                    "1000: Factor de conversión a litros por segundo",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
                <Paragraph>
                  <Text strong>Características:</Text>
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Proporciona una medida más estable del caudal",
                    "Reduce el impacto de variaciones momentáneas",
                    "Ideal para análisis de tendencias",
                    "Se muestra en litros por segundo (L/s)",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Space>

            <Paragraph>
              <Text type="secondary">
                <InfoCircleOutlined /> Los datos se actualizan automáticamente
                cada pocos minutos.
              </Text>
            </Paragraph>
          </Card>

          <Card
            type="inner"
            title={
              <span>
                <BarChartOutlined style={{ color: "#52c41a" }} /> Smart Análisis
              </span>
            }
          >
            <Paragraph>
              <Text strong>¿Qué mide?</Text> Análisis inteligente de datos
              históricos con gráficos y tendencias.
            </Paragraph>
            <List
              size="small"
              dataSource={[
                "Tendencias de caudal a lo largo del tiempo",
                "Análisis de patrones de consumo",
                "Comparación de períodos",
                "Gráficos interactivos de nivel y volumen",
                "Exportación de datos para análisis externo",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {item}
                </List.Item>
              )}
            />
            <Paragraph>
              <Text type="secondary">
                <InfoCircleOutlined /> Selecciona un rango de fechas para ver
                los datos históricos.
              </Text>
            </Paragraph>
          </Card>

          <Card
            type="inner"
            title={
              <span>
                <FileTextOutlined style={{ color: "#fa8c16" }} /> DGA - MEE
              </span>
            }
          >
            <Paragraph>
              <Text strong>¿Qué mide?</Text> Gestión de documentos y reportes
              para la Dirección General de Aguas (DGA).
            </Paragraph>
            <List
              size="small"
              dataSource={[
                "Registros de medición para DGA",
                "Códigos QR para verificación",
                "Documentos de cumplimiento normativo",
                "Reportes mensuales automáticos",
                "Historial de envíos a DGA",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {item}
                </List.Item>
              )}
            />
            <Paragraph>
              <Text type="secondary">
                <InfoCircleOutlined /> Los códigos QR permiten verificar la
                autenticidad de los documentos.
              </Text>
            </Paragraph>
          </Card>

          <Card
            type="inner"
            title={
              <span>
                <BarChartOutlined style={{ color: "#722ed1" }} /> DGA Análisis
              </span>
            }
          >
            <Paragraph>
              <Text strong>¿Qué mide?</Text> Análisis específico de datos para
              cumplimiento DGA.
            </Paragraph>
            <List
              size="small"
              dataSource={[
                "Análisis de cumplimiento normativo",
                "Comparación con límites DGA",
                "Reportes de excedencias",
                "Tendencias de calidad del agua",
                "Alertas de incumplimiento",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {item}
                </List.Item>
              )}
            />
          </Card>

          <Card
            type="inner"
            title={
              <span>
                <DownloadOutlined style={{ color: "#13c2c2" }} /> Descarga
              </span>
            }
          >
            <Paragraph>
              <Text strong>¿Qué mide?</Text> Generación y descarga de reportes
              en diferentes formatos.
            </Paragraph>
            <List
              size="small"
              dataSource={[
                "Reportes en PDF y Excel",
                "Datos históricos completos",
                "Reportes personalizados por fecha",
                "Exportación de gráficos",
                "Datos para análisis externo",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {item}
                </List.Item>
              )}
            />
          </Card>

          <Card
            type="inner"
            title={
              <span>
                <FileTextOutlined style={{ color: "#eb2f96" }} /> Documentos
              </span>
            }
          >
            <Paragraph>
              <Text strong>¿Qué mide?</Text> Gestión de documentos y archivos
              del sistema.
            </Paragraph>
            <List
              size="small"
              dataSource={[
                "Documentos técnicos",
                "Manuales de operación",
                "Certificados de calibración",
                "Documentos de mantenimiento",
                "Archivos históricos",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {item}
                </List.Item>
              )}
            />
          </Card>

          <Card
            type="inner"
            title={
              <span>
                <AlertOutlined style={{ color: "#f5222d" }} /> Alertas
              </span>
            }
          >
            <Paragraph>
              <Text strong>¿Qué mide?</Text> Sistema de alertas y notificaciones
              del sistema.
            </Paragraph>
            <List
              size="small"
              dataSource={[
                "Alertas de nivel crítico",
                "Notificaciones de fallas",
                "Alertas de mantenimiento",
                "Recordatorios de reportes",
                "Alertas de calidad del agua",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {item}
                </List.Item>
              )}
            />
          </Card>

          <Card
            type="inner"
            title={
              <span>
                <UserOutlined style={{ color: "#faad14" }} /> Módulo B
              </span>
            }
          >
            <Paragraph>
              <Text strong>¿Qué mide?</Text> Entrada manual de datos para
              mediciones específicas.
            </Paragraph>
            <List
              size="small"
              dataSource={[
                "Consumo mensual de agua",
                "Datos de medición manual",
                "Registros de campo",
                "Cálculos automáticos de totales",
                "Validación de datos ingresados",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {item}
                </List.Item>
              )}
            />
            <Paragraph>
              <Text type="secondary">
                <InfoCircleOutlined /> Los totales se calculan automáticamente
                al ingresar los valores mensuales.
              </Text>
            </Paragraph>
          </Card>
        </Space>

        <Divider />

        <Title level={3}>💡 Consejos de Uso</Title>

        <Collapse defaultActiveKey={["1"]}>
          <Panel header="Navegación Rápida" key="1">
            <List
              size="small"
              dataSource={[
                "Usa el menú lateral para navegar entre módulos",
                "El selector de pozos te permite cambiar entre puntos de captación",
                "Los iconos indican el estado de cada módulo",
                "Usa los filtros de fecha para consultar datos históricos",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Panel>

          <Panel header="Interpretación de Datos" key="2">
            <List
              size="small"
              dataSource={[
                "Los valores en verde indican normalidad",
                "Los valores en amarillo requieren atención",
                "Los valores en rojo indican alertas críticas",
                "Los gráficos muestran tendencias temporales",
                "Las tablas permiten ver datos detallados",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Panel>

          <Panel header="Solución de Problemas" key="3">
            <List
              size="small"
              dataSource={[
                "Si no ves datos, verifica la conexión de telemetría",
                "Para datos históricos, asegúrate de seleccionar fechas válidas",
                "Si hay errores, contacta al soporte técnico",
                "Limpia el caché del navegador si hay problemas de visualización",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>

        <Divider />

        <Title level={3}>📞 Soporte</Title>
        <Paragraph>
          Si necesitas ayuda adicional o tienes preguntas sobre el uso de la
          aplicación, puedes contactar al equipo de soporte técnico de
          SmartHydro a través del módulo de Soporte.
        </Paragraph>
      </Card>
    </div>
  );
};

export default UserDocumentation;
