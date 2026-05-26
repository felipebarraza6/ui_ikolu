import React, { useCallback, useState, useEffect } from "react";
import { Flex, Typography, Button, Input, Tag, theme, Card } from "antd";
import {
  FaRobot,
  FaPaperPlane,
  FaLightbulb,
  FaTrash,
  FaQuestionCircle,
} from "react-icons/fa";
import sh from "../../api/sh/endpoints";

const { Text } = Typography;
const { useToken } = theme;

const ControlCenterChat = ({ points, chatQuota }) => {
  const { token } = useToken();

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
      const res = await sh.chat(text);
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
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)",
          border: "2px solid #1F346150",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: `0 4px 16px rgba(31,52,97,0.35)`,
        }}
      >
        <FaRobot style={{ color: "#fff", fontSize: 22 }} />
      </div>
    );
  }

  const suggestionTags = (() => {
    const base = ["Como va mi consumo?", "Que punto consumio mas hoy?"];
    const pointQs = points.slice(0, 4).map((p) => `Como ha funcionado ${p.title || p.id}?`);
    return [...base, ...pointQs];
  })();

  return (
    <>
      <Card
        size="small"
        style={{
          position: "fixed",
          bottom: 90,
          right: 24,
          width: 380,
          height: 520,
          borderRadius: token.borderRadiusLG,
          zIndex: 1000,
          boxShadow: `0 8px 32px rgba(0,0,0,0.25)`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fade-in-up 0.25s ease",
        }}
        bodyStyle={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Flex align="center" gap={10} style={{ padding: "12px 16px", borderBottom: `1px solid ${token.colorBorderSecondary}`, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${token.colorPrimary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaRobot style={{ color: token.colorPrimary, fontSize: 14 }} />
          </div>
          <div>
            <Text strong style={{ fontSize: 13, display: "block" }}>Experto en Telemetria</Text>
            <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>Smart Hydro - Consultas en tiempo real</Text>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <Button
              type="text"
              size="small"
              icon={<FaTrash style={{ fontSize: 11, color: token.colorTextSecondary }} />}
              onClick={handleClearChat}
              style={{ padding: "0 4px" }}
              title="Limpiar chat"
            />
            <Button
              type="text"
              size="small"
              onClick={handleToggleDrawer}
              style={{ padding: "0 4px", color: token.colorTextSecondary, fontSize: 16 }}
            >
              x
            </Button>
          </div>
        </Flex>

        <div style={{ padding: "8px 12px", background: `${token.colorPrimary}08`, borderBottom: `1px solid ${token.colorBorderSecondary}`, flexShrink: 0 }}>
          <Text style={{ fontSize: 10, color: token.colorTextSecondary, lineHeight: 1.4, display: "block" }}>
            <FaLightbulb style={{ color: token.colorPrimary, fontSize: 10, marginRight: 4 }} /> <span style={{ color: token.colorPrimary, fontWeight: 600 }}>Objetivo:</span> Ayudarte a interpretar tus datos de telemetria, consumo, caudal y cumplimiento normativo en tiempo real.
          </Text>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {chatMessages.map((msg, i) => (
            <Flex
              key={i}
              justify={msg.role === "user" ? "flex-end" : "flex-start"}
              align="flex-start"
              gap={8}
              style={{ animation: "fade-in-up 0.3s ease" }}
            >
              {msg.role === "bot" && (
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${token.colorPrimary}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <FaRobot style={{ color: token.colorPrimary, fontSize: 10 }} />
                </div>
              )}
              <div
                style={{
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.role === "user" ? token.colorPrimary : token.colorBgLayout,
                  color: msg.role === "user" ? "#fff" : token.colorText,
                  fontSize: 13,
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  boxShadow: `0 1px 4px ${token.colorBorder}`,
                }}
              >
                {msg.text}
              </div>
            </Flex>
          ))}
          {chatLoading && (
            <Flex align="center" gap={8} style={{ animation: "fade-in-up 0.3s ease" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${token.colorPrimary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaRobot style={{ color: token.colorPrimary, fontSize: 10 }} />
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 12, background: token.colorBgLayout, border: `1px solid ${token.colorBorderSecondary}` }}>
                <Flex gap={3} align="center" style={{ height: 16 }}>
                  <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: token.colorPrimary, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0s" }} />
                  <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: token.colorPrimary, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }} />
                  <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: token.colorPrimary, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }} />
                </Flex>
              </div>
            </Flex>
          )}
        </div>

        {showSuggestions && (
          <div style={{ padding: "8px 12px", borderTop: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgLayout, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {suggestionTags.map((q) => (
                <Tag
                  key={q}
                  color="primary"
                  style={{ fontSize: 10, margin: 0, cursor: "pointer", lineHeight: "20px" }}
                  onClick={() => handleSuggestionClick(q)}
                >
                  {q}
                </Tag>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: "8px 12px", borderTop: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer, flexShrink: 0 }}>
          <Flex gap={8} align="flex-end">
            <Input.TextArea
              value={chatInput}
              onChange={handleInputChange}
              onPressEnter={handleKeyPress}
              placeholder="Preguntame sobre tus puntos..."
              maxLength={50}
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{
                flex: 1,
                borderRadius: 12,
                border: `1.5px solid ${token.colorBorder}`,
                background: token.colorBgElevated,
                fontSize: 13,
                padding: "8px 12px",
              }}
            />
            <Button
              type="default"
              shape="circle"
              icon={<FaQuestionCircle style={{ fontSize: 14, color: token.colorTextSecondary }} />}
              onClick={handleToggleSuggestions}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<FaPaperPlane style={{ fontSize: 12, color: "#fff" }} />}
              onClick={sendChatMessage}
              loading={chatLoading}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Flex>
          <Flex justify="space-between" align="center" style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: chatMeta.remainingToday === 0 ? token.colorError : token.colorTextSecondary, fontWeight: 500 }}>
              {chatMeta.dailyLimit != null ? `Preguntas usadas: ${chatMeta.usedToday} de ${chatMeta.dailyLimit} disponibles` : ""}
            </Text>
            <Text strong style={{ fontSize: 11, color: chatInput.length >= 50 ? token.colorError : token.colorTextSecondary }}>
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
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)",
          border: "2px solid #1F346150",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: `0 4px 16px rgba(31,52,97,0.35)`,
        }}
      >
        <FaRobot style={{ color: "#fff", fontSize: 22 }} />
      </div>
    </>
  );
};

export default React.memo(ControlCenterChat);
