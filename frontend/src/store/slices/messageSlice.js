import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
};

const messageSlice = createSlice({
  name: "messages",

  initialState,

  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
      state.error = null;
    },

    addMessage: (state, action) => {
      const exists = state.messages.some(
        (message) => message._id === action.payload._id,
      );

      if (!exists) {
        state.messages.push(action.payload);
      }
    },

    updateMessage: (state, action) => {
      const index = state.messages.findIndex(
        (message) => message._id === action.payload._id,
      );

      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          ...action.payload,
        };
      }
    },

    markMessageDelivered: (state, action) => {
      const message = state.messages.find(
        (item) => item._id === action.payload,
      );

      if (message) {
        message.isDelivered = true;
      }
    },

    markMessageSeen: (state, action) => {
      const message = state.messages.find(
        (item) => item._id === action.payload,
      );

      if (message) {
        message.isDelivered = true;
        message.isSeen = true;
      }
    },

    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (message) => message._id !== action.payload,
      );
    },

    setMessageLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setMessageSending: (state, action) => {
      state.isSending = action.payload;
    },

    setMessageError: (state, action) => {
      state.error = action.payload;
    },

    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
      state.isLoading = false;
      state.isSending = false;
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setMessageLoading,
  setMessageSending,
  setMessageError,
  clearMessages,
  markMessageDelivered,
  markMessageSeen,
} = messageSlice.actions;

export default messageSlice.reducer;
