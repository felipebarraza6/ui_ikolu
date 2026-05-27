import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { UnorderedListOutlined } from "@ant-design/icons";

const PanelContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const PanelTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.corporateBlue};
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
`;

const TaskColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TaskColumn = styled.div`
  background: ${({ theme }) => theme.token.colorBgLayout};
  border-radius: ${({ theme }) => theme.token.borderRadius};
  padding: 12px;
  min-height: 200px;
`;

const ColumnHeader = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;

  .count {
    background: ${({ theme }) => theme.token.colorBorderSecondary};
    color: ${({ theme }) => theme.colors.greyText};
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 8px;
  }
`;

const TaskCard = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.2s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadiusSmall || 6};
  padding: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
`;

const TaskTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0 0 6px;
  font-weight: 500;
`;

const TaskDescription = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.greyText};
  margin: 0 0 6px;
  line-height: 1.3;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TaskPriority = styled.span`
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ priority, theme }) => {
    if (priority === "high") return theme.colors.redBg;
    if (priority === "medium") return "#fff3e0";
    return "#e8f5e9";
  }};
  color: ${({ priority, theme }) => {
    if (priority === "high") return theme.colors.error;
    if (priority === "medium") return theme.colors.warning;
    return theme.colors.success;
  }};
`;

const TaskDate = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.greyText};
`;

const EmptyColumn = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: ${({ theme }) => theme.colors.greyText};
  font-size: 11px;
`;

const WaterIKTaskPanel = ({ tasks, onUpdateTask, onDeleteTask }) => {
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
    });
  };

  const TaskList = ({ items }) => {
    if (items.length === 0) {
      return <EmptyColumn>Sin tareas</EmptyColumn>;
    }

    return items.map((task) => (
      <TaskCard key={task.id}>
        <TaskTitle>{task.title}</TaskTitle>
        {task.description && <TaskDescription>{task.description}</TaskDescription>}
        <TaskMeta>
          <TaskPriority priority={task.priority}>
            {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
          </TaskPriority>
          <TaskDate>{formatDate(task.createdAt)}</TaskDate>
        </TaskMeta>
      </TaskCard>
    ));
  };

  return (
    <PanelContainer>
      <PanelTitle>
        <UnorderedListOutlined />
        <span>Tareas</span>
      </PanelTitle>

      <TaskColumns>
        <TaskColumn>
          <ColumnHeader>
            Pendientes <span className="count">{pendingTasks.length}</span>
          </ColumnHeader>
          <TaskList items={pendingTasks} />
        </TaskColumn>

        <TaskColumn>
          <ColumnHeader>
            En Progreso <span className="count">{inProgressTasks.length}</span>
          </ColumnHeader>
          <TaskList items={inProgressTasks} />
        </TaskColumn>

        <TaskColumn>
          <ColumnHeader>
            Completadas <span className="count">{completedTasks.length}</span>
          </ColumnHeader>
          <TaskList items={completedTasks} />
        </TaskColumn>
      </TaskColumns>
    </PanelContainer>
  );
};

export default WaterIKTaskPanel;
