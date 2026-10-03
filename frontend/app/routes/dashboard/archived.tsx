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
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Archived Tasks</h1>
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
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Archived Tasks</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Restore or manage tasks you've previously archived.
                    </p>
                </div>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-6">
                    <div className="flex w-full max-w-md items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by task title or project name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-card border-none shadow-sm h-10"
                            />
                        </div>
                    </div>

                    {!filteredTasks || filteredTasks.length === 0 ? (
                        <div className="bg-card rounded-xl border border-dashed p-12 text-center">
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
                                <Card key={task._id} className={cn(
                                    "group relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border-l-4",
                                    priorityColors[task.priority] || "border-l-muted"
                                )}>
                                    <CardContent className="p-5 flex flex-col h-full space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <h3 className="font-bold text-[15px] text-foreground truncate group-hover:text-primary transition-colors">
                                                    {task.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-semibold h-5">
                                                        {task.project?.title || "No Project"}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[10px] font-medium h-5">
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground border-primary/20 text-primary transition-all duration-200"
                                                onClick={() => handleUnarchive(task._id)}
                                                disabled={isUnarchiving}
                                            >
                                                <ArchiveRestore className="size-3.5" />
                                                <span>Restore</span>
                                            </Button>
                                        </div>

                                        {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {task.description}
                                            </p>
                                        )}

                                        <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="size-3" />
                                                <span>Archived {format(new Date(task.updatedAt), "MMM d, yyyy")}</span>
                                            </div>

                                            {task.dueDate && (
                                                <div className="flex items-center gap-1.5 font-medium">
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
