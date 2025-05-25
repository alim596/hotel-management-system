import { useState, useEffect } from "react";
import { type User } from "../shared/types";
import TokenService from "../services/tokenService";
import ApiClient from "../services/apiClient";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = TokenService.getAccessToken();
        if (!token) {
          // This is a normal case - user is not logged in
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
          return;
        }

        const user = await ApiClient.get<User>("/users/me");
        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } catch (error) {
        console.error("Session validation error:", error);
        // Only log actual errors, not the "no token" case
        if (error instanceof Error && error.message !== "No token found") {
          console.error("Session validation error:", error);
        }
        TokenService.removeTokens();
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await ApiClient.post<LoginResponse>(
        "/auth/login",
        { email, password },
        { requiresAuth: false }
      );

      if (!response.access_token) {
        throw new Error("No access token received");
      }

      TokenService.setTokens(response.access_token);
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      // Clear any existing tokens on login failure
      TokenService.removeTokens();
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "Login failed. Please check your credentials and try again."
      );
    }
  };

  const logout = () => {
    TokenService.removeTokens();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const user = await ApiClient.get<User>("/users/me");
      setAuthState((prev) => ({
        ...prev,
        user,
      }));
    } catch (error) {
      console.error("Error refreshing user data:", error);
      if (error instanceof Error && error.message.includes("401")) {
        // If unauthorized, log out the user
        logout();
      }
    }
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading: authState.isLoading,
    login,
    logout,
    refreshUser,
  };
};
