import type { CreateProjectFormData } from "@/components/project/create-project";
import { fetchData, postData, patchData, deleteData } from "@/lib/fetch-util";
import { queryKeys } from "@/lib/query-keys";
import type { Project, ProjectTasksResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData<Project>(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),
    onSuccess: (data: Project, variables) => {
      const workspaceId =
        (typeof data?.workspace === "string"
          ? data.workspace
          : data?.workspace?._id) || variables.workspaceId;

      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all,
      });
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.byId(workspaceId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.stats(workspaceId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.all,
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
};

export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projects.byId(projectId),
    queryFn: () =>
      fetchData<ProjectTasksResponse>(`/projects/${projectId}/tasks`),
    enabled: !!projectId && projectId !== "null",
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });
};

export const UseUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      projectData: Partial<CreateProjectFormData>;
    }) => patchData<Project>(`/projects/${data.projectId}`, data.projectData),
    onSuccess: (data: Project, variables) => {
      const projectId = data?._id || variables.projectId;
      const workspaceId =
        typeof data?.workspace === "string"
          ? data.workspace
          : data?.workspace?._id;

      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.byId(projectId),
      });
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.byId(workspaceId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.stats(workspaceId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.all,
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
    },
  });
};

export const UseDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) =>
      deleteData<{ message: string; workspaceId?: string }>(
        `/projects/${projectId}`
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all,
      });
      if (data?.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.byId(data.workspaceId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.stats(data.workspaceId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.all,
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.archivedTasks(),
      });
    },
  });
};

// Also export camelCase aliases
export const useCreateProject = UseCreateProject;
export const useProjectQuery = UseProjectQuery;
export const useUpdateProject = UseUpdateProject;
export const useDeleteProject = UseDeleteProject;
