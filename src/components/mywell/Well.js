import React, { useEffect, useState } from "react";
import "./Well.css";
import { Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import QueueAnim from "rc-queue-anim"; // Importación de QueueAnim

const { Text } = Typography;

const generateRandomBubbles = () => {
  const bubbles = [];
  const positions = new Set();
  for (let i = 0; i < 20; i++) {
    let top, left;
    do {
      top = Math.random() * 100 + "%";
      left = Math.random() * 100 + "%";
    } while (positions.has(`${top}-${left}`));
    positions.add(`${top}-${left}`);
    const size = Math.random() * 5 + 2 + "px"; // Tamaño entre 2px y 7px
    const animationDuration = Math.random() * 5 + 5 + "s";
    const animationDelay = Math.random() * -10 + "s";
    bubbles.push({ size, top, left, animationDuration, animationDelay });
  }
  return bubbles;
};

const generateRandomBubblesForTube = () => {
  const bubbles = [];
  for (let i = 0; i < 20; i++) {
    const size = Math.random() * 5 + 2 + "px"; // Tamaño entre 2px y 7px
    const left = Math.random() * 100 + "%";
    const animationDuration = Math.random() * 5 + 5 + "s";
    const animationDelay = Math.random() * -10 + "s";
    bubbles.push({ size, left, animationDuration, animationDelay });
  }
  return bubbles;
};

const Well = ({ total, nivel, caudal, profW, loading = false }) => {
  const [bubbles, setBubbles] = useState([]);
  const [tubeBubbles, setTubeBubbles] = useState([]);
  const [niveLevel, setNivelLevel] = useState(nivel);
  const [prof, setProf] = useState(profW);

  useEffect(() => {
    setBubbles(generateRandomBubbles());
    setTubeBubbles(generateRandomBubblesForTube());
    setNivelLevel(nivel);
    if (profW <= 0) {
      setProf(50);
    } else {
      setProf(profW);
    }
  }, [nivel, profW]);

  const currentProf = parseFloat(prof);
  const currentNivel = parseFloat(niveLevel);

  const waterHeight = currentProf - currentNivel;

  // 4. Calcula el porcentaje
  let percentage = (waterHeight / currentProf) * 100;

  // 5. Asegúrate de que el porcentaje esté entre 0 y 100
  percentage = Math.max(0, Math.min(100, percentage));

  // 6. Formatea como string para CSS (puedes usar toFixed para decimales)
  const percentageString = percentage.toFixed(2) + "%";

  const styles = {
    nivel: {
      position: "absolute",

      bottom: "0",
      width: "100%",
      height: percentageString,
      borderRadius: "0px 0px 10px 10px",
      backgroundColor: "#8aafb1",
      backgroundSize: "cover",
      animation: "ondulacion-nivel 2s infinite",
    },
  };

  console.log(prof);

  return (
    <div className="pozo">
      <div className="superficie"></div>
      <div className="pavimento"></div>
      <div className="nivel-agua">
        <div className="tierra"></div>
        <div className="agua-inferior">
          <QueueAnim type={["bottom", "top"]} duration={1000}>
            {bubbles.map((bubble, index) => (
              <div
                key={index}
                className="burbuja"
                style={{
                  width: bubble.size,
                  height: bubble.size,
                  top: bubble.top,
                  left: bubble.left,
                  animationDuration: bubble.animationDuration,
                  animationDelay: bubble.animationDelay,
                }}
              ></div>
            ))}
          </QueueAnim>
        </div>
        <div className="tubo-pozo">
          <QueueAnim type={["bottom", "top"]} duration={1000}>
            <div style={styles.nivel} className="nivel" key="nivel">
              {tubeBubbles.map((bubble, index) => (
                <div
                  key={index}
                  className="burbuja-tubo"
                  style={{
                    width: bubble.size,
                    height: bubble.size,
                    left: bubble.left,
                    animationDuration: bubble.animationDuration,
                    animationDelay: bubble.animationDelay,
                  }}
                ></div>
              ))}
            </div>
          </QueueAnim>
        </div>
      </div>
      <div className="sensor">
        <div className="punta">
          <Text style={{ color: "white" }}>
            {loading ? (
              <LoadingOutlined
                spin
                style={{ fontSize: "1.0em", color: "white" }}
              />
            ) : (
              `${nivel && parseFloat(nivel).toFixed(2)} m`
            )}
          </Text>
        </div>
      </div>
      <div className="linea-logger"></div>
      <div className="linea-caudalimetro"></div>
      <div className="datalogger">
        <div className="tablero">
          <center>
            <Text
              style={{
                color: "black",
                fontWeight: "500",
                fontSize: "1.0em",
              }}
            >
              {loading ? (
                <LoadingOutlined
                  spin
                  style={{ fontSize: "1.0em", color: "black" }}
                />
              ) : (
                `${total && total.toLocaleString("es-CL")} m³`
              )}
            </Text>
          </center>
        </div>
        <div className="pata-izquierda"></div>
        <div className="pata-derecha"></div>
      </div>

      <div className="caudalimetro">
        <Text style={{ textAlign: "center", color: "white" }}>
          {loading ? (
            <LoadingOutlined
              spin
              style={{ fontSize: "1.0em", color: "white" }}
            />
          ) : (
            `${caudal && parseFloat(caudal).toFixed(2)} lt/s`
          )}
        </Text>
      </div>
    </div>
  );
};

export default Well;
