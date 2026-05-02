import { fetchData } from "@/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../loader";
import type { ActivityLog } from "@/types";
import { getActivityIcon } from "./task-icon";

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
  const { data, isPending } = useQuery({
    queryKey: ["task-activity", resourceId],
    queryFn: () => fetchData(`/tasks/${resourceId}/activity`),
  }) as {
    data: ActivityLog[];
    isPending: boolean;
  };

  if (isPending) return <Loader />;

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {data?.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No activity yet</p>
      ) : (
        data?.map((activity) => (
          <div key={activity._id} className="flex gap-3 items-start">
            {getActivityIcon(activity.action)}

            <div className="flex flex-col flex-1 overflow-hidden">
              <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                <span className="font-semibold">{activity.user.name}</span>{" "}
                <span className="text-muted-foreground">{activity.details?.description}</span>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
