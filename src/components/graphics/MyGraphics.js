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
      <div key="graphic">
        <Row justify={"space-between"} align="middle">
          <Col xs={8} lg={3} xl={3}>
            {option && (
              <>
                {option === 1 && (
                  <DatePicker
                    style={styles.datePicker}
                    size="small"
                    allowEmpty={true}
                    onSelect={(date) => {
                      onSelectDate(date, "initial");
                    }}
                    defaultValue={option === 1 && dayjs().subtract(1, "day")}
                    showToday={false}
                    disabledDate={disabledDate}
                    placeholder="Selecciona un dia"
                    locale={es_ES}
                  />
                )}
                {option === 2 && (
                  <>
                    <DatePicker
                      style={styles.datePicker}
                      size="small"
                      showToday={false}
                      defaultValue={option === 2 && dayjs()}
                      allowEmpty={true}
                      onSelect={(date) => {
                        onSelectDate(date, "initial");
                      }}
                      disabledDate={disabledDateMonth}
                      picker="month"
                      placeholder="Selecciona un mes"
                      locale={es_ES}
                    />
                  </>
                )}
              </>
            )}
          </Col>
          <Col xs={10} lg={3} xl={6}>
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
              Mensual
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
