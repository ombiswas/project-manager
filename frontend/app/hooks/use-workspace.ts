import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData, deleteData, updateData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUpdateWorkspaceMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { workspaceId: string; workspaceData: Partial<WorkspaceForm> }) =>
            updateData(`/workspaces/${data.workspaceId}`, data.workspaceData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
    });
};

export const useCreateWorkspace = () => {
    return useMutation({
        mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
    });
};

export const useGetWorkspacesQuery = () => {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => fetchData("/workspaces"),
        refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    });
};

export const useGetWorkspaceQuery = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
        enabled: !!workspaceId && workspaceId !== "null",
        refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    });
};

export const useGetWorkspaceStatsQuery = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace", workspaceId, "stats"],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
        enabled: !!workspaceId && workspaceId !== "null",
    });
};

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace", workspaceId, "details"],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
        enabled: !!workspaceId && workspaceId !== "null",
    });
};

export const useInviteMemberMutation = () => {
    return useMutation({
        mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
            postData(`/workspaces/${data.workspaceId}/invite-member`, data),
    });
};

export const useAcceptInviteByTokenMutation = () => {
    return useMutation({
        mutationFn: (token: string) =>
            postData(`/workspaces/accept-invite-token`, {
                token,
            }),
    });
};

export const useAcceptGenerateInviteMutation = () => {
    return useMutation({
        mutationFn: (workspaceId: string) =>
            postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
    });
};

export const useDeleteWorkspaceMutation = () => {
    return useMutation({
        mutationFn: (workspaceId: string) => deleteData(`/workspaces/${workspaceId}`),
    });
};

export const useRemoveMemberMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { workspaceId: string; memberId: string }) =>
            postData(`/workspaces/${data.workspaceId}/remove-member/${data.memberId}`, {}),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
        },
    });
};

export const useChangeMemberRoleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { workspaceId: string; memberId: string; role: string }) =>
            postData(`/workspaces/${data.workspaceId}/change-member-role/${data.memberId}`, { role: data.role }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
        },
    });
};

export const useTransferOwnershipMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { workspaceId: string; newOwnerId: string }) =>
            postData(`/workspaces/${data.workspaceId}/transfer-ownership`, { newOwnerId: data.newOwnerId }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
        },
    });
};

