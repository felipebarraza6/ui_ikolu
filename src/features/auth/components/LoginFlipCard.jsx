import React from "react";

const flipStyles = `
.flip-container {
  perspective: 1200px;
  width: 100%;
  max-width: 380px;
}
.flip-inner {
  position: relative;
  width: 100%;
  min-height: 520px;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.flip-container.flipped .flip-inner {
  transform: rotateY(180deg);
}
.flip-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flip-face-back {
  transform: rotateY(180deg);
}
@media (max-width: 800px) {
  .flip-inner { min-height: 540px; }
}
`;

const LoginFlipCard = ({ flipped, front, back }) => (
  <>
    <style>{flipStyles}</style>
    <div className={`flip-container ${flipped ? "flipped" : ""}`}>
      <div className="flip-inner">
        <div className="flip-face flip-face-front">{front}</div>
        <div className="flip-face flip-face-back">{back}</div>
      </div>
    </div>
  </>
);

export default LoginFlipCard;
