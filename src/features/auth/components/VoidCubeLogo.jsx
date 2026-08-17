import React from "react";
import ikoluImg from "../../../assets/images/ikolu.png";

/**
 * Logo oficial Ikolu - reemplaza el cubo 3D por el isotipo hídrico oficial de la plataforma.
 */
const IkoluLogo = ({
  size = 50,
  onClick,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.25s ease, filter 0.25s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "scale(1.05)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      <img
        src={ikoluImg}
        alt="Ikolu Logo"
        style={{
          width: size,
          height: "auto",
          maxHeight: size,
          objectFit: "contain",
          filter: "drop-shadow(0 4px 12px rgba(58,137,210,0.3))",
        }}
      />
    </div>
  );
};

export default IkoluLogo;
