import { Typography } from "antd";
import React from "react";

const { Text } = Typography;

const LoadingScreen = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "70vh",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)",
        borderRadius: "12px",
        margin: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Efecto de burbujas de agua */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
            50% { transform: translateY(-30px) scale(1.1); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 1; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .bubble {
            position: absolute;
            bottom: -100px;
            width: 40px;
            height: 40px;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(33,150,243,0.3));
            border-radius: 50%;
            animation: float 4s ease-in-out infinite;
          }
          .bubble:nth-child(2) { left: 15%; width: 60px; height: 60px; animation-delay: 1s; animation-duration: 5s; }
          .bubble:nth-child(3) { left: 35%; width: 30px; height: 30px; animation-delay: 2s; animation-duration: 6s; }
          .bubble:nth-child(4) { left: 55%; width: 50px; height: 50px; animation-delay: 0.5s; animation-duration: 5.5s; }
          .bubble:nth-child(5) { left: 75%; width: 35px; height: 35px; animation-delay: 1.5s; animation-duration: 4.5s; }
          .bubble:nth-child(6) { left: 85%; width: 45px; height: 45px; animation-delay: 3s; animation-duration: 5s; }
        `}
      </style>

      {/* Burbujas */}
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>

      {/* Spinner de agua */}
      <div
        style={{
          width: "60px",
          height: "60px",
          border: "4px solid rgba(33, 150, 243, 0.2)",
          borderTop: "4px solid #2196f3",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px",
        }}
      />

      <Text
        style={{
          fontSize: "18px",
          fontWeight: "500",
          color: "#1565c0",
          textShadow: "0 2px 4px rgba(255,255,255,0.8)",
        }}
      >
        Cargando datos del sistema...
      </Text>

      <Text
        type="secondary"
        style={{
          fontSize: "14px",
          marginTop: "8px",
          color: "#1976d2",
        }}
      >
        Preparando centro de control
      </Text>
    </div>
  );
};

export default LoadingScreen;
