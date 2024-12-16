import React, { useContext, useEffect } from "react";
import { AppContext } from "../../App";
import { Row, Col, Tag, Badge, Select } from "antd";
import { useNavigate } from "react-router";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  SendOutlined,
  DatabaseFilled,
} from "@ant-design/icons";

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

  return (
    <Row style={{ marginTop: "0px" }} align={"middle"} justify={"start"}>
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
            width: window.innerWidth > 900 ? "350px" : "100%",
            zIndex: 9999,
            color: "black",
          }}
          placeholder="Selecciona un punto de captación"
          defaultValue={state.selected_profile.id}
          onSelect={(key) => {
            console.log(key);
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
                <Row>
                  <Col span={24}>
                    <Row justify={"space-between"}>
                      <Col span={11}>{e.title}</Col>
                      <Col span={1}>
                        {e.is_monitoring && <Badge status="processing" />}
                      </Col>
                      <Col span={11}>
                        {e.code_dga_site && window.innerWidth > 900 && (
                          <Tag
                            color={e.is_send_dga ? "green-inverse" : "blue"}
                            style={{
                              float: "right",
                              marginTop: "4px",
                              fontSize: "13px",
                            }}
                            icon={
                              e.is_send_dga ? (
                                <SendOutlined />
                              ) : (
                                <DatabaseFilled />
                              )
                            }
                          >
                            {e.code_dga_site}
                          </Tag>
                        )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Select.Option>
            ))}
        </Select>
      </Col>
    </Row>
  );
};

export default ListWells;
