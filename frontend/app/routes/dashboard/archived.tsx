import { NoDataFound } from "@/components/no-data-found";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArchiveRestore, Clock, Calendar } from "lucide-react";
import { useState } from "react";
import { useArchivedTasksQuery, useAchievedTaskMutation } from "@/hooks/use-task";
import { Loader } from "@/components/loader";
import { getErrorMessage } from "@/lib/fetch-util";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Task } from "@/types";

const Archived = () => {
    const [search, setSearch] = useState("");
    const { data: archivedTasks, isLoading, isError, error, refetch } = useArchivedTasksQuery() as {
        data: Task[] | undefined;
        isLoading: boolean;
        isError: boolean;
        error: unknown;
        refetch: () => void;
    };
    const { mutate: unarchiveTask, isPending: isUnarchiving } = useAchievedTaskMutation();

    const handleUnarchive = (taskId: string) => {
        unarchiveTask({ taskId }, {
            onSuccess: () => {
                toast.success("Task unarchived successfully");
            },
            onError: (err: unknown) => {
                toast.error(getErrorMessage(err, "Failed to unarchive task"));
            },
        });
    };

    const filteredTasks = archivedTasks?.filter((task: Task) =>
        task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.project?.title?.toLowerCase().includes(search.toLowerCase())
    );

    const priorityColors: Record<string, string> = {
        High: "border-l-red-500",
        Medium: "border-l-orange-500",
        Low: "border-l-blue-500",
    };

    if (isLoading) return <Loader label="Loading archived tasks..." />;

    if (isError) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-normal tracking-tight text-ink">Archived Tasks</h1>
                    </div>
                </div>
                <ErrorState
                    title="Failed to load archived tasks"
                    message={getErrorMessage(error, "Could not fetch your archived tasks.")}
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-normal tracking-tight text-ink">Archived Tasks</h1>
                <p className="caption-mono text-mute">
                    Restore or manage tasks you've previously archived.
                </p>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-6">
                    <div className="flex w-full max-w-md items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mute" />
                            <Input
                                type="text"
                                placeholder="Search by task title or project name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-full bg-canvas-card border-hairline focus-visible:border-canvas-mid text-sm h-9"
                            />
                        </div>
                    </div>

                    {!filteredTasks || filteredTasks.length === 0 ? (
                        <div className="bg-canvas-card rounded-[8px] border border-dashed border-hairline p-10 text-center">
                            <NoDataFound
                                title={search ? "No matches found" : "Your archive is empty"}
                                description={search ? `We couldn't find any archived tasks matching "${search}"` : "Items you archive will safely appear here for restoration."}
                                buttonText="Return to Dashboard"
                                buttonAction={() => window.history.back()}
                            />
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredTasks.map((task: Task) => (
                                <Card key={task._id} className="group bg-canvas-card border border-hairline hover:border-canvas-mid rounded-[8px] transition-colors">
                                    <CardContent className="p-4 flex flex-col h-full space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <h3 className="font-normal text-sm text-ink truncate group-hover:text-accent-breeze transition-colors">
                                                    {task.title}
                                                </h3>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="caption-mono text-mute px-1.5 py-0.5 rounded-full border border-hairline bg-canvas-soft text-[10px]">
                                                        {task.project?.title || "No Project"}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] font-mono h-4 uppercase">
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-2.5 rounded-full gap-1 text-[11px] font-mono border-hairline hover:border-canvas-mid bg-canvas-card hover:bg-canvas-soft text-body hover:text-ink shrink-0"
                                                onClick={() => handleUnarchive(task._id)}
                                                disabled={isUnarchiving}
                                            >
                                                <ArchiveRestore className="size-3" />
                                                <span>Restore</span>
                                            </Button>
                                        </div>

                                        {task.description && (
                                            <p className="text-xs text-mute line-clamp-2 leading-relaxed font-light">
                                                {task.description}
                                            </p>
                                        )}

                                        <div className="pt-2 border-t border-hairline flex items-center justify-between caption-mono text-mute text-[10px] mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="size-3" />
                                                <span>Archived {format(new Date(task.updatedAt), "MMM d, yyyy")}</span>
                                            </div>

                                            {task.dueDate && (
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="size-3" />
                                                    <span>Due {format(new Date(task.dueDate), "MMM d")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Archived;
