import React, { useContext } from "react";
import { Row, Col, Button, Popconfirm } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import { LogoutOutlined, BuildFilled } from "@ant-design/icons";
import ListWells from "./ListWells";
import QueueAnim from "rc-queue-anim";

const HeaderNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AppContext);

  return (
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
              type={location.pathname === "/profile" ? "primary" : "default"}
              icon={<BuildFilled />}
              shape={"round"}
              style={{ marginRight: "10px", borderColor: "white" }}
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
  );
};

export default HeaderNav;
