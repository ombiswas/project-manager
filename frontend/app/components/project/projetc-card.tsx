import type { Project } from "@/types";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { getTaskStatusColor } from "@/lib";
import { Progress } from "../ui/progress";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  progress: number;
  workspaceId: string;
}

export const ProjectCard = ({
  project,
  progress,
  workspaceId,
}: ProjectCardProps) => {
  return (
    <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
      <Card className="transition-all duration-300 hover:shadow-md hover:translate-y-1 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-bold line-clamp-1">{project.title}</CardTitle>
            <span
              className={cn(
                "text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap uppercase tracking-tight",
                getTaskStatusColor(project.status)
              )}
            >
              {project.status}
            </span>
          </div>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {project.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Progress</span>
              <span className="text-blue-600">{progress}%</span>
            </div>

            <Progress value={progress} className="h-1.5" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center text-xs gap-1.5 text-muted-foreground font-medium">
              <span className="text-foreground font-bold">{project.tasks.length}</span>
              <span>Tasks</span>
            </div>

            {project.dueDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md">
                <CalendarDays className="size-3.5" />
                <span>{format(new Date(project.dueDate), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
