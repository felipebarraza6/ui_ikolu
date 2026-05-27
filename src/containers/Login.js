import React, { useContext, useRef, useState, useEffect } from "react";
import {
  Row,
  Col,
  Input,
  Button,
  Form,
  notification,
  Typography,
  Card,
  Modal,
  Drawer,
  Tag,
  Divider,
} from "antd";
import {
  LoginOutlined,
  ClearOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  BarChartOutlined,
  SyncOutlined,
  GlobalOutlined,
  TeamOutlined,
  BellOutlined,
  CustomerServiceOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import logo from "../assets/images/logozivo.png";

import sh from "../api/sh/endpoints";
import QueueAnim from "rc-queue-anim";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const { Title, Text } = Typography;

const modules = [
  { icon: <DashboardOutlined />, title: "Monitoreo en Tiempo Real", color: "#40a9ff" },
  { icon: <BarChartOutlined />, title: "Reportes y Estadísticas", color: "#73d13d" },
  { icon: <SyncOutlined />, title: "Sincronización DGA", color: "#ffec3d" },
  { icon: <GlobalOutlined />, title: "Mapa de Puntos", color: "#36cfc9" },
  { icon: <TeamOutlined />, title: "Gestión de Usuarios", color: "#9254de" },
  { icon: <BellOutlined />, title: "Alertas Inteligentes", color: "#ff7875" },
  { icon: <CustomerServiceOutlined />, title: "Soporte 24/7", color: "#ffa940" },
  { icon: <ThunderboltOutlined />, title: "Automatización", color: "#69c0ff" },
  { icon: <CodeOutlined />, title: "Código Abierto", color: "#b37feb" },
];



const FloatingBubble = ({ delay, size, left }) => (
  <div
    className="floating-bubble"
    style={{
      position: "absolute",
      bottom: "-20px",
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.08)",
      animation: `floatUp 8s infinite ease-in`,
      animationDelay: `${delay}s`,
      pointerEvents: "none",
    }}
  />
);

