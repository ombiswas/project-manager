import { Loader } from "@/components/loader";
import { NoDataFound } from "@/components/no-data-found";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import { useGetWorkspacesQuery, useDeleteWorkspaceMutation } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { PlusCircle, Users, Trash } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { useAuth } from "@/provider/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

const Workspaces = () => {
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);
  
  const { data: workspaces = [], isLoading } = useGetWorkspacesQuery() as {
    data: Workspace[];
    isLoading: boolean;
  };
  
  const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspaceMutation();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    if (workspaceToDelete) {
      deleteWorkspace(workspaceToDelete._id, {
        onSuccess: () => {
          setWorkspaceToDelete(null);
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        }
      });
    }
  };

  if (isLoading) {
    return <Loader label="Loading your workspaces..." />;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-3xl font-bold">Workspaces</h2>

          <Button onClick={() => setIsCreatingWorkspace(true)}>
            <PlusCircle className="size-4 mr-2" />
            New Workspace
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {workspaces.map((ws) => (
            <WorkspaceCard 
              key={ws._id} 
              workspace={ws} 
              onDelete={() => setWorkspaceToDelete(ws)} 
            />
          ))}

          {workspaces.length === 0 && (
            <NoDataFound
              title="No workspaces found"
              description="Create a new workspace to get started"
              buttonText="Create Workspace"
              buttonAction={() => setIsCreatingWorkspace(true)}
            />
          )}
        </div>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />

      <Dialog open={!!workspaceToDelete} onOpenChange={(open) => !open && setWorkspaceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the workspace <strong>{workspaceToDelete?.name}</strong>? 
              This action cannot be undone and will permanently delete all projects and tasks inside it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWorkspaceToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const WorkspaceCard = ({ 
  workspace, 
  onDelete 
}: { 
  workspace: Workspace, 
  onDelete: () => void 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const ownerId = typeof workspace.owner === "string" ? workspace.owner : workspace.owner?._id;
  const isOwner = user?._id === ownerId;

  return (
    <Card 
      className="transition-all hover:shadow-md hover:-translate-y-1 h-full flex flex-col cursor-pointer"
      onClick={() => navigate(`/workspaces/${workspace._id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <WorkspaceAvatar name={workspace.name} color={workspace.color} />

            <div>
              <CardTitle>{workspace.name}</CardTitle>
              <span className="text-xs text-muted-foreground">
                Created at {format(workspace.createdAt, "MMM d, yyyy h:mm a")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-muted-foreground">
              <Users className="size-4 mr-1" />
              <span className="text-xs">{workspace.members.length}</span>
            </div>
            {isOwner && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <CardDescription className="line-clamp-2 mt-2">
          {workspace.description || "No description"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex items-end">
        <div className="text-sm text-muted-foreground w-full">
          View workspace details and projects
        </div>
      </CardContent>
    </Card>
  );
};

export default Workspaces;
