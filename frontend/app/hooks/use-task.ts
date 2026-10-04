import type { CreateTaskFormData } from "@/components/task/create-task-dialog";
import { fetchData, postData, patchData, deleteData } from "@/lib/fetch-util";
import { queryKeys, DETAIL_POLL_MS } from "@/lib/query-keys";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskDetailResponse,
  Comment,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const resolveProjectId = (
  data?: Task,
  fallback?: string
): string | undefined => {
  if (!data?.project) return fallback;
  if (typeof data.project === "string") return data.project;
  return data.project._id;
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; taskData: CreateTaskFormData }) =>
      postData<Task>(`/tasks/${data.projectId}/create-task`, data.taskData),
    onSuccess: (data: Task, variables) => {
      const projectId = resolveProjectId(data, variables.projectId);
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(projectId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.all,
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.byId(taskId),
    queryFn: () => fetchData<TaskDetailResponse>(`/tasks/${taskId}`),
    enabled: !!taskId && taskId !== "null",
    refetchInterval: DETAIL_POLL_MS,
    refetchIntervalInBackground: false,
  });
};

export const useUpdateTaskTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      patchData<Task>(`/tasks/${data.taskId}/title`, { title: data.title }),
    onSuccess: (data: Task, variables) => {
      const targetTaskId = data?._id || variables.taskId;
      const projectId = resolveProjectId(data);

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(targetTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(targetTaskId),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(projectId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; status: TaskStatus }) =>
      patchData<Task>(`/tasks/${data.taskId}/status`, { status: data.status }),
    onSuccess: (data: Task, variables) => {
      const targetTaskId = data?._id || variables.taskId;
      const projectId = resolveProjectId(data);

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(targetTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(targetTaskId),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(projectId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useUpdateTaskDescriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; description: string }) =>
      patchData<Task>(`/tasks/${data.taskId}/description`, {
        description: data.description,
      }),
    onSuccess: (data: Task, variables) => {
      const targetTaskId = data?._id || variables.taskId;
      const projectId = resolveProjectId(data);

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(targetTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(targetTaskId),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(projectId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useUpdateTaskAssigneesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; assignees: string[] }) =>
      patchData<Task>(`/tasks/${data.taskId}/assignees`, {
        assignees: data.assignees,
      }),
    onSuccess: (data: Task, variables) => {
      const targetTaskId = data?._id || variables.taskId;
      const projectId = resolveProjectId(data);

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(targetTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(targetTaskId),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(projectId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useUpdateTaskPriorityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; priority: TaskPriority }) =>
      patchData<Task>(`/tasks/${data.taskId}/priority`, {
        priority: data.priority,
      }),
    onSuccess: (data: Task, variables) => {
      const targetTaskId = data?._id || variables.taskId;
      const projectId = resolveProjectId(data);

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(targetTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(targetTaskId),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(projectId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useAddSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      postData<Task>(`/tasks/${data.taskId}/add-subtask`, {
        title: data.title,
      }),
    onSuccess: (data: Task, variables) => {
      const targetTaskId = variables.taskId || data?._id;
      const projectId = resolveProjectId(data);

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(targetTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(targetTaskId),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(projectId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useUpdateSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      subTaskId: string;
      completed: boolean;
    }) =>
      patchData<Task>(
        `/tasks/${data.taskId}/update-subtask/${data.subTaskId}`,
        {
          completed: data.completed,
        }
      ),
    onSuccess: (data: Task, variables) => {
      const targetTaskId = variables.taskId || data?._id;
      const projectId = resolveProjectId(data);

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(targetTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(targetTaskId),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(projectId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; text: string }) =>
      postData<Comment>(`/tasks/${data.taskId}/add-comment`, {
        text: data.text,
      }),
    onSuccess: (_: Comment, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.comments(variables.taskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(variables.taskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(variables.taskId),
      });
    },
  });
};

export const useGetCommentsByTaskIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.comments(taskId),
    queryFn: () => fetchData<Comment[]>(`/tasks/${taskId}/comments`),
    enabled: !!taskId && taskId !== "null",
  });
};

export const useWatchTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData<Task>(`/tasks/${data.taskId}/watch`, {}),
    onSuccess: (data: Task, variables) => {
      const targetTaskId = data?._id || variables.taskId;
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(targetTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(targetTaskId),
      });
    },
  });
};

export const useAchievedTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // HTTP verb changed from POST to PATCH for archive/unarchive task
    mutationFn: (data: { taskId: string }) =>
      patchData<Task>(`/tasks/${data.taskId}/achieved`, {}),
    onSuccess: (data: Task, variables) => {
      const targetTaskId = data?._id || variables.taskId;
      const projectId = resolveProjectId(data);

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byId(targetTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.activity(targetTaskId),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(projectId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.archivedTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      deleteData<{ message: string; projectId: string }>(`/tasks/${taskId}`),
    onSuccess: (
      data: { message: string; projectId: string },
      taskId: string
    ) => {
      if (taskId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.byId(taskId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.activity(taskId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.comments(taskId),
        });
      }
      if (data?.projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.byId(data.projectId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.all,
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.myTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.archivedTasks(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
};

export const useGetMyTasksQuery = () => {
  return useQuery({
    queryKey: queryKeys.tasks.myTasks(),
    queryFn: () => fetchData<Task[]>("/tasks/my-tasks"),
  });
};

export const useArchivedTasksQuery = () => {
  return useQuery({
    queryKey: queryKeys.tasks.archivedTasks(),
    queryFn: () => fetchData<Task[]>("/tasks/archived"),
  });
};
