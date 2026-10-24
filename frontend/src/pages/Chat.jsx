import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import ChatLayout from "../components/chat/ChatLayout";
import ChatHeader from "../components/chat/header/ChatHeader";
import MessageList from "../components/chat/messages/MessageList";
import MessageComposer from "../components/chat/composer/MessageComposer";

import useMessages from "../hooks/useMessages";
import useMessageSocket from "../hooks/useMessageSocket";
import useOnlineStatus from "../hooks/useOnlineStatus";

import { getConversations } from "../api/conversationApi";

import {
  setConversations,
  setActiveConversation,
} from "../store/slices/conversationSlice";

import useCalling from "../hooks/useCalling";
import CallOverlay from "../components/chat/calling/CallOverlay";

export default function Chat() {
  const dispatch = useDispatch();

  useOnlineStatus();

  const [editingMessage, setEditingMessage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeConversation = useSelector(
    (state) => state.conversations.activeConversation,
  );

  const receiverId = activeConversation?.user?._id;

  const { isTyping } = useMessageSocket(receiverId);

  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
  } = useMessages(receiverId);

  const {
    call,
    callStatus,
    networkQuality,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCalling();

  // Clear edit mode when the selected conversation changes.
  useEffect(() => {
    setEditingMessage(null);
  }, [receiverId]);

  // Send a new message or save an edited message.
  const handleSend = async (text) => {
    const trimmedText = text?.trim();

    if (!trimmedText) {
      return false;
    }

    if (editingMessage) {
      const success = await editMessage(editingMessage._id, trimmedText);

      if (success) {
        setEditingMessage(null);
      }

      return success;
    }

    const message = await sendMessage(trimmedText);

    if (!message) {
      return false;
    }

    // Refresh the conversation list after the first message.
    try {
      const response = await getConversations();
      const conversations = response.data || [];

      dispatch(setConversations(conversations));

      const createdConversation = conversations.find(
        (conversation) => String(conversation.user?._id) === String(receiverId),
      );

      if (createdConversation) {
        dispatch(setActiveConversation(createdConversation));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Message sent, but the conversation list could not be refreshed.",
      );
    }

    return true;
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
  };

  const handleDelete = async (message) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) return;

    await deleteMessage(message._id);
  };

  return (
    <ChatLayout
      sidebarOpen={sidebarOpen}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-slate-50">
        <ChatHeader
          isTyping={isTyping}
          onBack={() => setSidebarOpen(false)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onStartCall={startCall}
          callStatus={callStatus}
        />

        {activeConversation ? (
          <>
            <MessageList
              messages={messages}
              loading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            <MessageComposer
              onSend={handleSend}
              isSending={isSending}
              editingMessage={editingMessage}
              onCancelEdit={() => setEditingMessage(null)}
              onTyping={startTyping}
              onStopTyping={stopTyping}
            />
          </>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 px-6">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                <span className="text-2xl" aria-hidden="true">
                  
                </span>
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-800">
                Select a conversation
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose someone from your conversations to start messaging.
              </p>
            </div>
          </div>
        )}
      </div>

      <CallOverlay
        call={call}
        callStatus={callStatus}
        networkQuality={networkQuality}
        localStream={localStream}
        remoteStream={remoteStream}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
      />
    </ChatLayout>
  );
}
