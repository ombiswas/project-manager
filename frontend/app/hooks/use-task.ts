import type { CreateTaskFormData } from "@/components/task/create-task-dialog";
import { fetchData, postData, patchData, deleteData } from "@/lib/fetch-util";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskDetailResponse,
  Comment,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; taskData: CreateTaskFormData }) =>
      postData<Task>(`/tasks/${data.projectId}/create-task`, data.taskData),
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({
        queryKey: [
          "project",
          typeof data.project === "string" ? data.project : data.project?._id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks"],
      });
    },
  });
};

export const useTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchData<TaskDetailResponse>(`/tasks/${taskId}`),
    enabled: !!taskId && taskId !== "null",
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });
};

export const useUpdateTaskTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      patchData<Task>(`/tasks/${data.taskId}/title`, { title: data.title }),
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "project",
          typeof data.project === "string" ? data.project : data.project?._id,
        ],
      });
    },
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; status: TaskStatus }) =>
      patchData<Task>(`/tasks/${data.taskId}/status`, { status: data.status }),
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "project",
          typeof data.project === "string" ? data.project : data.project?._id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks"],
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
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "project",
          typeof data.project === "string" ? data.project : data.project?._id,
        ],
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
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "project",
          typeof data.project === "string" ? data.project : data.project?._id,
        ],
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
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "project",
          typeof data.project === "string" ? data.project : data.project?._id,
        ],
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
      queryClient.invalidateQueries({
        queryKey: ["task", targetTaskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", targetTaskId],
      });
      if (data?.project) {
        queryClient.invalidateQueries({
          queryKey: [
            "project",
            typeof data.project === "string" ? data.project : data.project?._id,
          ],
        });
      }
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
      queryClient.invalidateQueries({
        queryKey: ["task", targetTaskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", targetTaskId],
      });
      if (data?.project) {
        queryClient.invalidateQueries({
          queryKey: [
            "project",
            typeof data.project === "string" ? data.project : data.project?._id,
          ],
        });
      }
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
        queryKey: ["comments", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },
  });
};

export const useGetCommentsByTaskIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => fetchData<Comment[]>(`/tasks/${taskId}/comments`),
    enabled: !!taskId && taskId !== "null",
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });
};

export const useWatchTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData<Task>(`/tasks/${data.taskId}/watch`, {}),
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
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
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "project",
          typeof data.project === "string" ? data.project : data.project?._id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["archived-tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks"],
      });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      deleteData<{ message: string; projectId: string }>(`/tasks/${taskId}`),
    onSuccess: (data: { message: string; projectId: string }) => {
      queryClient.invalidateQueries({
        queryKey: ["project", data.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["archived-tasks"],
      });
    },
  });
};

export const useGetMyTasksQuery = () => {
  return useQuery({
    queryKey: ["my-tasks", "user"],
    queryFn: () => fetchData<Task[]>("/tasks/my-tasks"),
  });
};

export const useArchivedTasksQuery = () => {
  return useQuery({
    queryKey: ["archived-tasks"],
    queryFn: () => fetchData<Task[]>("/tasks/archived"),
  });
};
