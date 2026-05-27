import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { ThunderboltOutlined, UserOutlined } from "@ant-design/icons";

const MessageContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: flex-start;

  &.user {
    flex-direction: row-reverse;
  }
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ variant }) =>
    variant === "user"
      ? "linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)"
      : "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"};
  color: white;
  font-size: 13px;
`;

const Bubble = styled.div`
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
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
  font-size: ${({ theme }) => theme.fontSizes.base};
  white-space: pre-wrap;
`;

const MessageTime = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.greyText};
  margin-top: 3px;
  display: block;
  text-align: ${({ align }) => align || "left"};
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 3px;
  padding: 6px 10px;
`;

const TypingDot = styled.span`
  ${animations.typingDots}
  width: 6px;
  height: 6px;
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
        <Avatar variant="ai"><ThunderboltOutlined style={{ fontSize: 12 }} /></Avatar>
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
      <Avatar variant={variant}>{variant === "user" ? <UserOutlined style={{ fontSize: 13 }} /> : <ThunderboltOutlined style={{ fontSize: 12 }} />}</Avatar>
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
