import styled from "@emotion/styled";
import { animations } from "../../styles/animations";

export const WaterIKPageContainer = styled.div`
  display: flex;
  height: calc(100vh - 52px);
  background: ${({ theme }) => theme.token.colorBgLayout};
  overflow: hidden;
`;

export const WaterIKMainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

export const WaterIKHeader = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  padding: 8px 16px;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border-bottom: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

export const WaterIKTitle = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.corporateBlue};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const WaterIKBetaBadge = styled.span`
  font-size: 8px;
  font-weight: 700;
  color: #FF6B35;
  background: rgba(255,107,53,0.1);
  padding: 1px 5px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

export const WaterIKChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const WaterIKWelcomeMessage = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.4s ease-out;
  text-align: center;
  padding: 24px 16px;
  max-width: 520px;
  margin: auto;
`;

export const WaterIKWelcomeIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
`;

export const WaterIKWelcomeTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.corporateBlue};
  margin: 0 0 6px;
  font-weight: 600;
`;

export const WaterIKWelcomeText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.greyText};
  line-height: 1.5;
  margin: 0 0 14px;
`;

export const WaterIKQuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
  margin-top: 16px;
`;

export const WaterIKQuickAction = styled.button`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  animation-delay: ${({ delay }) => delay || "0s"};
  animation-fill-mode: both;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadius};
  padding: 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.corporateBlue};
    box-shadow: 0 2px 8px rgba(31, 52, 97, 0.08);
    transform: translateY(-1px);
  }

  .icon {
    font-size: 18px;
    margin-bottom: 4px;
  }

  .title {
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.corporateBlue};
    margin-bottom: 2px;
  }

  .description {
    font-size: ${({ theme }) => theme.fontSizes.small};
    color: ${({ theme }) => theme.colors.greyText};
  }
`;

export const WaterIKInputContainer = styled.div`
  padding: 8px 16px;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border-top: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  flex-shrink: 0;
`;

export const WaterIKQuotaBar = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.greyText};
  text-align: center;
  padding: 4px 0 0;
`;

export const WaterIKContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;
