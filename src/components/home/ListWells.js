import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Row, Col, Tag, Badge, Select, Flex, Button } from "antd";
import { useNavigate } from "react-router";
import { SendOutlined, DatabaseFilled } from "@ant-design/icons";
import { GiConsoleController } from "react-icons/gi";
import { FcDoughnutChart } from "react-icons/fc";

const ListWells = () => {
  const { state, dispatch } = useContext(AppContext);

  // Función segura para parsear localStorage
  const safeParseJSON = (item, fallback = null) => {
    try {
      const value = localStorage.getItem(item);
      if (value === null || value === "undefined" || value === "null") {
        return fallback;
      }
      return JSON.parse(value);
    } catch (error) {
      console.warn(`Error parsing localStorage item "${item}":`, error);
      return fallback;
    }
  };

  const selected = safeParseJSON("selected_profile");
  const navigate = useNavigate();

  const disabledWell = (well) => {
    if (well.config_data.is_telemetry) {
      return false;
    } else if (well.standard === "CAUDALES_MUY_PEQUENOS") {
      return false;
    } else if (well.standard === "MENOR") {
      return false;
    } else {
      return true;
    }
  };

  const onSelectWell = (key) => {
    if (key === "admin") {
      navigate("/supp");
    } else {
      const selectedProfile = state.profile_client.find(
        (profile) => profile.id === key
      );
      if (selectedProfile) {
        dispatch({
          type: "CHANGE_SELECTED_PROFILE",
          payload: {
            selected_profile: { ...selectedProfile, key: key },
          },
        });
        navigate("/");
      }
    }
  };

  return (
    <Flex align={"bottom"} justify={"end"} gap={"small"} wrap={"wrap"}>
      <Col>
        <Select
          style={{
            width: window.innerWidth > 900 ? "300px" : "100%",
            zIndex: 1000,
            color: "black",
            marginRight: window.innerWidth > 900 ? 12 : 0,
          }}
          placeholder="Seleccione punto de captación"
          value={selected && selected.id ? selected.id : undefined}
          onSelect={(key) => {
            onSelectWell(key);
          }}
          dropdownStyle={{ zIndex: 1001 }}
        >
          {state.profile_client && state.profile_client.length > 0 ? (
            state.profile_client.map((e) => (
              <Select.Option key={e.id} disabled={disabledWell(e)} value={e.id}>
                <Flex gap="large" justify="space-between">
                  <Flex gap="small">
                    {e.config_data.is_telemetry ? (
                      <Badge
                        status={
                          e.profile_ikolu.entry_by_form
                            ? "success"
                            : "processing"
                        }
                      />
                    ) : (
                      <Badge status="warning" />
                    )}
                    <span>{e.title}</span>
                  </Flex>

                  <Tag
                    color={e.is_send_dga ? "green-inverse" : "rgb(31, 52, 97)"}
                    style={{
                      float: "right",
                      marginTop: "4px",
                      marginBottom: "4px",
                      fontSize: "13px",
                    }}
                    icon={
                      e.dga.send_dga ? <SendOutlined /> : <DatabaseFilled />
                    }
                  >
                    {e.dga.code_dga}
                  </Tag>
                </Flex>
              </Select.Option>
            ))
          ) : (
            <Select.Option disabled value="no-data">
              No hay puntos de captación disponibles
            </Select.Option>
          )}
          {state.user.is_admin_view &&
            state.profile_client &&
            state.profile_client.length > 0 && (
              <Select.Option key="admin" value="admin">
                <Flex gap="large">
                  <Badge status="success" />
                  Total
                  <Tag
                    color="green-inverse"
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                    }}
                    icon={<DatabaseFilled />}
                  >
                    {state.profile_client[0].code_dga_site}
                  </Tag>
                </Flex>
              </Select.Option>
            )}
        </Select>
      </Col>

      {state.user.username === "demosmart" && (
        <Col>
          <Button
            onClick={() => navigate("formmultidata")}
            icon={<FcDoughnutChart />}
          >
            MODULO B
          </Button>
        </Col>
      )}
    </Flex>
  );
};

export default ListWells;
