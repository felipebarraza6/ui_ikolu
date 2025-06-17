import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import {
  LogoutOutlined,
  BuildFilled,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Typography, Button, Popconfirm, Flex } from "antd";
import ListWells from "./ListWells";

const { Title } = Typography;

const HeaderNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AppContext);
  const { pathname } = location;

  return (
    <Flex align="center" justify="space-between" style={{ width: "100%" }}>
      <Title
        level={window.innerWidth > 900 ? 3 : 4}
        style={{ color: "#1F3461", margin: 0 }}
      >
        {state.user && state.user.first_name
          ? state.user.first_name.toUpperCase()
          : ""}
      </Title>

      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {pathname === "/formmultidata" ? (
          <Button
            icon={<ArrowLeftOutlined />}
            style={{ marginTop: "10px" }}
            onClick={() => navigate("/")}
          >
            Volver a telemetría
          </Button>
        ) : (
          <ListWells />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          type={pathname === "/profile" ? "primary" : "default"}
          icon={<BuildFilled />}
          shape={"round"}
          style={{
            marginRight: "10px",
            borderColor: "white",
            backgroundColor:
              pathname === "/profile" ? undefined : "rgb(31, 52, 97)",
            color: "white",
          }}
        >
          {state.user && state.user.first_name
            ? state.user.first_name.toUpperCase()
            : ""}
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
      </div>
    </Flex>
  );
};

export default HeaderNav;
