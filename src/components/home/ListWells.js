import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Row, Col, Tag, Badge, Select, Flex } from "antd";
import { useNavigate } from "react-router";
import { SendOutlined, DatabaseFilled } from "@ant-design/icons";
import { GiConsoleController } from "react-icons/gi";

const ListWells = () => {
  const { state, dispatch } = useContext(AppContext);
  const selected = JSON.parse(localStorage.getItem("selected_profile"));
  console.log(selected.id);
  const navigate = useNavigate();

  const disabledWell = (well) => {
    console.log(well);
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
  console.log(state);

  return (
    <Row align={"middle"} justify={"start"}>
      <Col>
        <Select
          style={{
            width: window.innerWidth > 900 ? "300px" : "100%",
            zIndex: 9999,
            color: "black",
          }}
          placeholder="Punto de captación"
          defaultValue={selected.id}
          onSelect={(key) => {
            onSelectWell(key);
          }}
        >
          {state.profile_client.map((e) => (
            <Select.Option key={e.id} disabled={disabledWell(e)} value={e.id}>
              <Flex gap="large" justify="space-between">
                <Flex gap="small">
                  {console.log(
                    state.selected_profile.profile_ikolu.entry_by_form
                  )}
                  {e.config_data.is_telemetry ? (
                    <Badge
                      status={
                        e.profile_ikolu.entry_by_form ? "success" : "processing"
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
                  icon={e.dga.send_dga ? <SendOutlined /> : <DatabaseFilled />}
                >
                  {e.dga.code_dga}
                </Tag>
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
