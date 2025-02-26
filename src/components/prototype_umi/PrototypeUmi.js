import React, { useContext } from "react";
import {
  Typography,
  Row,
  Descriptions,
  Card,
  Col,
  Tag,
  Badge,
  Flex,
} from "antd";
import img_superficial from "../../assets/images/superficial.png";
import img_nivel from "../../assets/images/nivel.png";
import img_caudal from "../../assets/images/caudal.png";
import { AppContext } from "../../App";

const { Title, Text } = Typography;

const PrototypeUmi = () => {
  const { state } = useContext(AppContext);
  console.log(state.selected_profile);

  const nivel = state.selected_profile.modules.m1.nivel;
  const today_data = state.selected_profile.modules.today;
  const last_data = state.selected_profile.modules.m1;
  const yesterday_data = state.selected_profile.modules.yesterday;

  const totalNivelYesterday =
    Object.values(yesterday_data).reduce((total, module) => {
      const nivel = module.nivel;
      return total + parseFloat(nivel);
    }, 0) / Object.values(yesterday_data).length;

  const totalNivelToday =
    Object.values(today_data).reduce((total, module) => {
      const nivel = module.nivel;
      return total + parseFloat(nivel);
    }, 0) / Object.values(today_data).length;

  console.log(totalNivelToday);

  const total = (nivel) => {
    if (nivel <= 0) return "0";

    const vel_medium = 0.45;
    const area = 4.74;
    const rest_area = 0.53;

    var total_m3 = vel_medium * (area * nivel - rest_area) * 1000;
    total_m3 = Math.max(0, total_m3); // Ensure no negative values

    total_m3 = parseInt(total_m3).toLocaleString("es-CL");

    return total_m3;
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Row
        justify={"space-around"}
        style={{ width: "100%", paddingTop: "80px" }}
      >
        <Col style={{ padding: "20px" }}>
          <Descriptions
            bordered
            style={{
              marginBottom: "20px",
              width: "350px",
              borderRadius: "10px",
              background:
                "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
            }}
            size="small"
          >
            <Descriptions.Item
              span={3}
              label={
                <>
                  <Badge status="processing" /> Última conexión
                </>
              }
            >
              <Tag color="rgb(31, 52, 97)">
                {last_data.date_time_medition} hrs
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item
              span={3}
              label={
                <Text
                  style={styles.valueCard}
                >{`Caudal ${new Date().getDate()} - ${new Date().toLocaleString(
                  "default",
                  {
                    month: "short",
                  }
                )}`}</Text>
              }
            >
              {parseInt(total(totalNivelToday * 86400)).toLocaleString("es-CL")}
              {" (m³)"}
            </Descriptions.Item>
            <Descriptions.Item
              span={3}
              label={
                <Text style={styles.valueCard}>{`Caudal ${
                  new Date().getDate() - 1
                } - ${new Date().toLocaleString("default", {
                  month: "short",
                })}`}</Text>
              }
            >
              {" "}
              {parseInt(total(totalNivelYesterday * 86400)).toLocaleString(
                "es-CL"
              )}{" "}
              {"(m³)"}
            </Descriptions.Item>
          </Descriptions>
          <Flex vertical justify="center">
            <Card hoverable style={styles.cardValues} size="small">
              <Row
                justify={window.innerWidth > 900 ? "space-between" : "center"}
              >
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <img
                      src={img_nivel}
                      alt="caudal_img"
                      width={"40px"}
                      style={{
                        marginBottom: window.innerWidth > 900 ? "0px" : "5px",
                      }}
                    />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  <Title level={5} style={{ marginTop: "-10px" }}>
                    Nivel
                  </Title>

                  <Text style={styles.valueCard}>{nivel} (m)</Text>
                </Col>
              </Row>
            </Card>
            <Card hoverable style={styles.cardValues} size="small">
              <Row
                justify={window.innerWidth > 900 ? "space-between" : "center"}
              >
                <Col xs={24} lg={6} xl={6}>
                  <center>
                    <img
                      src={img_caudal}
                      alt="caudal_img"
                      width={"55px"}
                      style={{
                        marginBottom: window.innerWidth > 900 ? "0px" : "5px",
                      }}
                    />
                  </center>
                </Col>
                <Col xs={24} lg={18} xl={18} style={styles.colCard}>
                  <Title level={5} style={{ marginTop: "-10px" }}>
                    Caudal
                  </Title>

                  <Text style={styles.valueCard}>{total(nivel)} (m³)</Text>
                </Col>
              </Row>
            </Card>
          </Flex>
        </Col>
        <Col
          span={14}
          style={{
            backgroundImage: `url(${img_superficial})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            marginTop: "20px",
            height: "300px",
            borderRadius: "15px",
            backgroundPosition: "center",
          }}
        >
          <Tag
            style={{
              fontSize: "16px",
              marginTop: "100px",
              marginLeft: "10px",
              position: "absolute",
            }}
          >
            {total(nivel)} (m³)
          </Tag>
          <Tag
            style={{
              fontSize: "16px",
              position: "absolute",
              marginTop: "250px",
              marginLeft: "86%",
            }}
          >
            {nivel} (m)
          </Tag>
        </Col>
      </Row>
    </div>
  );
};

const styles = {
  colCard: {
    paddingLeft: window.innerWidth > 900 && "20px",
  },
  cardValues: {
    marginBottom: "10px",
    padding: window.innerWidth > 900 ? "14px" : "0px",
    borderRadius: "15px",
    border: "0px solid #1F3461",
    background:
      "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
    width: window.innerWidth > 900 ? "280px" : "100%",
  },
};

export default PrototypeUmi;
