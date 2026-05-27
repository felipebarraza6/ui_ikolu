import React from "react";
import useWaterIK from "../../hooks/useWaterIK";
import WaterIKSidebar from "./WaterIKSidebar";
import WaterIKChatThread from "./WaterIKChatThread";
import WaterIKInputBar from "./WaterIKInputBar";
import WaterIKDocumentPanel from "./WaterIKDocumentPanel";
import WaterIKFlowPanel from "./WaterIKFlowPanel";
import WaterIKValidationPanel from "./WaterIKValidationPanel";
import WaterIKTaskPanel from "./WaterIKTaskPanel";
import {
  WaterIKPageContainer,
  WaterIKMainArea,
  WaterIKHeader,
  WaterIKTitle,
  WaterIKBetaBadge,
  WaterIKQuotaBar,
} from "./WaterIKStyles";

const WaterIKPage = () => {
  const {
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
    activeFlowRun,
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
  } = useWaterIK();

  const hasPoint = false; // TODO: obtener del contexto global
  const suggestions = getSuggestions(hasPoint);

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const renderContent = () => {
    switch (sidebarMode) {
      case "documents":
        return (
          <WaterIKDocumentPanel
            documents={documents}
            isLoading={false}
            onGenerateDocument={generateDocument}
          />
        );
      case "flows":
        return (
          <WaterIKFlowPanel
            flows={[]}
            activeFlowRun={activeFlowRun}
            onRunFlow={runFlow}
            isLoading={false}
          />
        );
      case "validation":
        return <WaterIKValidationPanel validation={validation} isLoading={false} />;
      case "tasks":
        return (
          <WaterIKTaskPanel
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        );
      default:
        return (
          <>
            <WaterIKChatThread
              messages={messages}
              isLoading={isLoading}
              suggestions={messages.length === 0 ? suggestions : []}
              onSuggestionClick={handleSuggestionClick}
            />
            <WaterIKInputBar
              onSend={sendMessage}
              suggestions={messages.length === 0 ? [] : suggestions}
              onSuggestionClick={handleSuggestionClick}
              isLoading={isLoading}
              chatQuota={chatQuota}
            />
          </>
        );
    }
  };

  return (
    <WaterIKPageContainer>
      <WaterIKSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={() => createConversation()}
        onDeleteConversation={deleteConversation}
        sidebarMode={sidebarMode}
        onSetSidebarMode={setSidebarMode}
        tasks={tasks}
        documents={documents}
      />
      <WaterIKMainArea>
        <WaterIKHeader>
          <WaterIKTitle>
            <span>💧</span>
            <span>WaterIK</span>
            <WaterIKBetaBadge>Beta</WaterIKBetaBadge>
          </WaterIKTitle>
          {chatQuota?.dailyLimit && (
            <WaterIKQuotaBar>
              Preguntas: {chatQuota.usedToday || 0}/{chatQuota.dailyLimit}
            </WaterIKQuotaBar>
          )}
        </WaterIKHeader>
        {error && (
          <div style={{ padding: "8px 24px", background: "#FFF2F0", color: "#f5222d", fontSize: 13 }}>
            {error}
          </div>
        )}
        {renderContent()}
      </WaterIKMainArea>
    </WaterIKPageContainer>
  );
};

export default WaterIKPage;
