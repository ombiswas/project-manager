import type { CreateProjectFormData } from "@/components/project/create-project";
import { fetchData, postData, patchData, deleteData } from "@/lib/fetch-util";
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
    onSuccess: (data: Project) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", typeof data.workspace === "string" ? data.workspace : data.workspace?._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
  });
};

export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData<ProjectTasksResponse>(`/projects/${projectId}/tasks`),
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
    onSuccess: (data: Project) => {
      queryClient.invalidateQueries({
        queryKey: ["project", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
  });
};

export const UseDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) =>
      deleteData<{ message: string; workspaceId?: string }>(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
  });
};

// Also export camelCase aliases
export const useCreateProject = UseCreateProject;
export const useProjectQuery = UseProjectQuery;
export const useUpdateProject = UseUpdateProject;
export const useDeleteProject = UseDeleteProject;
