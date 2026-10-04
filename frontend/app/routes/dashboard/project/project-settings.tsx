import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProjectStatus,
  type ProjectTasksResponse,
  type Workspace,
  type WorkspaceMember,
} from "@/types";
import {
  UseProjectQuery,
  UseUpdateProject,
  UseDeleteProject,
} from "@/hooks/use-project";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import { getErrorMessage } from "@/lib/fetch-util";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Trash2, Save, AlertTriangle, Users } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProjectSettings = () => {
  const { user: currentUser } = useAuth();
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = UseProjectQuery(
    projectId!
  ) as {
    data: ProjectTasksResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
  const { data: workspaceData, isLoading: isLoadingWorkspace } =
    useGetWorkspaceDetailsQuery(workspaceId!) as {
      data: Workspace | undefined;
      isLoading: boolean;
    };
  const { mutate: updateProject, isPending: isUpdating } = UseUpdateProject();
  const { mutate: deleteProject, isPending: isDeleting } = UseDeleteProject();

  const workspaceOwnerId =
    typeof workspaceData?.owner === "string"
      ? workspaceData.owner
      : workspaceData?.owner?._id || "";
  const currentUserId = String(currentUser?._id || "");
  const isWorkspaceOwner =
    workspaceOwnerId && currentUserId && workspaceOwnerId === currentUserId;

  const currentUserWorkspaceRole = isWorkspaceOwner
    ? "owner"
    : workspaceData?.members?.find(
        (m) => String(m.user?._id || m.user) === currentUserId
      )?.role;

  let canDelete = false;
  let canUpdate = false;

  if (
    currentUserWorkspaceRole === "owner" ||
    currentUserWorkspaceRole === "admin"
  ) {
    canDelete = true;
    canUpdate = true;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [tags, setTags] = useState("");
  const [projectMembers, setProjectMembers] = useState<string[]>([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (data?.project) {
      setTitle(data.project.title);
      setDescription(data.project.description || "");
      setStatus(data.project.status);
      setTags(data.project.tags?.join(",") || "");
      setProjectMembers(
        data.project.members.map((m) => (typeof m === "string" ? m : m._id))
      );
    }
  }, [data]);

  if (isLoading || isLoadingWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader label="Loading project settings..." />
      </div>
    );
  }

  if (isError || !data?.project) {
    return (
      <div className="space-y-4 py-8">
        <BackButton className="w-fit" />
        <ErrorState
          title="Project not found"
          message={getErrorMessage(
            error,
            "Could not load settings for this project."
          )}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const handleUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const projectData = {
      title,
      description,
      status: (status || ProjectStatus.PLANNING) as ProjectStatus,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),
      members: projectMembers,
    };

    updateProject(
      {
        projectId: projectId!,
        projectData,
      },
      {
        onSuccess: () => {
          toast.success("Project updated successfully");
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to update project"));
        },
      }
    );
  };

  const handleMemberToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setProjectMembers([...projectMembers, userId]);
    } else {
      setProjectMembers(projectMembers.filter((id) => id !== userId));
    }
  };

  const handleDelete = () => {
    deleteProject(projectId!, {
      onSuccess: () => {
        toast.success("Project deleted successfully");
        navigate(`/workspaces/${workspaceId}`);
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "Failed to delete project"));
      },
    });
  };

  const workspaceMembers = workspaceData?.members || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 px-4 md:px-0">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <p className="caption-mono text-[10px] text-[#7d8187]">
            CONFIGURATION
          </p>
          <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">
            Project Settings
          </h1>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-[#191919] border border-[#212327] rounded-[8px] p-6 shadow-none">
          <CardHeader className="p-0 pb-5 border-b border-[#212327]">
            <CardTitle className="text-base font-normal text-white">
              General Information
            </CardTitle>
            <p className="text-xs text-[#7d8187]">
              Update basic parameters and status for this project.
            </p>
          </CardHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4 py-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="title"
                  className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]"
                >
                  Project Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="description"
                  className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project"
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="status"
                  className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]"
                >
                  Project Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as ProjectStatus)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white">
                    {Object.values(ProjectStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="tags"
                  className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]"
                >
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Enter tags separated by comma"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-[#212327]">
              <Button type="submit" disabled={isUpdating || !canUpdate}>
                <Save className="size-4 mr-2" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="bg-[#191919] border border-[#212327] rounded-[8px] p-6 shadow-none">
          <CardHeader className="p-0 pb-5 border-b border-[#212327]">
            <CardTitle className="text-base font-normal text-white flex items-center gap-2">
              <Users className="size-4 text-[#7d8187]" />
              Project Members
            </CardTitle>
            <p className="text-xs text-[#7d8187]">
              Manage who has access to this project.
            </p>
          </CardHeader>
          <div className="space-y-3 py-5">
            <div className="space-y-2">
              {workspaceMembers.map((member: WorkspaceMember) => {
                const isProjectMember = projectMembers.includes(
                  String(member.user._id)
                );

                return (
                  <div
                    key={member.user._id}
                    className="flex items-center justify-between p-3 bg-[#141517] border border-[#212327] rounded-[8px] hover:border-[#363a3f] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`member-${member.user._id}`}
                        checked={isProjectMember}
                        onCheckedChange={(checked) =>
                          handleMemberToggle(
                            String(member.user._id),
                            checked as boolean
                          )
                        }
                      />
                      <Avatar className="size-7 rounded-full border border-[#212327] bg-[#1a1c20]">
                        <AvatarImage src={member.user.profilePicture} />
                        <AvatarFallback className="text-[10px] font-mono bg-[#1a1c20] text-white">
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label
                          htmlFor={`member-${member.user._id}`}
                          className="text-sm font-normal text-white cursor-pointer"
                        >
                          {member.user.name}
                        </Label>
                        <p className="text-xs font-mono text-[#7d8187]">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-[#212327]">
            <Button onClick={handleUpdate} disabled={isUpdating || !canUpdate}>
              <Save className="size-4 mr-2" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        <Card className="border border-[#ff7a17]/30 bg-[#191919] rounded-[8px] p-6 shadow-none">
          <CardHeader className="p-0 pb-4 border-b border-[#212327]">
            <CardTitle className="text-xs font-mono uppercase tracking-[1.2px] text-[#ff7a17] flex items-center gap-2">
              <AlertTriangle className="size-4" />
              Danger Zone
            </CardTitle>
            <p className="text-xs text-[#7d8187]">
              Irreversible actions related to this project.
            </p>
          </CardHeader>
          <div className="pt-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-normal text-sm text-white">
                  Delete this project
                </h4>
                <p className="text-xs text-[#7d8187] mt-0.5">
                  Once deleted, all data including tasks, comments, and activity
                  will be permanently removed.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full md:w-auto"
                disabled={!canDelete}
              >
                <Trash2 className="size-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-normal tracking-tight text-white">
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#7d8187]">
              This action cannot be undone. This will permanently delete the
              project
              <strong className="text-white"> {title}</strong> and all
              associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectSettings;
