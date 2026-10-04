import { RecentProjects } from "@/components/dashboard/recnt-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { ErrorState } from "@/components/error-state";
import { NoDataFound } from "@/components/no-data-found";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import { getErrorMessage } from "@/lib/fetch-util";
import type { WorkspaceStatsResponse } from "@/types";
import { useNavigate, useSearchParams } from "react-router";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const navigate = useNavigate();

  const { data, isPending, isError, error, refetch } =
    useGetWorkspaceStatsQuery(workspaceId!) as {
      data: WorkspaceStatsResponse | undefined;
      isPending: boolean;
      isError: boolean;
      error: unknown;
      refetch: () => void;
    };

  if (!workspaceId) {
    return (
      <div className="py-12">
        <NoDataFound
          title="No workspace selected"
          description="Please select or create a workspace to view your dashboard analytics."
          buttonText="Go to Workspaces"
          buttonAction={() => navigate("/workspaces")}
        />
      </div>
    );
  }

  if (isPending) {
    return <Loader label="Loading workspace overview..." />;
  }

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load dashboard"
          message={getErrorMessage(
            error,
            "Could not fetch statistics for this workspace."
          )}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12">
        <ErrorState
          title="No data available"
          message="Dashboard statistics could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col space-y-1">
        <p className="caption-mono text-xs text-[#7d8187]">OVERVIEW</p>
        <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">
          Dashboard
        </h1>
      </div>

      <StatsCard data={data.stats} />

      <StatisticsCharts
        stats={data.stats}
        taskTrendsData={data.taskTrendsData}
        projectStatusData={data.projectStatusData}
        taskPriorityData={data.taskPriorityData}
        workspaceProductivityData={data.workspaceProductivityData}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects data={data.recentProjects} />
        <UpcomingTasks data={data.upcomingTasks} />
      </div>
    </div>
  );
};

export default Dashboard;
