import React, { useState, useContext, useEffect } from "react";
import { Tabs, Card, Flex, DatePicker, Select, Form, Button } from "antd";

import { AppContext } from "../../App";
import { PiAtomLight } from "react-icons/pi";
import QueueAnim from "rc-queue-anim";
import moment from "moment";
import sh from "../../api/sh/endpoints";
import ContainerDays from "./dga/days/Container";
import ContainerMonth from "./dga/month/Container";

const GraphisNavDga = () => {
  const [dateType, setDateType] = useState("1");

  const [monthMode, setMonthMode] = useState(false);

  const [maxConsumoHora, setMaxConsumoHora] = useState({
    hour: "00:00",
    value: 0,
  });
  const [minConsumoHora, setMinConsumoHora] = useState({
    hour: "00:00",
    value: 0,
  });
  const [acumulado, setAcumulado] = useState({
    first: {
      hour: "00:00",
      value: 0,
    },
    last: {
      hour: "00:00",
      value: 0,
    },
  });

  const [caudalMax, setCaudalMax] = useState(0);
  const [caudalMin, setCaudalMin] = useState(0);

  const [nivelMax, setNivelMax] = useState(0);
  const [nivelMin, setNivelMin] = useState(0);

  const { state } = useContext(AppContext);
  const [data, setData] = useState(state.selected_profile.modules.m22);
  const [dataMonth, setDataMonth] = useState([]);
  const activate = state.selected_profile.profile_ikolu.m2;
  console.log(activate);
  const [dateSelected, setDateSelected] = useState(
    moment().format("YYYY-MM-DD")
  );

  const getData = async () => {
    if (!monthMode) {
      const response = await sh
        .get_data_day(state.selected_profile.id, dateSelected, dateSelected)
        .then((response) => {
          setData(response || []);
        });
    } else {
      const response = await sh
        .get_data_month(state.selected_profile.id, dateSelected, dateSelected)
        .then((response) => {
          setDataMonth(response || []);
        });
    }
  };

  const handleDateTypeChange = (value) => {
    setDateType(value);
    if (value === "2") {
      setMonthMode(true);
    } else {
      setMonthMode(false);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      let caudalMax = data.reduce((prev, current) =>
        prev.flow > current.flow ? prev : current
      );

      let caudalMin = data.reduce((prev, current) => {
        if (current.flow === 0) return prev;
        return prev.flow < current.flow && prev.flow !== 0 ? prev : current;
      });

      setCaudalMax({
        hour: caudalMax.date_time_medition.slice(11, 16),
        value: caudalMax.flow,
      });
      setCaudalMin({
        hour: caudalMin.date_time_medition.slice(11, 16),
        value: caudalMin.flow,
      });

      let nivelMax = data.reduce((prev, current) =>
        prev.water_table > current.water_table ? prev : current
      );

      setNivelMax({
        hour: nivelMax.date_time_medition.slice(11, 16),
        value: nivelMax.flow,
      });

      let nivelMin = data.reduce((prev, current) => {
        if (current.water_table === 0) return prev;
        return prev.water_table < current.water_table && prev.water_table !== 0
          ? prev
          : current;
      });

      setNivelMin({
        hour: nivelMin.date_time_medition.slice(11, 16),
        value: nivelMin.flow,
      });

      let max = data.reduce((prev, current) =>
        prev.total_diff > current.total_diff ? prev : current
      );
      console.log(max.date_time_medition.slice(11, 16));
      setMaxConsumoHora({
        hour: max.date_time_medition.slice(11, 16),
        value: max.total_diff,
      });

      let min = data.reduce((prev, current) => {
        if (current.total_diff === 0) return prev;
        return prev.total_diff < current.total_diff && prev.total_diff !== 0
          ? prev
          : current;
      });

      setMinConsumoHora({
        hour: min.date_time_medition.slice(11, 16),
        value: min.total_diff,
      });
      setAcumulado({
        first: {
          hour: data[0].date_time_medition.slice(11, 16),
          value: parseInt(data[0].total).toLocaleString("es-CL"),
        },
        last: {
          hour: data[data.length - 1].date_time_medition.slice(11, 16),
          value: parseInt(data[data.length - 1].total).toLocaleString("es-CL"),
        },
      });
    }
  }, [data, monthMode]);

  return (
    <QueueAnim delay={300} duration={900} type="alpha">
      <div key="login">
        <Card
          style={{ width: "100%" }}
          headStyle={{
            borderColor: "transparent",
            background:
              "linear-gradient(39deg, rgba(235,60,70,0.3449754901960784) 0%, rgba(15,105,180,0.12648809523809523) 100%)",
          }}
          title={
            <Flex
              gap="small"
              justify="center"
              style={{
                marginTop: "8px",
                marginBottom: "8px",
              }}
            >
              <Form layout="inline">
                <Form.Item rules={[{ required: true }]}>
                  <DatePicker
                    placeholder="Seleccionar una día"
                    onChange={(date) => {
                      if (date) {
                        setDateSelected(date.format("YYYY-MM-DD"));
                      }
                    }}
                    style={{ width: "200px" }}
                    picker={dateType === "1" ? "date" : "month"}
                    disabledDate={(current) =>
                      current && current > moment().endOf("day")
                    }
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      backgroundColor: "#eb3c46",
                      borderColor: "#eb3c46",
                    }}
                    icon={<PiAtomLight />}
                    onClick={getData}
                    disabled={!activate}
                  >
                    Analizar {dateType === "1" ? "Día" : "Mes"}
                  </Button>
                </Form.Item>
              </Form>
            </Flex>
          }
          size="small"
        >
          <Flex vertical gap="small" style={{ width: "100%" }}>
            {monthMode ? (
              <ContainerMonth data={dataMonth} />
            ) : (
              <ContainerDays data={data} />
            )}
          </Flex>
        </Card>
      </div>
    </QueueAnim>
  );
};

const styles = {
  cardStat: {
    width: "100%",
    background:
      "linear-gradient(90deg, rgba(89,128,55,0.40940126050420167) 0%, rgba(30,48,85,0.7763480392156863)",
    header: {
      color: "white",
      fontWeight: "700",
      background: "red",
      textAlign: "center",
      borderRadius: "5px 5px 0px 0px",
      borderColor: "transparent",
    },
  },

  card: {
    marginTop: "-16px",
    borderRadius: "0px 0px 10px 10px",
    width: "100%",
    background:
      "radial-gradient(circle, rgba(30,48,85,1) 0%, rgba(43,46,51,1) 100%)",
  },
  cardData: {
    marginTop: "-16px",
    borderRadius: "0px",
    width: "100%",
  },
};

export default GraphisNavDga;
