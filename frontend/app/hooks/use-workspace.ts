import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData, patchData, deleteData } from "@/lib/fetch-util";
import { queryKeys } from "@/lib/query-keys";
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
        queryKey: queryKeys.workspace.byId(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.details(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.stats(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WorkspaceForm) =>
      postData<Workspace>("/workspaces", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
};

export const useGetWorkspacesQuery = () => {
  return useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: async () => fetchData<Workspace[]>("/workspaces"),
  });
};

export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: queryKeys.workspace.byId(workspaceId),
    queryFn: async () =>
      fetchData<WorkspaceProjectsResponse>(
        `/workspaces/${workspaceId}/projects`
      ),
    enabled: !!workspaceId && workspaceId !== "null",
  });
};

export const useGetWorkspaceStatsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: queryKeys.workspace.stats(workspaceId),
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
    queryKey: queryKeys.workspace.details(workspaceId, token),
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
        queryKey: queryKeys.workspace.byId(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.details(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.stats(variables.workspaceId),
      });
    },
  });
};

export const useAcceptInviteByTokenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      postData<{ message: string; workspaceId?: string }>(
        `/workspaces/accept-invite-token`,
        {
          token,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useAcceptGenerateInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData<{ message: string }>(
        `/workspaces/${workspaceId}/accept-generate-invite`,
        {}
      ),
    onSuccess: (_, workspaceId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.byId(workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.stats(workspaceId),
      });
    },
  });
};

export const useDeleteWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) =>
      deleteData<{ message: string }>(`/workspaces/${workspaceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
    },
  });
};

export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { workspaceId: string; memberId: string }) =>
      deleteData<{ message: string }>(
        `/workspaces/${data.workspaceId}/remove-member/${data.memberId}`
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.byId(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.details(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.stats(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
};

export const useChangeMemberRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
        queryKey: queryKeys.workspace.byId(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.details(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.stats(variables.workspaceId),
      });
    },
  });
};

export const useTransferOwnershipMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { workspaceId: string; newOwnerId: string }) =>
      patchData<{ message: string }>(
        `/workspaces/${data.workspaceId}/transfer-ownership`,
        {
          newOwnerId: data.newOwnerId,
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.byId(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.details(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.stats(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
};
