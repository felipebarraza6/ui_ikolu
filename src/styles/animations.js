import { css } from "@emotion/react";

export const fadeInUp = css`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const shimmer = css`
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

export const typingDots = css`
  @keyframes typingDots {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export const pulseGlow = css`
  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(31, 52, 97, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(31, 52, 97, 0);
    }
  }
`;

export const slideInLeft = css`
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const slideInRight = css`
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const scaleIn = css`
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const skeletonPulse = css`
  @keyframes skeletonPulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

export const animations = {
  fadeInUp,
  shimmer,
  typingDots,
  pulseGlow,
  slideInLeft,
  slideInRight,
  scaleIn,
  skeletonPulse,
};
