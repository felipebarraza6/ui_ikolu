import React, { useState, useEffect, useContext } from "react";
import { Typography, Row, Col, Button, DatePicker, Card } from "antd";
import GraphicLine from "./GraphicLine";
import { AppContext } from "../../App";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import QueueAnim from "rc-queue-anim";
import es_ES from "antd/lib/locale/es_ES";

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

  const disabledDate = (current) => {
    return (
      current &&
      (current > dayjs().endOf("day") || current < dayjs().startOf("month"))
    );
  };
  const disabledDateMonth = (current) => {
    const currentMonth = dayjs().month();
    const previousMonth = dayjs().subtract(1, "month").month();
    return (
      current &&
      current.month() !== currentMonth &&
      current.month() !== previousMonth
    );
  };

  useEffect(() => {
    if (option === 1) {
      setInitialDate(dayjs().subtract(1, "day").format("YYYY-MM-DD"));
    }
    if (option === 2) {
      setInitialDate(dayjs().format("YYYY-MM"));
    }
  }, [state.selected_profile, countUpdate, option]);

  return (
    <QueueAnim delay={500} duration={900} type="alpha">
      <div
        key="graphic"
        style={{
          padding: window.innerWidth < 900 ? "5px" : "20px",
          width: "100%",
        }}
      >
        <Row
          justify={window.innerWidth < 900 ? "start" : "space-between"}
          align="middle"
          style={{ width: "100%" }}
        >
          <Col
            xs={24}
            lg={6}
            xl={6}
            style={{ marginBottom: window.innerWidth < 900 ? 10 : 0 }}
          >
            <Button
              type={option === 2 ? "primary" : "default"}
              onClick={() => handleOption(1)}
              size={window.innerWidth < 900 ? "middle" : "small"}
              style={{
                ...styles.btnOption,
                width: window.innerWidth < 900 ? "100%" : "auto",
                marginBottom: window.innerWidth < 900 ? 8 : 0,
              }}
              icon={<ClockCircleOutlined />}
            >
              Registro 24 horas
            </Button>
            <Button
              type={option === 1 ? "primary" : "default"}
              onClick={() => handleOption(2)}
              size={window.innerWidth < 900 ? "middle" : "small"}
              style={{
                ...styles.btnOption,
                width: window.innerWidth < 900 ? "100%" : "auto",
              }}
              icon={<CalendarOutlined />}
            >
              Mensual
            </Button>
          </Col>
          <Col
            span={24}
            style={{
              ...styles.container,
              padding: window.innerWidth < 900 ? 0 : 20,
            }}
          >
            <GraphicLine />
          </Col>
        </Row>
      </div>
    </QueueAnim>
  );
};

const styles = {
  btnOption: {
    marginRight: "10px",
    marginTop: window.innerWidth > 900 ? "0px" : "10px",
  },
  datePicker: {
    width: window.innerWidth > 900 ? "250px" : "100%",
    marginRight: "10px",
  },
  container: {
    padding: "20px",
  },
};

export default MyGraphics;
