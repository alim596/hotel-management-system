import TokenService from "./tokenService";

interface RequestOptions {
  requiresAuth?: boolean;
}

interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    // Use port 3000 to match the NestJS backend
    const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";
    this.baseURL = url.endsWith("/") ? url.slice(0, -1) : url;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { requiresAuth?: boolean } = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers);

    // Ensure content type is set for JSON requests
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (requiresAuth) {
      const token = TokenService.getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

    try {
      console.log(`Making request to: ${this.baseURL}${normalizedEndpoint}`);
      const response = await fetch(`${this.baseURL}${normalizedEndpoint}`, {
        ...fetchOptions,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error: ApiError = {
          message:
            (data && data.message) || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
        throw error;
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      if ((error as ApiError).status === 404) {
        throw new Error(`Endpoint not found: ${normalizedEndpoint}`);
      }
      throw error;
    }
  }

  public async get<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public async post<T>(
    endpoint: string,
    data: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async put<T>(
    endpoint: string,
    data: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public async delete<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export default new ApiClient();
