import React, { useContext, useRef, useState } from "react";
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
import sh from "../api/sh/endpoints";
import logoSmart from "../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Login = () => {
  const { dispatch } = useContext(AppContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const finishLogin = async (values) => {
    setLoading(true);
    try {
      const response = await sh.authenticated(values);
      dispatch({
        type: "LOGIN",
        payload: response,
      });
      notification.success({
        message: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      navigate("/");
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Error de autenticación",
        description: "Usuario o contraseña incorrectos",
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
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "linear-gradient(135deg, #1F3461 0%, #2A4A7A 100%)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
  };

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
            padding: "20px",
          }}
        >
          {/* Background with overlay blur */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(https://smarthydro.cl/wp-content/uploads/2023/12/textura-agua.jpg)`,
              backgroundAttachment: "fixed",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              filter: "blur(2px)",
              zIndex: -2,
            }}
          />
          {/* Dark overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(3px)",
              zIndex: -1,
            }}
          />
          <QueueAnim delay={300} duration={1100} type="scale">
            <Card
              key="loginCard"
              style={{
                ...loginCardStyle,
                width: "100%",
                maxWidth: "400px",
                padding: "20px",
              }}
              bodyStyle={{ padding: "30px" }}
            >
              {/* Logo y título */}
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <img
                  src={logo}
                  width="60px"
                  style={{ marginBottom: "15px" }}
                  alt="Logo"
                />
                <Title
                  level={2}
                  style={{
                    color: "white",
                    fontWeight: "700",
                    margin: 0,
                    fontSize: "28px",
                  }}
                >
                  Ikolu App
                </Title>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    marginTop: "5px",
                  }}
                >
                  Ingresa a tu cuenta
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
                    { required: true, message: "Por favor ingresa tu email!" },
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

                <Form.Item style={{ marginBottom: "20px", marginTop: "30px" }}>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={buttonStyle}
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
                        style={{
                          ...buttonStyle,
                          background: "rgba(255, 255, 255, 0.1)",
                          color: "white",
                        }}
                        icon={<ClearOutlined />}
                        block
                      >
                        Limpiar
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>

              {/* Información de soporte */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "30px",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "12px",
                    margin: 0,
                    lineHeight: "1.4",
                  }}
                >
                  Para mayor información o problemas de acceso envíanos un
                  correo a:
                  <br />
                  <strong>soporte@smarthydro.cl</strong>
                </p>
              </div>

              {/* Logo Smart Hydro */}
              <div style={{ textAlign: "center", marginTop: "30px" }}>
                <img
                  src={logoSmart}
                  width="150px"
                  style={{ opacity: 0.8 }}
                  alt="Smart Hydro"
                />
              </div>
            </Card>
          </QueueAnim>
        </div>

        {/* Estilos CSS personalizados */}
        <style jsx>{`
          .login-input input {
            background: transparent !important;
            color: white !important;
            border: none !important;
          }
          .login-input input::placeholder {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          .login-input:hover {
            border-color: rgba(255, 255, 255, 0.5) !important;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) !important;
          }
          .login-input:focus-within {
            border-color: #40a9ff !important;
            box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.2) !important;
          }
          .ant-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3) !important;
          }
        `}</style>
      </div>
    </QueueAnim>
  );
};

export default Login;
