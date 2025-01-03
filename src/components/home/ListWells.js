import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Row, Col, Tag, Badge, Select, Flex } from "antd";
import { useNavigate } from "react-router";
import { SendOutlined, DatabaseFilled } from "@ant-design/icons";

const ListWells = () => {
  const { state, dispatch } = useContext(AppContext);

  const navigate = useNavigate();

  const disabledWell = (well) => {
    if (well.is_monitoring) {
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
      console.log(state.profile_client);

      navigate("/supp");
    } else {
      const selectedProfile = state.profile_client.find(
        (profile) => profile.id === key
      );
      dispatch({
        type: "CHANGE_SELECTED_PROFILE",
        payload: {
          selected_profile: { ...selectedProfile, key: key },
        },
      });
      navigate("/");
    }
  };

  return (
    <Row align={"middle"} justify={"start"}>
      <Col>
        <Tag
          color="rgb(31, 52, 97)"
          style={{
            marginBottom: "5px",
            fontSize: "13px",
            borderColor: "white",
            padding: "2px",
            paddingLeft: "5px",
          }}
        >
          Puntos de captación ({state.user.profile_data.length})
        </Tag>
        <br />
        <Select
          style={{
            width: window.innerWidth > 900 ? "300px" : "100%",
            zIndex: 9999,
            color: "black",
          }}
          placeholder="Punto de captación"
          defaultValue={
            state.selected_profile.id ? state.selected_profile.id : ""
          }
          onSelect={(key) => {
            onSelectWell(key);
          }}
        >
          {state.profile_client
            .sort((a, b) => {
              if (a.is_monitoring === b.is_monitoring) {
                return a.title.localeCompare(b.title);
              }
              return a.is_monitoring ? -1 : 1;
            })
            .map((e) => (
              <Select.Option key={e.id} disabled={disabledWell(e)} value={e.id}>
                <Flex gap="large" justify="start">
                  {e.is_monitoring ? (
                    <Badge status="processing" />
                  ) : (
                    <Badge status="default" />
                  )}

                  <Flex justify="space-around" gap={"large"}>
                    <span>{e.title}</span>
                    {!state.user.is_admin_view && (
                      <Tag
                        color={e.is_send_dga ? "green-inverse" : "blue"}
                        style={{
                          float: "right",
                          marginTop: "4px",
                          marginBottom: "4px",
                          fontSize: "13px",
                        }}
                        icon={
                          e.is_send_dga ? <SendOutlined /> : <DatabaseFilled />
                        }
                      >
                        {e.code_dga_site}
                      </Tag>
                    )}
                  </Flex>
                </Flex>
              </Select.Option>
            ))}
          {state.user.is_admin_view && (
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
    </Row>
  );
};

export default ListWells;
