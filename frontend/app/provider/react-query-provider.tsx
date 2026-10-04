import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-context";

export let queryClient: QueryClient;

interface ApiErrorLike {
  response?: { status?: number };
  status?: number;
  statusCode?: number;
}

const isApiErrorLike = (error: unknown): error is ApiErrorLike => {
  return typeof error === "object" && error !== null;
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 600_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: (failureCount, error: unknown) => {
          const status = isApiErrorLike(error)
            ? error.response?.status ?? error.status ?? error.statusCode
            : undefined;
          if (status === 401 || status === 403 || status === 404) {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  });

queryClient = createQueryClient();

const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(() => {
    const qc = createQueryClient();
    queryClient = qc;
    return qc;
  });

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {children}
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
};
export default ReactQueryProvider;
