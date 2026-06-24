import React, { useState } from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  message,
  Flex,
  theme,
} from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import orchestrator from "../../api/orchestrator";

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const { token } = theme.useToken();
  const { token: resetToken } = useParams();
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
        background: token.colorPrimary,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #203562 0%, #0f1d36 100%)",
          opacity: 0.8,
        }}
      />

      <Card
        style={{
          width: 420,
          borderRadius: token.borderRadiusLG,
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Flex vertical align="center" style={{ marginBottom: 32 }}>
          <Title
            level={2}
            style={{
              color: token.colorWarning,
              margin: 0,
            }}
          >
            Restablecer contraseña
          </Title>
          <Text
            style={{
              color: token.colorTextDisabled,
              marginTop: 8,
            }}
          >
            Ingresa tu nueva contraseña
          </Text>
        </Flex>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Ingresa una nueva contraseña" },
            ]}
          >
            <Input.Password
              prefix={
                <LockOutlined style={{ color: token.colorTextDisabled }} />
              }
              placeholder="Nueva contraseña"
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
          >
            <Input.Password
              prefix={
                <LockOutlined style={{ color: token.colorTextDisabled }} />
              }
              placeholder="Confirmar contraseña"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              style={{
                background: token.colorWarning,
                borderColor: token.colorWarning,
                fontWeight: 600,
                height: 48,
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
