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
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  ResponsiveContainer,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
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

const truncateLabel = (val: string) => {
  if (!val) return "";
  return val.length > 8 ? `${val.slice(0, 7)}…` : val;
};

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#141517] border border-[#212327] rounded-[6px] px-3 py-2 text-xs font-mono shadow-xl z-50">
      {label && <p className="text-[#dadbdf] mb-1.5 font-normal">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-[#7d8187] capitalize">{entry.name}:</span>
            <span className="text-white font-normal">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  if (!item || item.name === "No data") return null;
  return (
    <div className="bg-[#141517] border border-[#212327] rounded-[6px] px-3 py-2 text-xs font-mono shadow-xl z-50">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full shrink-0"
          style={{ backgroundColor: item.payload?.fill || item.color }}
        />
        <span className="text-[#7d8187]">{item.name}:</span>
        <span className="text-white font-normal">{item.value}</span>
      </div>
    </div>
  );
};

export const StatisticsCharts = ({
  stats,
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  const totalProjects =
    stats?.totalProjects ??
    projectStatusData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  const totalTasks =
    stats?.totalTasks ??
    taskPriorityData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  const projectStatusColors: Record<string, string> = {
    Completed: "#ffffff",
    "In Progress": "#a0c3ec",
    Planning: "#c4b5fd",
  };

  const taskPriorityColors: Record<string, string> = {
    High: "#ff7a17",
    Medium: "#a0c3ec",
    Low: "#7d8187",
  };

  // Filter out zero-value slices for the pie rendering
  const filteredProjectData = projectStatusData.filter((item) => item.value > 0);
  const pieProjectData =
    filteredProjectData.length > 0
      ? filteredProjectData
      : [{ name: "No data", value: 1, color: "#212327" }];

  const filteredPriorityData = taskPriorityData.filter((item) => item.value > 0);
  const piePriorityData =
    filteredPriorityData.length > 0
      ? filteredPriorityData
      : [{ name: "No data", value: 1, color: "#212327" }];

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* 1. Task Trends */}
      <Card className="min-w-0 md:col-span-2 lg:col-span-2 bg-[#191919] border border-[#212327] rounded-[8px] shadow-none flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#212327]">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
              Task Trends
            </CardTitle>
            <p className="text-xs text-[#dadbdf]">Daily task status activity</p>
          </div>
          <ChartLine className="size-4 text-[#7d8187]" />
        </CardHeader>
        <CardContent className="w-full pt-4 min-w-0 flex flex-col justify-between flex-1">
          <div className="w-full min-w-0 h-[260px] sm:h-[300px] lg:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={taskTrendsData}
                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#7d8187"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                  tickFormatter={truncateLabel}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#7d8187"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                />
                <CartesianGrid
                  stroke="#212327"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <Tooltip
                  content={<CustomChartTooltip />}
                  wrapperStyle={{ outline: "none", zIndex: 50 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#ffffff"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#ffffff" }}
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  name="In Progress"
                  stroke="#a0c3ec"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#a0c3ec" }}
                />
                <Line
                  type="monotone"
                  dataKey="todo"
                  name="To Do"
                  stroke="#7d8187"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#7d8187" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-3 border-t border-[#212327] mt-auto">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="size-2 rounded-full bg-[#ffffff] shrink-0" />
              <span className="text-[#7d8187]">Completed</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="size-2 rounded-full bg-[#a0c3ec] shrink-0" />
              <span className="text-[#7d8187]">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="size-2 rounded-full bg-[#7d8187] shrink-0" />
              <span className="text-[#7d8187]">To Do</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Project Status */}
      <Card className="min-w-0 md:col-span-1 lg:col-span-1 bg-[#191919] border border-[#212327] rounded-[8px] shadow-none flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#212327]">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
              Project Status
            </CardTitle>
            <p className="text-xs text-[#dadbdf]">
              Active portfolio distribution
            </p>
          </div>
          <ChartPie className="size-4 text-[#7d8187]" />
        </CardHeader>

        <CardContent className="w-full pt-4 min-w-0 flex flex-col justify-between flex-1">
          <div className="w-full min-w-0 h-[260px] sm:h-[300px] lg:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieProjectData}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="78%"
                  paddingAngle={filteredProjectData.length > 1 ? 3 : 0}
                  stroke="#191919"
                  strokeWidth={2}
                >
                  {pieProjectData.map((entry, index) => {
                    const color =
                      projectStatusColors[entry.name] || entry.color || "#7d8187";
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={filteredProjectData.length > 0 ? color : "#212327"}
                        stroke="#191919"
                        strokeWidth={2}
                      />
                    );
                  })}
                </Pie>
                {filteredProjectData.length > 0 && (
                  <Tooltip
                    content={<CustomPieTooltip />}
                    wrapperStyle={{ outline: "none", zIndex: 50 }}
                  />
                )}
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white font-mono text-2xl font-normal"
                >
                  {totalProjects}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-[#7d8187] font-mono text-xs uppercase tracking-wider"
                >
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* HTML flex-wrap legend showing name and count (including zero-value categories) */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-3 border-t border-[#212327] mt-auto">
            {projectStatusData.map((item) => {
              const color =
                projectStatusColors[item.name] || item.color || "#ffffff";
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 text-xs font-mono"
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[#7d8187]">{item.name}:</span>
                  <span className="text-white font-normal">{item.value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Task Priority */}
      <Card className="min-w-0 md:col-span-1 lg:col-span-1 bg-[#191919] border border-[#212327] rounded-[8px] shadow-none flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#212327]">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
              Task Priority
            </CardTitle>
            <p className="text-xs text-[#dadbdf]">Priority load balancing</p>
          </div>
        </CardHeader>

        <CardContent className="w-full pt-4 min-w-0 flex flex-col justify-between flex-1">
          <div className="w-full min-w-0 h-[260px] sm:h-[300px] lg:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={piePriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="78%"
                  paddingAngle={filteredPriorityData.length > 1 ? 3 : 0}
                  dataKey="value"
                  nameKey="name"
                  stroke="#191919"
                  strokeWidth={2}
                >
                  {piePriorityData.map((entry, index) => {
                    const color =
                      taskPriorityColors[entry.name] || entry.color || "#7d8187";
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={filteredPriorityData.length > 0 ? color : "#212327"}
                        stroke="#191919"
                        strokeWidth={2}
                      />
                    );
                  })}
                </Pie>
                {filteredPriorityData.length > 0 && (
                  <Tooltip
                    content={<CustomPieTooltip />}
                    wrapperStyle={{ outline: "none", zIndex: 50 }}
                  />
                )}
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white font-mono text-2xl font-normal"
                >
                  {totalTasks}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-[#7d8187] font-mono text-xs uppercase tracking-wider"
                >
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* HTML flex-wrap legend showing name and count (including zero-value categories) */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-3 border-t border-[#212327] mt-auto">
            {taskPriorityData.map((item) => {
              const color =
                taskPriorityColors[item.name] || item.color || "#ffffff";
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 text-xs font-mono"
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[#7d8187]">{item.name}:</span>
                  <span className="text-white font-normal">{item.value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Workspace Productivity Chart */}
      <Card className="min-w-0 md:col-span-2 lg:col-span-2 bg-[#191919] border border-[#212327] rounded-[8px] shadow-none flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#212327]">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
              Workspace Productivity
            </CardTitle>
            <p className="text-xs text-[#dadbdf]">
              Task completion volume by project
            </p>
          </div>
          <ChartBarBig className="h-4 w-4 text-[#7d8187]" />
        </CardHeader>
        <CardContent className="w-full pt-4 min-w-0 flex flex-col justify-between flex-1">
          <div className="w-full min-w-0 h-[260px] sm:h-[300px] lg:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workspaceProductivityData}
                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                barGap={4}
                barSize={16}
                maxBarSize={28}
              >
                <XAxis
                  dataKey="name"
                  stroke="#7d8187"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                  tickFormatter={truncateLabel}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#7d8187"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                />
                <CartesianGrid
                  stroke="#212327"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <Tooltip
                  content={<CustomChartTooltip />}
                  wrapperStyle={{ outline: "none", zIndex: 50 }}
                />
                <Bar
                  dataKey="total"
                  name="Total Tasks"
                  fill="#363a3f"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="completed"
                  name="Completed Tasks"
                  fill="#a0c3ec"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-3 border-t border-[#212327] mt-auto">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="size-2 rounded-full bg-[#363a3f] shrink-0" />
              <span className="text-[#7d8187]">Total Tasks</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="size-2 rounded-full bg-[#a0c3ec] shrink-0" />
              <span className="text-[#7d8187]">Completed Tasks</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