const Login = () => {
  const { dispatch } = useContext(AppContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [notifications, setNotifications] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await sh.getPublicAnnouncements(20);
        const list = Array.isArray(data) ? data : data.announcements || [];
        const mapped = list
          .filter((n) => (n.type || "").toLowerCase() === "info")
          .map((n) => ({
            id: n.id,
            title: n.title,
            description: n.message,
            type: "info",
            is_finished: n.is_read,
            created: n.created,
            start_date: n.start_date,
            end_date: n.end_date,
          }));
        setNotifications(mapped);
      } catch (err) {
        console.error("Error cargando anuncios:", err);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const finishLogin = async (values) => {
    setLoading(true);
    try {
      const response = await sh.authenticated(values);
      // 🚀 Solo guardar datos esenciales del usuario (login optimizado)
      const minimalUser = {
        id: response.user?.id,
        email: response.user?.email,
        username: response.user?.username,
        first_name: response.user?.first_name,
        last_name: response.user?.last_name,
        is_staff: response.user?.is_staff,
        is_superuser: response.user?.is_superuser,
        is_client_admin: response.user?.is_client_admin,
      };
      localStorage.setItem("token", JSON.stringify(response.access_token));
      localStorage.setItem("user", JSON.stringify(minimalUser));
      if (response.points_summary) {
        localStorage.setItem("points_summary", JSON.stringify(response.points_summary));
      }
      dispatch({ type: "LOGIN", payload: { ...response, user: minimalUser } });
      notification.success({
        message: "¡Bienvenido a Ikolu!",
        description: "Has iniciado sesión correctamente",
      });
      navigate("/");
    } catch (err) {
      console.error("Error en login:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Usuario o contraseña incorrectos";
      notification.error({
        message: "Error de autenticación",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (values) => {
    setForgotLoading(true);
    try {
      await sh.requestPasswordReset(values.email);
      setForgotSent(true);
      setForgotLoading(false);
      notification.success({
        message: "Solicitud enviada",
        description: "Revisa tu correo para continuar con la recuperación.",
      });
    } catch (err) {
      setForgotLoading(false);
      console.error("[Password Reset] Error completo:", err);
      if (err.response) {
        console.error("[Password Reset] Status:", err.response.status);
        console.error("[Password Reset] Data:", err.response.data);
      } else {
        console.error("[Password Reset] Sin respuesta del servidor (posible CORS o red)");
      }
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (err.response
          ? `Error ${err.response.status} del servidor`
          : "No se pudo conectar con el servidor. Revisa tu conexión o si el endpoint está disponible.");
      notification.error({
        message: "Error al recuperar contraseña",
        description: errorMessage,
      });
    }
  };

  const loginCardStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "24px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  };

  const darkCardStyle = {
    background: "rgba(31, 52, 97, 0.92)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "24px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  };

  const inputStyle = {
    borderRadius: "12px",
    height: "46px",
    fontSize: "15px",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#1f3461",
    transition: "all 0.3s ease",
  };

  const primaryButtonStyle = {
    borderRadius: "12px",
    height: "46px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    background: "linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)",
    boxShadow: "0 4px 14px rgba(31, 52, 97, 0.4)",
    transition: "all 0.3s ease",
  };

  const secondaryButtonStyle = {
    borderRadius: "12px",
    height: "46px",
    fontSize: "16px",
    fontWeight: "600",
    border: "1px solid rgba(31, 52, 97, 0.3)",
    background: "rgba(31, 52, 97, 0.05)",
    color: "#1f3461",
    transition: "all 0.3s ease",
  };

  const renderInfoPanel = () => (
    <QueueAnim delay={300} duration={1000} type="left">
      <div
        key="infoPanel"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "20px 24px",
          color: "white",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <img src={logo} width="48px" style={{ flexShrink: 0 }} alt="Ikolu" />
          <div>
            <Title
              level={2}
              style={{
                color: "white",
                fontWeight: "800",
                margin: 0,
                fontSize: "26px",
                lineHeight: 1.1,
              }}
            >
              Ikolu
            </Title>
            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "13px",
                display: "block",
                marginTop: "2px",
              }}
            >
              Plataforma de Gestión Hídrica Inteligente
            </Text>
          </div>
        </div>

        <Divider style={{ borderColor: "rgba(255,255,255,0.2)", margin: "8px 0" }} />

        <Text
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "12px",
            marginBottom: "8px",
            display: "block",
          }}
        >
          Módulos disponibles en esta versión:
        </Text>

        <Row gutter={[6, 6]} align="top">
          {modules.map((mod, idx) => (
            <Col span={8} key={idx}>
              <div
                className="module-card"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "6px 4px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    color: mod.color,
                    marginBottom: "2px",
                  }}
                >
                  {mod.icon}
                </div>
                <Text
                  strong
                  style={{ color: "white", fontSize: "9px", display: "block", lineHeight: 1.2 }}
                >
                  {mod.title}
                </Text>
              </div>
            </Col>
          ))}
        </Row>

        <Divider style={{ borderColor: "rgba(255,255,255,0.15)", margin: "10px 0 8px" }} />

        <Text
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "11px",
            marginBottom: "6px",
            display: "block",
          }}
        >
          Notificaciones del sistema
        </Text>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {notifications.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
              No hay notificaciones pendientes.
            </Text>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="notif-item"
                onClick={() => {
                  setSelectedNotification(n);
                  setDrawerVisible(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "8px 10px",
                  background: n.is_finished
                    ? "rgba(82, 196, 26, 0.08)"
                    : "rgba(64, 169, 255, 0.1)",
                  borderRadius: "10px",
                  border: `1px solid ${n.is_finished ? "rgba(82, 196, 26, 0.2)" : "rgba(64, 169, 255, 0.2)"}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {n.is_finished ? (
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", fontSize: "13px", marginTop: "2px", flexShrink: 0 }}
                  />
                ) : (
                  <InfoCircleOutlined
                    style={{ color: "#40a9ff", fontSize: "13px", marginTop: "2px", flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <Text strong style={{ color: "white", fontSize: "11px", display: "block", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {n.title}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: "10px", display: "block", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {n.description}
                  </Text>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </QueueAnim>
  );

  const renderLoginForm = () => (
    <QueueAnim delay={400} duration={1000} type={isMobile ? "alpha" : "right"}>
      <div
        key="loginForm"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: isMobile ? "20px" : "28px 32px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {isMobile && (
            <img src={logo} width="52px" style={{ marginBottom: "10px" }} alt="Ikolu" />
          )}
          <Title
            level={3}
            style={{
              color: "#1f3461",
              fontWeight: "700",
              margin: 0,
              fontSize: "22px",
            }}
          >
            {isMobile ? "Ikolu" : "Bienvenido"}
          </Title>
          <Text style={{ color: "rgba(0,0,0,0.45)", fontSize: "14px" }}>
            Ingresa tus credenciales
          </Text>
        </div>

        <Form
          name="auth"
          onFinish={finishLogin}
          form={form}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Por favor ingresa tu email!" },
              { type: "email", message: "Ingresa un email válido!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "rgba(31,52,97,0.5)" }} />}
              placeholder="Correo electrónico"
              style={inputStyle}
              className="modern-input water-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa tu contraseña!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(31,52,97,0.5)" }} />}
              placeholder="Contraseña"
              style={inputStyle}
              className="modern-input water-input"
              iconRender={(visible) => (
                <span style={{ color: "#40a9ff", fontSize: "16px" }}>
                  {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </span>
              )}
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "12px",
            }}
          >
            <Button
              type="link"
              onClick={() => {
                setForgotVisible(true);
                setForgotSent(false);
              }}
              style={{
                padding: 0,
                color: "#1f3461",
                fontWeight: 500,
                fontSize: "13px",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>

          <Form.Item style={{ marginBottom: "12px" }}>
            <Row gutter={12}>
              <Col span={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={primaryButtonStyle}
                  icon={<LoginOutlined />}
                  block
                >
                  Ingresar
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="default"
                  onClick={() => form.resetFields()}
                  style={secondaryButtonStyle}
                  icon={<ClearOutlined />}
                  block
                >
                  Limpiar
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>

        <Divider style={{ margin: "8px 0", borderColor: "rgba(0,0,0,0.06)" }}>
          <Text style={{ color: "rgba(0,0,0,0.35)", fontSize: "12px" }}>
            ¿Necesitas ayuda?
          </Text>
        </Divider>

        <div
          style={{
            textAlign: "center",
            padding: "10px 12px",
            background: "rgba(31, 52, 97, 0.04)",
            borderRadius: "12px",
            border: "1px solid rgba(31, 52, 97, 0.08)",
            marginBottom: "10px",
          }}
        >
          <Text
            style={{
              color: "rgba(0,0,0,0.55)",
              fontSize: "12px",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Para problemas de acceso contacta a soporte:
            <br />
            <strong style={{ color: "#1f3461" }}>soporte@smarthydro.cl</strong>
          </Text>
        </div>


      </div>
    </QueueAnim>
  );

  return (
    <QueueAnim delay={200} duration={900} type="alpha">
      <div key="login" ref={containerRef}>
        <div
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "16px" : "40px",
            overflow: "hidden",
          }}
        >
          {/* Animated Background */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, #0f1b3a 0%, #1f3461 40%, #2a5298 100%)",
              zIndex: -2,
            }}
          />

          {/* Floating bubbles */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: "hidden",
              zIndex: -1,
            }}
          >
            {[...Array(12)].map((_, i) => (
              <FloatingBubble
                key={i}
                delay={i * 0.7}
                size={8 + Math.random() * 20}
                left={5 + Math.random() * 90}
              />
            ))}
          </div>

          {/* Subtle mesh pattern overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(64, 169, 255, 0.08) 0%, transparent 50%),
                                radial-gradient(circle at 80% 80%, rgba(54, 207, 201, 0.06) 0%, transparent 50%)`,
              zIndex: -1,
            }}
          />

          <div
            style={{
              width: "100%",
              maxWidth: "980px",
              zIndex: 1,
            }}
          >
            {isMobile ? (
              <Card
                style={{
                  ...loginCardStyle,
                  width: "100%",
                }}
                bodyStyle={{ padding: "24px 20px" }}
              >
                {renderLoginForm()}
              </Card>
            ) : (
              <Row gutter={0} style={{ display: "flex", alignItems: "stretch" }}>
                <Col xs={24} lg={14} style={{ display: "flex" }}>
                  <Card
                    style={{
                      ...darkCardStyle,
                      borderRadius: "24px 0 0 24px",
                      borderRight: "none",
                      overflow: "hidden",
                    }}
                    bodyStyle={{ padding: 0, flex: 1, overflow: "hidden" }}
                  >
                    {renderInfoPanel()}
                  </Card>
                </Col>
                <Col xs={24} lg={10} style={{ display: "flex" }}>
                  <Card
                    style={{
                      ...loginCardStyle,
                      borderRadius: "0 24px 24px 0",
                      borderLeft: "none",
                    }}
                    bodyStyle={{ padding: "28px 32px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}
                  >
                    {renderLoginForm()}
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        </div>

        {/* Notification Detail Drawer */}
        <Drawer
          title={
            <span style={{ color: "#1f3461", fontWeight: 700 }}>
              {selectedNotification?.title || "Detalle"}
            </span>
          }
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={380}
          styles={{ body: { padding: "20px 24px" } }}
        >
          {selectedNotification && (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <Tag
                  color={selectedNotification.is_finished ? "success" : "blue"}
                  style={{ fontSize: "12px", marginBottom: "8px" }}
                >
                  {selectedNotification.is_finished ? "Resuelto" : "Informativo"}
                </Tag>
                <Text style={{ color: "rgba(0,0,0,0.65)", fontSize: "14px", display: "block", lineHeight: 1.6 }}>
                  {selectedNotification.description}
                </Text>
              </div>

              {(selectedNotification.start_date || selectedNotification.end_date || selectedNotification.created) && (
                <div
                  style={{
                    background: "rgba(31, 52, 97, 0.04)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    border: "1px solid rgba(31, 52, 97, 0.08)",
                  }}
                >
                  {selectedNotification.created && (
                    <Text style={{ color: "rgba(0,0,0,0.5)", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                      <strong>Publicado:</strong> {new Date(selectedNotification.created).toLocaleString("es-CL")}
                    </Text>
                  )}
                  {selectedNotification.start_date && (
                    <Text style={{ color: "rgba(0,0,0,0.5)", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                      <strong>Inicio:</strong> {selectedNotification.start_date}
                    </Text>
                  )}
                  {selectedNotification.end_date && (
                    <Text style={{ color: "rgba(0,0,0,0.5)", fontSize: "12px", display: "block" }}>
                      <strong>Fin:</strong> {selectedNotification.end_date}
                    </Text>
                  )}
                </div>
              )}
            </div>
          )}
        </Drawer>

        {/* Forgot Password Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <LockOutlined style={{ color: "#1f3461" }} />
              <span style={{ color: "#1f3461", fontWeight: 700 }}>
                Recuperar contraseña
              </span>
            </div>
          }
          open={forgotVisible}
          onCancel={() => {
            setForgotVisible(false);
            setForgotSent(false);
          }}
          footer={null}
          centered
          width={420}
          styles={{ body: { padding: "24px 24px 8px" } }}
        >
          {!forgotSent ? (
            <>
              <Text style={{ color: "rgba(0,0,0,0.65)", fontSize: "14px" }}>
                Ingresa tu correo electrónico y te enviaremos un enlace para
                restablecer tu contraseña.
              </Text>
              <Form
                layout="vertical"
                onFinish={handleForgotPassword}
                style={{ marginTop: "20px" }}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Ingresa tu correo" },
                    { type: "email", message: "Ingresa un correo válido" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: "rgba(31,52,97,0.5)" }} />}
                    placeholder="Correo electrónico"
                    size="large"
                    style={inputStyle}
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={forgotLoading}
                    block
                    size="large"
                    style={primaryButtonStyle}
                  >
                    Enviar instrucciones
                  </Button>
                </Form.Item>
              </Form>
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <Button
                  type="link"
                  onClick={() => setForgotVisible(false)}
                  icon={<ArrowLeftOutlined />}
                  style={{ color: "#1f3461", fontSize: "13px" }}
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircleOutlined
                style={{ fontSize: "48px", color: "#52c41a", marginBottom: "16px" }}
              />
              <Title level={4} style={{ color: "#1f3461", marginBottom: "8px" }}>
                ¡Solicitud enviada!
              </Title>
              <Text style={{ color: "rgba(0,0,0,0.65)", fontSize: "14px" }}>
                Revisa tu bandeja de entrada. Si no encuentras el correo, revisa
                tu carpeta de spam.
              </Text>
              <div style={{ marginTop: "20px" }}>
                <Button
                  type="primary"
                  onClick={() => setForgotVisible(false)}
                  style={primaryButtonStyle}
                >
                  Entendido
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </QueueAnim>
  );
};

export default Login;
