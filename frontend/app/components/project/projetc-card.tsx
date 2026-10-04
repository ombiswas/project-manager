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
    <Link to={`/workspaces/${workspaceId}/projects/${project._id}`} className="group block h-full">
      <Card className="bg-[#191919] border border-[#212327] rounded-[8px] p-5 shadow-none hover:border-[#363a3f] transition-colors h-full flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-base font-normal text-white group-hover:text-white/80 transition-colors line-clamp-1">
              {project.title}
            </h3>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full shrink-0",
                getTaskStatusColor(project.status)
              )}
            >
              {project.status}
            </span>
          </div>

          <p className="text-xs text-[#7d8187] line-clamp-2 min-h-[2rem] mb-4">
            {project.description || "No description provided."}
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono uppercase tracking-[1px]">
              <span className="text-[#7d8187]">PROGRESS</span>
              <span className="text-white">{progress}%</span>
            </div>

            <Progress value={progress} className="h-1.5" />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#212327]">
            <div className="flex items-center text-xs font-mono text-[#7d8187] gap-1.5">
              <span className="text-white">{project.tasks.length}</span>
              <span>TASKS</span>
            </div>

            {project.dueDate && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#7d8187] bg-[#1a1c20] border border-[#212327] px-2 py-0.5 rounded-full">
                <CalendarDays className="size-3 text-[#7d8187]" />
                <span>{format(new Date(project.dueDate), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
