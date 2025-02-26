import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Typography, Row, Descriptions, Flex, Affix, Tag } from "antd";
import caudal_img from "../../assets/images/caudal.png";
import { useLocation } from "react-router-dom";
import { CopyOutlined, CheckCircleFilled } from "@ant-design/icons";
import QueueAnim from "rc-queue-anim";
import wall from "../../assets/images/walldga.png";
import logo_dga from "../../assets/images/channels4_profile.jpg";

const { Title, Paragraph, Text } = Typography;

const SiderRight = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();
  const numberForMiles = new Intl.NumberFormat("de-DE");

  return (
    <Affix>
      <QueueAnim delay={200} duration={900} type="right">
        <div key="right">
          <Flex
            vertical
            style={{ width: "100%", minHeight: "100vh" }}
            align="center"
            justify="center"
            gap="large"
          >
            {state.selected_profile.dga.code_dga ? (
              <Descriptions
                style={{
                  paddingTop: "10px",
                  height: "110px",
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
                    gap="small"
                  >
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        backgroundColor: "white",
                        width: "70px",
                        borderRadius: "100%",
                      }}
                      gap="small"
                    >
                      <img
                        src={logo_dga}
                        alt="img"
                        style={{
                          width: "80px",
                          borderRadius: "100%",
                          border: "0px",
                        }}
                      />
                    </Flex>
                    <Flex vertical justify="start">
                      <Text
                        copyable={{
                          text: state.selected_profile.dga.code_dga,
                          icon: [
                            <CopyOutlined
                              key="copy-icon"
                              style={{ color: "white" }}
                            />,
                            <CheckCircleFilled
                              key="copied-icon"
                              style={{ color: "white" }}
                            />,
                          ],
                          color: "white",
                        }}
                        style={{
                          fontSize: "12px",
                          textAlign: "end",
                          border: "1px solid rgb(31, 52, 97)",
                          borderRadius: "5px",
                          paddingLeft: "5px",
                          paddingRight: "5px",
                          paddingTop: "2px",
                          paddingBottom: "2px",
                          backgroundColor: "rgb(31, 52, 97)",
                          color: "white",
                        }}
                      >
                        {state.selected_profile.dga.code_dga}
                      </Text>

                      <Flex
                        justify="space-between"
                        vertical
                        align="bottom"
                        style={{ marginLeft: "10px" }}
                      >
                        <Text
                          style={{ fontSize: "12px", color: "rgb(31, 52, 97)" }}
                        >
                          {state.selected_profile.dga.standard &&
                          state.selected_profile.dga.standard ===
                            "CAUDALES_MUY_PEQUENOS"
                            ? "Muy Pequeños"
                            : state.selected_profile.dga.standard.toUpperCase()}
                        </Text>

                        <Text style={{ fontSize: "12px" }}>
                          {state.selected_profile.dga.type_dga.toUpperCase()}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                }
              ></Descriptions>
            ) : (
              ""
            )}
            <Descriptions
              bordered
              style={styles.descriptions}
              labelStyle={{ fontSize: "13px", color: "black" }}
              key="right"
              size={"small"}
            >
              <Descriptions.Item label="Nombre" span={3}>
                <b style={{ fontSize: "12px" }}>
                  {state.selected_profile.title}
                </b>
              </Descriptions.Item>

              <Descriptions.Item label="Profundidad" span={3}>
                <b style={{ fontSize: "12px" }}>
                  {parseFloat(state.selected_profile.config_data.d1).toFixed(2)}{" "}
                  m
                </b>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              bordered
              style={styles.descriptions}
              key="right"
              size={"small"}
              labelStyle={{
                width: "58%",
                fontSize: "13px",
                color: "black",
                fontWeight: "400",
              }}
            >
              <Descriptions.Item span={3} label={"Posicionamientos"}>
                <b>(m)</b>
              </Descriptions.Item>
              <Descriptions.Item span={3} label={"Bomba"}>
                <b style={{ fontSize: "12px" }}>
                  {parseFloat(state.selected_profile.config_data.d2).toFixed(2)}{" "}
                </b>
              </Descriptions.Item>
              <Descriptions.Item span={3} label={"Sensor Nivel"}>
                <b style={{ fontSize: "12px" }}>
                  {parseFloat(state.selected_profile.config_data.d3).toFixed(2)}{" "}
                </b>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              bordered
              style={styles.descriptions}
              key="right"
              labelStyle={{
                width: "58%",
                fontSize: "13px",
                color: "black",
                fontWeight: "400",
              }}
              size={"small"}
            >
              <Descriptions.Item span={3} label={"Diámetros"}>
                <b style={{ fontSize: "12px" }}>(pulg)</b>
              </Descriptions.Item>
              <Descriptions.Item span={3} label={"Ducto salida bomba"}>
                <b style={{ fontSize: "12px" }}>
                  {parseFloat(state.selected_profile.config_data.d4).toFixed(2)}{" "}
                </b>
              </Descriptions.Item>
              <Descriptions.Item span={3} label={"Flujometro"}>
                <b style={{ fontSize: "12px" }}>
                  {parseFloat(state.selected_profile.config_data.d5).toFixed(2)}{" "}
                </b>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              style={styles.descriptions}
              bordered
              key="right"
              labelStyle={{
                fontSize: "13px",
                color: "black",
                fontWeight: "400",
              }}
              size={"small"}
            >
              <Descriptions.Item span={3} label={"Caudalímetro"}>
                <b style={{ fontSize: "13px" }}>(m³)</b>
              </Descriptions.Item>
              <Descriptions.Item
                span={3}
                label={
                  <Flex vertical align="center">
                    <img
                      src={caudal_img}
                      style={{ width: "70px" }}
                      alt="caudal"
                    />
                  </Flex>
                }
              >
                <Flex justify={"center"} vertical>
                  <b style={{ fontSize: "13px" }}>
                    {numberForMiles.format(
                      state.selected_profile.config_data.d6
                    )}
                  </b>
                  <Text style={{ fontSize: "10px" }}>Puesta en marcha</Text>
                </Flex>
              </Descriptions.Item>
            </Descriptions>
          </Flex>
        </div>
      </QueueAnim>
    </Affix>
  );
};

const styles = {
  descriptions: {
    borderColor: "transparent",
    background:
      "linear-gradient(31deg, rgba(146,146,146,1) 0%, rgba(255,255,255,1) 100%)",
    backgroundColor: "white",
    borderRadius: "10px",
    width: "97%",
    textAlign: "end",
  },
};

export default SiderRight;
