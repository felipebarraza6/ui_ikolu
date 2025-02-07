import React, { useContext, useRef } from "react";
import { Row, Col, Input, Button, Form, notification, Typography } from "antd";
import { LoginOutlined, ClearOutlined } from "@ant-design/icons";
import wallpaper from "../assets/images/walldga.png";
import logo from "../assets/images/logozivo.png";
import logo2 from "../assets/images/logogreen.png";
import sh from "../api/sh/endpoints";
import logoSmart from "../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";
import { AppContext } from "../App";
const { Title } = Typography;
const Login = () => {
  const { dispatch } = useContext(AppContext);
  const [form] = Form.useForm();
  const containerRef = useRef(null);

  const finishLogin = async (values) => {
    const request = await sh
      .authenticated(values)
      .then((res) => {
        console.log(res);

        dispatch({
          type: "LOGIN",
          payload: res,
        });
      })
      .catch((err) => {
        console.log(err);
        notification.error({ message: "contraseña incorrecta" });
      });
    console.log(request);

    return request;
  };

  return (
    <QueueAnim delay={200} duration={900} type="alpha">
      <div key="login" ref={containerRef}>
        <Row
          align={"middle"}
          justify="center"
          style={{
            backgroundImage: `url(${wallpaper})`,
            minHeight: "100vh",
            /* Create the parallax 
      scrolling effect */
            backgroundAttachment: "fixed",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <QueueAnim delay={300} duration={1100} type="scale">
            <div key="login" ref={containerRef}>
              <Row justify={"center"}>
                <Col span={7}>
                  <Title
                    style={{
                      fontSize: "",
                      color: "white",
                      fontWeight: "600",
                      borderRadius: "10px",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={logo}
                      width="17%"
                      style={{ marginRight: "10px" }}
                    />
                    Ikolu App
                  </Title>
                  <Form name="auth" onFinish={finishLogin} form={form}>
                    <Form.Item
                      name="email"
                      rules={[{ required: true, message: "Ingresa tu email!" }]}
                    >
                      <Input
                        size="large"
                        placeholder="Usuario"
                        style={{ borderRadius: "10px", width: "100%" }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: "Ingresa tu clave!" }]}
                    >
                      <Input
                        type="password"
                        size="large"
                        placeholder="Clave"
                        style={{ borderRadius: "10px", width: "100%" }}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Row justify={"space-between"}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          style={{
                            borderRadius: "10px",
                            width: "48%",
                            border: "1px solid white",
                            backgroundColor: "#1F3461",
                          }}
                          icon={<LoginOutlined />}
                        >
                          Ingresar
                        </Button>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => form.resetFields()}
                          style={{
                            borderRadius: "10px",
                            width: "48%",
                            border: "1px solid white",
                            backgroundColor: "#1F3461",
                          }}
                          icon={<ClearOutlined />}
                        >
                          Limpiar
                        </Button>
                      </Row>
                    </Form.Item>
                  </Form>
                </Col>
                <Col span={24}>
                  <center>
                    <Title
                      level={5}
                      style={{
                        fontSize: "12px",
                        color: "white",
                        width: window.innerWidth > 900 ? "27%" : "79%",
                        fontWeight: "600",
                        backgroundColor: "#1F3461",
                        borderRadius: "10px",
                        padding: "10px",
                        textAlign: "center",
                        border: "1px solid white",
                      }}
                    >
                      Para mayor información o problemas de acceso envíanos un
                      correo a: soporte@smarthydro.cl
                    </Title>
                  </center>
                </Col>
                <Col span={24}>
                  <center>
                    <img
                      src={logoSmart}
                      width={window.innerWidth > 900 ? "200px" : "200px"}
                      style={{ marginTop: "100px" }}
                    />
                  </center>
                </Col>
              </Row>
            </div>
          </QueueAnim>
        </Row>
      </div>
    </QueueAnim>
  );
};

export default Login;
