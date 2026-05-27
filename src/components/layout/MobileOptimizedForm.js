import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  InputNumber,
} from "antd";
import {
  CalendarOutlined,
  SaveOutlined,
  ClearOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import "dayjs/locale/es";

const { Title, Text } = Typography;
const { Option } = Select;

const MobileOptimizedForm = ({
  form,
  children,
  onFinish,
  title,
  loading = false,
  layout = "vertical",
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Estilos para móvil
  const mobileFormItemStyle = {
    marginBottom: isMobile ? 20 : 16,
  };

  const mobileInputStyle = {
    height: isMobile ? 44 : 32,
    fontSize: isMobile ? 16 : 14,
    borderRadius: 8,
  };

  const mobileButtonStyle = {
    height: isMobile ? 48 : 32,
    fontSize: isMobile ? 16 : 14,
    borderRadius: 8,
    fontWeight: 500,
  };

  // Envolver Form.Item para aplicar estilos móviles automáticamente
  const MobileFormItem = ({ children, ...itemProps }) => (
    <Form.Item
      {...itemProps}
      style={{
        ...mobileFormItemStyle,
        ...itemProps.style,
      }}
    >
      {React.cloneElement(children, {
        style: {
          ...mobileInputStyle,
          ...children.props.style,
        },
        size: isMobile ? "large" : "middle",
      })}
    </Form.Item>
  );

  // Renderizar formulario optimizado
  const renderForm = () => (
    <Form
      form={form}
      layout={layout}
      onFinish={onFinish}
      scrollToFirstError
      {...props}
      style={{
        maxWidth: isMobile ? "100%" : 600,
        margin: "0 auto",
        ...props.style,
      }}
    >
      {title && (
        <>
          <Title
            level={isMobile ? 3 : 4}
            style={{
              textAlign: "center",
              color: "#1F3461",
              marginBottom: isMobile ? 24 : 16,
            }}
          >
            {title}
          </Title>
          <Divider />
        </>
      )}

      {/* Renderizar children con optimizaciones automáticas */}
      <div style={{ padding: isMobile ? "0 8px" : 0 }}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Si es un Form.Item, aplicar optimizaciones
            if (child.type === Form.Item) {
              return (
                <Form.Item
                  {...child.props}
                  style={{
                    ...mobileFormItemStyle,
                    ...child.props.style,
                  }}
                >
                  {React.cloneElement(child.props.children, {
                    style: {
                      ...mobileInputStyle,
                      ...child.props.children.props?.style,
                    },
                    size: isMobile ? "large" : "middle",
                  })}
                </Form.Item>
              );
            }

            // Si es un botón, aplicar estilos móviles
            if (child.type === Button) {
              return React.cloneElement(child, {
                style: {
                  ...mobileButtonStyle,
                  ...child.props.style,
                },
                size: isMobile ? "large" : "middle",
              });
            }

            return child;
          }
          return child;
        })}
      </div>

      {/* Botones de acción por defecto si no se proporcionan */}
      {!React.Children.toArray(children).some(
        (child) => React.isValidElement(child) && child.type === Button
      ) && (
        <>
          <Divider />
          <Row gutter={[16, 16]} justify="center">
            <Col span={isMobile ? 24 : 12}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                block={isMobile}
                style={mobileButtonStyle}
              >
                Guardar
              </Button>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={() => form?.resetFields()}
                block={isMobile}
                style={mobileButtonStyle}
              >
                Limpiar
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Form>
  );

  // Envolver en Card para móvil
  return isMobile ? (
    <Card
      style={{
        margin: 16,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: 24 }}
    >
      {renderForm()}
    </Card>
  ) : (
    renderForm()
  );
};

// Componentes especializados para diferentes tipos de campos
export const MobileDatePicker = (props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DatePicker
        {...props}
        style={{
          width: "100%",
          height: isMobile ? 44 : 32,
          fontSize: isMobile ? 16 : 14,
          ...props.style,
        }}
        size={isMobile ? "large" : "middle"}
        suffixIcon={<CalendarOutlined />}
        format="DD/MM/YYYY"
      />
  );
};

export const MobileSelect = (props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Select
      {...props}
      style={{
        width: "100%",
        fontSize: isMobile ? 16 : 14,
        ...props.style,
      }}
      size={isMobile ? "large" : "middle"}
      dropdownStyle={{
        borderRadius: 8,
        ...props.dropdownStyle,
      }}
    />
  );
};

export const MobileInput = (props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Input
      {...props}
      style={{
        height: isMobile ? 44 : 32,
        fontSize: isMobile ? 16 : 14,
        borderRadius: 8,
        ...props.style,
      }}
      size={isMobile ? "large" : "middle"}
    />
  );
};

export const MobileInputNumber = (props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <InputNumber
      {...props}
      style={{
        width: "100%",
        height: isMobile ? 44 : 32,
        fontSize: isMobile ? 16 : 14,
        borderRadius: 8,
        ...props.style,
      }}
      size={isMobile ? "large" : "middle"}
    />
  );
};

export default MobileOptimizedForm;
