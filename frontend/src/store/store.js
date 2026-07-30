import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import conversationReducer from "./slices/conversationSlice";
import messageReducer from "./slices/messageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversations: conversationReducer,
    messages: messageReducer,
  },
});
