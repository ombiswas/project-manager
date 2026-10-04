import axios from "axios";
import { queryClient } from "@/provider/react-query-provider";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore storage errors
    }
  }
  return config;
});

// Add a global handler for 401, 403, and 404 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear token and user from localStorage globally
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          } catch {
            // Ignore storage errors
          }

          // Clear TanStack Query cache on 401
          try {
            queryClient?.clear();
          } catch {
            // Ignore if queryClient is not yet ready
          }

          // Dispatch custom event to notify AuthProvider
          window.dispatchEvent(new Event("force-logout"));

          // Redirect to login if currently on a protected route (avoid loops on auth pages)
          const pathname = window.location.pathname;
          const authPrefixes = [
            "/sign-in",
            "/sign-up",
            "/forgot-password",
            "/reset-password",
            "/verify-email",
          ];
          if (!authPrefixes.some((prefix) => pathname.startsWith(prefix))) {
            window.location.href = "/sign-in";
          }
        }
      } else if (
        error.response.status === 403 ||
        error.response.status === 404
      ) {
        // Skip global redirect for self-service user mutation routes.
        // These routes use 403 for "wrong password" errors and should
        // display the message in-place rather than redirecting the user.
        const selfServiceRoutes = [
          "/users/profile",
          "/users/account",
          "/users/change-password",
        ];
        const requestUrl: string = (error.config?.url as string) ?? "";
        const isSelfService = selfServiceRoutes.some((route) =>
          requestUrl.includes(route)
        );

        if (!isSelfService) {
          // Dispatch a custom event to trigger redirect if access is lost or resource is deleted
          const message =
            error.response.data?.message ||
            error.response.data?.error ||
            "Access denied or resource not found";
          const event = new CustomEvent("access-denied", {
            detail: {
              message,
              status: error.response.status,
            },
          });
          window.dispatchEvent(event);
        }
      }
    }
    return Promise.reject(error);
  }
);

const postData = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.post(url, data);
  return response.data;
};

const fetchData = async <T>(url: string): Promise<T> => {
  const response = await api.get(url);
  return response.data;
};

const updateData = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.put(url, data);
  return response.data;
};

const patchData = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.patch(url, data);
  return response.data;
};

const deleteData = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.delete(url, data ? { data } : undefined);
  return response.data;
};

/**
 * Extracts a user-friendly error message from backend error responses or Axios errors
 */
export const getErrorMessage = (
  error: unknown,
  fallback: string = "An unexpected error occurred"
): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
      if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0];
        if (typeof first?.message === "string") return first.message;
        if (typeof first === "string") return first;
      }
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export { postData, fetchData, updateData, patchData, deleteData };
