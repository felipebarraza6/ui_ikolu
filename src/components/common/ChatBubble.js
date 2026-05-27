import styled from "@emotion/styled";
import { animations } from "../../styles/animations";

const BubbleBase = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 14px;
  line-height: 1.5;
  word-wrap: break-word;
`;

export const UserBubble = styled(BubbleBase)`
  background: ${({ theme }) => theme.colors.corporateBlue};
  color: ${({ theme }) => theme.colors.white};
  border-bottom-right-radius: 4px;
  margin-left: auto;
`;

export const AiBubble = styled(BubbleBase)`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.token.colorText};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-bottom-left-radius: 4px;
`;

export const ToolBubble = styled(BubbleBase)`
  background: ${({ theme }) => theme.colors.blueTint};
  color: ${({ theme }) => theme.colors.corporateBlue};
  border: 1px solid ${({ theme }) => theme.colors.blueBg};
  border-radius: 12px;
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

export const BubbleWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 16px;

  &.user {
    flex-direction: row-reverse;
  }
`;

export const BubbleAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ variant }) =>
    variant === "user"
      ? "linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)"
      : "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"};
  color: white;
  font-size: 14px;
`;

export const BubbleTime = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.greyText};
  margin-top: 4px;
  display: block;
  text-align: ${({ align }) => align || "left"};
`;
