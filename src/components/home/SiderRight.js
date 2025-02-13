import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Typography, Card, Tag, Affix, Row, Col, Badge, Flex } from "antd";
import { useLocation } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";
import QueueAnim from "rc-queue-anim";

const { Title, Paragraph } = Typography;

const SiderRight = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();

  return (
    <QueueAnim delay={200} duration={900} type="right">
      <div key="right">
        <Card
          style={styles.card}
          size="small"
          hoverable
          title={
            <Flex justify="space-between" align="baseline">
              <Title
                style={{
                  color: "white",
                }}
                level={5}
              >
                {state.selected_profile.title}
              </Title>
              {state.selected_profile.dga.standard && (
                <div>
                  <Tag color="blue-inverse">
                    {state.selected_profile.dga.standard.toUpperCase() ===
                    "CAUDALES_MUY_PEQUENOS"
                      ? "CMP"
                      : state.selected_profile.dga.standard.toUpperCase()}
                  </Tag>
                </div>
              )}
            </Flex>
          }
        >
          <Row align={"middle"} justify={"center"}>
            <QueueAnim delay={500} duration={2000} type="bottom">
              <div key="right" style={{ width: "100%" }}>
                {state.selected_profile.dga.flow_granted_dga && (
                  <Col span={24}>
                    <div style={styles.element}>
                      Caudal otorgado DGA:
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {state.selected_profile.dga.flow_granted_dga} lt/s
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>
                )}

                {state.selected_profile.dga.total_granted_dga && (
                  <Col span={24}>
                    <div style={styles.element}>
                      m³ anuales otorgado DGA:
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {Number(
                            state.selected_profile.dga.total_granted_dga
                          ).toLocaleString()}{" "}
                          m³
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>
                )}
                {state.selected_profile.dga.date_start_compliance && (
                  <Col span={24}>
                    <div style={styles.element}>
                      Inicio cumplimiento DGA:
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {state.selected_profile.dga.date_start_compliance}
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>
                )}

                {state.selected_profile.dga.shac && (
                  <Col span={24}>
                    <div style={styles.element}>
                      SHAC:
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {state.selected_profile.dga.shac}
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>
                )}
                <hr style={{ marginBottom: "20px" }} />
                {state.selected_profile.config_data.date_start_telemetry && (
                  <Col span={24}>
                    <div style={styles.element}>
                      Inicio transmision Ikolu:
                      <br />
                      <b>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          {
                            state.selected_profile.config_data
                              .date_start_telemetry
                          }
                        </Typography.Paragraph>
                      </b>
                    </div>
                  </Col>
                )}

                <Col span={24}>
                  <div style={styles.element}>
                    Profundidad:
                    <br />
                    <b>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        {parseFloat(
                          state.selected_profile.config_data.d1
                        ).toFixed(2)}{" "}
                        mtrs
                      </Typography.Paragraph>
                    </b>
                  </div>
                </Col>

                <Col span={24}>
                  <div style={styles.element}>
                    Posicionamiento de bomba:
                    <br />
                    <b>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        {parseFloat(
                          state.selected_profile.config_data.d2
                        ).toFixed(2)}{" "}
                        mtrs
                      </Typography.Paragraph>
                    </b>
                  </div>
                </Col>

                <Col span={24}>
                  <div style={styles.element}>
                    Posicionamiento de sensor:
                    <br />
                    <b>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        {parseFloat(
                          state.selected_profile.config_data.d3
                        ).toFixed(2)}{" "}
                        mtrs
                      </Typography.Paragraph>
                    </b>
                  </div>
                </Col>

                <Col span={24}>
                  <div style={styles.element}>
                    Diámetro ducto de salida (bomba)
                    <br />
                    <b>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        {parseFloat(
                          state.selected_profile.config_data.d4
                        ).toFixed(2)}{" "}
                        pulg
                      </Typography.Paragraph>
                    </b>
                  </div>
                </Col>

                <Col span={24}>
                  <div style={styles.element}>
                    Diámetro flujometro
                    <br />
                    <b>
                      <Typography.Paragraph style={{ fontSize: "16px" }}>
                        {parseFloat(
                          state.selected_profile.config_data.d5
                        ).toFixed(2)}{" "}
                        pulg
                      </Typography.Paragraph>
                    </b>
                  </div>
                </Col>
              </div>
            </QueueAnim>
          </Row>
        </Card>
      </div>
    </QueueAnim>
  );
};

const styles = {
  card: {
    background:
      "radial-gradient(circle, rgba(59,63,96,1) 0%, rgba(31,52,97,1) 100%)",
    paddingLeft: "10px",

    borderRadius: "0px",
    paddingRight: "10px",
    borderColor: "transparent",
    minHeight: "100vh",
  },
  title: {
    color: "white",
    marginBottom: "30px",
  },
  element: {
    textAlign: "center",
    paddingLeft: "4px",
    paddingdRight: "4px",
    backgroundColor: "white",
    borderRadius: "10px",
    marginLeft: "-10px",
    marginRight: "-10px",
  },
};

export default SiderRight;
