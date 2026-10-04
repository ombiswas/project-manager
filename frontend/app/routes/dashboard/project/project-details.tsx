import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { ErrorState } from "@/components/error-state";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import { getProjectProgress, getTaskStatusColor } from "@/lib";
import { getErrorMessage } from "@/lib/fetch-util";
import { cn } from "@/lib/utils";
import type {
  ProjectTasksResponse,
  Task,
  TaskStatus,
  Workspace,
} from "@/types";
import { format } from "date-fns";
import { CheckCircle, Clock, Plus, Settings, CircleDashed } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const TopProgressBar = () => (
  <div
    role="progressbar"
    aria-label="Updating project..."
    className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-gradient-to-r from-transparent via-[#ff7a17] to-transparent animate-pulse"
  />
);

const ProjectDetailsSkeleton = () => (
  <div
    className="space-y-6 animate-pulse"
    aria-busy="true"
    aria-label="Loading project details"
  >
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-20 bg-[#1a1c20] rounded-[8px]" />
        <div className="mt-2 space-y-2">
          <div className="h-3 w-16 bg-[#1a1c20] rounded-[8px]" />
          <div className="h-8 w-48 bg-[#1a1c20] rounded-[8px]" />
          <div className="h-4 w-72 bg-[#1a1c20] rounded-[8px]" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-48 bg-[#141517] border border-[#212327] rounded-[8px]" />
        <div className="h-9 w-24 bg-[#1a1c20] rounded-full" />
      </div>
    </div>

    {/* Tabs skeleton */}
    <div className="h-10 w-72 bg-[#141517] border border-[#212327] rounded-[8px]" />

    {/* Task cards skeleton */}
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-[#141517] border border-[#212327] rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 h-[72px]"
        >
          <div className="flex items-center gap-3">
            <div className="size-5 rounded-full bg-[#1a1c20]" />
            <div className="h-4 w-56 bg-[#1a1c20] rounded-[8px]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-[#1a1c20] rounded-full" />
            <div className="h-5 w-14 bg-[#1a1c20] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProjectDetails = () => {
  const { user } = useAuth();
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const [isCreateTask, setIsCreateTask] = useState(false);
  const [, setTaskFilter] = useState("All");

  const { data, isLoading, isFetching, isError, error, refetch } = UseProjectQuery(
    projectId!
  ) as {
    data: ProjectTasksResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
  const { data: workspaceData, isLoading: isLoadingWorkspace } =
    useGetWorkspaceDetailsQuery(workspaceId!) as {
      data: Workspace | undefined;
      isLoading: boolean;
    };

  // Render skeleton loader only when there is no data yet
  if ((isLoading && !data) || (isLoadingWorkspace && !workspaceData)) {
    return <ProjectDetailsSkeleton />;
  }

  if (isError || !data?.project) {
    return (
      <div className="space-y-4 py-8">
        <BackButton className="w-fit" />
        <ErrorState
          title="Failed to load project"
          message={getErrorMessage(
            error,
            "The requested project could not be found or loaded."
          )}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const { project, tasks } = data;
  const projectProgress = getProjectProgress(tasks || []);

  // Permission logic
  const currentUserId = String(
    user?._id || (user as { id?: string })?.id || ""
  );

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

  const projectCreatorId =
    typeof project.createdBy === "string"
      ? project.createdBy
      : project.createdBy?._id || "";
  const isProjectCreator = projectCreatorId === currentUserId;
  const isProjectMember = (project.members || []).some(
    (m) => String((m as { _id?: string })?._id || m) === currentUserId
  );

  const isOwnerOrAdmin =
    currentUserWorkspaceRole === "owner" ||
    currentUserWorkspaceRole === "admin" ||
    isWorkspaceOwner;

  // Viewers have strictly read-only access and cannot add or edit tasks
  const isViewer = currentUserWorkspaceRole === "viewer";

  const canDelete = isOwnerOrAdmin;
  const canUpdate = isOwnerOrAdmin;

  const canManage = canUpdate || canDelete;
  // Non-viewers who are admins, owners, project creator, or project members can add/edit tasks
  const canEditTasks = !isViewer && (isOwnerOrAdmin || isProjectCreator || isProjectMember);

  // Derive a flat User[] list of all workspace members for the assignee selector
  const workspaceMembers = (workspaceData?.members || []).flatMap((m) => {
    const u = m.user as { _id?: string; name?: string; email?: string; profilePicture?: string } | string | undefined;
    if (!u || typeof u === "string") return [];
    return [{ _id: u._id || "", name: u.name || "", email: u.email || "", profilePicture: u.profilePicture || "" }];
  }) as import("@/types").User[];

  const handleTaskClick = (taskId: string) => {
    navigate(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
    );
  };

  return (
    <>
      {isFetching && <TopProgressBar />}
      <div
        className={cn(
          "space-y-6 transition-opacity duration-200",
          isFetching ? "opacity-75" : "opacity-100"
        )}
      >
        {isError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[8px] flex items-center justify-between text-xs text-red-400">
            <span>{getErrorMessage(error, "Failed to refresh project details.")}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <BackButton className="w-fit" />
          <div className="mt-2">
            <p className="caption-mono text-xs text-[#7d8187]">PROJECT</p>
            <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-sm text-[#dadbdf] mt-2 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 w-full sm:w-64 bg-[#191919] border border-[#212327] rounded-[8px] p-3">
            <span className="text-xs font-mono uppercase tracking-[1px] text-[#7d8187] whitespace-nowrap">
              PROGRESS
            </span>
            <Progress value={projectProgress} className="h-1.5 flex-1" />
            <span className="font-mono text-xs text-white min-w-[2.5rem] text-right">
              {projectProgress}%
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {canEditTasks && (
              <Button
                onClick={() => setIsCreateTask(true)}
                className="flex-1 sm:flex-none"
              >
                <Plus className="size-4 mr-2" />
                Add Task
              </Button>
            )}

            {canManage && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() =>
                  navigate(
                    `/workspaces/${workspaceId}/projects/${projectId}/settings`
                  )
                }
                title="Project Settings"
              >
                <Settings className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
              <TabsList className="bg-[#141517] border border-[#212327] h-auto p-1 w-max sm:w-auto">
                <TabsTrigger value="all" onClick={() => setTaskFilter("All")} className="text-xs px-3 py-1.5">
                  All Tasks
                </TabsTrigger>
                <TabsTrigger value="todo" onClick={() => setTaskFilter("To Do")} className="text-xs px-3 py-1.5">
                  To Do
                </TabsTrigger>
                <TabsTrigger
                  value="in-progress"
                  onClick={() => setTaskFilter("In Progress")}
                  className="text-xs px-3 py-1.5"
                >
                  In Progress
                </TabsTrigger>
                <TabsTrigger value="done" onClick={() => setTaskFilter("Done")} className="text-xs px-3 py-1.5">
                  Done
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                OVERVIEW
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase"
                >
                  {tasks.filter((task) => task.status === "To Do").length} To Do
                </Badge>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase"
                >
                  {tasks.filter((task) => task.status === "In Progress").length}{" "}
                  In Progress
                </Badge>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase"
                >
                  {tasks.filter((task) => task.status === "Done").length} Done
                </Badge>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TaskColumn
                title="To Do"
                tasks={tasks.filter((task) => task.status === "To Do")}
                onTaskClick={handleTaskClick}
                canEditTasks={canEditTasks}
              />

              <TaskColumn
                title="In Progress"
                tasks={tasks.filter((task) => task.status === "In Progress")}
                onTaskClick={handleTaskClick}
                canEditTasks={canEditTasks}
              />

              <TaskColumn
                title="Done"
                tasks={tasks.filter((task) => task.status === "Done")}
                onTaskClick={handleTaskClick}
                canEditTasks={canEditTasks}
              />
            </div>
          </TabsContent>

          <TabsContent value="todo" className="m-0">
            <TaskColumn
              title="To Do"
              tasks={tasks.filter((task) => task.status === "To Do")}
              onTaskClick={handleTaskClick}
              isFullWidth
              canEditTasks={canEditTasks}
            />
          </TabsContent>

          <TabsContent value="in-progress" className="m-0">
            <TaskColumn
              title="In Progress"
              tasks={tasks.filter((task) => task.status === "In Progress")}
              onTaskClick={handleTaskClick}
              isFullWidth
              canEditTasks={canEditTasks}
            />
          </TabsContent>

          <TabsContent value="done" className="m-0">
            <TaskColumn
              title="Done"
              tasks={tasks.filter((task) => task.status === "Done")}
              onTaskClick={handleTaskClick}
              isFullWidth
              canEditTasks={canEditTasks}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* create task dialog */}
      {canEditTasks && (
        <CreateTaskDialog
          open={isCreateTask}
          onOpenChange={setIsCreateTask}
          projectId={projectId!}
          projectMembers={workspaceMembers}
        />
      )}
      </div>
    </>
  );
};

export default ProjectDetails;

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  isFullWidth?: boolean;
  canEditTasks: boolean;
}

const TaskColumn = ({
  title,
  tasks,
  onTaskClick,
  isFullWidth = false,
  canEditTasks,
}: TaskColumnProps) => {
  return (
    <div className={cn("space-y-3", isFullWidth && "w-full")}>
      {!isFullWidth && (
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
            {title}
          </h2>
          <Badge variant="outline" className="font-mono text-[10px]">
            {tasks.length}
          </Badge>
        </div>
      )}

      <div
        className={cn(
          "space-y-3",
          isFullWidth && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        )}
      >
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-[#141517] border border-[#212327] rounded-[8px] text-xs font-mono text-[#7d8187]">
            NO TASKS IN STAGE
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task._id)}
              canEditTasks={canEditTasks}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TaskCard = ({
  task,
  onClick,
  canEditTasks,
}: {
  task: Task;
  onClick: () => void;
  canEditTasks: boolean;
}) => {
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateTaskStatusMutation();

  const handleStatusUpdate = (e: React.MouseEvent, status: TaskStatus) => {
    e.stopPropagation();
    updateStatus(
      { taskId: task._id, status },
      {
        onSuccess: () => {
          toast.success(`Task marked as ${status}`);
        },
      }
    );
  };

  return (
    <Card
      onClick={onClick}
      className="group relative cursor-pointer bg-[#191919] border border-[#212327] rounded-[8px] p-4 shadow-none hover:border-[#363a3f] transition-colors flex flex-col gap-3"
    >
      {/* Top Row: Badges & Buttons */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full",
              getTaskStatusColor(task.status)
            )}
          >
            {task.status}
          </span>

          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-[1px] px-2 py-0.5 rounded-full border",
              task.priority === "High" &&
                "text-[#ff7a17] border-[#ff7a17]/30 bg-[#ff7a17]/10",
              task.priority === "Medium" &&
                "text-[#a0c3ec] border-[#a0c3ec]/30 bg-[#a0c3ec]/10",
              task.priority === "Low" &&
                "text-[#7d8187] border-[#212327] bg-[#1a1c20]"
            )}
          >
            {task.priority}
          </span>
        </div>

        {canEditTasks && (
          <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity static sm:absolute sm:right-3 sm:top-3 bg-[#141517] border border-[#212327] rounded-full p-0.5 shrink-0">
            {task.status !== "To Do" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 rounded-full text-[#7d8187] hover:text-white hover:bg-[#1a1c20]"
                onClick={(e) => handleStatusUpdate(e, "To Do")}
                disabled={isUpdating}
                title="Mark as To Do"
              >
                <CircleDashed className="size-3" />
              </Button>
            )}
            {task.status !== "In Progress" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 rounded-full text-[#7d8187] hover:text-[#a0c3ec] hover:bg-[#1a1c20]"
                onClick={(e) => handleStatusUpdate(e, "In Progress")}
                disabled={isUpdating}
                title="Mark as In Progress"
              >
                <Clock className="size-3" />
              </Button>
            )}
            {task.status !== "Done" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 rounded-full text-[#7d8187] hover:text-white hover:bg-[#1a1c20]"
                onClick={(e) => handleStatusUpdate(e, "Done")}
                disabled={isUpdating}
                title="Mark as Done"
              >
                <CheckCircle className="size-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h3
          className="font-normal text-sm text-white line-clamp-2 leading-snug group-hover:text-white/80 transition-colors"
          title={task.title}
        >
          {task.title}
        </h3>
        {task.description && (
          <p
            className="text-xs text-[#7d8187] line-clamp-2 mt-1 leading-relaxed"
            title={task.description}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between pt-2 border-t border-[#212327] text-xs font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#7d8187] uppercase tracking-[0.5px]">
            Start
          </span>
          <span className="text-white">
            {task.createdAt ? format(new Date(task.createdAt), "MMM d") : "N/A"}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-[#7d8187] uppercase tracking-[0.5px]">
            Due
          </span>
          <span
            className={cn(
              new Date(task.dueDate) < new Date() && task.status !== "Done"
                ? "text-[#ff7a17]"
                : "text-white"
            )}
          >
            {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "N/A"}
          </span>
        </div>
      </div>

      {/* Profiles */}
      {task.assignees && task.assignees.length > 0 && (
        <div className="flex items-center pt-1">
          <div className="flex -space-x-1.5">
            {task.assignees?.slice(0, 3).map((member) => (
              <Avatar
                key={member._id}
                className="size-6 border border-[#212327] bg-[#1a1c20]"
                title={member.name}
              >
                <AvatarImage src={member.profilePicture} />
                <AvatarFallback className="text-[9px] font-mono bg-[#1a1c20] text-white">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignees.length > 3 && (
              <div className="size-6 rounded-full bg-[#1a1c20] flex items-center justify-center text-[9px] font-mono border border-[#212327] text-[#7d8187]">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
