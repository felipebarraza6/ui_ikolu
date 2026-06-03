import React, { useCallback, useState, useEffect } from "react";
import { Flex, Typography, Button, Input, Tag, Card } from "antd";
import {
  FaRobot,
  FaPaperPlane,
  FaLightbulb,
  FaTrash,
  FaQuestionCircle,
} from "react-icons/fa";
import sh from "../../api/sh/endpoints";

const { Text } = Typography;

const OCEAN_CYAN = "#00B4D8";
const OCEAN_DEEP = "#0A2540";
const OCEAN_BLUE = "#0077B6";
const OCEAN_LIGHT = "#90E0EF";

const ControlCenterChat = ({ points, chatQuota }) => {
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
        className="chat-fab"
      >
        <FaRobot style={{ color: "#fff", fontSize: 24 }} />
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
        className="chat-card"
        bodyStyle={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Flex align="center" gap={10} className="chat-header">
          <div className="chat-avatar-header">
            <FaRobot style={{ color: "#fff", fontSize: 16 }} />
          </div>
          <div>
            <Text strong className="ocean-text-lg ocean-text-primary" style={{ display: "block" }}>Experto en Telemetria</Text>
            <Text className="ocean-text-sm ocean-text-muted">Smart Hydro - Consultas en tiempo real</Text>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <Button
              type="text"
              size="small"
              icon={<FaTrash style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }} />}
              onClick={handleClearChat}
              style={{ padding: "0 4px" }}
              title="Limpiar chat"
            />
            <Button
              type="text"
              size="small"
              onClick={handleToggleDrawer}
              style={{ padding: "0 4px", color: "rgba(255,255,255,0.5)", fontSize: 18 }}
            >
              ×
            </Button>
          </div>
        </Flex>

        <div className="chat-objective">
          <Text className="ocean-text-sm ocean-text-muted" style={{ lineHeight: 1.4, display: "block" }}>
            <FaLightbulb style={{ color: OCEAN_CYAN, fontSize: 11, marginRight: 6 }} /> 
            <span className="ocean-text-cyan-light ocean-font-semibold">Objetivo:</span> 
            Ayudarte a interpretar tus datos de telemetria, consumo, caudal y cumplimiento normativo en tiempo real.
          </Text>
        </div>

        <div className="chat-messages ocean-scrollbar">
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
                  background: `linear-gradient(135deg, ${OCEAN_BLUE} 0%, ${OCEAN_CYAN} 100%)`, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  flexShrink: 0, 
                  marginTop: 2 
                }}>
                  <FaRobot style={{ color: "#fff", fontSize: 12 }} />
                </div>
              )}
              <div
                style={{
                  maxWidth: "85%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" 
                    ? `linear-gradient(135deg, ${OCEAN_BLUE} 0%, ${OCEAN_CYAN} 100%)` 
                    : "rgba(255, 255, 255, 0.05)",
                  color: msg.role === "user" ? "#fff" : "rgba(255,255,255,0.85)",
                  fontSize: 13,
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  border: msg.role === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                  backdropFilter: msg.role === "user" ? "none" : "blur(10px)",
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
                background: `linear-gradient(135deg, ${OCEAN_BLUE} 0%, ${OCEAN_CYAN} 100%)`, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <FaRobot style={{ color: "#fff", fontSize: 12 }} />
              </div>
              <div style={{ 
                padding: "10px 14px", 
                borderRadius: 16, 
                background: "rgba(255, 255, 255, 0.05)", 
                border: `1px solid rgba(255, 255, 255, 0.08)`,
                backdropFilter: "blur(10px)",
              }}>
                <Flex gap={4} align="center" style={{ height: 16 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: OCEAN_CYAN, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0s" }} />
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: OCEAN_CYAN, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }} />
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: OCEAN_CYAN, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }} />
                </Flex>
              </div>
            </Flex>
          )}
        </div>

        {showSuggestions && (
          <div style={{ 
            padding: "12px 16px", 
            borderTop: `1px solid rgba(0, 180, 216, 0.1)`, 
            background: "rgba(0, 180, 216, 0.03)", 
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
                    background: "rgba(0, 180, 216, 0.1)",
                    border: "1px solid rgba(0, 180, 216, 0.2)",
                    color: OCEAN_LIGHT,
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

        <div style={{ 
          padding: "12px 16px", 
          borderTop: `1px solid rgba(0, 180, 216, 0.1)`, 
          background: "rgba(5, 10, 20, 0.9)", 
          flexShrink: 0 
        }}>
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
                border: `1.5px solid rgba(0, 180, 216, 0.2)`,
                background: "rgba(255, 255, 255, 0.05)",
                fontSize: 13,
                padding: "10px 14px",
                color: "#fff",
              }}
            />
            <Button
              type="default"
              shape="circle"
              icon={<FaQuestionCircle style={{ fontSize: 16, color: OCEAN_CYAN }} />}
              onClick={handleToggleSuggestions}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0, 180, 216, 0.1)",
                border: "1px solid rgba(0, 180, 216, 0.2)",
              }}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<FaPaperPlane style={{ fontSize: 14, color: "#fff" }} />}
              onClick={sendChatMessage}
              loading={chatLoading}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${OCEAN_BLUE} 0%, ${OCEAN_CYAN} 100%)`,
                border: "none",
                boxShadow: "0 0 15px rgba(0, 180, 216, 0.3)",
              }}
            />
          </Flex>
          <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: chatMeta.remainingToday === 0 ? "#E76F51" : "rgba(255,255,255,0.4)", fontWeight: 500 }}>
              {chatMeta.dailyLimit != null ? `Preguntas usadas: ${chatMeta.usedToday} de ${chatMeta.dailyLimit} disponibles` : ""}
            </Text>
            <Text strong style={{ fontSize: 11, color: chatInput.length >= 50 ? "#E76F51" : "rgba(255,255,255,0.4)" }}>
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
          background: `linear-gradient(135deg, ${OCEAN_DEEP} 0%, ${OCEAN_BLUE} 50%, ${OCEAN_CYAN} 100%)`,
          backgroundSize: "400% 400%",
          animation: "gradient-flow 8s ease infinite",
          border: "2px solid rgba(0, 180, 216, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: `0 4px 20px rgba(0, 180, 216, 0.4)`,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 30px rgba(0, 180, 216, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 180, 216, 0.4)";
        }}
      >
        <FaRobot style={{ color: "#fff", fontSize: 24 }} />
      </div>
    </>
  );
};

export default React.memo(ControlCenterChat);
