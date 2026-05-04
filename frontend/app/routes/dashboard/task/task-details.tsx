import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
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
import type { Project, Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Archive, ArchiveRestore, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
  };
  const { data: workspaceData, isLoading: isLoadingWorkspace } = useGetWorkspaceDetailsQuery(workspaceId!) as any;

  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

  if (isLoading) return <Loader label="Loading task details..." />;

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold text-muted-foreground">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => (watcher._id || watcher).toString() === user?._id.toString()
  );

  // Permission logic
  const workspaceOwnerId = String(workspaceData?.owner?._id || workspaceData?.owner || "");
  const currentUserId = String(user?._id || "");
  const isWorkspaceOwner = workspaceOwnerId && currentUserId && workspaceOwnerId === currentUserId;

  const currentUserWorkspaceRole = isWorkspaceOwner ? "owner" : workspaceData?.members?.find(
    (m: any) => String(m.user?._id || m.user) === currentUserId
  )?.role;

  const projectCreatorId = typeof project.createdBy === "string" 
    ? project.createdBy 
    : project.createdBy?._id || "";
  const isCreatorOwner = workspaceOwnerId && projectCreatorId && workspaceOwnerId === projectCreatorId;
  
  const creatorMember = workspaceData?.members?.find(
    (m: any) => String(m.user?._id || m.user) === projectCreatorId
  );
  const creatorRole = isCreatorOwner ? "owner" : (creatorMember?.role || "member");

  let canDelete = false;
  let canUpdate = false;

  if (currentUserWorkspaceRole === "owner") {
    canDelete = true;
    canUpdate = true;
  } else if (currentUserWorkspaceRole === "admin") {
    canUpdate = true;
    if (creatorRole !== "owner") {
      canDelete = true;
    }
  } else if (currentUserWorkspaceRole === "member") {
    if (creatorRole === "member") {
      canUpdate = true;
      canDelete = true;
    }
  }

  const canEditTasks = currentUserWorkspaceRole === "owner" || currentUserWorkspaceRole === "admin" || currentUserWorkspaceRole === "member";

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
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to delete task");
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex flex-col gap-4">
          <BackButton className="w-fit" />
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{task.title}</h1>
            {task.isArchived && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
                Archived
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEditTasks && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWatchTask}
                className="flex items-center gap-2 shadow-sm"
                disabled={isWatching}
              >
                {isUserWatching ? (
                  <>
                    <EyeOff className="size-4" />
                    <span>Unwatch</span>
                  </>
                ) : (
                  <>
                    <Eye className="size-4" />
                    <span>Watch</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAchievedTask}
                className="flex items-center gap-2 shadow-sm"
                disabled={isAchieved}
              >
                {task.isArchived ? (
                  <>
                    <ArchiveRestore className="size-4" />
                    <span>Unarchive</span>
                  </>
                ) : (
                  <>
                    <Archive className="size-4" />
                    <span>Archive</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left main content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card rounded-xl border p-6 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-6">
              <div className="space-y-3 flex-1 w-full overflow-hidden">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</span>
                    <TaskPrioritySelector priority={task.priority} taskId={task._id} canEdit={canEditTasks} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                    <TaskStatusSelector status={task.status} taskId={task._id} canEdit={canEditTasks} />
                  </div>
                </div>

                <div className="pt-2">
                  <TaskTitle title={task.title} taskId={task._id} canEdit={canEditTasks} />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span className="font-medium">Task ID:</span>
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded uppercase">{task._id.slice(-6)}</span>
                  <span className="mx-1">•</span>
                  <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </h3>
              <div className="bg-muted/10 rounded-lg p-2 border border-muted/50 min-h-[100px]">
                <TaskDescription
                  description={task.description || "No description provided."}
                  taskId={task._id}
                  canEdit={canEditTasks}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Assignees
                </h3>
                <div className="max-w-md">
                  <TaskAssigneesSelector
                    task={task}
                    assignees={task.assignees}
                    projectMembers={project.members as any}
                    canEdit={canEditTasks}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} canEdit={canEditTasks} />
            </div>
          </div>

          <CommentSection taskId={task._id} members={project.members as any} canComment={currentUserWorkspaceRole !== "viewer"} />
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
            <Watchers watchers={task.watchers || []} />
          </div>
          
          <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Task Activity
            </h3>
            <TaskActivity resourceId={task._id} />
          </div>

          {canDelete && (
            <div className="bg-red-50/30 rounded-xl border border-red-100 p-6 space-y-4">
              <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider border-b border-red-100 pb-2">
                Danger Zone
              </h3>
              <p className="text-xs text-red-600/70">
                Actions that can't be undone. Delete this task permanently from the project.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full shadow-sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="size-4 mr-2" />
                Delete Task
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the task
              <strong> {task.title}</strong> and all its comments and activity history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
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
