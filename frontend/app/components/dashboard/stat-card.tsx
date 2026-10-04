import type { StatsCardProps } from "@/types";
import { Card } from "../ui/card";

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-[#191919] border border-[#212327] rounded-[8px] p-5 shadow-none hover:border-[#363a3f] transition-colors">
        <div className="flex flex-col justify-between space-y-3">
          <p className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
            Total Projects
          </p>
          <div>
            <div className="font-mono text-3xl font-normal tracking-tight text-white">
              {data.totalProjects}
            </div>
            <p className="text-xs text-[#7d8187] mt-1">
              <span className="text-[#dadbdf] font-mono">
                {data.totalProjectInProgress}
              </span>{" "}
              in progress
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-[#191919] border border-[#212327] rounded-[8px] p-5 shadow-none hover:border-[#363a3f] transition-colors">
        <div className="flex flex-col justify-between space-y-3">
          <p className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
            Total Tasks
          </p>
          <div>
            <div className="font-mono text-3xl font-normal tracking-tight text-white">
              {data.totalTasks}
            </div>
            <p className="text-xs text-[#7d8187] mt-1">
              <span className="text-[#dadbdf] font-mono">
                {data.totalTaskCompleted}
              </span>{" "}
              completed
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-[#191919] border border-[#212327] rounded-[8px] p-5 shadow-none hover:border-[#363a3f] transition-colors">
        <div className="flex flex-col justify-between space-y-3">
          <p className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
            To Do
          </p>
          <div>
            <div className="font-mono text-3xl font-normal tracking-tight text-white">
              {data.totalTaskToDo}
            </div>
            <p className="text-xs text-[#7d8187] mt-1">
              Tasks waiting to be done
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-[#191919] border border-[#212327] rounded-[8px] p-5 shadow-none hover:border-[#363a3f] transition-colors">
        <div className="flex flex-col justify-between space-y-3">
          <p className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
            In Progress
          </p>
          <div>
            <div className="font-mono text-3xl font-normal tracking-tight text-white">
              {data.totalTaskInProgress}
            </div>
            <p className="text-xs text-[#7d8187] mt-1">
              Tasks currently in progress
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
