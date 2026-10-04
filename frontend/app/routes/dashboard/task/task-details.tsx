import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { ErrorState } from "@/components/error-state";
import { CommentSection } from "@/components/task/comment-section";
import { SubTasksDetails } from "@/components/task/sub-tasks";
import { TaskActivity } from "@/components/task/task-activity";
import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { Watchers } from "@/components/task/watchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAchievedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
  useDeleteTaskMutation,
} from "@/hooks/use-task";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import { getErrorMessage } from "@/lib/fetch-util";
import type { TaskDetailResponse, Workspace } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId, projectId, workspaceId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useTaskByIdQuery(
    taskId!
  ) as {
    data: TaskDetailResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
  const { data: workspaceData, isLoading: isLoadingWorkspace } =
    useGetWorkspaceDetailsQuery(workspaceId!) as {
      data: Workspace | undefined;
      isLoading: boolean;
    };

  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

  if (isLoading || isLoadingWorkspace)
    return <Loader label="Loading task details..." />;

  const rawTask = (data as TaskDetailResponse)?.task || (data as unknown as import("@/types").Task);
  const task = rawTask && rawTask._id ? rawTask : undefined;
  const project = (data as TaskDetailResponse)?.project;

  if (isError || !task) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 py-8 px-4">
        <BackButton className="w-fit" />
        <ErrorState
          title="Task not found"
          message={getErrorMessage(
            error,
            "Could not load the requested task details."
          )}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const currentUserId = String(
    user?._id || (user as { id?: string })?.id || ""
  );

  const isUserWatching = task?.watchers?.some(
    (watcher) => (watcher._id || watcher).toString() === currentUserId
  );

  // Permission logic
  const workspaceOwnerId =
    typeof workspaceData?.owner === "string"
      ? workspaceData.owner
      : workspaceData?.owner?._id || (workspaceData?.owner as { id?: string })?.id || "";

  const isWorkspaceOwner = Boolean(
    workspaceOwnerId && currentUserId && String(workspaceOwnerId) === currentUserId
  );

  const memberRecord = workspaceData?.members?.find((m) => {
    const mUserId = String(m.user?._id || (m.user as { id?: string })?.id || m.user || "");
    return mUserId && mUserId === currentUserId;
  });

  const currentUserWorkspaceRole = isWorkspaceOwner
    ? "owner"
    : memberRecord?.role;

  const isOwnerOrAdmin =
    currentUserWorkspaceRole === "owner" ||
    currentUserWorkspaceRole === "admin" ||
    isWorkspaceOwner;

  // Viewers have read-only access.
  // Workspace owners, admins, and members can collaborate on tasks (create, edit, subtasks, comments).
  // Default to allowing actions for authorized users viewing the task (backend enforces access).
  const isViewer = currentUserWorkspaceRole === "viewer";

  const canManageTask = !isViewer;
  const canDeleteTask = isOwnerOrAdmin;
  const canUpdateStatus = !isViewer;
  const canManageSubtasks = !isViewer;
  const canComment = !isViewer;
  const canWatch = !isViewer;

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success(isUserWatching ? "Unwatched task" : "Watching task");
        },
      }
    );
  };

  const handleAchievedTask = () => {
    achievedTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success(task.isArchived ? "Task unarchived" : "Task archived");
        },
      }
    );
  };

  const handleDeleteTask = () => {
    deleteTask(task._id, {
      onSuccess: () => {
        toast.success("Task deleted successfully");
        navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "Failed to delete task"));
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#212327] pb-5">
        <div className="flex flex-col gap-2">
          <BackButton className="w-fit" />
          <div className="flex items-center gap-3 mt-1">
            <p className="caption-mono text-xs text-[#7d8187]">TASK</p>
            <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">
              {task.title}
            </h1>
            {task.isArchived && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] text-[#ffc285] border-[#ffc285]/30 bg-[#ffc285]/10"
              >
                ARCHIVED
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canWatch && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWatchTask}
              className="flex items-center gap-2"
              disabled={isWatching}
            >
              {isUserWatching ? (
                <>
                  <EyeOff className="size-3.5" />
                  <span>Unwatch</span>
                </>
              ) : (
                <>
                  <Eye className="size-3.5" />
                  <span>Watch</span>
                </>
              )}
            </Button>
          )}

          {canManageTask && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAchievedTask}
              className="flex items-center gap-2"
              disabled={isAchieved}
            >
              {task.isArchived ? (
                <>
                  <ArchiveRestore className="size-3.5" />
                  <span>Unarchive</span>
                </>
              ) : (
                <>
                  <Archive className="size-3.5" />
                  <span>Archive</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left main content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#191919] rounded-[8px] border border-[#212327] p-6 shadow-none space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[#212327] pb-5">
              <div className="space-y-3 flex-1 w-full overflow-hidden">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[1px] text-[#7d8187]">
                      Priority
                    </span>
                    <TaskPrioritySelector
                      priority={task.priority}
                      taskId={task._id}
                      canEdit={canManageTask}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[1px] text-[#7d8187]">
                      Status
                    </span>
                    <TaskStatusSelector
                      status={task.status}
                      taskId={task._id}
                      canEdit={canUpdateStatus}
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <TaskTitle
                    title={task.title}
                    taskId={task._id}
                    canEdit={canManageTask}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#7d8187] pt-1">
                  <span>ID:</span>
                  <span className="text-white bg-[#1a1c20] px-2 py-0.5 rounded-full border border-[#212327]">
                    {task._id.slice(-6)}
                  </span>
                  <span>•</span>
                  <span>
                    Created{" "}
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                Description
              </h3>
              <div className="bg-[#141517] rounded-[8px] p-4 border border-[#212327] min-h-[90px]">
                <TaskDescription
                  description={task.description || "No description provided."}
                  taskId={task._id}
                  canEdit={canManageTask}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#212327]">
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                  Assignees
                </h3>
                <div className="max-w-md">
                  <TaskAssigneesSelector
                    task={task}
                    assignees={task.assignees || []}
                    projectMembers={(workspaceData?.members || []).flatMap((m) => {
                      const u = m.user as { _id?: string; name?: string; email?: string; profilePicture?: string } | string | undefined;
                      if (!u || typeof u === "string") return [];
                      return [{ _id: u._id || "", name: u.name || "", email: u.email || "", profilePicture: u.profilePicture || "" }];
                    }) as import("@/types").User[]}
                    canEdit={canManageTask}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#212327]">
              <SubTasksDetails
                subTasks={task.subtasks || []}
                taskId={task._id}
                canEdit={canManageSubtasks}
              />
            </div>
          </div>

          <CommentSection
            taskId={task._id}
            members={(project?.members || []) as unknown as import("@/types").User[]}
            canComment={canComment}
          />
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#191919] rounded-[8px] border border-[#212327] p-5 shadow-none space-y-4">
            <Watchers watchers={task.watchers || []} />
          </div>

          <div className="bg-[#191919] rounded-[8px] border border-[#212327] p-5 shadow-none space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187] border-b border-[#212327] pb-2">
              Task Activity
            </h3>
            <TaskActivity resourceId={task._id} />
          </div>

          {canDeleteTask && (
            <div className="bg-[#191919] rounded-[8px] border border-[#ff7a17]/30 p-5 space-y-3 shadow-none">
              <h3 className="text-xs font-mono uppercase tracking-[1.2px] text-[#ff7a17] border-b border-[#212327] pb-2 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" />
                Danger Zone
              </h3>
              <p className="text-xs text-[#7d8187]">
                Permanently delete this task and its history from the project.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-2"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="size-3.5 mr-2" />
                Delete Task
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-normal tracking-tight text-white">
              Delete Task?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#7d8187]">
              This action cannot be undone. This will permanently delete{" "}
              <strong className="text-white">{task.title}</strong> and all
              associated activity.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetails;
