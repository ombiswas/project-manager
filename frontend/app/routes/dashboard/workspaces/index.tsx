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

import { ErrorState } from "@/components/error-state";
import { getErrorMessage } from "@/lib/fetch-util";

const Workspaces = () => {
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);
  
  const { data: workspaces = [], isLoading, isError, error, refetch } = useGetWorkspacesQuery() as {
    data: Workspace[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
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

  if (isError) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-3xl font-bold">Workspaces</h2>
          <Button onClick={() => setIsCreatingWorkspace(true)}>
            <PlusCircle className="size-4 mr-2" />
            New Workspace
          </Button>
        </div>
        <ErrorState
          title="Failed to load workspaces"
          message={getErrorMessage(error, "Could not retrieve your workspaces.")}
          onRetry={() => refetch()}
        />
        <CreateWorkspace
          isCreatingWorkspace={isCreatingWorkspace}
          setIsCreatingWorkspace={setIsCreatingWorkspace}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="caption-mono text-xs text-[#7d8187]">ORGANIZATION</p>
            <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">Workspaces</h1>
          </div>

          <Button onClick={() => setIsCreatingWorkspace(true)} className="w-fit">
            <PlusCircle className="size-4 mr-2" />
            New Workspace
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {workspaces.map((ws) => (
            <WorkspaceCard 
              key={ws._id} 
              workspace={ws} 
              onDelete={() => setWorkspaceToDelete(ws)} 
            />
          ))}

          {workspaces.length === 0 && (
            <div className="col-span-full">
              <NoDataFound
                title="No workspaces found"
                description="Create a new workspace to get started"
                buttonText="Create Workspace"
                buttonAction={() => setIsCreatingWorkspace(true)}
              />
            </div>
          )}
        </div>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />

      <Dialog open={!!workspaceToDelete} onOpenChange={(open) => !open && setWorkspaceToDelete(null)}>
        <DialogContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-normal tracking-tight text-white">
              Delete Workspace
            </DialogTitle>
            <DialogDescription className="text-xs text-[#7d8187]">
              Are you sure you want to delete <span className="text-white font-medium">{workspaceToDelete?.name}</span>? 
              This action cannot be undone and will permanently delete all projects and tasks inside it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
      className="bg-[#191919] border border-[#212327] rounded-[8px] p-5 shadow-none transition-colors hover:border-[#363a3f] h-full flex flex-col cursor-pointer group"
      onClick={() => navigate(`/workspaces/${workspace._id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <WorkspaceAvatar name={workspace.name} color={workspace.color} />

          <div className="min-w-0">
            <h3 className="text-sm font-normal text-white group-hover:text-white/80 transition-colors truncate">
              {workspace.name}
            </h3>
            <span className="font-mono text-[11px] text-[#7d8187]">
              {format(new Date(workspace.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center text-[#7d8187] font-mono text-xs">
            <Users className="size-3.5 mr-1" />
            <span>{workspace.members.length}</span>
          </div>
          {isOwner && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full text-[#7d8187] hover:text-[#ff7a17] hover:bg-[#1a1c20]"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-[#7d8187] line-clamp-2 flex-1 mb-4">
        {workspace.description || "No description provided."}
      </p>

      <div className="pt-3 border-t border-[#212327] flex items-center justify-between font-mono text-[11px] text-[#7d8187] uppercase tracking-[1px]">
        <span>WORKSPACE</span>
        <span className="text-white group-hover:underline">VIEW &rarr;</span>
      </div>
    </Card>
  );
};

export default Workspaces;
