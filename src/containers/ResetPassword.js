import React, { useState, useEffect } from "react";
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
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import logo from "../assets/images/logozivo.png";
import sh from "../api/sh/endpoints";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/login.css";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      notification.error({
        message: "Enlace inválido",
        description: "El token de recuperación no es válido o ha expirado.",
      });
    }
  }, [token]);

  const handleReset = async (values) => {
    if (!token) {
      notification.error({
        message: "Error",
        description: "No se encontró el token de recuperación.",
      });
      return;
    }
    setLoading(true);
    try {
      await sh.confirmPasswordReset(token, values.new_password);
      setSuccess(true);
      notification.success({
        message: "Contraseña actualizada",
        description: "Tu contraseña ha sido restablecida correctamente.",
      });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo restablecer la contraseña. Intenta nuevamente.";
      notification.error({
        message: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "linear-gradient(135deg, #0f1b3a 0%, #1f3461 40%, #2a5298 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px", zIndex: 1 }}>
        <Card
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "24px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
          bodyStyle={{ padding: "32px" }}
        >
          {!success ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <img
                  src={logo}
                  width="48px"
                  style={{ marginBottom: "12px" }}
                  alt="Ikolu"
                />
                <Title
                  level={3}
                  style={{
                    color: "#1f3461",
                    fontWeight: "700",
                    margin: 0,
                    fontSize: "22px",
                  }}
                >
                  Nueva contraseña
                </Title>
                <Text style={{ color: "rgba(0,0,0,0.45)", fontSize: "14px" }}>
                  Ingresa tu nueva contraseña para continuar
                </Text>
              </div>

              <Form
                name="reset"
                onFinish={handleReset}
                form={form}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="new_password"
                  rules={[
                    { required: true, message: "Ingresa tu nueva contraseña" },
                    { min: 6, message: "Mínimo 6 caracteres" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "rgba(31,52,97,0.5)" }} />}
                    placeholder="Nueva contraseña"
                    style={inputStyle}
                    className="modern-input"
                  />
                </Form.Item>

                <Form.Item
                  name="confirm_password"
                  dependencies={["new_password"]}
                  rules={[
                    { required: true, message: "Confirma tu contraseña" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("new_password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Las contraseñas no coinciden"));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "rgba(31,52,97,0.5)" }} />}
                    placeholder="Confirmar contraseña"
                    style={inputStyle}
                    className="modern-input"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={primaryButtonStyle}
                    block
                  >
                    Restablecer contraseña
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Button
                  type="link"
                  onClick={() => navigate("/login")}
                  icon={<ArrowLeftOutlined />}
                  style={{ color: "#1f3461", fontSize: "13px" }}
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <CheckCircleOutlined
                style={{ fontSize: "48px", color: "#52c41a", marginBottom: "16px" }}
              />
              <Title level={4} style={{ color: "#1f3461", marginBottom: "8px" }}>
                ¡Contraseña actualizada!
              </Title>
              <Text style={{ color: "rgba(0,0,0,0.65)", fontSize: "14px" }}>
                Tu contraseña se restableció correctamente. Ahora puedes iniciar sesión.
              </Text>
              <div style={{ marginTop: "24px" }}>
                <Button
                  type="primary"
                  onClick={() => navigate("/login")}
                  icon={<LoginOutlined />}
                  style={primaryButtonStyle}
                  block
                >
                  Ir al login
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
