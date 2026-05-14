import React, { useEffect, useState } from "react";
import "./Well.css";
import { Typography } from "antd";

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

// Genera burbujas para el tubo del pozo con intensidad basada en caudal
const generateRandomBubblesForTube = (caudal = 0) => {
  const bubbles = [];
  // Ajusta la cantidad de burbujas según el caudal (más caudal = más burbujas)
  const bubbleCount = Math.min(30, Math.max(10, Math.floor(caudal * 2) + 15));
  // Ajusta la velocidad según el caudal (más caudal = más rápido)
  const baseSpeed = Math.max(3, Math.min(8, 8 - caudal * 0.5));

  for (let i = 0; i < bubbleCount; i++) {
    const size = Math.random() * 5 + 2 + "px"; // Tamaño entre 2px y 7px
    const left = Math.random() * 100 + "%";
    const animationDuration = Math.random() * 2 + baseSpeed + "s";
    const animationDelay = Math.random() * -10 + "s";
    bubbles.push({ size, left, animationDuration, animationDelay });
  }
  return bubbles;
};

const Well = (props) => {
  const {
    total,
    nivel,
    caudal,
    profW,
    waterTable = 0,
    loading = false,
    showCaudal = true,
    showNivel = true,
    showTotal = false,
    children,
  } = props;
  const [tubeBubbles, setTubeBubbles] = useState([]);
  const [niveLevel, setNivelLevel] = useState(nivel);
  const [prof, setProf] = useState(profW);
  const [waterTableLevel, setWaterTableLevel] = useState(waterTable);

  useEffect(() => {
    setTubeBubbles(generateRandomBubblesForTube(parseFloat(caudal) || 0));
    setNivelLevel(nivel);
    setWaterTableLevel(waterTable);
    if (profW <= 0) {
      setProf(50); // Default placeholder depth
    } else {
      setProf(profW);
    }
  }, [nivel, profW, waterTable, caudal]);

  // Calcular profundidad: si no hay profundidad configurada, usar suma de nivel freático + columna de agua
  const hasProfundidad = profW > 0;
  const currentProf = hasProfundidad
    ? parseFloat(prof) || 50
    : parseFloat(waterTableLevel) + parseFloat(niveLevel) || 50;

  const currentNivel = parseFloat(niveLevel) || 0;
  const currentWaterTable = parseFloat(waterTableLevel) || 0;
  const currentCaudal = parseFloat(caudal) || 0;

  // Calcular nivel estático: diferencia entre profundidad y (nivel freático + columna de agua)
  // Solo se calcula si hay profundidad configurada
  const nivelEstatico = hasProfundidad
    ? Math.max(0, currentProf - (currentWaterTable + currentNivel))
    : 0;

  // --- CÁLCULOS DE VISUALIZACIÓN ---

  // 1. AGUA TOTAL (Columna de Agua + Nivel Estático como un solo cuerpo)
  // Si hay profundidad, sumamos columna de agua + nivel estático
  // Si no hay profundidad, solo usamos la columna de agua
  const totalWaterHeightMeters =
    hasProfundidad && nivelEstatico > 0
      ? currentNivel + nivelEstatico
      : currentNivel;
  const totalWaterHeightPercent = Math.min(
    100,
    (totalWaterHeightMeters / currentProf) * 100
  );

  // Porcentaje de la columna de agua dentro del total de agua
  const columnaPercentInTotal =
    totalWaterHeightMeters > 0
      ? (currentNivel / totalWaterHeightMeters) * 100
      : 100;

  // 2. NIVEL FREÁTICO (Background en la tierra)
  // Al estar anidado en .tierra, el contenedor padre ES la tierra (100% height).
  const effectiveEarthHeight = 100;
  const effectiveSurfaceTop = 0;

  // Profundidad relativa al total
  const freaticoRelativePercent =
    (currentWaterTable / currentProf) * effectiveEarthHeight;
  const freaticoTop = effectiveSurfaceTop + freaticoRelativePercent;
  const freaticoHeight = effectiveEarthHeight - freaticoRelativePercent;

  const styles = {
    nivel: {
      height: `${totalWaterHeightPercent}%`,
      bottom: 0,
      // Gradiente que va de claro (columna de agua) a oscuro (nivel estático)
      // El punto de transición está en el porcentaje donde termina la columna de agua
      background:
        hasProfundidad && nivelEstatico > 0
          ? `linear-gradient(180deg,
            rgba(0, 242, 255, 0.8) 0%,
            rgba(0, 230, 245, 0.82) ${columnaPercentInTotal * 0.3}%,
            rgba(0, 220, 240, 0.83) ${columnaPercentInTotal * 0.6}%,
            rgba(0, 210, 235, 0.84) ${columnaPercentInTotal * 0.8}%,
            rgba(0, 200, 230, 0.8) ${columnaPercentInTotal}%,
            rgba(0, 190, 225, 0.82) ${columnaPercentInTotal + 5}%,
            rgba(0, 170, 215, 0.85) ${columnaPercentInTotal + 20}%,
            rgba(0, 150, 205, 0.88) ${columnaPercentInTotal + 40}%,
            rgba(0, 140, 200, 0.9) 100%)`
          : `linear-gradient(180deg,
            rgba(0, 242, 255, 0.8) 0%,
            rgba(0, 230, 245, 0.82) 30%,
            rgba(0, 220, 240, 0.83) 60%,
            rgba(0, 210, 235, 0.84) 80%,
            rgba(0, 200, 230, 0.8) 100%)`,
      zIndex: 2,
    },
    freatico: {
      top: `${Math.min(98, Math.max(50, freaticoTop))}%`, // Clamp entre 50% (superficie) y casi fondo
      height: `${Math.max(0, freaticoHeight)}%`,
    },
    sensorLine: {
      height: `${100 - totalWaterHeightPercent}%`, // El cable baja hasta el nivel del agua
    },
  };

  if (loading) {
    return (
      <div className="pozo" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fa", borderRadius: 16 }}>
        <div
          style={{
            width: "60%",
            maxWidth: 200,
            height: "70%",
            borderRadius: 12,
            background: "linear-gradient(90deg, #e8ecf1 25%, #dfe4ea 50%, #e8ecf1 75%)",
            backgroundSize: "200% 100%",
            animation: "wellShimmer 1.6s ease-in-out infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className="pozo">
      {/* 2. Suelo / Tierra (Fondo Minimalista) - Contenedor Principal */}
      <div className="tierra">
        {/* 3. Nivel Freático (Capa de Agua en la tierra) */}
        <div className="nivel-freatico-container" style={styles.freatico}>
          {/* Label removed per user request */}
        </div>

        {/* 5. Tubo del Pozo (Vidrio) */}
        <div className="tubo-pozo">
          {/* Profundidad Total - Lado Izquierdo */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: "100%",
              marginRight: 8,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              borderRight: "1px solid rgba(0, 0, 0, 0.15)",
              whiteSpace: "nowrap",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 10,
                height: 1,
                background: "rgba(0, 0, 0, 0.15)",
              }}
            ></div>

            <div
              style={{
                paddingRight: 4,
                textAlign: "right",
                pointerEvents: "auto",
              }}
            >
              <Text
                style={{
                  display: "block",
                  fontSize: 9,
                  color: "rgba(0, 0, 0, 0.6)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Profundidad
              </Text>
              <Text
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#1F3461",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {currentProf.toFixed(2)} m
              </Text>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 10,
                height: 1,
                background: "rgba(0, 0, 0, 0.15)",
              }}
            ></div>
          </div>

          {/* ETIQUETAS DE NIVEL - Lado Derecho */}
          {/* Bloque 1: Nivel Freático (parte superior) - solo si hay valor */}
          {currentWaterTable > 0 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "100%",
                marginLeft: 8,
                height: `${Math.max(15, 100 - totalWaterHeightPercent)}%`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
                whiteSpace: "nowrap",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 10,
                  height: 1,
                  background: "rgba(0, 0, 0, 0.12)",
                }}
              ></div>

              <div style={{ paddingLeft: 4, pointerEvents: "auto" }}>
                <Text
                  style={{
                    display: "block",
                    fontSize: 9,
                    color: "rgba(0, 0, 0, 0.6)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Nivel freático
                </Text>
                <Text
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#1F3461",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {currentWaterTable.toFixed(2)} m
                </Text>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: 10,
                  height: 1,
                  background: "rgba(0, 0, 0, 0.12)",
                }}
              ></div>
            </div>
          )}

          {/* Bloque 2: Columna de Agua (parte media del agua total) - solo si hay valor */}
          {currentNivel > 0 && (
            <div
              style={{
                position: "absolute",
                bottom:
                  hasProfundidad && nivelEstatico > 0
                    ? `${(nivelEstatico / currentProf) * 100}%`
                    : "0",
                left: "100%",
                marginLeft: 8,
                height: `${Math.max(15, (currentNivel / currentProf) * 100)}%`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderLeft: "1px solid rgba(0, 0, 0, 0.18)",
                whiteSpace: "nowrap",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 10,
                  height: 1,
                  background: "rgba(0, 0, 0, 0.18)",
                }}
              ></div>

              <div style={{ paddingLeft: 4, pointerEvents: "auto" }}>
                <Text
                  style={{
                    fontSize: 9,
                    color: "rgba(0, 0, 0, 0.6)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Columna de Agua
                </Text>
                <Text
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#1F3461",
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {currentNivel.toFixed(2)} m
                </Text>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: 10,
                  height: 1,
                  background: "rgba(0, 0, 0, 0.18)",
                }}
              ></div>
            </div>
          )}

          {/* Agua Interior - Un solo cuerpo de agua (Columna + Estático) */}
          <div className="nivel" style={styles.nivel}>
            {/* Ondas que interactúan con los bordes */}
            <div className="water-wave wave-left"></div>
            <div className="water-wave wave-right"></div>
            <div className="water-wave wave-center"></div>

            {/* Burbujas animadas - algunas pueden cruzar al nivel estático */}
            {tubeBubbles.map((bubble, index) => (
              <div
                key={index}
                className="burbuja-minimal"
                style={{
                  left: bubble.left,
                  width: bubble.size,
                  height: bubble.size,
                  animationDuration: bubble.animationDuration,
                  animationDelay: bubble.animationDelay,
                }}
              />
            ))}
          </div>

          {/* Bloque 3: Nivel Estático (parte inferior del agua total) */}
          {hasProfundidad && nivelEstatico > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "100%",
                marginLeft: 8,
                height: `${(nivelEstatico / currentProf) * 100}%`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderLeft: "1px solid rgba(0, 0, 0, 0.15)",
                whiteSpace: "nowrap",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 10,
                  height: 1,
                  background: "rgba(0, 0, 0, 0.15)",
                }}
              ></div>

              <div style={{ paddingLeft: 4, pointerEvents: "auto" }}>
                <Text
                  style={{
                    fontSize: 9,
                    color: "rgba(0, 0, 0, 0.6)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Nivel Estático
                </Text>
                <Text
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#1F3461",
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {nivelEstatico.toFixed(2)} m
                </Text>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: 10,
                  height: 1,
                  background: "rgba(0, 0, 0, 0.15)",
                }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Stats / Children Integrados: Renderizar si hay children */}
      {children && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 0,
            width: "100%",
            zIndex: 30,
            padding: "0 20px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Well;
