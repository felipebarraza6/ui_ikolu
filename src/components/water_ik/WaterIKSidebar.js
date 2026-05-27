import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { FileTextOutlined, ExperimentOutlined, CheckCircleOutlined, UnorderedListOutlined } from "@ant-design/icons";

const SidebarContainer = styled.div`
  width: 240px;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border-right: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NewChatButton = styled.button`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  margin: 12px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.token.borderRadius};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(31, 52, 97, 0.3);
  }
`;

const SectionTitle = styled.h3`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.greyText};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 10px 14px 6px;
  margin: 0;
`;

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 6px;
`;

const ConversationItem = styled.div`
  ${animations.slideInLeft}
  animation: slideInLeft 0.2s ease-out;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.small};
  cursor: pointer;
  margin-bottom: 2px;
  background: ${({ active, theme }) =>
    active ? `${theme.colors.corporateBlue}12` : "transparent"};
  color: ${({ active, theme }) =>
    active ? theme.colors.corporateBlue : theme.token.colorText};
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundLight};
  }

  .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: ${({ active }) => (active ? "600" : "400")};
    line-height: 1.3;
  }

  .date {
    font-size: 10px;
    color: ${({ theme }) => theme.colors.greyText};
    margin-top: 2px;
  }
`;

const NavSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  padding: 6px;
`;

const NavItem = styled.div`
  ${animations.slideInLeft}
  animation: slideInLeft 0.2s ease-out;
  animation-delay: ${({ delay }) => delay || "0s"};
  animation-fill-mode: both;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.small};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.token.colorText};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundLight};
  }

  &.active {
    background: ${({ theme }) => theme.colors.corporateBlue}12;
    color: ${({ theme }) => theme.colors.corporateBlue};
    font-weight: 500;
  }

  .icon {
    font-size: 15px;
    flex-shrink: 0;
  }

  .badge {
    margin-left: auto;
    background: ${({ theme }) => theme.colors.accentOrange};
    color: white;
    font-size: 9px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 8px;
    min-width: 16px;
    text-align: center;
  }
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
};

const WaterIKSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  sidebarMode,
  onSetSidebarMode,
  tasks,
  documents,
}) => {
  const navItems = [
    { key: "chat", icon: <FileTextOutlined />, label: "Chat", delay: "0.05s" },
    { key: "documents", icon: <FileTextOutlined />, label: "Documentos", badge: documents.length, delay: "0.1s" },
    { key: "flows", icon: <ExperimentOutlined />, label: "Flujos", delay: "0.15s" },
    { key: "validation", icon: <CheckCircleOutlined />, label: "Validación", delay: "0.2s" },
    { key: "tasks", icon: <UnorderedListOutlined />, label: "Tareas", badge: tasks.filter((t) => t.status === "pending").length, delay: "0.25s" },
  ];

  return (
    <SidebarContainer>
      <NewChatButton onClick={onNewConversation}>
        <span>+</span>
        <span>Nueva conversación</span>
      </NewChatButton>

      <SectionTitle>Recientes</SectionTitle>
      <ConversationList>
        {conversations.length === 0 && (
          <div style={{ padding: "12px", textAlign: "center", color: "#8c8c8c", fontSize: 11 }}>
            Sin conversaciones aún
          </div>
        )}
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            active={conv.id === activeConversationId}
            onClick={() => onSelectConversation(conv.id)}
          >
            <div className="title">{conv.title}</div>
            <div className="date">{formatDate(conv.updatedAt || conv.createdAt)}</div>
          </ConversationItem>
        ))}
      </ConversationList>

      <NavSection>
        {navItems.map((item) => (
          <NavItem
            key={item.key}
            className={sidebarMode === item.key ? "active" : ""}
            delay={item.delay}
            onClick={() => onSetSidebarMode(item.key)}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge > 0 && <span className="badge">{item.badge}</span>}
          </NavItem>
        ))}
      </NavSection>
    </SidebarContainer>
  );
};

export default WaterIKSidebar;
