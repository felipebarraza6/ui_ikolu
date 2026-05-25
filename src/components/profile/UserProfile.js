import React, { useContext, useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Form,
  Input,
  Avatar,
  Flex,
  Statistic,
  Tag,
  Divider,
  notification,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import { useResponsive } from "../../hooks/useResponsive";

const { Title, Text } = Typography;

const UserProfile = () => {
  const { state, dispatch } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const user = state.user || {};
  const catchmentPoints = state.points_list || [];

  useEffect(() => {
    form.setFieldsValue({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      username: user.username || "",
    });
  }, [user, form]);

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      await sh.updateUser(user.username, {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
      });

      const updatedUser = { ...user, ...values };
      dispatch({
        type: "UPDATE",
        payload: {
          user: { ...updatedUser, catchment_points: catchmentPoints },
          selected_profile: state.selected_profile,
        },
      });

      notification.success({
        message: "Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente.",
      });
      setEditing(false);
    } catch (error) {
      notification.error({
        message: "Error al actualizar",
        description: "No se pudo actualizar el perfil. Intenta nuevamente.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordLoading(true);
    try {
      notification.info({
        message: "Función no disponible",
        description:
          "El cambio de contraseña desde el perfil estará disponible próximamente. Contacta a soporte.",
      });
      passwordForm.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo procesar la solicitud.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: isMobile ? "12px auto" : "0 auto",
        padding: isMobile ? "0 8px" : "0",
        minHeight: "90vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderRadius: "12px",
          background: "linear-gradient(135deg, #1F3461 0%, #2A4B8D 100%)",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <Flex align="center" gap="middle">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
          />
          <div>
            <Title level={3} style={{ margin: 0, color: "white" }}>
              {user.first_name || user.username}
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)" }}>
              {user.email}
            </Text>
          </div>
        </Flex>
      </div>

      <Row gutter={[24, 24]}>
        {/* Información del usuario */}
        <Col xs={24} md={16}>
          <Card
            title={
              <Flex justify="space-between" align="center">
                <span>
                  <UserOutlined style={{ marginRight: 8, color: "#1F3461" }} />
                  Información Personal
                </span>
                {!editing ? (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                    size="small"
                  >
                    Editar
                  </Button>
                ) : (
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => setEditing(false)}
                    size="small"
                    danger
                  >
                    Cancelar
                  </Button>
                )}
              </Flex>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "none",
            }}
          >
            {editing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSaveProfile}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="first_name"
                      label="Nombre"
                      rules={[
                        { required: true, message: "Ingresa tu nombre" },
                      ]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="last_name"
                      label="Apellido"
                      rules={[
                        { required: true, message: "Ingresa tu apellido" },
                      ]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="email"
                  label="Correo electrónico"
                  rules={[
                    { required: true, message: "Ingresa tu email" },
                    { type: "email", message: "Email inválido" },
                  ]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>
                <Form.Item name="username" label="Nombre de usuario">
                  <Input prefix={<UserOutlined />} disabled />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{ background: "#1F3461" }}
                  >
                    Guardar cambios
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <div>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text type="secondary">Nombre</Text>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {user.first_name || "—"}
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Apellido</Text>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {user.last_name || "—"}
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Email</Text>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {user.email}
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Usuario</Text>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      @{user.username}
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Card>

          <Card
            title={
              <span>
                <LockOutlined style={{ marginRight: 8, color: "#1F3461" }} />
                Seguridad
              </span>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "none",
              marginTop: 24,
            }}
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                name="current_password"
                label="Contraseña actual"
                rules={[
                  { required: true, message: "Ingresa tu contraseña actual" },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item
                name="new_password"
                label="Nueva contraseña"
                rules={[
                  { required: true, message: "Ingresa una nueva contraseña" },
                  { min: 8, message: "Mínimo 8 caracteres" },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item
                name="confirm_password"
                label="Confirmar contraseña"
                dependencies={["new_password"]}
                rules={[
                  { required: true, message: "Confirma tu contraseña" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Las contraseñas no coinciden")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={passwordLoading}
                  style={{ background: "#1F3461" }}
                >
                  Cambiar contraseña
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={
              <span>
                <GlobalOutlined style={{ marginRight: 8, color: "#1F3461" }} />
                Resumen de Cuenta
              </span>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "none",
            }}
          >
            <Flex vertical gap="middle">
              <Statistic
                title="Puntos de Captación"
                value={catchmentPoints.length}
                prefix={<EnvironmentOutlined />}
                valueStyle={{ color: "#1F3461", fontWeight: 700 }}
              />
              <Divider style={{ margin: "12px 0" }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Estado de la cuenta
              </Text>
              <Tag color="green">Activa</Tag>
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                ID de usuario
              </Text>
              <Text copyable>{user.id}</Text>
            </Flex>
          </Card>

          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "none",
              marginTop: 16,
            }}
          >
            <Flex vertical gap="small">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Mis Puntos de Captación
              </Text>
              {catchmentPoints.slice(0, 5).map((point) => (
                <Flex
                  key={point.id}
                  justify="space-between"
                  align="center"
                  style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}
                >
                  <Text strong style={{ fontSize: 13 }}>
                    {point.title}
                  </Text>
                  {point.dga?.code_dga && (
                    <Tag color="blue" style={{ fontSize: 11 }}>
                      {point.dga.code_dga}
                    </Tag>
                  )}
                </Flex>
              ))}
              {catchmentPoints.length > 5 && (
                <Text type="secondary" style={{ fontSize: 12, textAlign: "center" }}>
                  y {catchmentPoints.length - 5} más...
                </Text>
              )}
            </Flex>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfile;
