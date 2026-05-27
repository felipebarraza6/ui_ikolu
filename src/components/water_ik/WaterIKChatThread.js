import React, { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { ThunderboltOutlined } from "@ant-design/icons";
import WaterIKMessageBubble from "./WaterIKMessageBubble";
import {
  SkeletonChat,
  SkeletonChatBubble,
  SkeletonAvatar,
  SkeletonBubbleContent,
} from "../common/skeletons";

const ThreadContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

const WelcomeContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
`;

const WelcomeIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 36px;
  color: white;
`;

const WelcomeTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  color: ${({ theme }) => theme.colors.corporateBlue};
  margin: 0 0 12px;
`;

const WelcomeText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.greyText};
  line-height: 1.6;
  margin: 0 0 24px;
  max-width: 500px;
`;

const WaterIKChatThread = ({ messages, isLoading, suggestions, onSuggestionClick }) => {
  const threadRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <ThreadContainer>
        <WelcomeContainer>
          <WelcomeIcon><ThunderboltOutlined style={{ fontSize: 36 }} /></WelcomeIcon>
          <WelcomeTitle>WaterIK</WelcomeTitle>
          <WelcomeText>
            Tu asistente inteligente de gestión hídrica. Pregúntame sobre normativa DGA,
            consumo de agua, telemetría, o genera informes y análisis.
          </WelcomeText>
          {suggestions && suggestions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {suggestions.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick(s)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: "1px solid #f0f0f0",
                    background: "white",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#1F3461",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#1F3461";
                    e.target.style.background = "#f0f5ff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#f0f0f0";
                    e.target.style.background = "white";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </WelcomeContainer>
      </ThreadContainer>
    );
  }

  return (
    <ThreadContainer ref={threadRef}>
      {messages.map((msg) => (
        <WaterIKMessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && <WaterIKMessageBubble message={{ role: "bot" }} isTyping />}
    </ThreadContainer>
  );
};

export default WaterIKChatThread;
