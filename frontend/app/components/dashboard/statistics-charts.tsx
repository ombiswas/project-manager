import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

export const StatisticsCharts = ({
  stats,
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="lg:col-span-2 bg-[#191919] border border-[#212327] rounded-[8px] shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#212327]">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
              Task Trends
            </CardTitle>
            <p className="text-xs text-[#dadbdf]">Daily task status activity</p>
          </div>
          <ChartLine className="size-4 text-[#7d8187]" />
        </CardHeader>
        <CardContent className="w-full pt-4 overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[280px]"
              config={{
                completed: { label: "Completed", color: "#ffffff" },
                inProgress: { label: "In Progress", color: "#a0c3ec" },
                todo: { label: "To Do", color: "#7d8187" },
              }}
            >
              <LineChart data={taskTrendsData}>
                <XAxis
                  dataKey={"name"}
                  stroke="#7d8187"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                />
                <YAxis
                  stroke="#7d8187"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                />

                <CartesianGrid stroke="#212327" strokeDasharray={"3 3"} vertical={false} />
                <ChartTooltip />

                <Line
                  type="monotone"
                  dataKey={"completed"}
                  stroke="#ffffff"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#ffffff" }}
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#a0c3ec"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#a0c3ec" }}
                />
                <Line
                  type="monotone"
                  dataKey="todo"
                  stroke="#7d8187"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#7d8187" }}
                />

                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* project status  */}
      <Card className="bg-[#191919] border border-[#212327] rounded-[8px] shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#212327]">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
              Project Status
            </CardTitle>
            <p className="text-xs text-[#dadbdf]">Active portfolio distribution</p>
          </div>

          <ChartPie className="size-4 text-[#7d8187]" />
        </CardHeader>

        <CardContent className="w-full pt-4 overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[280px]"
              config={{
                Completed: { label: "Completed", color: "#ffffff" },
                "In Progress": { label: "In Progress", color: "#a0c3ec" },
                Planning: { label: "Planning", color: "#c4b5fd" },
              }}
            >
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  label={({ name, percent = 0 }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                  className="font-mono text-[11px]"
                >
                  {projectStatusData.map((entry, index) => {
                    const color =
                      entry.name === "Completed"
                        ? "#ffffff"
                        : entry.name === "In Progress"
                        ? "#a0c3ec"
                        : "#c4b5fd";
                    return <Cell key={`cell-${index}`} fill={color} stroke="#191919" strokeWidth={2} />;
                  })}
                </Pie>
                <ChartTooltip />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* task priority  */}
      <Card className="bg-[#191919] border border-[#212327] rounded-[8px] shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#212327]">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
              Task Priority
            </CardTitle>
            <p className="text-xs text-[#dadbdf]">Priority load balancing</p>
          </div>
        </CardHeader>

        <CardContent className="w-full pt-4 overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[280px]"
              config={{
                High: { label: "High", color: "#ff7a17" },
                Medium: { label: "Medium", color: "#a0c3ec" },
                Low: { label: "Low", color: "#7d8187" },
              }}
            >
              <PieChart>
                <Pie
                  data={taskPriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent = 0 }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  className="font-mono text-[11px]"
                >
                  {taskPriorityData?.map((entry, index) => {
                    const color =
                      entry.name === "High"
                        ? "#ff7a17"
                        : entry.name === "Medium"
                        ? "#a0c3ec"
                        : "#7d8187";
                    return <Cell key={`cell-${index}`} fill={color} stroke="#191919" strokeWidth={2} />;
                  })}
                </Pie>
                <ChartTooltip />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Productivity Chart */}
      <Card className="lg:col-span-2 bg-[#191919] border border-[#212327] rounded-[8px] shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#212327]">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
              Workspace Productivity
            </CardTitle>
            <p className="text-xs text-[#dadbdf]">Task completion volume by project</p>
          </div>
          <ChartBarBig className="h-4 w-4 text-[#7d8187]" />
        </CardHeader>
        <CardContent className="w-full pt-4 overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[280px]"
              config={{
                completed: { label: "Completed", color: "#a0c3ec" },
                total: { label: "Total Tasks", color: "#363a3f" },
              }}
            >
              <BarChart
                data={workspaceProductivityData}
                barGap={4}
                barSize={16}
              >
                <XAxis
                  dataKey="name"
                  stroke="#7d8187"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                />
                <YAxis
                  stroke="#7d8187"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                />
                <CartesianGrid stroke="#212327" strokeDasharray="3 3" vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill="#363a3f"
                  radius={[4, 4, 0, 0]}
                  name="Total Tasks"
                />
                <Bar
                  dataKey="completed"
                  fill="#a0c3ec"
                  radius={[4, 4, 0, 0]}
                  name="Completed Tasks"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
