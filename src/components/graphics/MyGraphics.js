import React, { useState, useEffect, useContext } from "react";
import { Typography, Row, Col, Button, DatePicker } from "antd";
import GraphicLine from "./GraphicLine";
import { AppContext } from "../../App";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title } = Typography;

const MyGraphics = () => {
  const [option, setOption] = useState(1);
  const { state, dispatch } = useContext(AppContext);
  const [initialDate, setInitialDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [onGetFilter, setOnGetFilter] = useState(false);
  const [countUpdate, setCountUpdate] = useState(0);

  const handleOption = (option) => {
    setOption(option);
  };

  const onSelectDate = (date, type) => {
    if (type === "initial") {
      setInitialDate(moment(date).format("YYYY-MM-DD").toString());
    } else {
      setEndDate(moment(date).format("YYYY-MM-DD").toString());
    }
  };

  useEffect(() => {}, [state.selected_profile, countUpdate]);

  return (
    <Row
      justify={"space-between"}
      align="middle"
      style={{ paddingTop: "20px" }}
    >
      <Col>
        <Title level={2}>Gráficos</Title>
      </Col>
      <Col>
        <Button
          type={option === 2 ? "primary" : "default"}
          onClick={() => handleOption(1)}
          size="small"
          style={styles.btnOption}
          icon={<ClockCircleOutlined />}
        >
          Registro 24 horas
        </Button>
        <Button
          type={option === 1 ? "primary" : "default"}
          onClick={() => handleOption(2)}
          size="small"
          style={styles.btnOption}
          icon={<CalendarOutlined />}
        >
          Rango de fechas
        </Button>
      </Col>
      <Col span={24}>
        {option && (
          <>
            {option === 1 && (
              <DatePicker
                style={styles.datePicker}
                size="small"
                onSelect={(date) => {
                  onSelectDate(date, "initial");
                  onSelectDate(date, "end");
                }}
                placeholder="Selecciona un dia"
              />
            )}
            {option === 2 && (
              <>
                <DatePicker
                  style={styles.datePicker}
                  size="small"
                  placeholder="Selecciona una fecha inicial"
                />
                <DatePicker
                  style={styles.datePicker}
                  size="small"
                  placeholder="Selecciona una fecha final"
                />
              </>
            )}
            <Button
              disabled={
                option === 1
                  ? initialDate
                    ? false
                    : true
                  : option === 2 && initialDate & endDate
                  ? true
                  : false
              }
              type="primary"
              icon={<FilterOutlined />}
              size={"small"}
              onClick={() => {
                setOnGetFilter(true);
                setCountUpdate(countUpdate + 1);
              }}
            >
              Filtrar
            </Button>
          </>
        )}
      </Col>
      <Col span={24} style={styles.container}>
        {onGetFilter && (
          <GraphicLine
            option={option}
            initialDate={initialDate}
            endDate={endDate}
            id_profile={state.selected_profile.id}
          />
        )}
      </Col>
    </Row>
  );
};

const styles = {
  btnOption: {
    marginRight: "10px",
  },
  datePicker: {
    width: "250px",
    marginRight: "10px",
  },
  container: {
    padding: "20px",
  },
};

export default MyGraphics;
