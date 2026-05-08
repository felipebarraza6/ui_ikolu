import React, { useContext, useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Switch,
  Select,
  DatePicker,
  notification,
  Flex,
  Statistic,
  Tag,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import { useResponsive } from "../../hooks/useResponsive";
import dayjs from "dayjs";

const DgaConfigDrawer = ({ visible, onClose }) => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const isAdmin = state.user?.is_staff || false;

  const [dgaForm] = Form.useForm();

  const profile = state.selected_profile || {};
  const dga = profile.dga || {};

  useEffect(() => {
    if (visible && profile.id) {
      dgaForm.setFieldsValue({
        send_dga: dga.send_dga,
        standard: dga.standard,
        type_dga: dga.type_dga,
        code_dga: dga.code_dga,
        flow_granted_dga: dga.flow_granted_dga,
        total_granted_dga: dga.total_granted_dga,
        shac: dga.shac,
        date_start_compliance: dga.date_start_compliance ? dayjs(dga.date_start_compliance) : null,
        date_created_code: dga.date_created_code ? dayjs(dga.date_created_code) : null,
      });
    }
  }, [visible, profile.id]);

  const handleSaveDga = async (values) => {
    setLoading(true);
    try {
      await sh.update_data_sh(profile.id, { dga: values });
      notification.success({ message: "Configuración DGA guardada" });
      onClose();
    } catch (err) {
      notification.error({
        message: "Error al guardar DGA",
        description: "Verifica que el endpoint esté disponible.",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    color: "white",
    borderColor: "rgba(255,255,255,0.2)",
  };

  const buttonStyle = {
    width: "100%",
    background: "#1F3461",
    borderColor: "#1F3461",
    height: 44,
    fontWeight: 600,
  };

  return (
    <Drawer
      title={
        <span style={{ color: "#BDC00C", fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>
          CONFIGURACIÓN DGA
        </span>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={isMobile ? "100%" : 560}
      styles={{
        body: { background: "#0a0e27", padding: "24px" },
        header: { background: "#0f152e", borderBottom: "1px solid rgba(255,107,53,0.25)" },
        mask: { background: "rgba(0,0,0,0.75)" },
      }}
      closeIcon={<span style={{ color: "#BDC00C", fontSize: 18 }}>✕</span>}
      extra={
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{
            background: "transparent",
            borderColor: "rgba(255,255,255,0.3)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Cerrar
        </Button>
      }
    >
      <Flex vertical gap="small" style={{ marginBottom: 16 }}>
        <Statistic
          title={<span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Punto</span>}
          value={profile.title || "—"}
          valueStyle={{ color: "white", fontSize: 18, fontWeight: 700 }}
        />
        {dga.code_dga && (
          <Tag color="blue" style={{ width: "fit-content" }}>
            DGA: {dga.code_dga}
          </Tag>
        )}
      </Flex>

      <Form form={dgaForm} layout="vertical" onFinish={handleSaveDga}>
        <Form.Item
          name="send_dga"
          label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Enviar a DGA</span>}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="standard"
          label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Estándar</span>}
        >
          <Select style={inputStyle}>
            <Select.Option value="MENOR">Menor</Select.Option>
            <Select.Option value="MEDIO">Medio</Select.Option>
            <Select.Option value="MAYOR">Mayor</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="type_dga"
          label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Tipo DGA</span>}
        >
          <Select style={inputStyle}>
            <Select.Option value="SUBTERRANEO">Subterráneo</Select.Option>
            <Select.Option value="SUPERFICIAL">Superficial</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="code_dga"
          label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Código DGA</span>}
        >
          <Input style={inputStyle} />
        </Form.Item>
        <Form.Item
          name="flow_granted_dga"
          label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Caudal autorizado (lt/s)</span>}
        >
          <Input type="number" step="0.1" style={inputStyle} />
        </Form.Item>
        <Form.Item
          name="total_granted_dga"
          label={<span style={{ color: "rgba(255,255,255,0.7)" }}>Volumen autorizado (m³)</span>}
        >
          <Input type="number" step="1" style={inputStyle} />
        </Form.Item>
        <Form.Item
          name="shac"
          label={<span style={{ color: "rgba(255,255,255,0.7)" }}>SHAC</span>}
        >
          <Input type="number" step="0.1" style={inputStyle} />
        </Form.Item>
        <Form.Item
          name="date_start_compliance"
          label={
            <span style={{ color: isAdmin ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>
              Inicio cumplimiento {!isAdmin && "— Solo admin"}
            </span>
          }
        >
          <DatePicker format="DD/MM/YYYY" style={{ ...inputStyle, width: "100%" }} disabled={!isAdmin} />
        </Form.Item>
        <Form.Item
          name="date_created_code"
          label={
            <span style={{ color: isAdmin ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>
              Fecha creación código {!isAdmin && "— Solo admin"}
            </span>
          }
        >
          <DatePicker format="DD/MM/YYYY" style={{ ...inputStyle, width: "100%" }} disabled={!isAdmin} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
            style={buttonStyle}
          >
            Guardar DGA
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default DgaConfigDrawer;
