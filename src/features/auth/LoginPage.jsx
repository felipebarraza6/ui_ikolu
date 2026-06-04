import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Flex } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { smarthydro } from "../../theme/smarthydro.tokens";

const { Text, Title } = Typography;

const LoginPage = () => {
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
        background: smarthydro.colors.primary[500],
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: smarthydro.gradients.oceanDeep,
          opacity: 0.8,
        }}
      />

      <Card
        style={{
          width: 420,
          borderRadius: smarthydro.radii.xl,
          background: smarthydro.colors.surface.medium,
          border: `1px solid ${smarthydro.colors.surface.border}`,
          boxShadow: smarthydro.shadows.lg,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Flex vertical align="center" style={{ marginBottom: 32 }}>
          <Title
            level={2}
            style={{
              color: smarthydro.colors.accent[200],
              margin: 0,
              fontFamily: smarthydro.typography.heading,
            }}
          >
            Ikolu
          </Title>
          <Text
            style={{
              color: smarthydro.colors.neutral[400],
              fontFamily: smarthydro.typography.body,
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
              prefix={<MailOutlined style={{ color: smarthydro.colors.neutral[500] }} />}
              placeholder="Email"
              style={{
                background: smarthydro.colors.surface.light,
                border: `1px solid ${smarthydro.colors.surface.border}`,
                color: smarthydro.colors.neutral[200],
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: smarthydro.colors.neutral[500] }} />}
              placeholder="Contraseña"
              style={{
                background: smarthydro.colors.surface.light,
                border: `1px solid ${smarthydro.colors.surface.border}`,
                color: smarthydro.colors.neutral[200],
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
                background: smarthydro.colors.accent[500],
                borderColor: smarthydro.colors.accent[500],
                fontFamily: smarthydro.typography.heading,
                fontWeight: smarthydro.typography.weights.semibold,
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