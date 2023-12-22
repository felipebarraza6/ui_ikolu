import React, { useContext, useEffect } from "react";
import { Button } from "antd";
import { AppContext } from "../../App";
import { Row, Col, Tag, Badge, Select } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckSquareFilled,
} from "@ant-design/icons";

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
          {state.selected_profile.key}
        </Tag>
        <br />
        <Select
          style={{
            width: window.innerWidth > 900 ? "300px" : "100%",
            zIndex: 10000,
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
              <Select.Option key={index} value={index}>
                {e.title}
              </Select.Option>
            ))}
        </Select>
      </Col>
    </Row>
  );
};

export default ListWells;
