import { POST, GET, DELETE, PATCH, Axios } from "./config";

const BASE_URL = "ik/water-ik/";

const waterIK = {
  chat: async (message, conversationId = null) => {
    const body = { message, conversation_id: conversationId };
    const rq = await POST(`${BASE_URL}chat/`, body);
    return rq.data;
  },

  getConversations: async () => {
    const rq = await GET(`${BASE_URL}conversations/`);
    return rq.data;
  },

  createConversation: async (title = "Nueva conversación") => {
    const rq = await POST(`${BASE_URL}conversations/`, { title });
    return rq.data;
  },

  deleteConversation: async (id) => {
    const rq = await DELETE(`${BASE_URL}conversations/${id}/`);
    return rq.data;
  },

  getDocuments: async () => {
    const rq = await GET(`${BASE_URL}documents/`);
    return rq.data;
  },

  generateDocument: async (type, title, dataSources = [], templateId = null) => {
    const rq = await POST(`${BASE_URL}documents/generate/`, {
      type,
      title,
      data_sources: dataSources,
      template_id: templateId,
    });
    return rq.data;
  },

  downloadDocument: async (id) => {
    const rq = await Axios.get(`${BASE_URL}documents/${id}/download/`, {
      responseType: "blob",
    });
    return rq.data;
  },

  getFlows: async () => {
    const rq = await GET(`${BASE_URL}flows/`);
    return rq.data;
  },

  runFlow: async (flowId, pointId = null, parameters = {}) => {
    const rq = await POST(`${BASE_URL}flows/${flowId}/run/`, {
      point_id: pointId,
      parameters,
    });
    return rq.data;
  },

  getFlowRun: async (runId) => {
    const rq = await GET(`${BASE_URL}flows/runs/${runId}/`);
    return rq.data;
  },

  validate: async (pointId = null, modules = ["telemetry", "dga", "compliance"]) => {
    const rq = await POST(`${BASE_URL}validate/`, {
      point_id: pointId,
      modules,
    });
    return rq.data;
  },

  getTasks: async () => {
    const rq = await GET(`${BASE_URL}tasks/`);
    return rq.data;
  },

  createTask: async (title, description = "", sourceMessageId = null, dueDate = null, priority = "medium") => {
    const rq = await POST(`${BASE_URL}tasks/`, {
      title,
      description,
      source_message_id: sourceMessageId,
      due_date: dueDate,
      priority,
    });
    return rq.data;
  },

  updateTask: async (id, updates = {}) => {
    const rq = await PATCH(`${BASE_URL}tasks/${id}/`, updates);
    return rq.data;
  },

  deleteTask: async (id) => {
    const rq = await DELETE(`${BASE_URL}tasks/${id}/`);
    return rq.data;
  },

  getPublicData: async (type, params = {}) => {
    const rq = await GET(`${BASE_URL}public-data/${type}/`);
    return rq.data;
  },

  compare: async (pointId, metric, period, compareWith = []) => {
    const rq = await POST(`${BASE_URL}compare/`, {
      point_id: pointId,
      metric,
      period,
      compare_with: compareWith,
    });
    return rq.data;
  },
};

export default waterIK;
