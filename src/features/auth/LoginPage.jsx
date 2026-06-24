import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Flex,
  theme,
  Modal,
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import orchestrator from "../../api/orchestrator";

const { Text, Title } = Typography;

const waveKeyframes = `
@keyframes wave-rise {
  0% { transform: translateY(0) scaleY(1); }
  50% { transform: translateY(-24px) scaleY(1.08); }
  100% { transform: translateY(0) scaleY(1); }
}
@keyframes wave-drift {
  0% { transform: translateX(-50%) rotate(0deg); }
  50% { transform: translateX(-45%) rotate(2deg); }
  100% { transform: translateX(-50%) rotate(0deg); }
}
@keyframes shimmer {
  0% { opacity: 0.35; }
  50% { opacity: 0.6; }
  100% { opacity: 0.35; }
}
`;

const LoginPage = () => {
  const { token } = theme.useToken();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotForm] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success("Inicio de sesión exitoso");
      navigate("/control-center/telemetry", { replace: true });
    } catch {
      message.error("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (values) => {
    setForgotLoading(true);
    try {
      await orchestrator.requestPasswordReset(values.email);
      message.success("Revisa tu correo para continuar con la recuperación");
      forgotForm.resetFields();
      setForgotOpen(false);
    } catch (err) {
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Error al solicitar recuperación"
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #05080f 0%, #0b1429 50%, #0a1a33 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{waveKeyframes}</style>

      {/* Noir radial glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, rgba(32,53,98,0.35) 0%, rgba(5,8,15,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, rgba(58,104,170,0.25) 0%, rgba(5,8,15,0) 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      {/* Water effect layers */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "200%",
          height: "40vh",
          background:
            "linear-gradient(180deg, rgba(32,53,98,0) 0%, rgba(32,53,98,0.25) 40%, rgba(15,29,54,0.55) 100%)",
          borderRadius: "50% 50% 0 0 / 60px 60px 0 0",
          animation: "wave-drift 10s ease-in-out infinite, wave-rise 6s ease-in-out infinite",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "220%",
          height: "32vh",
          background:
            "linear-gradient(180deg, rgba(58,104,170,0) 0%, rgba(58,104,170,0.22) 50%, rgba(32,53,98,0.45) 100%)",
          borderRadius: "50% 50% 0 0 / 50px 50px 0 0",
          animation:
            "wave-drift 14s ease-in-out infinite reverse, wave-rise 8s ease-in-out infinite",
          filter: "blur(3px)",
          pointerEvents: "none",
          animationDelay: "-2s",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "180%",
          height: "24vh",
          background:
            "linear-gradient(180deg, rgba(88,137,210,0) 0%, rgba(88,137,210,0.15) 60%, rgba(32,53,98,0.35) 100%)",
          borderRadius: "50% 50% 0 0 / 40px 40px 0 0",
          animation: "wave-drift 18s ease-in-out infinite, shimmer 5s ease-in-out infinite",
          filter: "blur(4px)",
          pointerEvents: "none",
          animationDelay: "-4s",
        }}
      />

      <Card
        style={{
          width: 420,
          borderRadius: token.borderRadiusLG * 1.5,
          background: "rgba(11, 20, 41, 0.72)",
          border: "1px solid rgba(88, 137, 210, 0.22)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Flex vertical align="center" style={{ marginBottom: 32 }}>
          <Title
            level={2}
            style={{
              color: "#f2f5fa",
              margin: 0,
              fontWeight: 800,
              letterSpacing: "0.5px",
              textShadow: "0 2px 14px rgba(0,0,0,0.45)",
            }}
          >
            ERP - Ikolu Smart
          </Title>
          <Text
            style={{
              color: "rgba(200, 214, 240, 0.55)",
              marginTop: 8,
              fontSize: 13,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Centro de Control
          </Text>
        </Flex>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Ingresa tu email" },
              { type: "email", message: "Ingresa un email válido" },
            ]}
          >
            <Input
              prefix={
                <MailOutlined style={{ color: "rgba(200,214,240,0.5)" }} />
              }
              placeholder="Email"
              style={{
                background: "rgba(5, 8, 15, 0.55)",
                border: "1px solid rgba(88, 137, 210, 0.25)",
                color: "#e8eef7",
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password
              prefix={
                <LockOutlined style={{ color: "rgba(200,214,240,0.5)" }} />
              }
              placeholder="Contraseña"
              style={{
                background: "rgba(5, 8, 15, 0.55)",
                border: "1px solid rgba(88, 137, 210, 0.25)",
                color: "#e8eef7",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="link"
              onClick={() => setForgotOpen(true)}
              style={{ padding: 0, color: "rgba(200,214,240,0.6)" }}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              style={{
                background: "linear-gradient(135deg, #3a89d2 0%, #203562 100%)",
                borderColor: "rgba(88,137,210,0.4)",
                fontWeight: 700,
                height: 48,
                boxShadow: "0 8px 24px rgba(32,53,98,0.45)",
              }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Recuperar contraseña"
        open={forgotOpen}
        onCancel={() => {
          setForgotOpen(false);
          forgotForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
        </Text>
        <Form form={forgotForm} layout="vertical" onFinish={handleForgot}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Ingresa tu email" },
              { type: "email", message: "Ingresa un email válido" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={forgotLoading}
            >
              Enviar instrucciones
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
};

export default LoginPage;
