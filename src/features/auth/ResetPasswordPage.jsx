import React, { useState } from "react";
import { Card, Typography, Form, Input, Button, message, Flex } from "antd";
import { LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import orchestrator from "../../api/orchestrator";
import WaterBackground from "./components/WaterBackground";

const { Title, Text } = Typography;

const inputStyles = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 0,
  color: "#f2f5fa",
  height: 52,
  paddingLeft: 0,
  paddingRight: 0,
  fontSize: 15,
  transition: "border-color 0.25s ease",
};

const inputFocusStyles = {
  borderBottomColor: "#ffffff",
  boxShadow: "0 1px 0 0 #ffffff",
};

const applyFocus = (e, focused) =>
  Object.assign(e.target.style, focused ? inputFocusStyles : inputStyles);

const keyframes = `
@keyframes fade-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    if (!resetToken) {
      message.error("Token de recuperación inválido");
      return;
    }
    setLoading(true);
    try {
      await orchestrator.confirmPasswordReset(resetToken, values.password);
      message.success("Contraseña restablecida correctamente");
      navigate("/login", { replace: true });
    } catch (err) {
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Error al restablecer la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#030c18",
      }}
    >
      <style>{keyframes}</style>
      <WaterBackground />

      <Card
        style={{
          width: 400,
          borderRadius: 24,
          background: "rgba(8, 20, 36, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 32px 90px rgba(0,0,0,0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 1,
          padding: "12px 8px",
          animation: "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <Flex vertical align="center" style={{ marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ffffff 0%, #9fb3c8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: "0 8px 24px rgba(255,255,255,0.18)",
            }}
          >
            <SafetyOutlined style={{ fontSize: 22, color: "#041126" }} />
          </div>
          <Title
            level={3}
            style={{
              color: "#f2f5fa",
              margin: 0,
              fontWeight: 700,
              fontSize: "1.5rem",
            }}
          >
            Restablecer contraseña
          </Title>
          <Text
            style={{
              color: "rgba(200, 214, 240, 0.5)",
              marginTop: 6,
              textAlign: "center",
              fontSize: 13,
            }}
          >
            Ingresa tu nueva contraseña segura
          </Text>
        </Flex>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Ingresa una nueva contraseña" },
              { min: 8, message: "Mínimo 8 caracteres" },
            ]}
            style={{ marginBottom: 28 }}
          >
            <Input.Password
              prefix={
                <LockOutlined style={{ color: "rgba(200,214,240,0.4)", marginRight: 10 }} />
              }
              placeholder="Nueva contraseña"
              style={inputStyles}
              onFocus={(e) => applyFocus(e, true)}
              onBlur={(e) => applyFocus(e, false)}
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            rules={[
              { required: true, message: "Confirma la nueva contraseña" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Las contraseñas no coinciden")
                  );
                },
              }),
            ]}
            style={{ marginBottom: 28 }}
          >
            <Input.Password
              prefix={
                <LockOutlined style={{ color: "rgba(200,214,240,0.4)", marginRight: 10 }} />
              }
              placeholder="Confirmar contraseña"
              style={inputStyles}
              onFocus={(e) => applyFocus(e, true)}
              onBlur={(e) => applyFocus(e, false)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #9fb3c8 100%)",
                border: "none",
                color: "#041126",
                fontWeight: 700,
                height: 50,
                borderRadius: 25,
                transition: "all 0.25s ease",
                boxShadow: "0 10px 28px rgba(255,255,255,0.18)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 14px 36px rgba(255,255,255,0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 28px rgba(255,255,255,0.18)";
              }}
            >
              Guardar contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  );
};

export default ResetPasswordPage;
