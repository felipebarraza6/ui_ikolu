import React, { useContext } from "react";
import { Row, Col, Typography, Button, Popconfirm, Affix, List } from "antd";
import wallpaper from "../../assets/images/wallssr.png";
import { useLocation, Link } from "react-router-dom";
import { AppContext } from "../../App";
import { LogoutOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import ListWells from "./ListWells";
import QueueAnim from "rc-queue-anim";

const { Title } = Typography;

const HeaderNav = () => {
  const location = useLocation();
  const { state, dispatch } = useContext(AppContext);

  return (
    <Affix>
      <QueueAnim delay={100} duration={900} type="top">
        <div key="login">
          <Row
            align={"middle"}
            justify={"space-between"}
            style={{
              backgroundImage: `url(${wallpaper})`,
              /* Create the parallax 
        scrolling effect */
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              marginLeft: "-2px",
            }}
          >
            <Col>
              <Title
                level={window.innerWidth > 900 ? 3 : 4}
                style={{ color: "white", marginLeft: "20px" }}
              >
                {state.user.first_name.toUpperCase()}
              </Title>
            </Col>
            <ListWells />

            <Col style={{ paddingRight: "10px" }}>
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
                <LogoutOutlined
                  style={{
                    backgroundColor: "rgb(31, 52, 97)",
                    color: "white",
                    fontSize: "15px",
                    border: "1px solid white",
                    borderRadius: "100%",
                    padding: "10px",
                  }}
                />
              </Popconfirm>
            </Col>
          </Row>
        </div>
      </QueueAnim>
    </Affix>
  );
};

export default HeaderNav;
