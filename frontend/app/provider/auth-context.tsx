import type { User, AuthResponse } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "@/lib";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  token?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface StoredAuth {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const getStoredAuth = (): StoredAuth => {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      return { user: null, token: null, isAuthenticated: false };
    }

    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser || typeof parsedUser !== "object" || !parsedUser._id) {
      throw new Error("Invalid user data in storage");
    }

    return {
      user: parsedUser,
      token: storedToken,
      isAuthenticated: true,
    };
  } catch {
    // Corrupt JSON or invalid data: clear stored keys and fall back to logged out
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // Ignore storage errors
    }
    return { user: null, token: null, isAuthenticated: false };
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Synchronous lazy initializer reading localStorage on initial render
  const [initialAuth] = useState<StoredAuth>(() => getStoredAuth());
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [token, setToken] = useState<string | null>(initialAuth.token);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initialAuth.isAuthenticated
  );
  // isLoading is false immediately because storage was read synchronously
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const currentPath = useLocation().pathname;
  const isPublicRoute = publicRoutes.some((route) =>
    route === "*" ? false : currentPath.startsWith(route) || currentPath === route
  );

  const updateUser = (updatedUser: User) => {
    if (!updatedUser || !updatedUser._id) {
      return;
    }
    setUser(updatedUser);
    try {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch {
      // Ignore storage errors
    }
  };

  // Route protection redirect when not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, isPublicRoute, navigate]);

  const logout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // Ignore storage errors
    }

    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    queryClient.clear();
  };

  useEffect(() => {
    const handleLogout = () => {
      logout();
      const pathname = window.location.pathname;
      const isAuthPage = [
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
      ].some((prefix) => pathname.startsWith(prefix));

      if (!isAuthPage) {
        navigate("/sign-in");
      }
    };

    const handleAccessDenied = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message?: string;
        status?: number;
      }>;
      const message =
        customEvent.detail?.message || "Access denied or resource not found";
      toast.error(message);
      if (!window.location.pathname.startsWith("/workspace-invite")) {
        navigate("/");
      }
    };

    window.addEventListener("force-logout", handleLogout);
    window.addEventListener("access-denied", handleAccessDenied);

    return () => {
      window.removeEventListener("force-logout", handleLogout);
      window.removeEventListener("access-denied", handleAccessDenied);
    };
  }, [navigate]);

  const login = async (data: AuthResponse) => {
    try {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch {
      // Ignore storage errors
    }

    setUser(data.user);
    setToken(data.token);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const values = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
