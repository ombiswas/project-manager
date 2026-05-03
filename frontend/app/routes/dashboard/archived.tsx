import { NoDataFound } from "@/components/no-data-found";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArchiveRestore, Clock, Calendar } from "lucide-react";
import { useState } from "react";
import { useArchivedTasksQuery, useAchievedTaskMutation } from "@/hooks/use-task";
import { Loader } from "@/components/loader";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Task } from "@/types";

const Archived = () => {
    const [search, setSearch] = useState("");
    const { data: archivedTasks, isLoading } = useArchivedTasksQuery();
    const { mutate: unarchiveTask, isPending: isUnarchiving } = useAchievedTaskMutation();

    const handleUnarchive = (taskId: string) => {
        unarchiveTask({ taskId }, {
            onSuccess: () => {
                toast.success("Task unarchived successfully");
            }
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
                                className="pl-10 h-10 bg-background border-muted-foreground/20 focus:border-primary transition-all"
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
                            {filteredTasks.map((task: any) => (
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
                                                        {task.project?.title}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                                task.priority === "High" ? "bg-red-100 text-red-600" :
                                                    task.priority === "Medium" ? "bg-orange-100 text-orange-600" :
                                                        "bg-blue-100 text-blue-600"
                                            )}>
                                                {task.priority}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-between pt-1">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Status</span>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                    <Clock className="size-3 text-muted-foreground" />
                                                    {task.status}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Archived On</span>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                    <Calendar className="size-3 text-muted-foreground" />
                                                    {format(new Date(task.updatedAt), "do MMM, yyyy")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 mt-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full h-9 bg-background hover:bg-primary hover:text-primary-foreground border-muted-foreground/20 transition-all gap-2"
                                                onClick={() => handleUnarchive(task._id)}
                                                disabled={isUnarchiving}
                                            >
                                                <ArchiveRestore className="size-4" />
                                                <span className="text-xs font-semibold">Restore Task</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
};

export default Archived;
