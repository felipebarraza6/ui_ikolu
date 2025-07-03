import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: {
    translation: {
      waterModule: {
        title:
          "¿De qué manera se monitorea y se administra el consumo de agua de su empresa?",
        description:
          "Seleccione una sola respuesta que indique si la empresa monitorea el uso del agua y si establece metas (respuestas 1 a 4). Si la empresa establece metas, la respuesta 5 también puede ser relevante.",
        options: [
          "Actualmente la empresa no monitorea ni registra el consumo de agua",
          "La empresa monitorea y registra el consumo de agua, pero no tiene metas de reducción establecidas",
          "La empresa monitorea y registra el consumo de agua y ha establecido metas de reducción específicas de acuerdo con su desempeño anterior (p. ej., una reducción del consumo de agua del 5% en comparación con el año tomado como referencia)",
          "La empresa monitorea y registra el consumo de agua y ha establecido metas específicas con bases científicas que son necesarias para alcanzar un uso sostenible de la cuenca hidrográfica local",
          "La empresa ha alcanzado las metas de reducción específicas durante el período evaluado",
        ],
        submit: "Enviar",
        totalScore: "Puntaje total",
        newRecord: "Nuevo",
        name: "Punto de captación",
        year: "Año",
        create: "Crear",
        cancel: "Cancelar",
        monthly: "Consumo mensual (m³)",
        total: "Consumo total de agua",
      },
    },
  },
  en: {
    translation: {
      waterModule: {
        title: "How does your company monitor and manage water consumption?",
        description:
          "Select a single answer indicating if the company monitors water use and if it sets targets (answers 1 to 4). If the company sets targets, answer 5 may also be relevant.",
        options: [
          "The company does not monitor or record water consumption",
          "The company monitors and records water consumption, but has no reduction targets set",
          "The company monitors and records water consumption and has set specific reduction targets based on past performance (e.g., a 5% reduction compared to the reference year)",
          "The company monitors and records water consumption and has set science-based targets necessary to achieve sustainable use of the local watershed",
          "The company has achieved the specific reduction targets during the evaluated period",
        ],
        submit: "Submit",
        totalScore: "Total Score",
        newRecord: "New",
        name: "Capture point",
        year: "Year",
        create: "Create",
        cancel: "Cancel",
        monthly: "Monthly consumption (m³)",
        total: "Total water consumption",
      },
    },
  },
  zh: {
    translation: {
      waterModule: {
        title: "您的公司如何监测和管理用水？",
        description:
          "请选择一个答案，说明公司是否监测用水并设定目标（答案1到4）。如果公司设定目标，第5个答案也可能相关。",
        options: [
          "公司目前不监测或记录用水量",
          "公司监测并记录用水量，但没有设定减少目标",
          "公司监测并记录用水量，并根据以往表现设定了具体的减少目标（例如，与基准年相比减少5%）",
          "公司监测并记录用水量，并设定了实现当地流域可持续利用所需的科学目标",
          "公司在评估期间已实现具体的减少目标",
        ],
        submit: "提交",
        totalScore: "总分",
        newRecord: "新建",
        name: "取水点",
        year: "年份",
        create: "创建",
        cancel: "取消",
        monthly: "每月用水量 (m³)",
        total: "总用水量",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
