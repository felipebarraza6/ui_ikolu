import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Typography, Card, Tag, Affix, Row, Col } from "antd";
import { useLocation } from "react-router-dom";

const { Title } = Typography;

const SiderLeft = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();
  console.log(location.pathname);

  return (
    <>
      <Card style={styles.card}>
        <Title align="center" style={styles.title} level={4}>
          {state.selected_profile.title}{" "}
          {state.selected_profile.standard && (
            <div>
              <Tag color="geekblue-inverse">
                ESTANDAR: {state.selected_profile.standard.toUpperCase()}
              </Tag>
            </div>
          )}
        </Title>
        <Row align={"middle"}>
      {state.selected_profile.date_report_api &&
          <Col span={24}>
            <div style={styles.element}>
              Inicio transmision Ikolu:
              <br />
              <b>
                <Typography.Paragraph style={{ fontSize: "16px" }}>
                  {state.selected_profile.date_report_api}                 
                </Typography.Paragraph>
              </b>
            </div>
          </Col>}

          {state.selected_profile.date_code_dga && 
          <Col span={24}>
            <div style={styles.element}>
              Creacion codigo de obra:
              <br />
              <b>
                <Typography.Paragraph style={{ fontSize: "16px" }}>
                  {state.selected_profile.date_code_dga}
                </Typography.Paragraph>
              </b>
            </div>
          </Col>}
          {state.selected_profile.date_reporting_dga && 
          <Col span={24}>
            <div style={styles.element}>
              Inicio transmision DGA:
              <br />
              <b>
                <Typography.Paragraph style={{ fontSize: "16px" }}>
                  {state.selected_profile.date_reporting_dga}
                </Typography.Paragraph>
              </b>
            </div>
          </Col>}

          <Col span={24}>
            <div style={styles.element}>
              Profundida del pozo:
              <br />
              <b>
                <Typography.Paragraph style={{ fontSize: "16px" }}>
                  {parseFloat(state.selected_profile.d1).toFixed(0)} mtrs
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
                  {parseFloat(state.selected_profile.d2).toFixed(0)} mtrs
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
                  {parseFloat(state.selected_profile.d3).toFixed(0)} mtrs
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
                  {parseFloat(state.selected_profile.d4).toFixed(0)} pulg
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
                  {parseFloat(state.selected_profile.d5).toFixed(0)} pulg
                </Typography.Paragraph>
              </b>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  );
};

const styles = {
  card: {
    backgroundColor: "#1F3461",
    borderRadius: "20px",
    minHeight: "85vh",
  },
  title: {
    color: "white",
    marginTop: "-15px",
      marginBottom:"30px"
  },
  element: {
    textAlign: "center",
    paddingLeft: "4px",
    paddingRight: "4px",
    backgroundColor: "white",
    borderRadius: "10px",
    marginLeft: "-20px",
    marginRight: "-20px",
  },
};

export default SiderLeft;
