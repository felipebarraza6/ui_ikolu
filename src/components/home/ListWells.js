import React, { useContext } from "react";
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
    <Row style={{ marginTop: "-80px" }} align={"middle"} justify={"start"}>
      <Col>
        <Tag
          color="geekblue-inverse"
          style={{ marginBottom: "5px", fontSize: "13px" }}
        >
          Selecciona un punto de captación ({state.user.profile_data.length})
        </Tag>
        <br />
        <Select
          style={{ width: "300px", zIndex: 10000, color: "black" }}
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
          {state.profile_client.map((e, index) => (
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
