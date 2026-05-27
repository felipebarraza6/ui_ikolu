import styled from "@emotion/styled";
import { animations } from "../../styles/animations";

const CardBase = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.2s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadiusLG};
  overflow: hidden;
`;

export const AppCard = ({ variant = "default", children, className, ...props }) => {
  const variants = {
    default: {},
    panel: {
      headerBackground: "linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)",
      headerColor: "#ffffff",
    },
    kpi: {
      padding: "16px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
    chat: {
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    },
    flat: {
      border: "none",
      boxShadow: "none",
    },
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <CardBase className={className} style={currentVariant} {...props}>
      {children}
    </CardBase>
  );
};

export const AppCardHeader = styled.div`
  padding: ${({ padding }) => padding || "12px 16px"};
  background: ${({ background, theme }) =>
    background || `linear-gradient(135deg, ${theme.colors.corporateBlue} 0%, ${theme.colors.corporateBlueLight} 100%)`};
  color: ${({ color, theme }) => color || theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
`;

export const AppCardBody = styled.div`
  padding: ${({ padding }) => padding || "16px"};
  background: ${({ background, theme }) => background || theme.token.colorBgContainer};
`;

export const AppCardFooter = styled.div`
  padding: 12px 16px;
  background: ${({ theme }) => theme.token.colorBgLayout};
  border-top: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;
