import { Loader } from "@/components/loader";
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
  useTransferOwnershipMutation 
} from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { MoreHorizontal, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

const Members = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const workspaceId = searchParams.get("workspaceId");
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState<string>(initialSearch);

  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };

  const { mutate: removeMember, isPending: isRemoving } = useRemoveMemberMutation();
  const { mutate: transferOwnership, isPending: isTransferring } = useTransferOwnershipMutation();

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

  if (isLoading) return <Loader label="Loading workspace members..." />;
  if (!data || !workspaceId) return <div>No workspace found</div>;

  const currentUserRole = data?.members?.find(
    (m) => m.user._id === currentUser?._id
  )?.role;

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMember({ workspaceId, memberId }, {
        onSuccess: () => toast.success("Member removed successfully"),
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to remove member")
      });
    }
  };

  const handleTransferOwnership = (newOwnerId: string) => {
    if (confirm("Are you sure you want to transfer ownership? You will become an admin.")) {
      transferOwnership({ workspaceId, newOwnerId }, {
        onSuccess: () => toast.success("Ownership transferred successfully"),
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to transfer ownership")
      });
    }
  };

  const filteredMembers = data?.members?.filter(
    (member) =>
      member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase()) ||
      member.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between">
        <h1 className="text-2xl font-bold">Workspace Members</h1>
      </div>

      <Input
        placeholder="Search members ...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                {filteredMembers?.length} members in your workspace
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {filteredMembers.map((member) => (
                  <div
                    key={member.user._id}
                    className="flex flex-col md:flex-row items-center justify-between p-4 gap-3"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="bg-gray-500">
                        <AvatarImage src={member.user.profilePicture} />
                        <AvatarFallback>
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {member.user.name}
                          {member.user._id === currentUser?._id && (
                            <Badge variant="outline" className="text-[10px] h-4">You</Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 ml-11 md:ml-0">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            ["admin", "owner"].includes(member.role)
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {member.role}
                        </Badge>
                        <Badge variant={"outline"}>{data.name}</Badge>
                      </div>

                      {/* Actions Menu */}
                      {member.user._id !== currentUser?._id && 
                       (currentUserRole === "owner" || currentUserRole === "admin") && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            {/* Transfer Ownership (Owner only) */}
                            {currentUserRole === "owner" && (
                              <DropdownMenuItem 
                                onClick={() => handleTransferOwnership(member.user._id)}
                                className="text-blue-600 cursor-pointer"
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Transfer Ownership
                              </DropdownMenuItem>
                            )}

                            {/* Remove Member (Owner/Admin, but Admin can't remove Owner) */}
                            {((currentUserRole === "owner") || 
                              (currentUserRole === "admin" && member.role !== "owner")) && (
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member.user._id)}
                                className="text-red-600 cursor-pointer"
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remove Member
                              </DropdownMenuItem>
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

        {/* BOARD VIEW */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.user._id} className="relative group">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="bg-gray-500 size-20 mb-4">
                    <AvatarImage src={member.user.profilePicture} />
                    <AvatarFallback className="uppercase">
                      {member.user.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-lg font-medium mb-1">
                    {member.user.name}
                    {member.user._id === currentUser?._id && " (You)"}
                  </h3>

                  <p className="text-sm text-gray-500 mb-4 truncate w-full px-2">
                    {member.user.email}
                  </p>

                  <div className="flex flex-col gap-2 w-full">
                    <Badge
                      variant={
                        ["admin", "owner"].includes(member.role)
                          ? "destructive"
                          : "secondary"
                      }
                      className="mx-auto"
                    >
                      {member.role}
                    </Badge>

                    {/* Quick actions for board view? Or just leave it for list view. 
                        Let's add a small action button if authorized */}
                    {member.user._id !== currentUser?._id && 
                     (currentUserRole === "owner" || currentUserRole === "admin") && (
                      <div className="pt-2">
                        {currentUserRole === "owner" && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-blue-600 h-auto p-0 text-xs"
                            onClick={() => handleTransferOwnership(member.user._id)}
                          >
                            Transfer Ownership
                          </Button>
                        )}
                        {((currentUserRole === "owner") || 
                          (currentUserRole === "admin" && member.role !== "owner")) && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-red-600 h-auto p-0 text-xs ml-2"
                            onClick={() => handleRemoveMember(member.user._id)}
                          >
                            Remove
                          </Button>
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
  );
};

export default Members;
