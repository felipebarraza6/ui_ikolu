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
} from "antd";
import {
  LoginOutlined,
  ClearOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import wallpaper from "../assets/images/walldga.png";
import logo from "../assets/images/logozivo.png";
import logo2 from "../assets/images/logogreen.png";
import logoSmart from "../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const { Title } = Typography;

/**
 * 🔐 COMPONENTE LOGIN REFACTORIZADO
 *
 * Ahora usa el hook useAuth para manejar la autenticación
 * en lugar de depender del contexto del login.
 *
 * Características principales:
 * - Autenticación independiente del contexto
 * - Manejo de errores mejorado
 * - Redirección automática después del login
 */
const Login = () => {
  const { login, loading: authLoading, error: authError } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const finishLogin = async (values) => {
    setLoading(true);
    try {
      await login(values);
      notification.success({
        message: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      navigate("/");
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

  const loginCardStyle = {
    background: "rgba(31, 52, 97, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  };

  const inputStyle = {
    borderRadius: "12px",
    height: "45px",
    fontSize: "16px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
  };

  const buttonStyle = {
    borderRadius: "12px",
    height: "45px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    background: "linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)",
    boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)",
  };

  const clearButtonStyle = {
    borderRadius: "12px",
    height: "45px",
    fontSize: "16px",
    fontWeight: "600",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    background: "transparent",
    color: "white",
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, rgba(31, 52, 97, 0.9) 0%, rgba(46, 91, 138, 0.9) 100%), url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Row justify="center" align="middle" style={{ width: "100%" }}>
        <Col
          xs={24}
          sm={22}
          md={20}
          lg={18}
          xl={16}
          xxl={14}
          style={{ maxWidth: "600px" }}
        >
          <QueueAnim type="bottom" delay={300}>
            <div key="login-card">
              <Card style={loginCardStyle}>
                {/* Header del Login */}
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "40px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <img
                      src={logo}
                      alt="Logo Zivo"
                      style={{
                        height: "60px",
                        width: "auto",
                        filter: "brightness(0) invert(1)",
                      }}
                    />
                    <img
                      src={logo2}
                      alt="Logo Green"
                      style={{
                        height: "50px",
                        width: "auto",
                        filter: "brightness(0) invert(1)",
                      }}
                    />
                  </div>
                  <img
                    src={logoSmart}
                    alt="Logo Smart"
                    style={{
                      height: "40px",
                      width: "auto",
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                  <Title
                    level={2}
                    style={{
                      color: "white",
                      margin: "20px 0 10px 0",
                      fontSize: "28px",
                      fontWeight: "700",
                    }}
                  >
                    Bienvenido a Ikolu
                  </Title>
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: "16px",
                      margin: 0,
                    }}
                  >
                    Sistema de Monitoreo Hídrico Inteligente
                  </p>
                </div>

                {/* Formulario */}
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
                      {
                        required: true,
                        message: "Por favor ingresa tu email!",
                      },
                      { type: "email", message: "Ingresa un email válido!" },
                    ]}
                  >
                    <Input
                      prefix={
                        <UserOutlined
                          style={{ color: "rgba(255, 255, 255, 0.6)" }}
                        />
                      }
                      placeholder="Correo electrónico"
                      style={inputStyle}
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
                      prefix={
                        <LockOutlined
                          style={{ color: "rgba(255, 255, 255, 0.6)" }}
                        />
                      }
                      placeholder="Contraseña"
                      style={inputStyle}
                      className="login-input"
                      iconRender={(visible) => (
                        <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                          {visible ? "👁️" : "💧"}
                        </span>
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    style={{ marginBottom: "20px", marginTop: "30px" }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<LoginOutlined />}
                          style={buttonStyle}
                          loading={loading || authLoading}
                          block
                        >
                          Iniciar Sesión
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          icon={<ClearOutlined />}
                          onClick={() => form.resetFields()}
                          style={clearButtonStyle}
                          block
                        >
                          Limpiar
                        </Button>
                      </Col>
                    </Row>
                  </Form.Item>
                </Form>

                {/* Footer del Login */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "30px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "14px",
                      margin: 0,
                    }}
                  >
                    © 2024 Ikolu App - Smart Hydro Monitoring
                  </p>
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.4)",
                      fontSize: "12px",
                      margin: "8px 0 0 0",
                    }}
                  >
                    Sistema de Monitoreo Hídrico Inteligente
                  </p>
                </div>
              </Card>
            </div>
          </QueueAnim>
        </Col>
      </Row>

      {/* Estilos CSS adicionales */}
      <style>
        {`
          .login-input::placeholder {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          
          .login-input input {
            color: white !important;
          }
          
          .login-input input::placeholder {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          
          .ant-input-password-icon {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          
          .ant-form-item-explain-error {
            color: #ff7875 !important;
            font-size: 12px;
            margin-top: 4px;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
