import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData, patchData, deleteData } from "@/lib/fetch-util";
import type {
  Workspace,
  WorkspaceProjectsResponse,
  WorkspaceStatsResponse,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUpdateWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      workspaceId: string;
      workspaceData: Partial<WorkspaceForm>;
    }) =>
      patchData<Workspace>(
        `/workspaces/${data.workspaceId}`,
        data.workspaceData
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WorkspaceForm) =>
      postData<Workspace>("/workspaces", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useGetWorkspacesQuery = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData<Workspace[]>("/workspaces"),
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });
};

export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () =>
      fetchData<WorkspaceProjectsResponse>(
        `/workspaces/${workspaceId}/projects`
      ),
    enabled: !!workspaceId && workspaceId !== "null",
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });
};

export const useGetWorkspaceStatsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () =>
      fetchData<WorkspaceStatsResponse>(`/workspaces/${workspaceId}/stats`),
    enabled: !!workspaceId && workspaceId !== "null",
  });
};

export const useGetWorkspaceDetailsQuery = (
  workspaceId: string,
  token?: string | null
) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details", token || ""],
    queryFn: async () => {
      const url = token
        ? `/workspaces/${workspaceId}?tk=${encodeURIComponent(token)}`
        : `/workspaces/${workspaceId}`;
      return fetchData<Workspace>(url);
    },
    enabled: !!workspaceId && workspaceId !== "null",
  });
};

export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
      postData<{ message: string }>(
        `/workspaces/${data.workspaceId}/invite-member`,
        {
          email: data.email,
          role: data.role,
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
  });
};

export const useAcceptInviteByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData<{ message: string; workspaceId?: string }>(
        `/workspaces/accept-invite-token`,
        {
          token,
        }
      ),
  });
};

export const useAcceptGenerateInviteMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData<{ message: string }>(
        `/workspaces/${workspaceId}/accept-generate-invite`,
        {}
      ),
  });
};

export const useDeleteWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) =>
      deleteData<{ message: string }>(`/workspaces/${workspaceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // HTTP verb changed from POST to DELETE
    mutationFn: (data: { workspaceId: string; memberId: string }) =>
      deleteData<{ message: string }>(
        `/workspaces/${data.workspaceId}/remove-member/${data.memberId}`
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
  });
};

export const useChangeMemberRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // HTTP verb changed from POST to PATCH
    mutationFn: (data: {
      workspaceId: string;
      memberId: string;
      role: string;
    }) =>
      patchData<{ message: string }>(
        `/workspaces/${data.workspaceId}/change-member-role/${data.memberId}`,
        {
          role: data.role,
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
  });
};

export const useTransferOwnershipMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // HTTP verb changed from POST to PATCH
    mutationFn: (data: { workspaceId: string; newOwnerId: string }) =>
      patchData<{ message: string }>(
        `/workspaces/${data.workspaceId}/transfer-ownership`,
        {
          newOwnerId: data.newOwnerId,
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
  });
};
