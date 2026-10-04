import { RecentProjects } from "@/components/dashboard/recnt-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { ErrorState } from "@/components/error-state";
import { NoDataFound } from "@/components/no-data-found";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import { getErrorMessage } from "@/lib/fetch-util";
import { cn } from "@/lib/utils";
import type { WorkspaceStatsResponse } from "@/types";
import { useNavigate, useSearchParams } from "react-router";

const TopProgressBar = () => (
  <div
    role="progressbar"
    aria-label="Updating dashboard..."
    className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-gradient-to-r from-transparent via-[#ff7a17] to-transparent animate-pulse"
  />
);

const DashboardSkeleton = () => (
  <div
    className="space-y-6 pb-8 animate-pulse"
    aria-busy="true"
    aria-label="Loading dashboard"
  >
    {/* Title skeleton */}
    <div className="flex flex-col space-y-2">
      <div className="h-3 w-20 bg-[#1a1c20] rounded-[8px]" />
      <div className="h-7 w-40 bg-[#1a1c20] rounded-[8px]" />
    </div>

    {/* Stat Cards skeleton: 4 cards matching StatsCard */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-[#141517] border border-[#212327] rounded-[8px] p-4 h-[106px] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-[#1a1c20] rounded-[8px]" />
            <div className="h-5 w-5 bg-[#1a1c20] rounded-full" />
          </div>
          <div className="h-8 w-16 bg-[#1a1c20] rounded-[8px]" />
        </div>
      ))}
    </div>

    {/* Statistics Charts skeleton: 4 charts matching StatisticsCharts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-[#141517] border border-[#212327] rounded-[8px] p-4 flex flex-col justify-between h-[260px] sm:h-[300px] lg:h-[340px]"
        >
          <div className="space-y-2 mb-4">
            <div className="h-3 w-28 bg-[#1a1c20] rounded-[8px]" />
            <div className="h-5 w-44 bg-[#1a1c20] rounded-[8px]" />
          </div>
          <div className="flex-1 w-full bg-[#1a1c20]/50 rounded-[8px]" />
        </div>
      ))}
    </div>

    {/* Bottom row: Recent Projects + Upcoming Tasks */}
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="bg-[#141517] border border-[#212327] rounded-[8px] p-6 h-[300px]">
        <div className="h-4 w-32 bg-[#1a1c20] rounded-[8px] mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-[#1a1c20] rounded-[8px]" />
          ))}
        </div>
      </div>
      <div className="bg-[#141517] border border-[#212327] rounded-[8px] p-6 h-[300px]">
        <div className="h-4 w-32 bg-[#1a1c20] rounded-[8px] mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-[#1a1c20] rounded-[8px]" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const navigate = useNavigate();

  const { data, isPending, isFetching, isError, error, refetch } =
    useGetWorkspaceStatsQuery(workspaceId!) as {
      data: WorkspaceStatsResponse | undefined;
      isPending: boolean;
      isFetching: boolean;
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

  // Show skeleton loader only when there is no data yet
  if (isPending && !data) {
    return <DashboardSkeleton />;
  }

  if (isError && !data) {
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
    <>
      {isFetching && <TopProgressBar />}
      <div
        className={cn(
          "space-y-6 pb-8 transition-opacity duration-200",
          isFetching ? "opacity-75" : "opacity-100"
        )}
      >
        {isError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[8px] flex items-center justify-between text-xs text-red-400">
            <span>{getErrorMessage(error, "Failed to refresh dashboard.")}</span>
            <button
              type="button"
              className="px-2.5 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded border border-red-500/30 transition-colors"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        )}
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
    </>
  );
};

export default Dashboard;
