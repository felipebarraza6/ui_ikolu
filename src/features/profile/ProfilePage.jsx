import React from "react";
import { Card, Avatar, Typography, Descriptions, Button, Space, Divider, Row, Col, Tag, theme } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;

const ProfilePage = () => {
  const { token } = theme.useToken();
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Text type="secondary">No hay información de usuario disponible</Text>
      </div>
    );
  }

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
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{
                background: token.colorWarning,
                marginBottom: 16,
                border: `3px solid ${token.colorWarning}`,
              }}
            />

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
              {user.role || "Usuario"}
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
              >
                Editar Perfil
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
              <Descriptions.Item label={<PhoneOutlined />}>
                {user.phone || "No disponible"}
              </Descriptions.Item>
              <Descriptions.Item label="Usuario">
                {user.username}
              </Descriptions.Item>
              <Descriptions.Item label="Empresa">
                {user.company || "No especificada"}
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
              <Descriptions.Item label="Idioma">Español</Descriptions.Item>
              <Descriptions.Item label="Zona Horaria">America/Santiago</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;