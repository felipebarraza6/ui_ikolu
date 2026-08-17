import React, { useState, useEffect } from "react";
import { message, Form, Modal } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import orchestrator from "../../api/orchestrator";
import usePublicData from "./hooks/usePublicData";
import BrandPanel from "./components/BrandPanel";
import LoginForm from "./components/LoginForm";
import ForgotModal from "./components/ForgotModal";

const modalStyles = `
  .ikolu-login-modal .ant-modal-content {
    background: rgba(8, 20, 36, 0.92) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 28px !important;
    box-shadow: 0 32px 90px rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(24px) !important;
    -webkit-backdrop-filter: blur(24px) !important;
    padding: 24px 16px !important;
  }
  .ikolu-login-modal .ant-modal-close {
    color: rgba(255, 255, 255, 0.6) !important;
    top: 20px !important;
    right: 20px !important;
  }
  .ikolu-login-modal .ant-modal-close:hover {
    color: #ffffff !important;
    background: rgba(255, 255, 255, 0.1) !important;
  }
`;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: publicData, loading: publicLoading } = usePublicData();

  const [loading, setLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotForm] = Form.useForm();

  // Abrir modal de login si la URL incluye #login o ?login=true
  useEffect(() => {
    if (location.hash === "#login" || location.search.includes("login=true")) {
      setLoginModalOpen(true);
    }
  }, [location]);

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
      if (typeof orchestrator?.requestPasswordReset !== "function") {
        throw new Error(
          "Módulo de recuperación no disponible. Intenta recargar la página (Ctrl+F5)."
        );
      }
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

  const closeForgot = () => {
    setForgotOpen(false);
    forgotForm.resetFields();
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#030c18" }}>
      <style>{modalStyles}</style>

      {/* LANDING PAGE A ANCHO COMPLETO (100%) */}
      <BrandPanel
        data={publicData}
        loading={publicLoading}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* MODAL DE INICIO DE SESIÓN */}
      <Modal
        open={loginModalOpen}
        onCancel={() => setLoginModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
        width={420}
        className="ikolu-login-modal"
      >
        <LoginForm
          onSubmit={onFinish}
          loading={loading}
          onForgot={() => setForgotOpen(true)}
        />
      </Modal>

      {/* MODAL DE RECUPERACIÓN DE CONTRASEÑA */}
      <ForgotModal
        open={forgotOpen}
        onCancel={closeForgot}
        onSubmit={handleForgot}
        loading={forgotLoading}
        form={forgotForm}
      />
    </div>
  );
};

export default LoginPage;
