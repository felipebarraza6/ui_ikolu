import React from "react";
import { Form, Input, Button, Modal, Typography } from "antd";
import { MailOutlined, SafetyOutlined, ArrowLeftOutlined } from "@ant-design/icons";

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

const ForgotModal = ({ open, onCancel, onSubmit, loading, form }) => (
  <Modal
    title={null}
    open={open}
    onCancel={onCancel}
    footer={null}
    destroyOnClose
    centered
    width={380}
    styles={{
      mask: {
        backgroundColor: "rgba(3, 12, 24, 0.85)",
        backdropFilter: "blur(6px)",
      },
      content: {
        background: "rgba(8, 20, 36, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 24,
        boxShadow: "0 32px 90px rgba(0,0,0,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "36px 30px 28px",
        animation: "modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      header: { display: "none" },
    }}
  >
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ffffff 0%, #9fb3c8 100%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          boxShadow: "0 8px 24px rgba(255,255,255,0.18)",
        }}
      >
        <SafetyOutlined style={{ fontSize: 22, color: "#041126" }} />
      </div>
      <Title
        level={4}
        style={{
          color: "#f2f5fa",
          margin: 0,
          fontWeight: 700,
          fontSize: "1.3rem",
        }}
      >
        Recuperar acceso
      </Title>
      <Text
        style={{
          color: "rgba(200, 214, 240, 0.5)",
          marginTop: 6,
          display: "block",
          fontSize: 13,
        }}
      >
        Te enviaremos instrucciones a tu email.
      </Text>
    </div>

    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Ingresa tu email" },
          { type: "email", message: "Ingresa un email válido" },
        ]}
        style={{ marginBottom: 28 }}
      >
        <Input
          prefix={
            <MailOutlined style={{ color: "rgba(200,214,240,0.4)", marginRight: 10 }} />
          }
          placeholder="Email"
          style={inputStyles}
          onFocus={(e) => applyFocus(e, true)}
          onBlur={(e) => applyFocus(e, false)}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 12 }}>
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
            height: 48,
            borderRadius: 24,
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
          Enviar instrucciones
        </Button>
      </Form.Item>

      <Button
        type="link"
        block
        icon={<ArrowLeftOutlined />}
        onClick={onCancel}
        style={{ color: "rgba(200,214,240,0.5)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "#ffffff")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(200,214,240,0.5)")
        }
      >
        Volver
      </Button>
    </Form>
  </Modal>
);

export default ForgotModal;
