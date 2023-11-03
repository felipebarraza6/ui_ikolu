import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Typography, Card, Tag } from "antd";
import { useLocation } from "react-router-dom";

const { Title } = Typography;

const SiderLeft = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();
  console.log(location.pathname);

  return (
    <Card
      style={{
        backgroundColor: "#1F3461",
        borderRadius: "20px",
        paddingRight: "5px",
        minHeight: "85vh",
        paddingLeft: "5px",
      }}
    >
      <Title align="center" style={{ color: "white" }} level={3}>
        {" "}
        {state.selected_profile.title}{" "}
      </Title>
      <Title
        align="center"
        style={{ color: "white", marginTop: "-10px", marginBottom: "30px" }}
        level={5}
      >
        {" "}
        <Tag color="geekblue-inverse">
          E. {state.selected_profile.standard.toUpperCase()}{" "}
        </Tag>
      </Title>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "white",
          marginLeft: "-24px",
          marginRight: "-24px",
          marginBottom: "30px",
        }}
      >
        Profundida del pozo:
        <br />
        <b>
          <Typography.Paragraph style={{ fontSize: "16px" }}>
            {" "}
            {parseFloat(state.selected_profile.d1).toFixed(0)} mtrs
          </Typography.Paragraph>
        </b>
      </div>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "white",
          marginLeft: "-24px",
          marginRight: "-24px",
          marginBottom: "30px",
        }}
      >
        Posicionamiento de bomba:
        <br />
        <b>
          <Typography.Paragraph style={{ fontSize: "16px" }}>
            {" "}
            {parseFloat(state.selected_profile.d2).toFixed(0)} mtrs
          </Typography.Paragraph>
        </b>
      </div>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "white",
          marginLeft: "-24px",
          marginRight: "-24px",
          marginBottom: "30px",
        }}
      >
        Posicionamiento de sensor (freatico):
        <br />
        <b>
          <Typography.Paragraph style={{ fontSize: "16px" }}>
            {parseFloat(state.selected_profile.d3).toFixed(0)} mtrs
          </Typography.Paragraph>
        </b>
      </div>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "white",
          marginLeft: "-24px",
          marginRight: "-24px",
          marginBottom: "30px",
        }}
      >
        Diámetro ducto de salida (bomba)
        <br />
        <b>
          <Typography.Paragraph style={{ fontSize: "16px" }}>
            {parseFloat(state.selected_profile.d4).toFixed(0)} pulg
          </Typography.Paragraph>
        </b>
      </div>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "white",
          marginLeft: "-24px",
          marginRight: "-24px",
          marginBottom: "50px",
        }}
      >
        Diámetro flujometro
        <br />
        <b>
          <Typography.Paragraph style={{ fontSize: "16px" }}>
            {parseFloat(state.selected_profile.d5).toFixed(0)} pulg
          </Typography.Paragraph>
        </b>
      </div>
    </Card>
  );
};

export default SiderLeft;
