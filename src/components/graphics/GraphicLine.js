import React, { useState, useEffect } from "react";
import sh from "../../api/sh/endpoints";

import { Line, DualAxes } from "@ant-design/plots";

const GraphicLine = ({ option, initialDate, endDate, id_profile }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = async () => {
    var listFormated = [];
    const rq = await sh
      .get_data_sh_range(id_profile, initialDate, endDate, 1)
      .then((res) => {
        const formatList = res.results.map((element) => {
          console.log(element);
        });
        setData(formatList);
      });
  };
  const COLOR_PLATE_10 = [
    "#5B8FF9",
    "#5AD8A6",
    "#5D7092",
    "#F6BD16",
    "#E8684A",
    "#6DC8EC",
    "#9270CA",
    "#FF9D4D",
    "#269A99",
    "#FF99C3",
  ];

  const config = {
    data: [data, data],
    xField: "date_time_medition",
    yField: ["total", "nivel", "flow"],
    geometryOptions: [
      {
        geometry: "line",
        smooth: false,
        color: "#5B8FF9",
        label: {
          formatter: (datum) => {
            return `${datum.total}个`;
          },
        },
        lineStyle: {
          lineWidth: 3,
          lineDash: [5, 5],
        },
      },
      {
        geometry: "line",
        smooth: false,
        color: "#5B8FF9",
        label: {
          formatter: (datum) => {
            return `${datum.flow}个`;
          },
        },
        lineStyle: {
          lineWidth: 3,
          lineDash: [5, 5],
        },
      },
      {
        geometry: "line",
        smooth: true,
        color: "red",
        lineStyle: {
          lineWidth: 4,
          opacity: 0.5,
        },
        label: {
          formatter: (datum) => {
            return `${datum.nivel}个`;
          },
        },
        point: {
          shape: "circle",
          size: 4,
          style: {
            opacity: 0.5,
            stroke: "#5AD8A6",
            fill: "#fff",
          },
        },
      },
    ],
  };

  return <DualAxes {...config} />;
};

export default GraphicLine;
