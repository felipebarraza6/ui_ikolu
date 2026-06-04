import React from "react";
import { Card, Avatar, Typography, Descriptions, Button, Space, Divider, Row, Col, Tag } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { smarthydro } from "../../theme/smarthydro.tokens";

const { Title, Text } = Typography;

const ProfilePage = () => {
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
          color: smarthydro.colors.accent[200],
          fontFamily: smarthydro.typography.heading,
          marginBottom: 32,
        }}
      >
        Mi Perfil
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              background: smarthydro.colors.surface.medium,
              border: `1px solid ${smarthydro.colors.surface.border}`,
              borderRadius: smarthydro.radii.lg,
              textAlign: "center",
            }}
          >
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{
                background: smarthydro.colors.accent[500],
                marginBottom: 16,
                border: `3px solid ${smarthydro.colors.accent[300]}`,
              }}
            />

            <Title
              level={4}
              style={{
                color: smarthydro.colors.accent[200],
                margin: "8px 0",
                fontFamily: smarthydro.typography.heading,
              }}
            >
              {user.first_name} {user.last_name}
            </Title>

            <Tag
              style={{
                background: smarthydro.colors.semantic.infoBg,
                color: smarthydro.colors.semantic.info,
                border: `1px solid ${smarthydro.colors.semantic.infoBorder}`,
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
                  background: smarthydro.colors.accent[500],
                  borderColor: smarthydro.colors.accent[500],
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
              background: smarthydro.colors.surface.medium,
              border: `1px solid ${smarthydro.colors.surface.border}`,
              borderRadius: smarthydro.radii.lg,
            }}
            title={
              <Text
                strong
                style={{
                  color: smarthydro.colors.accent[200],
                  fontFamily: smarthydro.typography.heading,
                  fontSize: smarthydro.typography.sizes.lg,
                }}
              >
                Información de Contacto
              </Text>
            }
          >
            <Descriptions
              column={1}
              labelStyle={{
                color: smarthydro.colors.neutral[400],
                fontFamily: smarthydro.typography.body,
                fontWeight: smarthydro.typography.weights.semibold,
              }}
              contentStyle={{
                color: smarthydro.colors.neutral[200],
                fontFamily: smarthydro.typography.body,
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

            <Divider style={{ borderColor: smarthydro.colors.surface.border }} />

            <Text
              strong
              style={{
                color: smarthydro.colors.accent[200],
                fontFamily: smarthydro.typography.heading,
                fontSize: smarthydro.typography.sizes.lg,
                display: "block",
                marginBottom: 16,
              }}
            >
              Preferencias
            </Text>

            <Descriptions
              column={1}
              labelStyle={{
                color: smarthydro.colors.neutral[400],
                fontFamily: smarthydro.typography.body,
                fontWeight: smarthydro.typography.weights.semibold,
              }}
              contentStyle={{
                color: smarthydro.colors.neutral[200],
                fontFamily: smarthydro.typography.body,
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