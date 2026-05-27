import React, { useState } from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";

const InputContainer = styled.div`
  padding: 10px 20px;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border-top: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
`;

const SuggestionsContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
  justify-content: center;
`;

const SuggestionChip = styled.button`
  padding: 4px 10px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  background: ${({ theme }) => theme.token.colorBgContainer};
  color: ${({ theme }) => theme.colors.corporateBlue};
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.corporateBlue};
    background: ${({ theme }) => theme.colors.blueBg};
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  max-width: 720px;
  margin: 0 auto;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: 20px;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  min-height: 40px;
  max-height: 100px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.corporateBlue};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.greyText};
  }
`;

const SendButton = styled.button`
  ${animations.pulseGlow}
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.greyTextDisabled : theme.gradients.primary};
  color: white;
  border: none;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    transform: ${({ disabled }) => (disabled ? "none" : "scale(1.05)")};
  }
`;

const QuotaText = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.greyText};
  text-align: center;
  margin-top: 6px;
`;

const WaterIKInputBar = ({
  onSend,
  suggestions = [],
  onSuggestionClick,
  isLoading,
  chatQuota,
}) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <InputContainer>
      {suggestions.length > 0 && (
        <SuggestionsContainer>
          {suggestions.slice(0, 4).map((s, i) => (
            <SuggestionChip key={i} onClick={() => onSuggestionClick(s)}>
              {s}
            </SuggestionChip>
          ))}
        </SuggestionsContainer>
      )}
      <InputWrapper>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregúntame sobre gestión hídrica, normativa DGA, o genera informes..."
          rows={1}
          disabled={isLoading}
        />
        <SendButton onClick={handleSend} disabled={!input.trim() || isLoading}>
          ➤
        </SendButton>
      </InputWrapper>
      {chatQuota?.dailyLimit && (
        <QuotaText>
          {chatQuota.usedToday || 0}/{chatQuota.dailyLimit} preguntas hoy
        </QuotaText>
      )}
    </InputContainer>
  );
};

export default WaterIKInputBar;
