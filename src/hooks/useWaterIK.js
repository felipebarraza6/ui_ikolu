import { useState, useEffect, useCallback, useRef } from "react";
import sh from "../api/sh/endpoints";
import waterIK from "../api/sh/water_ik_endpoints";

const STORAGE_KEY_CONVERSATIONS = "water-ik-conversations";
const STORAGE_KEY_ACTIVE = "water-ik-active-conversation";
const STORAGE_KEY_LAST_VALIDATION = "water-ik-last-validation";
const STORAGE_KEY_TASKS = "water-ik-tasks";
const STORAGE_KEY_DOCUMENTS = "water-ik-documents";

const generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const useWaterIK = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarMode, setSidebarMode] = useState("chat");
  const [chatQuota, setChatQuota] = useState({ limit: null, used: null, remaining: null });
  const [validation, setValidation] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [flows, setFlows] = useState([]);
  const [activeFlowRun, setActiveFlowRun] = useState(null);
  const inputRef = useRef(null);

  // Cargar conversaciones desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
      }
    } catch (e) {
      console.error("[WaterIK] Error loading conversations:", e);
    }

    try {
      const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (activeId) {
        setActiveConversationId(activeId);
      }
    } catch (e) {
      console.error("[WaterIK] Error loading active conversation:", e);
    }

    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (e) {
      console.error("[WaterIK] Error loading tasks:", e);
    }

    try {
      const storedDocs = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } catch (e) {
      console.error("[WaterIK] Error loading documents:", e);
    }
  }, []);

  // Guardar conversaciones en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error("[WaterIK] Error saving conversations:", e);
    }
  }, [conversations]);

  // Guardar active conversation
  useEffect(() => {
    try {
      if (activeConversationId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, activeConversationId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    } catch (e) {
      console.error("[WaterIK] Error saving active conversation:", e);
    }
  }, [activeConversationId]);

  // Cargar mensajes de la conversación activa
  useEffect(() => {
    if (activeConversationId) {
      const conv = conversations.find((c) => c.id === activeConversationId);
      if (conv) {
        setMessages(conv.messages || []);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversationId, conversations]);

  // Validación automática diaria
  useEffect(() => {
    const checkDailyValidation = () => {
      try {
        const lastValidation = localStorage.getItem(STORAGE_KEY_LAST_VALIDATION);
        if (lastValidation) {
          const parsed = JSON.parse(lastValidation);
          const today = new Date().toDateString();
          if (parsed.date === today) {
            setValidation(parsed.data);
            return;
          }
        }
      } catch (e) {
        console.error("[WaterIK] Error checking validation:", e);
      }

      // Mock validation para demo
      const mockValidation = {
        date: new Date().toDateString(),
        score: 0.82,
        modules: {
          telemetry: { status: "ok", score: 0.95, lastCheck: new Date().toISOString() },
          dga: { status: "warning", score: 0.75, issues: ["Falta registro de caudal en punto #12"] },
          compliance: { status: "ok", score: 0.88 },
        },
        recommendations: [
          "Revisa los registros DGA del punto #12",
          "Considera actualizar la frecuencia de telemetría",
        ],
      };

      localStorage.setItem(STORAGE_KEY_LAST_VALIDATION, JSON.stringify({ date: mockValidation.date, data: mockValidation }));
      setValidation(mockValidation);
    };

    checkDailyValidation();
  }, []);

  // Crear nueva conversación
  const createConversation = useCallback((title = "Nueva conversación") => {
    const newConv = {
      id: generateId(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  }, []);

  // Eliminar conversación
  const deleteConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  // Enviar mensaje al chat
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation(text.slice(0, 50) + (text.length > 50 ? "..." : ""));
    }

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Usar endpoint existente como demo
      const res = await sh.chat(text.trim());
      const reply = res?.response || res?.message || res?.answer || "No tengo una respuesta en este momento.";

      const aiMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "bot",
        text: reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Actualizar cuota
      setChatQuota({
        dailyLimit: res?.daily_limit ?? null,
        usedToday: res?.used_today ?? null,
        remainingToday: res?.remaining_today ?? null,
      });

      // Actualizar conversación
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, userMessage, aiMessage],
                updatedAt: new Date().toISOString(),
                title: c.messages.length === 0 ? text.slice(0, 50) + (text.length > 50 ? "..." : "") : c.title,
              }
            : c
        )
      );
    } catch (err) {
      console.error("[WaterIK] Chat error:", err);
      setError("Error al enviar el mensaje. Intenta de nuevo.");
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          role: "bot",
          text: "Ups, hubo un error. Intenta de nuevo.",
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, isLoading, createConversation]);

  // Generar documento (mock para demo)
  const generateDocument = useCallback(async (type, title, dataSources = [], templateId = null) => {
    const newDoc = {
      id: `doc_${Date.now()}`,
      type,
      title,
      status: "generating",
      createdAt: new Date().toISOString(),
      dataSources,
      templateId,
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Simular generación
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === newDoc.id ? { ...d, status: "ready", url: "#" } : d
        )
      );
    }, 3000);

    return newDoc;
  }, []);

  // Crear tarea
  const createTask = useCallback((title, description = "", priority = "medium") => {
    const newTask = {
      id: `task_${Date.now()}`,
      title,
      description,
      priority,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  // Actualizar tarea
  const updateTask = useCallback((id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  // Eliminar tarea
  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Ejecutar flujo (mock para demo)
  const runFlow = useCallback(async (flowId, parameters = {}) => {
    const mockRun = {
      flowId,
      runId: `run_${Date.now()}`,
      status: "running",
      currentStep: 0,
      totalSteps: 4,
      steps: [
        { name: "Recopilando datos", status: "running" },
        { name: "Analizando información", status: "pending" },
        { name: "Generando insights", status: "pending" },
        { name: "Completado", status: "pending" },
      ],
      results: null,
    };

    setActiveFlowRun(mockRun);

    // Simular progreso
    for (let i = 0; i < mockRun.totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setActiveFlowRun((prev) => ({
        ...prev,
        currentStep: i + 1,
        steps: prev.steps.map((s, idx) => ({
          ...s,
          status: idx < i + 1 ? "completed" : idx === i + 1 ? "running" : "pending",
        })),
      }));
    }

    setActiveFlowRun((prev) => ({
      ...prev,
      status: "completed",
      results: {
        summary: "Análisis completado exitosamente.",
        findings: ["Hallazgo 1", "Hallazgo 2"],
        recommendations: ["Recomendación 1", "Recomendación 2"],
      },
    }));

    return mockRun;
  }, []);

  // Sugerencias contextuales
  const getSuggestions = useCallback((hasPoint = false) => {
    const general = [
      "¿Qué es el caudal ecológico?",
      "Normativa DGA para pozos",
      "¿Cómo funciona Ikolu?",
      "¿Qué es la extracción sustentable?",
    ];

    const withPoint = [
      "¿Cómo va mi consumo hoy?",
      "Comparar con caudal ecológico",
      "Generar informe DGA mensual",
      "Validar mis datos de telemetría",
    ];

    return hasPoint ? [...withPoint, ...general.slice(0, 2)] : general;
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    error,
    sidebarMode,
    setSidebarMode,
    chatQuota,
    validation,
    tasks,
    documents,
    flows,
    activeFlowRun,
    inputRef,
    createConversation,
    deleteConversation,
    setActiveConversationId,
    sendMessage,
    generateDocument,
    createTask,
    updateTask,
    deleteTask,
    runFlow,
    getSuggestions,
  };
};

export default useWaterIK;
