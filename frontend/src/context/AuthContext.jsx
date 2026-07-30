import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getMyProfile } from "../api/userApi";
import { logoutUser } from "../api/authApi";

import {
  clearCredentials,
  setCredentials,
  setInitializing,
} from "../store/slices/authSlice";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const { user, isAuthenticated, isInitializing } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await getMyProfile();

        dispatch(setCredentials(response.data));
      } catch {
        dispatch(clearCredentials());
      } finally {
        dispatch(setInitializing(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      dispatch(clearCredentials());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isInitializing,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
};
