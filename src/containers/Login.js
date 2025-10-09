import React, { useRef, useState } from "react";
import {
  Row,
  Col,
  Input,
  Button,
  Form,
  notification,
  Typography,
  Card,
  Space,
} from "antd";
import {
  LoginOutlined,
  ClearOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import wallpaper from "../assets/images/walldga.png";
import logo from "../assets/images/logozivo.png";
import QueueAnim from "rc-queue-anim";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import "./Login.css";

const { Title, Text } = Typography;

/**
 * 🔐 COMPONENTE LOGIN REFACTORIZADO Y OPTIMIZADO
 *
 * Características principales:
 * - Uso máximo de componentes Ant Design
 * - Estilos separados en archivo CSS dedicado
 * - 100% responsivo sin scroll
 * - Código más limpio y mantenible
 * - Autenticación independiente del contexto
 */
const Login = () => {
  const {
    login,
    loading: authLoading,
    error: authError,
    isAuthenticated,
    user,
  } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Redirigir si ya está autenticado (solo después de que termine de cargar)
  React.useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log("🔄 Login - Redirigiendo a home porque ya está autenticado");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  const finishLogin = async (values) => {
    setLoading(true);
    try {
      await login(values);
      notification.success({
        message: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });

      // Pequeño delay para asegurar que el estado se actualice antes de navegar
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Error de autenticación",
        description: authError || "Usuario o contraseña incorrectos",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="login-container">
      {/* Contenedor de gotas realistas */}
      <div className="bubbles-container">
        {/* Generar múltiples gotas con diferentes tamaños y posiciones */}
        {Array.from({ length: 500 }, (_, i) => {
          // Distribución más proporcional de tamaños - más gotas pequeñas
          let size;
          const rand = Math.random();
          if (rand < 0.4) {
            size = "small"; // 40% gotas pequeñas
          } else if (rand < 0.7) {
            size = "medium"; // 30% gotas medianas
          } else if (rand < 0.85) {
            size = "large"; // 15% gotas grandes
          } else if (rand < 0.95) {
            size = "xlarge"; // 10% gotas extra grandes
          } else {
            size = "giant"; // 5% gotas gigantes
          }

          // Distribución proporcional por toda la pantalla
          let top, left;

          // Dividir la pantalla en una cuadrícula 12x42 para distribución uniforme
          const gridRow = Math.floor(i / 42); // 12 filas
          const gridCol = i % 42; // 42 columnas por fila

          // Distribuir uniformemente en cada sección
          if (gridRow === 0) {
            // Fila superior (0-8% de la pantalla)
            top = 0.5 + gridCol * 0.18; // 0.5% a 8%
            left = Math.random() * 100;
          } else if (gridRow === 1) {
            // Segunda fila (8-16% de la pantalla)
            top = 8 + gridCol * 0.19; // 8% a 16%
            left = Math.random() * 100;
          } else if (gridRow === 2) {
            // Tercera fila (16-24% de la pantalla)
            top = 16 + gridCol * 0.19; // 16% a 24%
            left = Math.random() * 100;
          } else if (gridRow === 3) {
            // Cuarta fila (24-32% de la pantalla)
            top = 24 + gridCol * 0.19; // 24% a 32%
            left = Math.random() * 100;
          } else if (gridRow === 4) {
            // Quinta fila (32-40% de la pantalla)
            top = 32 + gridCol * 0.19; // 32% a 40%
            left = Math.random() * 100;
          } else if (gridRow === 5) {
            // Sexta fila (40-48% de la pantalla)
            top = 40 + gridCol * 0.19; // 40% a 48%
            left = Math.random() * 100;
          } else if (gridRow === 6) {
            // Séptima fila (48-56% de la pantalla)
            top = 48 + gridCol * 0.19; // 48% a 56%
            left = Math.random() * 100;
          } else if (gridRow === 7) {
            // Octava fila (56-64% de la pantalla)
            top = 56 + gridCol * 0.19; // 56% a 64%
            left = Math.random() * 100;
          } else if (gridRow === 8) {
            // Novena fila (64-72% de la pantalla)
            top = 64 + gridCol * 0.19; // 64% a 72%
            left = Math.random() * 100;
          } else if (gridRow === 9) {
            // Décima fila (72-80% de la pantalla)
            top = 72 + gridCol * 0.19; // 72% a 80%
            left = Math.random() * 100;
          } else if (gridRow === 10) {
            // Undécima fila (80-88% de la pantalla)
            top = 80 + gridCol * 0.19; // 80% a 88%
            left = Math.random() * 100;
          } else {
            // Duodécima fila (88-99.5% de la pantalla)
            top = 88 + gridCol * 0.27; // 88% a 99.5%
            left = Math.random() * 100;
          }

          // Agregar variación aleatoria para evitar patrones muy rígidos
          top += (Math.random() - 0.5) * 6; // ±3px de variación
          left += (Math.random() - 0.5) * 8; // ±4px de variación

          // Asegurar que las gotas estén dentro de los límites de la pantalla
          top = Math.max(1, Math.min(99, top));
          left = Math.max(1, Math.min(99, left));

          // Delay variado para que las gotas aparezcan escalonadamente
          const delay = Math.random() * 15;

          return (
            <div
              key={i}
              className={`bubble ${size}`}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Contenedor principal responsivo */}
      <div className="login-content-wrapper">
        {/* Card de login centrado */}
        <div className="login-card-container">
          <QueueAnim type="bottom" delay={300}>
            <div key="login-card">
              <Card className="login-card">
                {/* Header del Login */}
                <div className="login-header">
                  <div className="logo-container">
                    <img src={logo} alt="Logo Zivo" className="login-logo" />
                  </div>

                  <Title level={2} className="login-title">
                    Bienvenido a Ikolu
                  </Title>
                  <Text className="login-subtitle">
                    Sistema de Monitoreo Hídrico Inteligente
                  </Text>
                </div>

                {/* Formulario de autenticación */}
                <Form
                  name="auth"
                  onFinish={finishLogin}
                  form={form}
                  layout="vertical"
                  size="large"
                  className="login-form"
                >
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Por favor ingresa tu email!",
                      },
                      { type: "email", message: "Ingresa un email válido!" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="input-icon" />}
                      placeholder="Correo electrónico"
                      className="login-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Por favor ingresa tu contraseña!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="input-icon" />}
                      placeholder="Contraseña"
                      className="login-input"
                      iconRender={(visible) => (
                        <span className="password-toggle-icon">
                          {visible ? <LuEye /> : <LuEyeClosed />}
                        </span>
                      )}
                    />
                  </Form.Item>

                  <Form.Item className="login-buttons-container">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<LoginOutlined />}
                          loading={loading || authLoading}
                          block
                          className="login-button"
                        >
                          Iniciar Sesión
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          icon={<ClearOutlined />}
                          onClick={() => form.resetFields()}
                          className="clear-button"
                          block
                        >
                          Limpiar
                        </Button>
                      </Col>
                    </Row>
                  </Form.Item>
                </Form>

                {/* Footer del Login */}
                <div className="login-footer">
                  <Text className="footer-text">
                    © 2025 Ikolu App - Smart Hydro Monitoring
                  </Text>
                  <Text className="footer-subtext">
                    Sistema de Monitoreo Hídrico Inteligente
                  </Text>
                </div>
              </Card>
            </div>
          </QueueAnim>
        </div>
      </div>
    </div>
  );
};

export default Login;
