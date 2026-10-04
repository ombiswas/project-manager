import type { Task } from "@/types";
import { Link, useSearchParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";

export const UpcomingTasks = ({ data }: { data: Task[] }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <Card className="bg-[#191919] border border-[#212327] rounded-[8px] shadow-none">
      <CardHeader className="pb-3 border-b border-[#212327]">
        <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
          Upcoming Tasks
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-2.5">
        {data.length === 0 ? (
          <p className="text-center text-xs text-[#7d8187] py-8 font-mono">
            NO UPCOMING TASKS
          </p>
        ) : (
          data.map((task) => (
            <Link
              to={`/workspaces/${workspaceId}/projects/${task.project}/tasks/${task._id}`}
              key={task._id}
              className="flex items-center justify-between p-3 rounded-[8px] border border-[#212327] bg-[#141517] hover:border-[#363a3f] transition-colors group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={cn(
                    "rounded-full p-1 border flex items-center justify-center shrink-0",
                    task.priority === "High" && "border-[#ff7a17]/40 text-[#ff7a17] bg-[#ff7a17]/10",
                    task.priority === "Medium" && "border-[#a0c3ec]/40 text-[#a0c3ec] bg-[#a0c3ec]/10",
                    task.priority === "Low" && "border-[#212327] text-[#7d8187] bg-[#1a1c20]"
                  )}
                >
                  {task.status === "Done" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-normal text-white truncate group-hover:text-white/80 transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center text-xs font-mono text-[#7d8187] space-x-2">
                    <span className="uppercase">{task.status}</span>
                    {task.dueDate && (
                      <>
                        <span>•</span>
                        <span>{format(new Date(task.dueDate), "MMM d")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <span
                className={cn(
                  "text-[10px] font-mono uppercase tracking-[1px] px-2 py-0.5 rounded-full border shrink-0 ml-2",
                  task.priority === "High" && "text-[#ff7a17] border-[#ff7a17]/30 bg-[#ff7a17]/5",
                  task.priority === "Medium" && "text-[#a0c3ec] border-[#a0c3ec]/30 bg-[#a0c3ec]/5",
                  task.priority === "Low" && "text-[#7d8187] border-[#212327] bg-[#1a1c20]"
                )}
              >
                {task.priority}
              </span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
};
