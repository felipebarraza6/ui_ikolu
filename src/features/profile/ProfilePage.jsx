import React, { useState } from "react";
import {
  Card,
  Avatar,
  Typography,
  Descriptions,
  Button,
  Space,
  Divider,
  Row,
  Col,
  Tag,
  theme,
  Modal,
  Form,
  Input,
  message,
  Upload,
  Switch,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  LockOutlined,
  SaveOutlined,
  UploadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import orchestrator from "../../api/orchestrator";

const { Title, Text } = Typography;

const ProfilePage = () => {
  const { token } = theme.useToken();
  const { user, updateUserProfile, changeCurrentPassword, dispatch } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [pwdForm] = Form.useForm();

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Text type="secondary">No hay información de usuario disponible</Text>
      </div>
    );
  }

  const roles = [
    user.is_superuser && "Superusuario",
    user.is_staff && "Staff",
    user.is_client_admin && "Client Admin",
  ].filter(Boolean);

  const handleOpenEdit = () => {
    editForm.setFieldsValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (values) => {
    setEditLoading(true);
    try {
      await updateUserProfile({
        first_name: values.first_name,
        last_name: values.last_name,
      });
      message.success("Perfil actualizado correctamente");
      setEditOpen(false);
    } catch (err) {
      message.error(orchestrator.parseApiError(err));
    } finally {
      setEditLoading(false);
    }
  };

  const handlePwdSubmit = async (values) => {
    setPwdLoading(true);
    try {
      await changeCurrentPassword(values.current_password, values.new_password);
      message.success("Contraseña actualizada correctamente");
      pwdForm.resetFields();
      setPwdOpen(false);
    } catch (err) {
      message.error(orchestrator.parseApiError(err));
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div>
      <Title
        level={2}
        style={{
          color: token.colorWarning,
          marginBottom: 32,
        }}
      >
        Mi Perfil
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              background: token.colorBgElevated,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadiusLG,
              textAlign: "center",
            }}
          >
            <Upload
              showUploadList={false}
              beforeUpload={async (file) => {
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error("La imagen debe ser menor a 2MB");
                  return false;
                }
                setAvatarLoading(true);
                try {
                  const updatedUser = await orchestrator.uploadAvatar(file);
                  dispatch({ type: "UPDATE_USER", payload: updatedUser });
                  message.success("Foto de perfil actualizada");
                } catch (err) {
                  message.error("Error al subir foto de perfil");
                } finally {
                  setAvatarLoading(false);
                }
                return false;
              }}
            >
              <div style={{ position: "relative", display: "inline-block", cursor: "pointer" }}>
                <Avatar
                  size={120}
                  src={user.avatar || null}
                  icon={avatarLoading ? <LoadingOutlined /> : <UserOutlined />}
                  style={{
                    background: token.colorWarning,
                    marginBottom: 16,
                    border: `3px solid ${token.colorWarning}`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 0,
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <UploadOutlined style={{ color: "#fff", fontSize: 14 }} />
                </div>
              </div>
            </Upload>

            <Title
              level={4}
              style={{
                color: token.colorWarning,
                margin: "8px 0",
              }}
            >
              {user.first_name} {user.last_name}
            </Title>

            <Tag
              style={{
                background: "rgba(58, 104, 170, 0.1)",
                color: token.colorInfo,
                border: `1px solid rgba(58, 104, 170, 0.3)`,
                marginBottom: 16,
              }}
            >
              {roles.length ? roles.join(", ") : "Usuario"}
            </Tag>

            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                block
                style={{
                  background: token.colorWarning,
                  borderColor: token.colorWarning,
                }}
                onClick={handleOpenEdit}
              >
                Editar Perfil
              </Button>
              <Button
                icon={<LockOutlined />}
                block
                onClick={() => setPwdOpen(true)}
              >
                Cambiar Contraseña
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            style={{
              background: token.colorBgElevated,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadiusLG,
            }}
            title={
              <Text
                strong
                style={{
                  color: token.colorWarning,
                  fontSize: 16,
                }}
              >
                Información de Contacto
              </Text>
            }
          >
            <Descriptions
              column={1}
              labelStyle={{
                color: token.colorTextDisabled,
                fontWeight: 600,
              }}
              contentStyle={{
                color: token.colorTextSecondary,
              }}
            >
              <Descriptions.Item label={<MailOutlined />}>
                {user.email || "No disponible"}
              </Descriptions.Item>
              <Descriptions.Item label="Usuario">
                {user.username}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre">
                {user.first_name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Apellido">
                {user.last_name || "—"}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ borderColor: token.colorBorder }} />

            <Text
              strong
              style={{
                color: token.colorWarning,
                fontSize: 16,
                display: "block",
                marginBottom: 16,
              }}
            >
              Preferencias
            </Text>

            <Descriptions
              column={1}
              labelStyle={{
                color: token.colorTextDisabled,
                fontWeight: 600,
              }}
              contentStyle={{
                color: token.colorTextSecondary,
              }}
            >
              <Descriptions.Item label="Notificaciones por Correo">
                <Switch
                  checked={user.notify_email}
                  loading={prefLoading}
                  onChange={async (checked) => {
                    setPrefLoading(true);
                    try {
                      await orchestrator.updateNotifyEmailPreference(checked);
                      dispatch({
                        type: "UPDATE_USER",
                        payload: { ...user, notify_email: checked },
                      });
                      message.success("Preferencias actualizadas");
                    } catch (err) {
                      message.error("Error al actualizar preferencias");
                    } finally {
                      setPrefLoading(false);
                    }
                  }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Idioma">Español</Descriptions.Item>
              <Descriptions.Item label="Zona Horaria">America/Santiago</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Editar Perfil"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          initialValues={{
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          }}
        >
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
          <Form.Item name="first_name" label="Nombre">
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Apellido">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={editLoading}
              block
            >
              Guardar cambios
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cambiar Contraseña"
        open={pwdOpen}
        onCancel={() => {
          setPwdOpen(false);
          pwdForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={pwdForm}
          layout="vertical"
          onFinish={handlePwdSubmit}
        >
          <Form.Item
            name="current_password"
            label="Contraseña actual"
            rules={[{ required: true, message: "Ingresa tu contraseña actual" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="Nueva contraseña"
            rules={[{ required: true, message: "Ingresa una nueva contraseña" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="Confirmar nueva contraseña"
            rules={[
              { required: true, message: "Confirma la nueva contraseña" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Las contraseñas no coinciden"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<LockOutlined />}
              loading={pwdLoading}
              block
            >
              Actualizar contraseña
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
