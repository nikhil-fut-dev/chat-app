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

export default function Chat() {
  const dispatch = useDispatch();

  useOnlineStatus();

  const [editingMessage, setEditingMessage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const activeConversation = useSelector(
    (state) => state.conversations.activeConversation,
  );

  const receiverId = activeConversation?.user?._id;

  const { isTyping } = useMessageSocket(receiverId);

  console.log("🔥 CHAT RENDER isTyping =", isTyping);

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

  /*
   * Clear edit mode whenever the selected user changes.
   */
  useEffect(() => {
    setEditingMessage(null);
  }, [receiverId]);

  /*
   * Send message / edit message
   */
  const handleSend = async (text) => {
    if (!text?.trim()) {
      return false;
    }

    /*
     * Existing message edit
     */
    if (editingMessage) {
      const success = await editMessage(editingMessage._id, text.trim());

      if (success) {
        setEditingMessage(null);
      }

      return success;
    }

    /*
     * New message
     *
     * Backend will automatically create the conversation
     * if this is the first message between both users.
     */
    const message = await sendMessage(text.trim());

    if (!message) {
      return false;
    }

    /*
     * After the first message the backend has created
     * the real Conversation document.
     *
     * Fetch conversations again so Redux gets the real
     * conversationId instead of temporary `new-userId`.
     */
    try {
      const response = await getConversations();

      const conversations = response.data || [];

      dispatch(setConversations(conversations));

      /*
       * Find the newly created conversation.
       *
       * Usually there will be only one conversation for
       * these two users.
       */
      const createdConversation = conversations.find(
        (conversation) =>
          conversation.user?._id?.toString() === receiverId?.toString(),
      );

      if (createdConversation) {
        dispatch(setActiveConversation(createdConversation));
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Message sent, but conversation could not be refreshed.";

      toast.error(message);
    }

    return true;
  };

  /*
   * Start editing a message
   */
  const handleEdit = (message) => {
    setEditingMessage(message);
  };

  /*
   * Delete a message
   */
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
      <div className="flex h-full min-w-0 flex-col bg-slate-950">
        <ChatHeader
          isTyping={isTyping}
          onBack={() => setSidebarOpen(false)}
          onOpenSidebar={() => setSidebarOpen(true)}
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
          <div className="flex flex-1 items-center justify-center bg-slate-900/30 px-6">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <span className="text-2xl">💬</span>
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-200">
                Select a conversation
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose someone from your conversations to start messaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </ChatLayout>
  );
}
