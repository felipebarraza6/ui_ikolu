import React, { useState, useEffect, useContext } from "react";
import sh from "../../api/sh/endpoints";
import Stats24Hours from "./Stats24ours";
import StatsMonth from "./StatsMonth";
import { Line } from "@ant-design/plots";
import { AppContext } from "../../App";

const GraphicLine = ({ option, initialDate, endDate, id_profile }) => {
  const [data, setData] = useState([]);
  const { state } = useContext(AppContext);

  useEffect(() => {
    if (option === 1) {
      asyncFetch();
    } else if (option === 2) {
      asyncFetch2();
    }
  }, [option, initialDate]);

  const asyncFetch = async () => {
    var date = new Date(initialDate);
    const rq1 = await sh
      .get_data_structural(
        id_profile,
        date.getFullYear(),
        date.getMonth() + 1,
        option === 1 ? date.getDate() : ""
      )
      .then((res) => {
        console.log(res);
        var listFormated = [];
        res.results.map((element) => {
          for (const [key, value] of Object.entries(element)) {
            var date_time = element.date_time_medition.slice(11, 16);
            const formattedElement = {};
            if (key === "total") {
              formattedElement.type = "acumulado (m³)";
              formattedElement.value = value;
              formattedElement.date = `${date_time} hrs`;
              listFormated.push(formattedElement);
            } else if (key === "nivel") {
              formattedElement.type = "nivel freático(m)";
              formattedElement.value = parseFloat(
                state.selected_profile.d3 - value
              ).toFixed(1);
              formattedElement.date = `${date_time} hrs`;
              listFormated.push(formattedElement);
            } else if (key === "flow") {
              formattedElement.type = "caudal (lt/s)";
              formattedElement.value = parseFloat(value).toFixed(1);
              formattedElement.date = `${date_time} hrs`;
              listFormated.push(formattedElement);
            } else if (key === "total_hora") {
              formattedElement.type = "acumulado(m³/hora)";
              formattedElement.value = value;
              formattedElement.date = `${date_time} hrs`;
              listFormated.push(formattedElement);
            }
          }
          return element;
        });

        // Ordenar el array por el campo date
        listFormated.sort((a, b) => {
          const timeA = parseInt(a.date.replace(":", ""));
          const timeB = parseInt(b.date.replace(":", ""));
          return timeA - timeB;
        });

        setData(listFormated);
      });
  };

  const asyncFetch2 = async () => {
    var date = new Date(initialDate);
    const rq1 = await sh
      .get_data_structural_month(
        id_profile,
        date.getFullYear(),
        date.getMonth()
      )
      .then((res) => {
        var listFormated = [];
        res.results.map((element) => {
          for (const [key, value] of Object.entries(element)) {
            var date_time = element.date_time_medition.slice(8, 10);
            const formattedElement = {};
            if (key === "total") {
              formattedElement.type = "acumulado (m³)";
              formattedElement.value = value;
              formattedElement.date = `${date_time}`;
              listFormated.push(formattedElement);
            } else if (key === "nivel") {
              formattedElement.type = "nivel freático (m)";
              formattedElement.value = parseFloat(
                state.selected_profile.d3 - value
              ).toFixed(1);
              formattedElement.date = `${date_time}`;
              listFormated.push(formattedElement);
            } else if (key === "flow") {
              formattedElement.type = "caudal (lt/s)";
              formattedElement.value = value;
              formattedElement.date = `${date_time}`;
              listFormated.push(formattedElement);
            } else if (key === "total_hora") {
              formattedElement.type = "acumulado(m³/hora)";
              formattedElement.value = value;
              formattedElement.date = `${date_time}`;
              listFormated.push(formattedElement);
            }
          }
          return element;
        });

        // Ordenar el array por el campo date
        listFormated.sort((a, b) => {
          const timeA = parseInt(a.date.replace(":", ""));
          const timeB = parseInt(b.date.replace(":", ""));
          return timeA - timeB;
        });

        setData(listFormated);
      });
  };
  const config = {
    data,
    xField: "date",

    xAxis: {
      title: {
        text: initialDate,
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: "value",
    yAxis: {
      tickInterval: 2,
      minValue: 0,
      label: {
        formatter: (v) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s}.`),
      },
    },
    seriesField: "type",
    color: ["#5b8c00", "#002c8c", "#cf1322", "#262626"],
  };

  const configMonth = {
    data,
    xField: "date",

    xAxis: {
      title: {
        text: initialDate,
        style: {
          fontSize: 14,
        },
      },
      tickInterval: 1,
    },
    yField: "value",
    yAxis: {
      tickInterval: 2,
      minValue: 0,
      label: {
        formatter: (v) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s}.`),
      },
    },
    seriesField: "type",
    color: ["#5b8c00", "#002c8c", "#cf1322", "#262626"],
  };

  return (
    <>
      {option === 1 ? (
        <>
          {data && (
            <>
              <Line {...config} />

              <Stats24Hours data={data} />
            </>
          )}
        </>
      ) : (
        <>
          <Line {...configMonth} />
          <StatsMonth />
        </>
      )}
    </>
  );
};

export default GraphicLine;
