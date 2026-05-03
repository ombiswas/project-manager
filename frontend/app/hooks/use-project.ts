import type { CreateProjectFormData } from "@/components/project/create-project";
import { fetchData, postData, deleteData, updateData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};

export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });
};

export const UseUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      projectData: Partial<CreateProjectFormData>;
    }) => updateData(`/projects/${data.projectId}`, data.projectData),
    onSuccess: (data: any) => {
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
      deleteData(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
  });
};
