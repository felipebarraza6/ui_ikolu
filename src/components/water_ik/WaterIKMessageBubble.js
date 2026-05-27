import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { ThunderboltOutlined, UserOutlined } from "@ant-design/icons";

const MessageContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-start;

  &.user {
    flex-direction: row-reverse;
  }
`;

const Avatar = styled.div`
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

const Bubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  background: ${({ variant, theme }) => {
    if (variant === "user") return theme.colors.corporateBlue;
    if (variant === "tool") return theme.colors.blueTint;
    return theme.token.colorBgContainer;
  }};
  color: ${({ variant, theme }) => {
    if (variant === "user") return theme.colors.white;
    if (variant === "tool") return theme.colors.corporateBlue;
    return theme.token.colorText;
  }};
  border: ${({ variant, theme }) =>
    variant === "ai" ? `1px solid ${theme.token.colorBorderSecondary}` : "none"};
  border-bottom-${({ variant }) => (variant === "user" ? "right" : "left")}-radius: 4px;
`;

const MessageText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.large};
  white-space: pre-wrap;
`;

const MessageTime = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.greyText};
  margin-top: 4px;
  display: block;
  text-align: ${({ align }) => align || "left"};
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 12px;
`;

const TypingDot = styled.span`
  ${animations.typingDots}
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.corporateBlue};
  animation: typingDots 1.4s infinite ease-in-out both;
  animation-delay: ${({ delay }) => delay};
`;

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
};

const WaterIKMessageBubble = ({ message, isTyping = false }) => {
  const variant = message.role === "user" ? "user" : "ai";

  if (isTyping) {
    return (
      <MessageContainer className="ai">
        <Avatar variant="ai"><ThunderboltOutlined /></Avatar>
        <Bubble variant="ai">
          <TypingIndicator>
            <TypingDot delay="0s" />
            <TypingDot delay="0.2s" />
            <TypingDot delay="0.4s" />
          </TypingIndicator>
        </Bubble>
      </MessageContainer>
    );
  }

  return (
    <MessageContainer className={variant}>
      <Avatar variant={variant}>{variant === "user" ? <UserOutlined /> : <ThunderboltOutlined />}</Avatar>
      <div>
        <Bubble variant={variant}>
          <MessageText>{message.text}</MessageText>
        </Bubble>
        <MessageTime align={variant === "user" ? "right" : "left"}>
          {formatTime(message.timestamp)}
        </MessageTime>
      </div>
    </MessageContainer>
  );
};

export default WaterIKMessageBubble;
