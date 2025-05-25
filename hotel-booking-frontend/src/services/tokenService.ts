interface DecodedToken {
  exp: number;
  userId: string;
  role: string;
}

class TokenService {
  private static TOKEN_KEY = "token";

  // Store token
  static setTokens(accessToken: string) {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
  }

  // Get access token
  static getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Remove tokens
  static removeTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Decode JWT token
  static decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
}

export default TokenService;
