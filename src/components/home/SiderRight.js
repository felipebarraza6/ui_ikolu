import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Typography, Card, Tag, Affix, Row, Col, Badge, Flex } from "antd";
import { useLocation } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";
import QueueAnim from "rc-queue-anim";
import wall from "../../assets/images/walldga.png";

const { Title, Paragraph } = Typography;

const SiderRight = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();

  return (
    <QueueAnim delay={200} duration={900} type="right">
      <div key="right">
        <Row align={"top"} justify={"center"}>
          <QueueAnim delay={500} duration={2000} type="bottom">
            <Col span={24}>
              <div key="right" style={{ width: "100%" }}>
                <Flex
                  direction="column"
                  align="center"
                  justify="space-around"
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                >
                  <Title
                    style={{
                      color: "white",
                      textAlign: "center",
                      margin: 0,
                    }}
                    level={3}
                  >
                    {state.selected_profile.title.toUpperCase()}
                  </Title>
                  <Tag color="green" style={{ marginTop: "0px" }}>
                    {state.selected_profile.dga.standard.toUpperCase()}
                  </Tag>
                </Flex>
                <Flex
                  vertical
                  style={{
                    marginTop: "27px",
                    marginLeft: "10px",
                    marginRight: "10px",
                  }}
                >
                  {state.selected_profile.config_data.date_start_telemetry && (
                    <Col span={24}>
                      <div style={styles.element}>
                        INICIO TRANSMISION IKOLU:
                        <br />
                        <b>
                          <Typography.Paragraph style={{ fontSize: "16px" }}>
                            {state.selected_profile.config_data.date_start_telemetry.toUpperCase()}
                          </Typography.Paragraph>
                        </b>
                      </div>
                    </Col>
                  )}

                  <Col span={24}>
                    <div style={styles.element}>
                      PROFUNDIDAD:
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {parseFloat(state.selected_profile.config_data.d1)
                            .toFixed(2)
                            .toUpperCase()}{" "}
                          MTRS
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>

                  <Col span={24}>
                    <div style={styles.element}>
                      POSICIONAMIENTO DE BOMBA:
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {parseFloat(state.selected_profile.config_data.d2)
                            .toFixed(2)
                            .toUpperCase()}{" "}
                          MTRS
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>

                  <Col span={24}>
                    <div style={styles.element}>
                      POSICIONAMIENTO DE SENSOR:
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {parseFloat(state.selected_profile.config_data.d3)
                            .toFixed(2)
                            .toUpperCase()}{" "}
                          MTRS
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>

                  <Col span={24}>
                    <div style={styles.element}>
                      DIAMETRO DUCTO DE SALIDA BOMBA
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {parseFloat(state.selected_profile.config_data.d4)
                            .toFixed(2)
                            .toUpperCase()}{" "}
                          PULG
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>

                  <Col span={24}>
                    <div style={styles.element}>
                      DIAMETRO FLUJOMETRO
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {parseFloat(state.selected_profile.config_data.d5)
                            .toFixed(2)
                            .toUpperCase()}{" "}
                          PULG
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>
                </Flex>
              </div>
            </Col>
          </QueueAnim>
        </Row>
      </div>
    </QueueAnim>
  );
};

const styles = {
  card: {
    paddingLeft: "10px",
    borderColor: "transparent",
    backgroundColor: "transparent",
    borderRadius: "0px",
    paddingRight: "10px",
    minHeight: "100vh",
  },
  title: {
    color: "white",
  },
  element: {
    textAlign: "center",
    borderRadius: "10px",
    backgroundColor: "white",
  },
};

export default SiderRight;
