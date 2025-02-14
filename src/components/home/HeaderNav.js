import React, { useContext } from "react";
import { Row, Col, Typography, Button, Popconfirm, Affix, List } from "antd";
import wallpaper from "../../assets/images/walldga.png";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import { LogoutOutlined, UserOutlined, BuildFilled } from "@ant-design/icons";
import ListWells from "./ListWells";
import QueueAnim from "rc-queue-anim";

const { Title } = Typography;

const HeaderNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AppContext);

  return (
    <Affix>
      <QueueAnim delay={100} duration={900} type="top">
        <div key="login">
          <Row
            align={"middle"}
            justify={"space-between"}
            style={{ marginTop: "10px", marginBottom: "10px" }}
          >
            <ListWells />

            <Col style={{ paddingRight: "10px" }}>
              <Button
                type={location.pathname === "/profile" ? "primary" : "primary"}
                icon={<BuildFilled />}
                shape={"round"}
                style={{ marginRight: "10px", borderColor: "white" }}
                onClick={() => {
                  //navigate("/profile");
                }}
              >
                {state.user.first_name.toUpperCase()}
              </Button>
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
