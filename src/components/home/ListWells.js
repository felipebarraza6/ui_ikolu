import React, { useContext, useEffect } from "react";
import { AppContext } from "../../App";
import { Row, Col, Tag, Badge, Select } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

const ListWells = () => {
  const { state, dispatch } = useContext(AppContext);

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
            width: window.innerWidth > 900 ? "300px" : "100%",
            zIndex: 9999,
            color: "black",
          }}
          placeholder="Selecciona un punto de captación"
          defaultValue={state.selected_profile.key}
          onSelect={(key) => {
            console.log(state.profile_client[key]);
            dispatch({
              type: "CHANGE_SELECTED_PROFILE",
              payload: {
                selected_profile: { ...state.profile_client[key], key: key },
              },
            });
          }}
        >
          {state.profile_client
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((e, index) => (
              <Select.Option
                key={index}
                disabled={!e.is_monitoring}
                value={index}
              >
                <Row justify={"space-between"}>
                  <Col span={12}>{e.title}</Col>
                  <Col span={12}>
                    {e.code_dga_site && window.innerWidth > 900 && (
                      <Tag
                        color={
                          e.is_monitoring
                            ? e.is_send_dga
                              ? "green-inverse"
                              : "geekblue-inverse"
                            : "volcano-inverse"
                        }
                        style={{
                          float: "right",
                          marginTop: "4px",
                          fontSize: "13px",
                        }}
                        icon={
                          e.is_monitoring ? (
                            e.is_send_dga && <CheckCircleFilled />
                          ) : (
                            <CloseCircleFilled />
                          )
                        }
                      >
                        {e.code_dga_site}
                      </Tag>
                    )}
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
