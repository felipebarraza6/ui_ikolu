import React, { useState } from "react";
import { message, Form } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import orchestrator from "../../api/orchestrator";
import usePublicData from "./hooks/usePublicData";
import BrandPanel from "./components/BrandPanel";
import LoginFlipCard from "./components/LoginFlipCard";
import LoginForm from "./components/LoginForm";
import IkoluFeatures from "./components/IkoluFeatures";
import ForgotModal from "./components/ForgotModal";

const keyframes = `
@keyframes fade-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes modal-in {
  0% { opacity: 0; transform: scale(0.96) translateY(12px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
`;

const responsiveStyles = `
.login-root {
  display: flex;
  min-height: 100vh;
}
.login-brand {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 64px;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}
.login-brand-content {
  position: relative;
  z-index: 1;
  max-width: 560px;
  animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.login-form-wrap {
  flex: 1 1 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #030c18;
  position: relative;
  overflow: hidden;
}
@media (max-width: 1000px) {
  .login-brand { flex: 1 1 50%; padding: 36px 40px; }
  .login-form-wrap { flex: 1 1 50%; padding: 32px; }
}
@media (max-width: 800px) {
  .login-root { flex-direction: column; }
  .login-brand { display: none; }
  .login-form-wrap {
    flex: 1;
    padding: 32px 24px;
    background: linear-gradient(160deg, #031020 0%, #061d38 50%, #0a2740 100%);
  }
}
`;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { data: publicData, loading: publicLoading } = usePublicData();

  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
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

  const front = (
    <LoginForm
      onSubmit={onFinish}
      loading={loading}
      onForgot={() => setForgotOpen(true)}
      onShowFeatures={() => setFlipped(true)}
    />
  );

  const back = (
    <IkoluFeatures
      platform={publicData?.platform}
      onBack={() => setFlipped(false)}
    />
  );

  return (
    <div className="login-root">
      <style>{keyframes}</style>
      <style>{responsiveStyles}</style>

      <BrandPanel data={publicData} loading={publicLoading} />

      <div className="login-form-wrap">
        <div
          style={{
            position: "absolute",
            top: "-15%",
            right: "-20%",
            width: "60vw",
            height: "60vw",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(180,200,220,0.03) 45%, rgba(3,12,24,0) 70%)",
            filter: "blur(90px)",
            pointerEvents: "none",
          }}
        />

        <LoginFlipCard flipped={flipped} front={front} back={back} />
      </div>

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
