import { fetchData } from "@/lib/fetch-util";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../loader";
import type { ActivityLog } from "@/types";
import { getActivityIcon } from "./task-icon";

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.tasks.activity(resourceId),
    queryFn: () => fetchData(`/tasks/${resourceId}/activity`),
  }) as {
    data: ActivityLog[];
    isPending: boolean;
  };

  if (isPending) return <Loader />;

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {data?.length === 0 ? (
        <p className="text-xs text-mute font-mono italic px-1">
          No activity yet
        </p>
      ) : (
        data?.map((activity) => (
          <div key={activity._id} className="flex gap-2.5 items-start">
            {getActivityIcon(activity.action)}

            <div className="flex flex-col flex-1 overflow-hidden pt-0.5">
              <p className="text-sm text-ink break-words whitespace-pre-wrap font-normal leading-snug">
                <span className="text-white">
                  {activity.user?.name || "User"}
                </span>{" "}
                <span className="text-mute font-mono text-xs">
                  {activity.details?.description}
                </span>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
