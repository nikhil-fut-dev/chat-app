import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },

    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },

    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setInitializing } =
  authSlice.actions;

export default authSlice.reducer;
