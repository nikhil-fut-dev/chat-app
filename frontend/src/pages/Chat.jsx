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
import { sendMediaMessage } from "../api/messageApi";

import {
  setConversations,
  setActiveConversation,
} from "../store/slices/conversationSlice";

import { addMessage } from "../store/slices/messageSlice";

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

  // Refresh the conversation list after sending a message.
  const refreshConversationList = async () => {
    try {
      const response = await getConversations();
      const conversations = response.data || [];

      dispatch(setConversations(conversations));

      const updatedConversation = conversations.find(
        (conversation) => String(conversation.user?._id) === String(receiverId),
      );

      if (updatedConversation) {
        dispatch(setActiveConversation(updatedConversation));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Message sent, but the conversation list could not be refreshed.",
      );
    }
  };

  // Send a text message or save an edited message.
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

    await refreshConversationList();

    return true;
  };

  // Upload and send an image/video with an optional caption.
  const handleSendMedia = async (payload = {}) => {
    console.log("[Chat] Media callback payload:", payload);

    const { file, caption = "", onUploadProgress, signal } = payload;

    if (!receiverId) {
      toast.error("Please select a conversation first.");
      return false;
    }

    if (!(file instanceof File)) {
      console.error("[Chat] Missing or invalid File object:", file);
      toast.error("Image file receive nahi hui. Please dobara select karo.");
      return false;
    }

    try {
      const response = await sendMediaMessage({
        receiverId,
        caption: caption.trim(),
        file,
        signal,
        onUploadProgress,
      });

      const mediaMessage = response?.data;

      if (!mediaMessage?._id) {
        console.error("[Chat] Unexpected media API response:", response);
        toast.error("Upload hua, lekin message response nahi mila.");
        return false;
      }

      dispatch(addMessage(mediaMessage));

      await refreshConversationList();

      toast.success(
        file.type.startsWith("video/")
          ? "Video sent successfully."
          : "Image sent successfully.",
      );

      return true;
    } catch (error) {
      if (
        error?.code === "ERR_CANCELED" ||
        error?.name === "CanceledError" ||
        error?.name === "AbortError"
      ) {
        return false;
      }

      console.error("[Chat] Media upload failed:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload media. Please try again.",
      );

      return false;
    }
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">
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
              onSendMedia={handleSendMedia}
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
                  💬
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
