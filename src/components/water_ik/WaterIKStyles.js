import styled from "@emotion/styled";
import { animations } from "../../styles/animations";

export const WaterIKPageContainer = styled.div`
  display: flex;
  height: calc(100vh - 52px);
  background: ${({ theme }) => theme.token.colorBgLayout};
  overflow: hidden;
`;

export const WaterIKSidebarContainer = styled.div`
  width: 280px;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border-right: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const WaterIKMainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const WaterIKHeader = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  padding: 16px 24px;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border-bottom: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const WaterIKTitle = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.corporateBlue};
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const WaterIKBetaBadge = styled.span`
  background: ${({ theme }) => theme.colors.accentOrange};
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const WaterIKChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

export const WaterIKWelcomeMessage = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.4s ease-out;
  text-align: center;
  padding: 40px 20px;
  max-width: 600px;
  margin: auto;
`;

export const WaterIKWelcomeIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 36px;
  color: white;
`;

export const WaterIKWelcomeTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  color: ${({ theme }) => theme.colors.corporateBlue};
  margin-bottom: 12px;
`;

export const WaterIKWelcomeText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.greyText};
  line-height: 1.6;
  margin-bottom: 24px;
`;

export const WaterIKQuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 24px;
`;

export const WaterIKQuickAction = styled.button`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  animation-delay: ${({ delay }) => delay || "0s"};
  animation-fill-mode: both;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadiusLG};
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.corporateBlue};
    box-shadow: 0 4px 12px rgba(31, 52, 97, 0.1);
    transform: translateY(-2px);
  }

  .icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .title {
    font-size: ${({ theme }) => theme.fontSizes.large};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.corporateBlue};
    margin-bottom: 4px;
  }

  .description {
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.greyText};
  }
`;

export const WaterIKInputContainer = styled.div`
  padding: 16px 24px;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border-top: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
`;

export const WaterIKQuotaBar = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.greyText};
  text-align: center;
  padding: 8px 0;
`;
