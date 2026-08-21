import React from "react";
import { Flex, Typography, Tag, Progress, Tooltip } from "antd";
import {
  EnvironmentOutlined,
  UserOutlined,
  ProjectOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { SmartCard } from "../../../../shared/ui";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import {
  PROJECT_PHASES,
  getProjectPhase,
  getProjectPhaseIndex,
  getProjectProgress,
} from "../../constants/projectPhases";
import { getTicketPriorityConfig } from "../../constants/tickets";
import { DEFAULT_VOCAB } from "../../constants/entityVocab";

const { Text } = Typography;

const MAIN_PHASES = PROJECT_PHASES.filter((p) => p.key !== "cancelado");

const ProjectCard = ({ project, onOpen, vocab = DEFAULT_VOCAB }) => {
  const token = useIkoluToken();
  const phase = getProjectPhase(project?.status) || PROJECT_PHASES[0];
  const currentIndex = getProjectPhaseIndex(project?.status);
  const isCancelled = phase.key === "cancelado";
  const progress = isCancelled ? 0 : getProjectProgress(project?.status);
  const priorityConfig = getTicketPriorityConfig(project?.priority);
  const cancelPhase = PROJECT_PHASES.find((p) => p.key === "cancelado");

  const PhaseIcon = phase.icon;

  const createdLabel = (() => {
    const raw = project?.created ?? project?.created_at;
    if (!raw) return "-";
    try {
      const date = parseISO(raw);
      return isValid(date) ? format(date, "dd MMM", { locale: es }) : "-";
    } catch {
      return "-";
    }
  })();

  const pointLabel =
    project?.point_title ||
    (project?.point_catchment ? `Punto ${project.point_catchment}` : "Sin punto");
  const assignedLabel = project?.assigned_to_name || "Sin asignar";

  const priorityColor = priorityConfig.borderColor || token.voidTextHeading;

  return (
    <SmartCard
      variant="void"
      hover
      onClick={() => onOpen?.(project)}
      style={{
        width: "100%",
        minHeight: 220,
        cursor: "pointer",
        background: token.glassBg,
        border: `1px solid ${token.glassBorder}`,
        borderRadius: token.voidRadius,
        opacity: isCancelled ? 0.6 : 1,
        overflow: "hidden",
      }}
      bodyStyle={{ padding: "12px", height: "100%" }}
    >
      <Flex vertical style={{ height: "100%" }} gap={8}>
        <Flex gap={10} align="center">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              flexShrink: 0,
              background: phase.color,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PhaseIcon style={{ fontSize: 16 }} />
          </div>
          <Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Text
              strong
              style={{
                fontSize: 13,
                lineHeight: 1.25,
                color: token.voidTextHeading,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {project?.title || `${vocab.entitySingularCap} #${project?.id}`}
            </Text>
            <Flex wrap gap={8} align="center" style={{ minWidth: 0 }}>
              <Flex align="center" gap={4} style={{ minWidth: 0 }}>
                <UserOutlined style={{ fontSize: 10, color: token.voidTextMuted, flexShrink: 0 }} />
                <Text
                  style={{
                    fontSize: 10,
                    color: token.voidTextMuted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {project?.client_name || "Sin cliente"}
                </Text>
              </Flex>
              <Flex align="center" gap={4} style={{ minWidth: 0 }}>
                <ProjectOutlined style={{ fontSize: 10, color: token.voidTextMuted, flexShrink: 0 }} />
                <Text
                  style={{
                    fontSize: 10,
                    color: token.voidTextMuted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {project?.project_name || "Sin proyecto"}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        <Flex align="center" gap={6} style={{ width: "100%" }}>
          {MAIN_PHASES.map((p, idx) => {
            const Icon = p.icon;
            const done = isCancelled ? false : idx <= currentIndex;
            const linePercent = isCancelled
              ? 0
              : currentIndex > idx
              ? 100
              : currentIndex === idx
              ? 50
              : 0;
            return (
              <React.Fragment key={p.key}>
                <Tooltip title={`${p.label}: ${p.description}`}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: done ? `${p.color}22` : token.voidSurface,
                      border: `1px solid ${done ? p.color : token.voidBorder}`,
                      color: done ? p.color : token.voidTextMuted,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon style={{ fontSize: 9 }} />
                  </div>
                </Tooltip>
                {idx < MAIN_PHASES.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      minWidth: 8,
                      borderRadius: 1,
                      background: `linear-gradient(to right, ${p.color} ${linePercent}%, ${token.voidBorder} ${linePercent}%)`,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
          {isCancelled && cancelPhase && (
            <Tooltip title={`${cancelPhase.label}: ${cancelPhase.description}`}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `${cancelPhase.color}22`,
                  border: `1px solid ${cancelPhase.color}`,
                  color: cancelPhase.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <cancelPhase.icon style={{ fontSize: 9 }} />
              </div>
            </Tooltip>
          )}
        </Flex>

        <Text
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: phase.color,
          }}
        >
          Fase: {phase.label}
        </Text>

        <Progress
          percent={progress}
          strokeColor={phase.color}
          showInfo
          size="small"
          format={(percent) => (
            <Text style={{ color: token.voidTextMuted, fontSize: 10 }}>{percent}%</Text>
          )}
          style={{ margin: 0 }}
        />

        <Flex vertical gap={6} style={{ marginTop: "auto" }}>
          <Flex wrap gap={8} align="center">
            <Flex align="center" gap={4} style={{ minWidth: 0 }}>
              <EnvironmentOutlined style={{ fontSize: 10, color: token.voidTextMuted, flexShrink: 0 }} />
              <Text
                style={{
                  fontSize: 10,
                  color: token.voidTextMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {pointLabel}
              </Text>
            </Flex>
            <Flex align="center" gap={4} style={{ minWidth: 0 }}>
              <TeamOutlined style={{ fontSize: 10, color: token.voidTextMuted, flexShrink: 0 }} />
              <Text
                style={{
                  fontSize: 10,
                  color: token.voidTextMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {assignedLabel}
              </Text>
            </Flex>
            <Flex align="center" gap={4} style={{ minWidth: 0 }}>
              <CalendarOutlined style={{ fontSize: 10, color: token.voidTextMuted, flexShrink: 0 }} />
              <Text style={{ fontSize: 10, color: token.voidTextMuted, flexShrink: 0 }}>
                {createdLabel}
              </Text>
            </Flex>
          </Flex>

          <Tag
            style={{
              color: priorityColor,
              background: `${priorityColor}12`,
              border: `1px solid ${priorityColor}35`,
              borderRadius: 3,
              fontSize: 9,
              padding: "0 5px",
              lineHeight: "14px",
              fontWeight: 600,
              alignSelf: "flex-start",
              margin: 0,
            }}
          >
            {priorityConfig.label}
          </Tag>
        </Flex>
      </Flex>
    </SmartCard>
  );
};

export default React.memo(ProjectCard);