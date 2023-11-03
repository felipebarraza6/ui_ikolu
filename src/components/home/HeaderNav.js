import React, { useContext } from "react";
import { Row, Col, Typography, Tooltip, Popconfirm } from "antd";
import wallpaper from "../../assets/images/walldga.png";
import { AppContext } from "../../App";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const HeaderNav = () => {
  const { state, dispatch } = useContext(AppContext);

  return (
    <>
      <Row
        align={"top"}
        style={{
          backgroundImage: `url(${wallpaper})`,
          minHeight: "100px",
          /* Create the parallax 
        scrolling effect */
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundColor: "rgb(255,255,255,0,0.7)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Col style={{ paddingTop: "10px", paddingLeft: "40px" }} span={12}>
          <Title level={3} style={{ color: "white" }}>
            {" "}
            {state.user.first_name.toUpperCase()}{" "}
          </Title>
        </Col>
        <Col style={{ paddingTop: "30px" }} span={1} offset={11}>
          <Popconfirm
            cancelText="Volver"
            okButtonProps
            okText="SALIR"
            title="¿Estas seguro de querer cerrar la sesión?"
            onConfirm={() => {
              dispatch({ type: "LOGOUT" });
              window.location.assign("/");
            }}
          >
            <ArrowLeftOutlined
              style={{
                backgroundColor: "grey",
                color: "white",
                fontSize: "15px",
                borderRadius: "100%",
                padding: "10px",
                marginRight: "10px",
              }}
            />
          </Popconfirm>
        </Col>
      </Row>
    </>
  );
};

export default HeaderNav;
