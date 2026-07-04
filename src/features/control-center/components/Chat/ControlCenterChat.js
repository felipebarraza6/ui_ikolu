import React, { useCallback, useState, useEffect } from "react";
import { Flex, Typography, Button, Input, Tag, Card } from "antd";
import {
  FaRobot,
  FaPaperPlane,
  FaLightbulb,
  FaTrash,
  FaQuestionCircle,
} from "react-icons/fa";
import { SmartButton } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import orchestrator from "../../../../api/orchestrator";

const { Text } = Typography;

const ControlCenterChat = ({ points, chatQuota }) => {
  const token = useIkoluToken();
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", text: "Hola! Soy tu asistente de telemetria. En que puedo ayudarte?", time: Date.now() },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chatMeta, setChatMeta] = useState({ dailyLimit: null, usedToday: null, remainingToday: null });

  useEffect(() => {
    if (chatQuota && chatQuota.limit != null) {
      setChatMeta({
        dailyLimit: chatQuota.limit,
        usedToday: chatQuota.used,
        remainingToday: chatQuota.remaining,
      });
    }
  }, [chatQuota]);

  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const text = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text, time: Date.now() }]);
    setChatLoading(true);
    try {
      const res = await orchestrator.chat(text);
      const reply = res?.response || res?.message || res?.answer || "No tengo una respuesta en este momento.";
      setChatMessages((prev) => [...prev, { role: "bot", text: reply, time: Date.now() }]);
      setChatMeta({
        dailyLimit: res?.daily_limit ?? null,
        usedToday: res?.used_today ?? null,
        remainingToday: res?.remaining_today ?? null,
      });
    } catch (err) {
      console.error("[Chat] Error:", err);
      setChatMessages((prev) => [...prev, { role: "bot", text: "Ups, hubo un error. Intenta de nuevo.", time: Date.now() }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading]);

  const handleKeyPress = useCallback((e) => {
    if (!e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }, [sendChatMessage]);

  const handleInputChange = useCallback((e) => {
    setChatInput(e.target.value);
  }, []);

  const handleSuggestionClick = useCallback((q) => {
    setChatInput(q);
  }, []);

  const handleClearChat = useCallback(() => {
    setChatMessages([
      { role: "bot", text: "Hola! Soy tu asistente de telemetria. En que puedo ayudarte?", time: Date.now() },
    ]);
  }, []);

  const handleToggleDrawer = useCallback(() => {
    setChatDrawerOpen((prev) => !prev);
  }, []);

  const handleToggleSuggestions = useCallback(() => {
    setShowSuggestions((prev) => !prev);
  }, []);

  if (!chatDrawerOpen) {
    return (
      <div
        onClick={handleToggleDrawer}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: token.voidTextHeading,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: token.voidShadow,
          transition: "transform 0.3s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <FaRobot style={{ color: token.voidBg, fontSize: 24 }} />
      </div>
    );
  }

  const suggestionTags = (() => {
    const base = ["Como va mi consumo?", "Que punto consumio mas hoy?"];
    const pointQs = points.slice(0, 4).map((p) => `Como ha funcionado ${p.title || p.id}?`);
    return [...base, ...pointQs];
  })();

  const cardStyle = {
    position: "fixed",
    bottom: 90,
    right: 24,
    width: 400,
    height: 550,
    borderRadius: token.voidRadius,
    zIndex: 1000,
    boxShadow: token.voidShadow,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    animation: "fade-in-up 0.25s ease",
    background: token.glassBg,
    border: `1px solid ${token.glassBorder}`,
    backdropFilter: "blur(16px)",
  };

  const headerStyle = {
    padding: "16px 20px",
    borderBottom: `1px solid ${token.voidBorder}`,
    flexShrink: 0,
    background: token.voidSurface,
  };

  const objectiveStyle = {
    padding: "12px 16px",
    background: token.voidSurface,
    borderBottom: `1px solid ${token.voidBorder}`,
    flexShrink: 0,
  };

  const messagesStyle = {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  const inputAreaStyle = {
    padding: "12px 16px",
    borderTop: `1px solid ${token.voidBorder}`,
    background: token.voidSurface,
    flexShrink: 0,
  };

  return (
    <>
      <Card
        size="small"
        style={cardStyle}
        bodyStyle={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Flex align="center" gap={10} style={headerStyle}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: token.voidTextHeading,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <FaRobot style={{ color: token.voidBg, fontSize: 16 }} />
          </div>
          <div>
            <Text strong style={{ display: "block", color: token.voidTextHeading }}>Experto en Telemetria</Text>
            <Text style={{ fontSize: token.fontSizeSM, color: token.voidTextMuted }}>Smart Hydro - Consultas en tiempo real</Text>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <Button
              type="text"
              size="small"
              icon={<FaTrash style={{ fontSize: 12, color: token.voidTextMuted }} />}
              onClick={handleClearChat}
              style={{ padding: "0 4px" }}
              title="Limpiar chat"
            />
            <Button
              type="text"
              size="small"
              onClick={handleToggleDrawer}
              style={{ padding: "0 4px", color: token.voidTextMuted, fontSize: 18 }}
            >
              ×
            </Button>
          </div>
        </Flex>

        <div style={objectiveStyle}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.voidTextMuted, lineHeight: 1.4, display: "block" }}>
            <FaLightbulb style={{ color: token.colorWarning, fontSize: 11, marginRight: 6 }} /> 
            <strong style={{ color: token.voidTextHeading }}>Objetivo:</strong> 
            Ayudarte a interpretar tus datos de telemetria, consumo, caudal y cumplimiento normativo en tiempo real.
          </Text>
        </div>

        <div style={messagesStyle} className="ocean-scrollbar">
          {chatMessages.map((msg, i) => (
            <Flex
              key={i}
              justify={msg.role === "user" ? "flex-end" : "flex-start"}
              align="flex-start"
              gap={8}
              style={{ animation: "fade-in-up 0.3s ease" }}
            >
              {msg.role === "bot" && (
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: "50%", 
                  background: token.voidTextHeading, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  flexShrink: 0, 
                  marginTop: 2 
                }}>
                  <FaRobot style={{ color: token.voidBg, fontSize: 12 }} />
                </div>
              )}
              <div
                style={{
                  maxWidth: "85%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" 
                    ? token.voidTextHeading 
                    : token.voidSurface,
                  color: msg.role === "user" ? token.voidBg : token.voidText,
                  fontSize: 13,
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  border: msg.role === "user" ? "none" : `1px solid ${token.voidBorder}`,
                }}
              >
                {msg.text}
              </div>
            </Flex>
          ))}
          {chatLoading && (
            <Flex align="center" gap={8} style={{ animation: "fade-in-up 0.3s ease" }}>
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: "50%", 
                background: token.voidTextHeading, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <FaRobot style={{ color: token.voidBg, fontSize: 12 }} />
              </div>
              <div style={{ 
                padding: "10px 14px", 
                borderRadius: 16, 
                background: token.voidSurface, 
                border: `1px solid ${token.voidBorder}`,
              }}>
                <Flex gap={4} align="center" style={{ height: 16 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: token.voidTextHeading, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0s" }} />
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: token.voidTextHeading, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }} />
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: token.voidTextHeading, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }} />
                </Flex>
              </div>
            </Flex>
          )}
        </div>

        {showSuggestions && (
          <div style={{ 
            padding: "12px 16px", 
            borderTop: `1px solid ${token.voidBorder}`, 
            background: token.voidSurface, 
            flexShrink: 0 
          }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {suggestionTags.map((q) => (
                <Tag
                  key={q}
                  style={{ 
                    fontSize: 11, 
                    margin: 0, 
                    cursor: "pointer", 
                    lineHeight: "22px",
                    background: token.voidSurfaceHover,
                    border: `1px solid ${token.voidBorderStrong}`,
                    color: token.voidTextHeading,
                    borderRadius: 12,
                    padding: "2px 12px",
                  }}
                  onClick={() => handleSuggestionClick(q)}
                >
                  {q}
                </Tag>
              ))}
            </div>
          </div>
        )}

        <div style={inputAreaStyle}>
          <Flex gap={10} align="flex-end">
            <Input.TextArea
              value={chatInput}
              onChange={handleInputChange}
              onPressEnter={handleKeyPress}
              placeholder="Preguntame sobre tus puntos..."
              maxLength={50}
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{
                flex: 1,
                borderRadius: 16,
                border: `1.5px solid ${token.voidBorder}`,
                background: token.voidBg,
                fontSize: 13,
                padding: "10px 14px",
                color: token.voidTextHeading,
              }}
            />
            <Button
              type="default"
              shape="circle"
              icon={<FaQuestionCircle style={{ fontSize: 16, color: token.voidTextHeading }} />}
              onClick={handleToggleSuggestions}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: token.voidSurfaceHover,
                border: `1px solid ${token.voidBorderStrong}`,
              }}
            />
            <SmartButton
              variant="void"
              size="sm"
              shape="circle"
              icon={<FaPaperPlane style={{ fontSize: 14, color: token.voidBg }} />}
              onClick={sendChatMessage}
              loading={chatLoading}
              style={{
                width: 36,
                height: 36,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Flex>
          <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: chatMeta.remainingToday === 0 ? token.colorError : token.voidTextMuted, fontWeight: 500 }}>
              {chatMeta.dailyLimit != null ? `Preguntas usadas: ${chatMeta.usedToday} de ${chatMeta.dailyLimit} disponibles` : ""}
            </Text>
            <Text strong style={{ fontSize: 11, color: chatInput.length >= 50 ? token.colorError : token.voidTextMuted }}>
              {chatInput.length}/50
            </Text>
          </Flex>
        </div>
      </Card>

      <div
        onClick={handleToggleDrawer}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: token.voidTextHeading,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: token.voidShadow,
          transition: "transform 0.3s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <FaRobot style={{ color: token.voidBg, fontSize: 24 }} />
      </div>
    </>
  );
};

export default React.memo(ControlCenterChat);