import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/provider/auth-context";
import {
  useGetWorkspaceDetailsQuery,
  useRemoveMemberMutation,
  useTransferOwnershipMutation,
  useChangeMemberRoleMutation,
} from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import {
  ChevronDown,
  MoreHorizontal,
  ShieldCheck,
  UserCog,
  UserMinus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { ErrorState } from "@/components/error-state";
import { TopProgressBar } from "@/components/top-progress-bar";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/fetch-util";

const MembersSkeleton = () => (
  <div
    className="space-y-6 pb-12 animate-pulse"
    aria-busy="true"
    aria-label="Loading workspace members"
  >
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-canvas-card border border-hairline rounded-[8px]" />
        <div className="h-4 w-32 bg-canvas-card border border-hairline rounded-[8px]" />
      </div>
      <div className="h-9 w-32 bg-canvas-card border border-hairline rounded-full" />
    </div>

    {/* Search bar Skeleton */}
    <div className="h-10 w-full max-w-md bg-canvas-card border border-hairline rounded-full" />

    {/* Tabs Skeleton */}
    <div className="h-9 w-44 bg-canvas-card border border-hairline rounded-[8px]" />

    {/* Member table rows Card Skeleton */}
    <Card className="bg-canvas-card border border-hairline rounded-[8px] overflow-hidden">
      <CardHeader className="p-4 md:p-5 border-b border-hairline">
        <div className="h-5 w-24 bg-canvas-soft rounded-[8px] mb-2" />
        <div className="h-3 w-36 bg-canvas-soft rounded-[8px]" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-hairline">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-3"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="size-9 rounded-full bg-canvas-soft border border-hairline shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="h-4 w-36 bg-canvas-soft rounded-[8px]" />
                  <div className="h-3 w-48 bg-canvas-soft rounded-[8px]" />
                </div>
              </div>
              <div className="flex items-center gap-3 ml-12 md:ml-0 shrink-0">
                <div className="h-5 w-16 bg-canvas-soft rounded-full" />
                <div className="size-8 rounded-full bg-canvas-soft border border-hairline" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const Members = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const workspaceId = searchParams.get("workspaceId");
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState<string>(initialSearch);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetWorkspaceDetailsQuery(workspaceId!) as {
      data: Workspace | undefined;
      isLoading: boolean;
      isFetching: boolean;
      isError: boolean;
      error: unknown;
      refetch: () => void;
    };

  const { mutate: removeMember } = useRemoveMemberMutation();
  const { mutate: transferOwnership } = useTransferOwnershipMutation();
  const { mutate: changeRole } = useChangeMemberRoleMutation();

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    params.search = search;
    setSearchParams(params, { replace: true });
  }, [search]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  if (isLoading && !data) return <MembersSkeleton />;

  if (!workspaceId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-normal tracking-tight text-ink">
          Workspace Members
        </h1>
        <ErrorState
          title="No workspace selected"
          message="Please select a workspace to view its members."
        />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-normal tracking-tight text-ink">
          Workspace Members
        </h1>
        <ErrorState
          title="Failed to load members"
          message={getErrorMessage(
            error,
            "Could not load member details for this workspace."
          )}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const currentUserRole = data?.members?.find(
    (m) => m.user._id === currentUser?._id
  )?.role;

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMember(
        { workspaceId, memberId },
        {
          onSuccess: () => toast.success("Member removed successfully"),
          onError: (err: unknown) =>
            toast.error(getErrorMessage(err, "Failed to remove member")),
        }
      );
    }
  };

  const handleTransferOwnership = (newOwnerId: string) => {
    if (
      confirm(
        "Are you sure you want to transfer ownership? You will become an admin."
      )
    ) {
      transferOwnership(
        { workspaceId, newOwnerId },
        {
          onSuccess: () => toast.success("Ownership transferred successfully"),
          onError: (err: unknown) =>
            toast.error(getErrorMessage(err, "Failed to transfer ownership")),
        }
      );
    }
  };

  const handleChangeRole = (memberId: string, role: string) => {
    changeRole(
      { workspaceId: workspaceId!, memberId, role },
      {
        onSuccess: () => toast.success("Role updated successfully"),
        onError: (err: unknown) =>
          toast.error(getErrorMessage(err, "Failed to update role")),
      }
    );
  };

  const filteredMembers = data?.members?.filter(
    (member) =>
      member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase()) ||
      member.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {isFetching && <TopProgressBar label="Updating workspace members..." />}
      <div
        className={cn(
          "space-y-6 pb-12 transition-opacity duration-200",
          isFetching && "opacity-60"
        )}
      >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal tracking-tight text-ink">
            Workspace Members
          </h1>
          <p className="caption-mono text-mute mt-1">
            {filteredMembers?.length} active{" "}
            {filteredMembers?.length === 1 ? "member" : "members"} in{" "}
            {data.name}
          </p>
        </div>
      </div>

      <Input
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md rounded-full bg-canvas-card border-hairline focus-visible:border-canvas-mid text-sm"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Grid View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="bg-canvas-card border border-hairline rounded-[8px] overflow-hidden">
            <CardHeader className="p-4 md:p-5 border-b border-hairline">
              <CardTitle className="text-base font-normal tracking-tight text-ink">
                Members
              </CardTitle>
              <CardDescription className="caption-mono text-mute mt-0.5">
                {filteredMembers?.length} members in your workspace
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-hairline">
                {filteredMembers.map((member) => (
                  <div
                    key={member.user._id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-3 hover:bg-canvas-soft/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <Avatar className="size-9 border border-hairline bg-canvas-soft">
                        <AvatarImage src={member.user.profilePicture} />
                        <AvatarFallback className="text-xs font-mono text-body">
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-normal text-ink flex items-center gap-2">
                          <span className="truncate">{member.user.name}</span>
                          {member.user._id === currentUser?._id && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono h-4"
                            >
                              You
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-mute truncate font-light">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-12 md:ml-0 shrink-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            ["admin", "owner"].includes(member.role)
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize text-[10px] font-mono h-5"
                        >
                          {member.role}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono h-5 hidden sm:inline-flex"
                        >
                          {data.name}
                        </Badge>
                      </div>

                      {member.user._id !== currentUser?._id &&
                        (currentUserRole === "owner" ||
                          currentUserRole === "admin") && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-full text-mute hover:text-ink hover:bg-canvas-soft"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="caption-mono text-mute">
                                Actions
                              </DropdownMenuLabel>

                              {currentUserRole === "owner" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTransferOwnership(member.user._id)
                                  }
                                  className="cursor-pointer text-accent-breeze focus:text-accent-breeze"
                                >
                                  <ShieldCheck className="mr-2 size-3.5" />
                                  Transfer Ownership
                                </DropdownMenuItem>
                              )}

                              {(currentUserRole === "owner" ||
                                (currentUserRole === "admin" &&
                                  member.role !== "owner")) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <div className="p-1">
                                    <p className="caption-mono text-mute px-2 py-1 text-[10px]">
                                      Change Role
                                    </p>
                                    {["admin", "member", "viewer"].map(
                                      (role) => (
                                        <DropdownMenuItem
                                          key={role}
                                          onClick={() =>
                                            handleChangeRole(
                                              member.user._id,
                                              role
                                            )
                                          }
                                          disabled={member.role === role}
                                          className="capitalize cursor-pointer text-xs"
                                        >
                                          <UserCog className="mr-2 size-3.5 opacity-50" />
                                          {role}
                                        </DropdownMenuItem>
                                      )
                                    )}
                                  </div>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRemoveMember(member.user._id)
                                    }
                                    className="text-accent-sunset focus:text-accent-sunset cursor-pointer text-xs"
                                  >
                                    <UserMinus className="mr-2 size-3.5" />
                                    Remove Member
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <Card
                key={member.user._id}
                className="bg-canvas-card border border-hairline hover:border-canvas-mid rounded-[8px] transition-colors"
              >
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <Avatar className="size-16 mb-3 border border-hairline bg-canvas-soft">
                    <AvatarImage src={member.user.profilePicture} />
                    <AvatarFallback className="uppercase font-mono text-sm text-body">
                      {member.user.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-sm font-normal text-ink mb-0.5 truncate max-w-full">
                    {member.user.name}
                    {member.user._id === currentUser?._id && " (You)"}
                  </h3>

                  <p className="text-xs text-mute mb-3.5 truncate w-full px-1 font-light">
                    {member.user.email}
                  </p>

                  <div className="flex flex-col gap-2.5 w-full items-center">
                    <Badge
                      variant={
                        ["admin", "owner"].includes(member.role)
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px] font-mono capitalize h-5"
                    >
                      {member.role}
                    </Badge>

                    {member.user._id !== currentUser?._id &&
                      (currentUserRole === "owner" ||
                        currentUserRole === "admin") && (
                        <div className="pt-2 border-t border-hairline w-full flex flex-wrap justify-center gap-2">
                          {currentUserRole === "owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full text-accent-breeze hover:text-accent-breeze hover:bg-canvas-soft h-7 px-2.5 text-xs font-mono"
                              onClick={() =>
                                handleTransferOwnership(member.user._id)
                              }
                            >
                              Transfer
                            </Button>
                          )}

                          {(currentUserRole === "owner" ||
                            (currentUserRole === "admin" &&
                              member.role !== "owner")) && (
                            <>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full text-mute hover:text-ink hover:bg-canvas-soft h-7 px-2.5 text-xs font-mono"
                                  >
                                    Role <ChevronDown className="size-3 ml-1" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  {["admin", "member", "viewer"].map((role) => (
                                    <DropdownMenuItem
                                      key={role}
                                      onClick={() =>
                                        handleChangeRole(member.user._id, role)
                                      }
                                      className="capitalize text-xs font-mono"
                                    >
                                      {role}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-accent-sunset hover:text-accent-sunset hover:bg-canvas-soft h-7 px-2.5 text-xs font-mono"
                                onClick={() =>
                                  handleRemoveMember(member.user._id)
                                }
                              >
                                Remove
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
};

export default Members;
