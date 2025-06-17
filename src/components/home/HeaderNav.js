import React, { useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../App";
import {
  LogoutOutlined,
  BuildFilled,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import { Row, Col, Typography, Button, Popconfirm, Affix } from "antd";
import wallpaper from "../../assets/images/wallssr.png";
import wallpaper0 from "../../assets/images/walldga.png";

import ListWells from "./ListWells";
import QueueAnim from "rc-queue-anim";

const { Title } = Typography; // Destructure Title from Typography

const HeaderNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AppContext);
  const { pathname } = location; // Use location.pathname for clarity

  console.log(pathname);

  return (
    <QueueAnim delay={100} duration={900} type="top">
      <div key="header-nav"> {/* Changed key for better semantics */}
        <Affix>
          <Row
            align={"middle"}
            justify={window.innerWidth > 900 ? "start" : "space-evenly"}
            style={{
              backgroundImage:
                pathname === "/formmultidata"
                  ? `url(${wallpaper0})`
                  : `url(${wallpaper})`,
              minHeight: window.innerWidth > 900 ? "100px" : "160px",
              /* Create the parallax scrolling effect */
              backgroundAttachment: "fixed",
              backgroundPosition: "center bottom",
              backgroundColor: "rgb(255,255,255,0,0.7)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <Col
              xl={6}
              lg={3}
              xs={8}
              style={{
                paddingTop: "0px",
                paddingLeft: "4px",
              }}
            >
              <Title
                level={window.innerWidth > 900 ? 3 : 4}
                style={{ color: "white", marginLeft: "10px" }}
              >
                {state.user.first_name.toUpperCase()}{" "}
              </Title>
            </Col>

            <Col
              style={{
                paddingTop: "0px",
              }}
              xs={9}
              xl={9}
              lg={12}
            >
              {pathname === "/formmultidata" ? (
                <Button
                  icon={<ArrowLeftOutlined />}
                  style={{ marginTop: "10px" }}
                  onClick={() => navigate("/")}
                >
                  Volver a Mi Pozo
                </Button>
              ) : (
                <ListWells />
              )}
            </Col>

            <Col
              style={{ paddingTop: window.innerWidth < 900 && "30px" }}
              span={1}
              offset={window.innerWidth > 900 ? 8 : 0}
            >
              <Button
                type={pathname === "/profile" ? "primary" : "default"}
                icon={<BuildFilled />}
                shape={"round"}
                style={{
                  marginRight: "10px",
                  borderColor: "white",
                  backgroundColor: pathname === "/profile" ? undefined : "rgb(31, 52, 97)", // Set background color for default button
                  color: "white" // Ensure text color is white
                }}
              >
                {state.user.first_name.toUpperCase()}
              </Button>
              <Popconfirm
                cancelText="Volver"
                okText="SALIR"
                title="¿Estás seguro de querer cerrar la sesión?"
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
        </Affix>
      </div>
    </QueueAnim>
  );
};

export default HeaderNav;
