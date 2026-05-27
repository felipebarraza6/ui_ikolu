import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { UnorderedListOutlined } from "@ant-design/icons";

const PanelContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const PanelTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.corporateBlue};
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TaskColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TaskColumn = styled.div`
  background: ${({ theme }) => theme.token.colorBgLayout};
  border-radius: ${({ theme }) => theme.token.borderRadiusLG};
  padding: 16px;
  min-height: 300px;
`;

const ColumnHeader = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .count {
    background: ${({ theme }) => theme.token.colorBorderSecondary};
    color: ${({ theme }) => theme.colors.greyText};
    font-size: ${({ theme }) => theme.fontSizes.small};
    padding: 2px 8px;
    border-radius: 10px;
  }
`;

const TaskCard = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.2s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadius};
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
`;

const TaskTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0 0 8px;
`;

const TaskDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.greyText};
  margin: 0 0 8px;
  line-height: 1.4;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TaskPriority = styled.span`
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
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
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.greyText};
`;

const EmptyColumn = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.greyText};
  font-size: ${({ theme }) => theme.fontSizes.base};
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
        <span><UnorderedListOutlined /></span>
        <span>Tareas del Copiloto</span>
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
