import React, { useEffect, useState } from "react";
import "./Well.css";

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

const Well = () => {
  const [bubbles, setBubbles] = useState([]);
  const [tubeBubbles, setTubeBubbles] = useState([]);

  useEffect(() => {
    setBubbles(generateRandomBubbles());
    setTubeBubbles(generateRandomBubblesForTube());
  }, []);

  return (
    <div className="pozo-container">
      <div className="pozo">
        <div className="superficie"></div>
        <div className="pavimento"></div>
        <div className="nivel-agua">
          <div className="tierra"></div>
          <div className="agua-inferior">
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
          </div>
          <div className="tubo-pozo">
            <div className="nivel">
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
          </div>
        </div>
        <div className="sensor">
          <div className="punta"></div>
        </div>
        <div className="linea-logger"></div>
        <div className="linea-caudalimetro"></div>
        <div className="datalogger">
          <div className="tablero"></div>
          <div className="pata-izquierda"></div>
          <div className="pata-derecha"></div>
        </div>
        <div className="caudalimetro"></div>
      </div>
    </div>
  );
};

export default Well;
