import type { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getProjectProgress, getTaskStatusColor } from "@/lib";
import { Link, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

export const RecentProjects = ({ data }: { data: Project[] }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <Card className="bg-[#191919] border border-[#212327] rounded-[8px] shadow-none">
      <CardHeader className="pb-3 border-b border-[#212327]">
        <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
          Recent Projects
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {data.length === 0 ? (
          <p className="text-center text-xs text-[#7d8187] py-8 font-mono">
            NO RECENT PROJECTS
          </p>
        ) : (
          data.map((project) => {
            const projectProgress = getProjectProgress(project.tasks);

            return (
              <div
                key={project._id}
                className="border border-[#212327] rounded-[8px] bg-[#141517] p-4 hover:border-[#363a3f] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/workspaces${workspaceId}/projects/${project._id}`}
                  >
                    <h3 className="text-sm font-normal text-white hover:text-white/70 transition-colors">
                      {project.title}
                    </h3>
                  </Link>

                  <span
                    className={cn(
                      "px-2.5 py-0.5 text-[11px] rounded-full",
                      getTaskStatusColor(project.status)
                    )}
                  >
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-xs text-[#7d8187] mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#7d8187]">PROGRESS</span>
                    <span className="text-white">{projectProgress}%</span>
                  </div>

                  <Progress value={projectProgress} className="h-1.5" />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
