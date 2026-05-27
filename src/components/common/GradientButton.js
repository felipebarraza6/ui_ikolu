import styled from "@emotion/styled";
import { animations } from "../../styles/animations";

export const GradientButton = styled.button`
  ${animations.pulseGlow}
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.radii.large};
  padding: 10px 24px;
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(31, 52, 97, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &.pulse {
    animation: pulseGlow 2s infinite;
  }
`;

export const GradientButtonSecondary = styled(GradientButton)`
  background: ${({ theme }) => theme.gradients.secondary};
`;

export const GradientButtonOutline = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.corporateBlue};
  border: 2px solid ${({ theme }) => theme.colors.corporateBlue};
  border-radius: ${({ theme }) => theme.radii.large};
  padding: 8px 22px;
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.corporateBlue};
    color: ${({ theme }) => theme.colors.white};
  }
`;
