import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Flex, theme } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const LoginPage = () => {
  const { token } = theme.useToken();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
            Ikolu
          </Title>
          <Text
            style={{
              color: token.colorTextDisabled,
              
              marginTop: 8,
            }}
          >
            Centro de Control
          </Text>
        </Flex>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Ingresa tu email" }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: token.colorTextDisabled }} />}
              placeholder="Email"
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorTextSecondary,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextDisabled }} />}
              placeholder="Contraseña"
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                color: token.colorTextSecondary,
              }}
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
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  );
};

export default LoginPage;