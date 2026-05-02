import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock, Plus, Settings, CircleDashed } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const ProjectDetails = () => {
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const [isCreateTask, setIsCreateTask] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");

  const { data, isLoading } = UseProjectQuery(projectId!) as {
    data: {
      tasks: Task[];
      project: Project;
    };
    isLoading: boolean;
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader label="Loading project details..." />
      </div>
    );

  if (!data) return null;

  const { project, tasks } = data;
  const projectProgress = getProjectProgress(tasks);

  const handleTaskClick = (taskId: string) => {
    navigate(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <BackButton className="w-fit" />
          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-4 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-64">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Progress:
            </span>
            <Progress value={projectProgress} className="h-2 flex-1" />
            <span className="text-sm font-bold text-blue-600 min-w-[3rem] text-right">
              {projectProgress}%
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setIsCreateTask(true)} 
              className="flex-1 sm:flex-none shadow-sm"
            >
              <Plus className="size-4 mr-2" />
              Add Task
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="shadow-sm"
              onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/settings`)}
              title="Project Settings"
            >
              <Settings className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" onClick={() => setTaskFilter("All")}>
                All Tasks
              </TabsTrigger>
              <TabsTrigger value="todo" onClick={() => setTaskFilter("To Do")}>
                To Do
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                onClick={() => setTaskFilter("In Progress")}
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger value="done" onClick={() => setTaskFilter("Done")}>
                Done
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Overview:
              </span>
              <div className="flex gap-1">
                <Badge variant="outline" className="bg-background/50 text-[10px]">
                  {tasks.filter((task) => task.status === "To Do").length} To Do
                </Badge>
                <Badge variant="outline" className="bg-background/50 text-[10px]">
                  {tasks.filter((task) => task.status === "In Progress").length}{" "}
                  In Progress
                </Badge>
                <Badge variant="outline" className="bg-background/50 text-[10px]">
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
              />

              <TaskColumn
                title="In Progress"
                tasks={tasks.filter((task) => task.status === "In Progress")}
                onTaskClick={handleTaskClick}
              />

              <TaskColumn
                title="Done"
                tasks={tasks.filter((task) => task.status === "Done")}
                onTaskClick={handleTaskClick}
              />
            </div>
          </TabsContent>

          <TabsContent value="todo" className="m-0">
            <TaskColumn
              title="To Do"
              tasks={tasks.filter((task) => task.status === "To Do")}
              onTaskClick={handleTaskClick}
              isFullWidth
            />
          </TabsContent>

          <TabsContent value="in-progress" className="m-0">
            <TaskColumn
              title="In Progress"
              tasks={tasks.filter((task) => task.status === "In Progress")}
              onTaskClick={handleTaskClick}
              isFullWidth
            />
          </TabsContent>

          <TabsContent value="done" className="m-0">
            <TaskColumn
              title="Done"
              tasks={tasks.filter((task) => task.status === "Done")}
              onTaskClick={handleTaskClick}
              isFullWidth
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* create task dialog */}
      <CreateTaskDialog
        open={isCreateTask}
        onOpenChange={setIsCreateTask}
        projectId={projectId!}
        projectMembers={project.members as any}
      />
    </div>
  );
};

export default ProjectDetails;

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  isFullWidth?: boolean;
}

const TaskColumn = ({
  title,
  tasks,
  onTaskClick,
  isFullWidth = false,
}: TaskColumnProps) => {
  return (
    <div className={cn("space-y-4", isFullWidth && "w-full")}>
      {!isFullWidth && (
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h2>
          <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-[10px]">
            {tasks.length}
          </Badge>
        </div>
      )}

      <div
        className={cn(
          "space-y-4",
          isFullWidth && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        )}
      >
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 border border-dashed rounded-lg text-sm text-muted-foreground">
            No tasks in this stage
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ task, onClick }: { task: Task; onClick: () => void }) => {
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateTaskStatusMutation();

  const handleStatusUpdate = (e: React.MouseEvent, status: TaskStatus) => {
    e.stopPropagation();
    updateStatus({ taskId: task._id, status }, {
      onSuccess: () => {
        toast.success(`Task marked as ${status}`);
      }
    });
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Determine the accent color based on status
  const getAccentColor = () => {
    if (task.status === "Done") return "border-l-green-500";
    if (task.status === "In Progress") return "border-l-blue-500";
    return "border-l-slate-300";
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer hover:shadow-lg transition-all duration-300 bg-card border border-l-[4px] shadow-sm flex flex-col gap-4 p-5 rounded-xl",
        getAccentColor()
      )}
    >
      {/* Top Row: Badges & Buttons */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            className={cn(
              "text-[11px] font-semibold tracking-tight border-none px-2.5 py-0.5",
              task.status === "Done" && "bg-green-100 text-green-700 hover:bg-green-100",
              task.status === "In Progress" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
              task.status === "To Do" && "bg-slate-100 text-slate-700 hover:bg-slate-100"
            )}
          >
            {task.status === "Done" ? "Completed" : task.status}
          </Badge>

          <Badge
            variant="secondary"
            className={cn(
              "text-[11px] font-semibold tracking-tight border-none px-2.5 py-0.5",
              task.priority === "High" && "bg-red-100 text-red-700 hover:bg-red-100",
              task.priority === "Medium" && "bg-orange-100 text-orange-700 hover:bg-orange-100",
              task.priority === "Low" && "bg-slate-100 text-slate-700 hover:bg-slate-100"
            )}
          >
            {task.priority} Priority
          </Badge>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-card/80 backdrop-blur-sm rounded-full p-0.5">
          {task.status !== "To Do" && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full hover:bg-slate-100 hover:text-slate-600"
              onClick={(e) => handleStatusUpdate(e, "To Do")}
              disabled={isUpdating}
              title="Mark as To Do"
            >
              <CircleDashed className="size-3.5" />
            </Button>
          )}
          {task.status !== "In Progress" && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full hover:bg-blue-50 hover:text-blue-600"
              onClick={(e) => handleStatusUpdate(e, "In Progress")}
              disabled={isUpdating}
              title="Mark as In Progress"
            >
              <Clock className="size-3.5" />
            </Button>
          )}
          {task.status !== "Done" && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full hover:bg-green-50 hover:text-green-600"
              onClick={(e) => handleStatusUpdate(e, "Done")}
              disabled={isUpdating}
              title="Mark as Done"
            >
              <CheckCircle className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="font-bold text-[15px] line-clamp-2 leading-tight mb-1.5 text-foreground" title={task.title}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed" title={task.description}>
            {task.description}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-muted/40 my-1"></div>

      {/* Dates */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground font-medium mb-1">Start Date</span>
          <span className="text-sm font-bold text-foreground">
            {task.createdAt ? format(new Date(task.createdAt), "do MMM yyyy") : "N/A"}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] text-muted-foreground font-medium mb-1">Due Date</span>
          <span className={cn(
            "text-sm font-bold",
            new Date(task.dueDate) < new Date() && task.status !== "Done" 
              ? "text-red-600" 
              : "text-foreground"
          )}>
            {task.dueDate ? format(new Date(task.dueDate), "do MMM yyyy") : "N/A"}
          </span>
        </div>
      </div>

      {/* Profiles */}
      <div className="flex items-center mt-1">
        <div className="flex -space-x-2">
          {task.assignees?.slice(0, 3).map((member) => (
            <Avatar
              key={member._id}
              className="size-8 border-2 border-background shadow-sm"
              title={member.name}
            >
              <AvatarImage src={member.profilePicture} />
              <AvatarFallback className="text-[10px] bg-slate-100 font-bold text-slate-600">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
          {task.assignees && task.assignees.length > 3 && (
            <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold border-2 border-background shadow-sm text-slate-600">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
