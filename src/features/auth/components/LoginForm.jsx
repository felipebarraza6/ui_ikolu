import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import VoidCubeLogo from "./VoidCubeLogo";

const { Title } = Typography;

const IKOLU_COLOR = "#ffffff";

const inputStyles = {
  background: "transparent",
  border: "none",
  borderRadius: 0,
  color: "#f2f5fa",
  fontSize: 15,
  textAlign: "left",
  boxShadow: "none",
};

const loginFormStyles = `
  .login-form-content .ant-input-affix-wrapper {
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
    transition: border-color 0.25s ease !important;
  }
  .login-form-content .ant-input-affix-wrapper-focused,
  .login-form-content .ant-input-affix-wrapper:focus-within {
    border-bottom-color: #ffffff !important;
    box-shadow: 0 1px 0 0 #ffffff !important;
  }
  .login-form-content .ant-input {
    background: transparent !important;
    color: #f2f5fa !important;
    text-align: left !important;
    box-shadow: none !important;
  }
  .login-form-content .ant-input::placeholder {
    color: rgba(255, 255, 255, 0.35) !important;
  }
  .login-form-content .ant-input-prefix {
    color: rgba(255, 255, 255, 0.4) !important;
    margin-right: 10px !important;
  }
  .login-form-content .ant-input-password-icon {
    color: rgba(255, 255, 255, 0.4) !important;
  }
  .login-form-content .ant-input-password-icon:hover {
    color: rgba(255, 255, 255, 0.7) !important;
  }
  .login-form-content .ant-form-item-explain-error {
    color: rgba(255, 255, 255, 0.55) !important;
    font-size: 12px !important;
    margin-top: 6px !important;
  }
`;

const LoginForm = ({ onSubmit, loading, onForgot, onShowFeatures }) => (
  <div
    className="login-form-content"
    style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <style>{loginFormStyles}</style>
    <VoidCubeLogo size={80} onClick={onShowFeatures} />

    <div style={{ textAlign: "center", marginBottom: 28, marginTop: 14 }}>
      <Title
        level={3}
        onClick={onShowFeatures}
        style={{
          color: "#f2f5fa",
          margin: 0,
          cursor: "pointer",
          display: "inline-block",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontWeight: 800,
            fontSize: "1.9rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#f2f5fa",
          }}
        >
          Ikolu
        </span>
      </Title>

      <div
        style={{
          fontSize: 11,
          color: "rgba(200,214,240,0.45)",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginTop: 6,
        }}
      >
        Plataforma de Gestion Hidrica
      </div>
    </div>

    <Form
      layout="vertical"
      onFinish={onSubmit}
      size="large"
      style={{ width: "100%" }}
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Ingresa tu email" },
          { type: "email", message: "Ingresa un email válido" },
        ]}
        style={{ marginBottom: 28 }}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Email"
          style={inputStyles}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Ingresa tu contraseña" }]}
        style={{ marginBottom: 16 }}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Contraseña"
          style={inputStyles}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 32, textAlign: "center" }}>
        <Button
          type="link"
          htmlType="button"
          onClick={(e) => {
            e.preventDefault();
            onForgot();
          }}
          style={{ padding: 0, color: "rgba(200,214,240,0.5)", fontSize: 13 }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = IKOLU_COLOR)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(200,214,240,0.5)")
          }
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </Form.Item>

      <Form.Item style={{ marginBottom: 18 }}>
        <Button
          htmlType="submit"
          block
          loading={loading}
          size="large"
          style={{
            background: "#ffffff",
            border: "none",
            boxShadow: "none",
            outline: "none",
            color: "#030c18",
            fontWeight: 700,
            height: 50,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontSize: 13,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e2e8f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
          }}
        >
          Iniciar Sesión
        </Button>
      </Form.Item>
    </Form>
  </div>
);

export default LoginForm;
