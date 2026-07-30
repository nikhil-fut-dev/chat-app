import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  activeConversation: null,
  isLoading: false,
  error: null,
};

const conversationSlice = createSlice({
  name: "conversations",

  initialState,

  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.error = null;
    },

    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },

    clearActiveConversation: (state) => {
      state.activeConversation = null;
    },

    setConversationLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setConversationError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearConversations: (state) => {
      state.conversations = [];
      state.activeConversation = null;
      state.error = null;
    },

    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage, updatedAt } = action.payload;

      const conversation = state.conversations.find(
        (item) =>
          item.conversationId?.toString() === conversationId?.toString(),
      );

      if (!conversation) return;

      conversation.lastMessage = lastMessage;
      conversation.updatedAt = updatedAt;

      state.conversations = [
        conversation,
        ...state.conversations.filter(
          (item) =>
            item.conversationId?.toString() !== conversationId?.toString(),
        ),
      ];
    },

    /*
     * Add a new conversation or update an existing one.
     *
     * Useful after sending the first message because
     * the backend creates the real conversation at that time.
     */
    upsertConversation: (state, action) => {
      const conversation = action.payload;

      if (!conversation?.conversationId) return;

      const conversationId = conversation.conversationId.toString();

      const existingIndex = state.conversations.findIndex(
        (item) => item.conversationId?.toString() === conversationId,
      );

      if (existingIndex !== -1) {
        state.conversations[existingIndex] = {
          ...state.conversations[existingIndex],
          ...conversation,
        };
      } else {
        state.conversations.unshift(conversation);
      }

      state.conversations.sort(
        (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
      );
    },

    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline } = action.payload;

      const updateUser = (user) => {
        if (!user?._id) return;

        if (user._id.toString() === userId.toString()) {
          user.isOnline = isOnline;

          if (!isOnline) {
            user.lastSeen = new Date().toISOString();
          }
        }
      };

      // Conversation list
      state.conversations.forEach((conversation) => {
        updateUser(conversation.user);
      });

      // Active conversation
      if (state.activeConversation?.user) {
        updateUser(state.activeConversation.user);
      }
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  clearActiveConversation,
  setConversationLoading,
  setConversationError,
  clearConversations,
  updateConversationLastMessage,
  upsertConversation,
  updateUserOnlineStatus,
} = conversationSlice.actions;

export default conversationSlice.reducer;
