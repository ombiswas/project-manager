import { Loader } from "@/components/loader";
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

const MyTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    params.filter = filter;
    params.sort = sortDirection;
    params.search = search;

    setSearchParams(params, { replace: true });
  }, [filter, sortDirection, search]);

  useEffect(() => {
    const urlFilter = searchParams.get("filter") || "all";
    const urlSort = searchParams.get("sort") || "desc";
    const urlSearch = searchParams.get("search") || "";

    if (urlFilter !== filter) setFilter(urlFilter);
    if (urlSort !== sortDirection)
      setSortDirection(urlSort === "asc" ? "asc" : "desc");
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  const filteredTasks =
    myTasks?.length > 0
      ? myTasks
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

  if (isLoading) return <Loader label="Loading your tasks..." />;
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-start md:items-center justify-between">
        <h1 className="text-2xl font-bold">My Tasks</h1>

        <div
          className="flex flex-col items-start md:flex-row md"
          itemScope
          gap-2
        >
          <Button
            variant={"outline"}
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "Oldest First" : "Newest First"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <FilterIcon className="w-4 h-4" /> Filter
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("todo")}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inprogress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("done")}>
                Done
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("achieved")}>
                Achieved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("high")}>
                High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Input
        placeholder="Search tasks ...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Tasks</CardTitle>
                  <CardDescription className="mt-2">
                    {sortedTasks?.length} tasks assigned to you
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 mt-4">
              <div className="divide-y divide-muted/50 border-t">
                {sortedTasks?.map((task) => (
                  <div key={task._id} className="group p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-1 flex-shrink-0">
                          {task.status === "Done" ? (
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                              <CheckCircle className="size-4 text-green-600 dark:text-green-400" />
                            </div>
                          ) : (
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded-full">
                              <Clock className="size-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <Link
                            to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                            className="font-bold text-base hover:text-primary hover:underline transition-colors flex items-center gap-1 group-hover:translate-x-0.5 transform duration-200"
                          >
                            <span className="truncate">{task.title}</span>
                            <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>

                          <p className="text-sm text-muted-foreground line-clamp-1 max-w-2xl">
                            {task.description || "No description provided"}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge
                              variant={
                                task.status === "Done" ? "default" : "outline"
                              }
                              className="text-[10px] font-bold uppercase tracking-tight h-5"
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
                                className="text-[10px] font-bold uppercase tracking-tight h-5"
                              >
                                {task.priority}
                              </Badge>
                            )}

                            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                              {task.project.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end gap-2 lg:gap-1 text-xs text-muted-foreground flex-shrink-0">
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>Due:</span>
                            <span className="text-foreground">{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span>Updated:</span>
                          <span>{format(new Date(task.updatedAt), "MMM d")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedTasks?.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="bg-muted size-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="size-6 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium">No tasks found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {[
              { title: "To Do", tasks: todoTasks, color: "bg-slate-500" },
              { title: "In Progress", tasks: inProgressTasks, color: "bg-blue-500" },
              { title: "Done", tasks: doneTasks, color: "bg-green-500" },
            ].map((column) => (
              <div key={column.title} className="flex flex-col h-full min-h-[500px]">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", column.color)} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">{column.title}</h3>
                  </div>
                  <Badge variant="outline" className="font-mono">{column.tasks.length}</Badge>
                </div>

                <div className="space-y-3 flex-1 bg-muted/20 p-2 rounded-xl border border-dashed border-muted-foreground/20">
                  {column.tasks?.map((task) => (
                    <Card
                      key={task._id}
                      className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-none shadow-sm"
                    >
                      <Link
                        to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                        className="block p-4 space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                              {task.title}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {task.description || "No description provided"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              task.priority === "High"
                                ? "destructive"
                                : task.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-[10px] px-1.5 py-0 font-bold uppercase"
                          >
                            {task.priority}
                          </Badge>

                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase truncate flex-1">
                            {task.project.title}
                          </span>
                        </div>

                        {task.dueDate && (
                          <div className="pt-2 border-t flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/80">
                            <Clock className="size-3" />
                            <span>{format(new Date(task.dueDate), "MMM d")}</span>
                          </div>
                        )}
                      </Link>
                    </Card>
                  ))}

                  {column.tasks?.length === 0 && (
                    <div className="h-24 flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/10">
                      <span className="text-xs text-muted-foreground/50 italic">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTasks;
