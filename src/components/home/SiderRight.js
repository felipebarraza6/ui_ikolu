import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Typography, Row, Descriptions, Flex, Card, Tag } from "antd";
import caudal_img from "../../assets/images/caudal.png";
import { useLocation } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";
import QueueAnim from "rc-queue-anim";
import wall from "../../assets/images/walldga.png";
import logo_dga from "../../assets/images/channels4_profile.jpg";

const { Title, Paragraph, Text } = Typography;

const SiderRight = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();
  const numberForMiles = new Intl.NumberFormat("de-DE");

  return (
    <QueueAnim delay={200} duration={900} type="right">
      <div key="right">
        <Row align={"top"} justify={"center"}>
          <Descriptions
            bordered
            style={styles.descriptions}
            key="right"
            size={"small"}
          >
            <Descriptions.Item label="Nombre" span={3}>
              <b>{state.selected_profile.title}</b>
            </Descriptions.Item>

            <Descriptions.Item label="Profundidad" span={3}>
              <b>
                {parseFloat(state.selected_profile.config_data.d1).toFixed(2)} m
              </b>
            </Descriptions.Item>

            <Descriptions.Item label="Tipo" span={3}>
              <b style={{ fontSize: "12px" }}>
                {state.selected_profile.dga.type_dga}
              </b>
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            bordered
            style={styles.descriptions}
            key="right"
            size={"small"}
            labelStyle={{ width: "58%" }}
          >
            <Descriptions.Item span={3} label={<b>Posicionamientos</b>}>
              <b>(m)</b>
            </Descriptions.Item>
            <Descriptions.Item span={3} label={"Bomba"}>
              <b>
                {parseFloat(state.selected_profile.config_data.d2).toFixed(2)}{" "}
              </b>
            </Descriptions.Item>
            <Descriptions.Item span={3} label={"Sensor Nivel"}>
              <b>
                {parseFloat(state.selected_profile.config_data.d3).toFixed(2)}{" "}
              </b>
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            bordered
            style={styles.descriptions}
            key="right"
            size={"small"}
            labelStyle={{ width: "58%" }}
          >
            <Descriptions.Item span={3} label={<b>Diámetros</b>}>
              <b>(pulg)</b>
            </Descriptions.Item>
            <Descriptions.Item span={3} label={"Ducto salida bomba"}>
              <b>
                {parseFloat(state.selected_profile.config_data.d4).toFixed(2)}{" "}
              </b>
            </Descriptions.Item>
            <Descriptions.Item span={3} label={"Flujometro"}>
              <b>
                {parseFloat(state.selected_profile.config_data.d5).toFixed(2)}{" "}
              </b>
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            style={styles.descriptions}
            bordered
            labelStyle={{ width: "58%" }}
            key="right"
            size={"small"}
          >
            <Descriptions.Item
              span={3}
              label={
                <center>
                  <b>Caudalímetro</b>
                </center>
              }
            >
              <b>(m³)</b>
            </Descriptions.Item>
            <Descriptions.Item
              span={3}
              label={
                <Flex vertical align="center">
                  <img src={caudal_img} alt="caudal" width="50%" />
                </Flex>
              }
            >
              <Flex justify={"center"}>
                <b>
                  {numberForMiles.format(state.selected_profile.config_data.d6)}
                </b>
              </Flex>
            </Descriptions.Item>
          </Descriptions>
          {state.selected_profile.dga.code_dga ? (
            <Descriptions
              style={{
                paddingTop: "10px",
                height: "120px",
                ...styles.descriptions,
              }}
              key="right"
              colon={false}
              size={"small"}
              labelStyle={{ color: "black" }}
              layout="vertical"
              title={
                <Flex
                  justify="space-between"
                  align={"center"}
                  style={{ paddingLeft: "10px", paddingRight: "15px" }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      padding: "5px",
                      backgroundColor: "white",
                      width: "80px",
                      borderRadius: "10px",
                    }}
                  >
                    <img
                      src={logo_dga}
                      alt="img"
                      style={{
                        width: "80px",
                      }}
                    />
                  </Flex>
                  <Flex vertical style={{ width: "100%" }} justify="center">
                    <Text copyable>{state.selected_profile.dga.code_dga}</Text>
                    <hr style={{ border: "1px solid black", width: "70%" }} />
                    <Flex justify="space-around">
                      <Text>{state.selected_profile.dga.flow_granted_dga}</Text>

                      <Text>(lt/s)</Text>
                    </Flex>
                    <Flex justify="space-around">
                      <Text>
                        {state.selected_profile.dga.total_granted_dga > 0
                          ? numberForMiles.format(
                              state.selected_profile.dga.total_granted_dga
                            )
                          : "Sin registro"}
                      </Text>
                      <Text>(m³)</Text>
                    </Flex>
                  </Flex>
                </Flex>
              }
            ></Descriptions>
          ) : (
            ""
          )}
        </Row>
      </div>
    </QueueAnim>
  );
};

const styles = {
  descriptions: {
    borderColor: "transparent",
    marginTop: "10px",
    background:
      "linear-gradient(31deg, rgba(146,146,146,1) 0%, rgba(255,255,255,1) 100%)",
    backgroundColor: "white",
    borderRadius: "10px",
    width: "100%",
    textAlign: "center",
  },
};

export default SiderRight;
