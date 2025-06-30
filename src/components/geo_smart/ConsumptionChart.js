import React, { useState, useEffect, useContext } from "react";
import { Line } from "@ant-design/plots";
import { Spin, Flex, Alert, DatePicker, Button } from "antd";
import { AppContext } from "../../App";
import moment from "moment";
import { formatVolume } from "../../utils/numberFormatter";
import sh from "../../api/sh/endpoints";

const { RangePicker } = DatePicker;

const ConsumptionChart = () => {
  const { state } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const processInitialData = () => {
    if (!state.profile_client || state.profile_client.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let allPointsData = [];
      state.profile_client.forEach((profile) => {
        if (profile.modules && profile.modules.today) {
          const profileName = profile.title;
          const todayData = profile.modules.today.map((d) => ({
            time: moment(d.date_time_medition).format("YYYY-MM-DD HH:mm:ss"),
            value: d.total_diff || 0,
            category: profileName,
          }));
          allPointsData.push(...todayData);
        }
      });

      allPointsData.sort((a, b) => new Date(a.time) - new Date(b.time));

      setData(allPointsData);
    } catch (err) {
      setError("No se pudieron procesar los datos para el gráfico.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRangeData = async (range) => {
    if (!state.profile_client || state.profile_client.length === 0 || !range) {
      return;
    }
    setLoading(true);
    setError(null);
    const [start, end] = range;
    const startDate = start.format("YYYY-MM-DD");
    const endDate = end.format("YYYY-MM-DD");

    try {
      const promises = state.profile_client.map((profile) =>
        sh
          .getDataApiShRangeDateGraphic(profile.id, startDate, endDate)
          .then((response) => {
            if (response.results) {
              return response.results.map((d) => ({
                time: moment(d.date_time_medition).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
                value: d.total_diff || 0,
                category: profile.title,
              }));
            }
            return [];
          })
      );

      const results = await Promise.all(promises);
      const allPointsData = results.flat();

      allPointsData.sort((a, b) => new Date(a.time) - new Date(b.time));
      setData(allPointsData);
    } catch (err) {
      setError("No se pudieron cargar los datos para el rango seleccionado.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange) {
      fetchRangeData(dateRange);
    } else {
      processInitialData();
    }
  }, [state.profile_client, dateRange]);

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ height: 200 }}>
        <Spin tip="Cargando gráfico de consumo..." />
      </Flex>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  if (data.length === 0) {
    return (
      <Alert
        message="No hay datos de consumo disponibles para mostrar en el gráfico."
        type="info"
        showIcon
      />
    );
  }

  const config = {
    data,
    xField: "time",
    yField: "value",
    seriesField: "category",
    xAxis: {
      type: "time",
      title: { text: "Hora" },
      label: {
        formatter: (v) =>
          dateRange
            ? moment(v).format("DD/MM HH:mm")
            : moment(v).format("HH:mm"),
      },
    },
    yAxis: {
      title: { text: "Consumo (m³)" },
      label: {
        formatter: (v) => formatVolume(v),
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: datum.category,
        value: `${formatVolume(datum.value)} m³`,
      }),
    },
    smooth: true,
    legend: {
      position: "top",
    },
    download: {
      filename: "consumo-historico",
      text: "Descargar Gráfico",
    },
  };

  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 16 }} gap="small">
        <RangePicker
          onChange={(dates) => setDateRange(dates)}
          value={dateRange}
        />
        {dateRange && (
          <Button onClick={() => setDateRange(null)}>Limpiar filtro</Button>
        )}
      </Flex>
      <Line {...config} />
    </>
  );
};

export default ConsumptionChart;
