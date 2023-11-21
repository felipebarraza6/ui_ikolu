import React, { useState, useEffect, useContext } from "react";
import { Typography, Row, Col, Button, DatePicker } from "antd";
import GraphicLine from "./GraphicLine";
import { AppContext } from "../../App";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

const MyGraphics = () => {
  const [option, setOption] = useState(1);
  const { state, dispatch } = useContext(AppContext);
  const [initialDate, setInitialDate] = useState(
    dayjs().subtract(1, "day").format("YYYY-MM-DD")
  );
  const [monthSelect, setMonthSelect] = useState(null);
  const [onGetFilter, setOnGetFilter] = useState(true);
  const [countUpdate, setCountUpdate] = useState(0);

  const handleOption = (option) => {
    setOption(option);
  };

  const onSelectDate = (date, type) => {
    if (type === "initial") {
      setInitialDate(dayjs(date).format("YYYY-MM-DD"));
    }
  };

  useEffect(() => {
    if (option === 1) {
      setInitialDate(dayjs().subtract(1, "day").format("YYYY-MM-DD"));
    }
    if (option === 2) {
    }
  }, [state.selected_profile, countUpdate, option]);

  return (
    <Row justify={"space-between"} align="middle">
      <Col>
        {option && (
          <>
            {option === 1 && (
              <DatePicker
                style={styles.datePicker}
                size="small"
                onSelect={(date) => {
                  onSelectDate(date, "initial");
                }}
                defaultValue={option === 1 && dayjs().subtract(1, "day")}
                placeholder="Selecciona un dia"
              />
            )}
            {option === 2 && (
              <>
                <DatePicker
                  style={styles.datePicker}
                  size="small"
                  onSelect={(date) => {
                    onSelectDate(date, "initial");
                  }}
                  picker="month"
                  placeholder="Selecciona un mes"
                />
              </>
            )}
          </>
        )}
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
      </Col>
      <Col span={24} style={styles.container}>
        {onGetFilter && (
          <GraphicLine
            option={option}
            initialDate={initialDate}
            id_profile={state.selected_profile.id}
            monthSelect={monthSelect}
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
