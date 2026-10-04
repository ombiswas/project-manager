import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";

import { ErrorState } from "@/components/error-state";
import { getErrorMessage } from "@/lib/fetch-util";

const TopProgressBar = () => (
  <div
    role="progressbar"
    aria-label="Updating tasks..."
    className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-gradient-to-r from-transparent via-[#ff7a17] to-transparent animate-pulse"
  />
);

const MyTasksSkeleton = () => (
  <div
    className="space-y-6 pb-12 animate-pulse"
    aria-busy="true"
    aria-label="Loading tasks"
  >
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-7 w-32 bg-[#1a1c20] rounded-[8px]" />
        <div className="h-4 w-24 bg-[#1a1c20] rounded-[8px]" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-28 bg-[#141517] border border-[#212327] rounded-full" />
        <div className="h-8 w-20 bg-[#141517] border border-[#212327] rounded-full" />
      </div>
    </div>

    {/* Search Input Skeleton */}
    <div className="h-10 max-w-md bg-[#141517] border border-[#212327] rounded-full" />

    {/* Tabs Skeleton */}
    <div className="h-9 w-44 bg-[#141517] border border-[#212327] rounded-[8px]" />

    {/* Task Rows Card Skeleton */}
    <div className="bg-[#141517] border border-[#212327] rounded-[8px] overflow-hidden">
      <div className="p-4 md:p-5 border-b border-[#212327]">
        <div className="h-5 w-24 bg-[#1a1c20] rounded-[8px] mb-2" />
        <div className="h-3 w-36 bg-[#1a1c20] rounded-[8px]" />
      </div>
      <div className="divide-y divide-[#212327]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="size-6 rounded-full bg-[#1a1c20] shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 bg-[#1a1c20] rounded-[8px]" />
                <div className="h-3 w-1/2 bg-[#1a1c20] rounded-[8px]" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-16 bg-[#1a1c20] rounded-full" />
              <div className="h-4 w-20 bg-[#1a1c20] rounded-[8px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MyTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = searchParams.get("filter") || "all";
  const sortDirection = (searchParams.get("sort") === "asc" ? "asc" : "desc") as
    | "asc"
    | "desc";
  const search = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(search);

  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  useEffect(() => {
    if (searchTerm === search) return;

    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (searchTerm.trim()) {
            next.set("search", searchTerm);
          } else {
            next.delete("search");
          }
          return next;
        },
        { replace: true }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, search, setSearchParams]);

  const handleSortChange = () => {
    const nextSort = sortDirection === "asc" ? "desc" : "asc";
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("sort", nextSort);
        return next;
      },
      { replace: true }
    );
  };

  const handleFilterChange = (newFilter: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newFilter === "all") {
        next.delete("filter");
      } else {
        next.set("filter", newFilter);
      }
      return next;
    });
  };

  const {
    data: myTasks,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMyTasksQuery() as {
    data: Task[] | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };

  const tasksList = myTasks || [];
  const filteredTasks =
    tasksList.length > 0
      ? tasksList
          .filter((task) => {
            if (filter === "all") return true;
            if (filter === "todo") return task.status === "To Do";
            if (filter === "inprogress") return task.status === "In Progress";
            if (filter === "done") return task.status === "Done";
            if (filter === "achieved") return task.isArchived === true;
            if (filter === "high") return task.priority === "High";

            return true;
          })
          .filter(
            (task) =>
              task.title.toLowerCase().includes(search.toLowerCase()) ||
              task.description?.toLowerCase().includes(search.toLowerCase())
          )
      : [];

  //   sort task
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  const todoTasks = sortedTasks.filter((task) => task.status === "To Do");
  const inProgressTasks = sortedTasks.filter(
    (task) => task.status === "In Progress"
  );
  const doneTasks = sortedTasks.filter((task) => task.status === "Done");

  if (isLoading && !myTasks) return <MyTasksSkeleton />;

  if (isError && !myTasks) {
    return (
      <div className="space-y-6 pb-12">
        <h1 className="text-2xl font-normal tracking-tight text-ink">
          My Tasks
        </h1>
        <ErrorState
          title="Failed to load tasks"
          message={getErrorMessage(
            error,
            "Could not fetch your assigned tasks."
          )}
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
          "space-y-6 pb-12 transition-opacity duration-200",
          isFetching ? "opacity-75" : "opacity-100"
        )}
      >
        {isError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[8px] flex items-center justify-between text-xs text-red-400">
            <span>{getErrorMessage(error, "Failed to refresh tasks.")}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal tracking-tight text-ink">
            My Tasks
          </h1>
          <p className="caption-mono text-mute mt-1">
            {sortedTasks?.length} assigned{" "}
            {sortedTasks?.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-mono"
            onClick={handleSortChange}
          >
            {sortDirection === "asc" ? "Oldest First" : "Newest First"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-mono"
              >
                <FilterIcon className="w-3.5 h-3.5 mr-1 text-mute" /> Filter
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="caption-mono text-mute">
                Filter Tasks
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("todo")}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("inprogress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("done")}>
                Done
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("achieved")}>
                Archived
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("high")}>
                High Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Input
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md rounded-full bg-canvas-card border-hairline focus-visible:border-canvas-mid text-sm"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card className="bg-canvas-card border border-hairline rounded-[8px] overflow-hidden">
            <CardHeader className="p-4 md:p-5 border-b border-hairline">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-normal tracking-tight text-ink">
                    All Tasks
                  </CardTitle>
                  <CardDescription className="caption-mono text-mute mt-0.5">
                    {sortedTasks?.length} tasks assigned to you
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-hairline">
                {sortedTasks?.map((task) => (
                  <div
                    key={task._id}
                    className="group p-4 hover:bg-canvas-soft/60 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5 flex-shrink-0">
                          {task.status === "Done" ? (
                            <div className="bg-canvas-soft border border-hairline p-1 rounded-full text-ink">
                              <CheckCircle className="size-3.5" />
                            </div>
                          ) : (
                            <div className="bg-canvas-soft border border-hairline p-1 rounded-full text-accent-breeze">
                              <Clock className="size-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <Link
                            to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                            className="font-normal text-sm md:text-base text-ink hover:text-accent-breeze transition-colors flex items-center gap-1.5"
                          >
                            <span className="truncate">{task.title}</span>
                            <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 text-mute transition-opacity" />
                          </Link>

                          <p className="text-xs md:text-sm text-body line-clamp-1 max-w-2xl font-light">
                            {task.description || "No description provided"}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Badge
                              variant={
                                task.status === "Done" ? "default" : "outline"
                              }
                              className="text-[10px] font-mono uppercase h-5"
                            >
                              {task.status}
                            </Badge>

                            {task.priority && (
                              <Badge
                                variant={
                                  task.priority === "High"
                                    ? "destructive"
                                    : task.priority === "Medium"
                                      ? "default"
                                      : "secondary"
                                }
                                className="text-[10px] font-mono uppercase h-5"
                              >
                                {task.priority}
                              </Badge>
                            )}

                            <span className="caption-mono text-mute px-2 py-0.5 rounded-full border border-hairline bg-canvas-soft">
                              {task.project.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end gap-1 caption-mono text-mute flex-shrink-0 text-[11px]">
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5">
                            <span>Due:</span>
                            <span className="text-body">
                              {format(new Date(task.dueDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span>Updated:</span>
                          <span>
                            {format(new Date(task.updatedAt), "MMM d")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedTasks?.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="bg-canvas-soft border border-hairline size-10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="size-4 text-mute" />
                    </div>
                    <h3 className="text-sm font-normal text-ink">
                      No tasks found
                    </h3>
                    <p className="caption-mono text-mute mt-1">
                      You're all caught up!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOARD VIEW */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {[
              { title: "To Do", tasks: todoTasks, indicator: "bg-mute" },
              {
                title: "In Progress",
                tasks: inProgressTasks,
                indicator: "bg-accent-breeze",
              },
              { title: "Done", tasks: doneTasks, indicator: "bg-ink" },
            ].map((column) => (
              <div
                key={column.title}
                className="flex flex-col h-full min-h-[450px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("size-2 rounded-full", column.indicator)}
                    />
                    <h3 className="caption-mono text-ink">{column.title}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] h-5"
                  >
                    {column.tasks?.length ?? 0}
                  </Badge>
                </div>

                <div className="space-y-2.5 flex-1 bg-canvas-soft/40 p-2.5 rounded-[8px] border border-hairline">
                  {column.tasks?.map((task) => (
                    <Card
                      key={task._id}
                      className="group bg-canvas-card border border-hairline hover:border-canvas-mid rounded-[8px] transition-colors"
                    >
                      <Link
                        to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                        className="block p-3.5 space-y-2.5"
                      >
                        <div className="space-y-1">
                          <h4 className="font-normal text-sm text-ink line-clamp-1 group-hover:text-accent-breeze transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-xs text-mute line-clamp-2 leading-relaxed">
                            {task.description || "No description provided"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <Badge
                            variant={
                              task.priority === "High"
                                ? "destructive"
                                : task.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-[10px] px-1.5 py-0 font-mono uppercase h-4"
                          >
                            {task.priority}
                          </Badge>

                          <span className="caption-mono text-mute truncate flex-1 text-[10px]">
                            {task.project.title}
                          </span>
                        </div>

                        {task.dueDate && (
                          <div className="pt-2 border-t border-hairline flex items-center gap-1.5 caption-mono text-mute text-[10px]">
                            <Clock className="size-3" />
                            <span>
                              {format(new Date(task.dueDate), "MMM d")}
                            </span>
                          </div>
                        )}
                      </Link>
                    </Card>
                  ))}

                  {column.tasks?.length === 0 && (
                    <div className="h-20 flex items-center justify-center rounded-[6px] border border-dashed border-hairline">
                      <span className="caption-mono text-mute text-xs italic">
                        Empty
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </>
);
};

export default MyTasks;
