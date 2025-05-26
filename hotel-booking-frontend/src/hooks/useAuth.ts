import { useState, useEffect } from "react";
import { type User } from "../shared/types";
import { jwtDecode, type JwtPayload } from "jwt-decode";
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
      const token = TokenService.getAccessToken();
      if (token) {
        try {
          const { exp } = jwtDecode<JwtPayload>(token);
          if (exp * 1000 < Date.now()) {
            // token expired locally
            TokenService.removeTokens();
            setAuthState({
              isAuthenticated: false,
              user: null,
              isLoading: false,
            });
            return;
          }
        } catch {
          // invalid token format
          TokenService.removeTokens();
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
          return;
        }
      }

      // rest of your existing logic:
      if (!token) {
        setAuthState({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }
      try {
        const user = await ApiClient.get<User>("api/users/me");
        setAuthState({ isAuthenticated: true, user, isLoading: false });
      } catch {
        TokenService.removeTokens();
        setAuthState({ isAuthenticated: false, user: null, isLoading: false });
      }
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await ApiClient.post<LoginResponse>(
        "api/auth/login",
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
      const user = await ApiClient.get<User>("api/users/me");
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
