import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectStatus } from "@/types";
import { UseProjectQuery, UseUpdateProject, UseDeleteProject } from "@/hooks/use-project";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Trash2, Save, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProjectSettings = () => {
  const { user: currentUser } = useAuth();
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const { data, isLoading } = UseProjectQuery(projectId!) as any;
  const { data: workspaceData, isLoading: isLoadingWorkspace } = useGetWorkspaceDetailsQuery(workspaceId!) as any;
  const { mutate: updateProject, isPending: isUpdating } = UseUpdateProject();
  const { mutate: deleteProject, isPending: isDeleting } = UseDeleteProject();

  const createdBy = data?.project?.createdBy?._id || data?.project?.createdBy;
  const workspaceOwnerId = String(workspaceData?.owner?._id || workspaceData?.owner || "");
  const currentUserId = String(currentUser?._id || "");
  const isWorkspaceOwner = workspaceOwnerId && currentUserId && workspaceOwnerId === currentUserId;

  const currentUserWorkspaceRole = isWorkspaceOwner ? "owner" : workspaceData?.members?.find(
    (m: any) => String(m.user?._id || m.user) === currentUserId
  )?.role;

  const projectCreatorId = String(createdBy || "");
  const isCreatorOwner = workspaceOwnerId && projectCreatorId && workspaceOwnerId === projectCreatorId;
  
  const creatorMember = workspaceData?.members?.find(
    (m: any) => String(m.user?._id || m.user) === projectCreatorId
  );
  const creatorRole = isCreatorOwner ? "owner" : (creatorMember?.role || "member");

  let canDelete = false;
  let canUpdate = false;

  if (currentUserWorkspaceRole === "owner" || currentUserWorkspaceRole === "admin") {
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
      setProjectMembers(data.project.members.map((m: any) => m._id || m));
    }
  }, [data]);

  if (isLoading || isLoadingWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader label="Loading project settings..." />
      </div>
    );
  }

  const handleUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const projectData: any = { 
      title, 
      description, 
      tags: tags.split(",").map((t) => t.trim()).filter((t) => t !== ""),
      members: projectMembers 
    };
    
    if (status) {
      projectData.status = status as ProjectStatus;
    }

    updateProject(
      {
        projectId: projectId!,
        projectData,
      },
      {
        onSuccess: () => {
          toast.success("Project updated successfully");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to update project");
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
      onError: (error: any) => {
        if (error?.response?.status !== 403 && error?.response?.status !== 404) {
          toast.error(error?.response?.data?.message || "Failed to delete project");
        }
      },
    });
  };

  const workspaceMembers = workspaceData?.members || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 px-4 md:px-0">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Project Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update your project's basic details and current status.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Project Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProjectStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Enter tags separated by comma"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/50 px-6 py-4 rounded-b-lg">
              <Button type="submit" disabled={isUpdating || !canUpdate}>
                <Save className="size-4 mr-2" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Project Members
            </CardTitle>
            <CardDescription>
              Manage who has access to this project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg divide-y">
              {workspaceMembers.map((member: any) => {
                const isProjectMember = projectMembers.includes(String(member.user._id));

                return (
                  <div key={member.user._id} className="flex items-center justify-between p-4 bg-card">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`member-${member.user._id}`}
                        checked={isProjectMember}
                        onCheckedChange={(checked) => handleMemberToggle(String(member.user._id), checked as boolean)}
                      />
                      <Avatar className="size-8">
                        <AvatarImage src={member.user.profilePicture} />
                        <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor={`member-${member.user._id}`} className="font-medium cursor-pointer">
                          {member.user.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t bg-muted/50 px-6 py-4 rounded-b-lg">
            <Button onClick={handleUpdate} disabled={isUpdating || !canUpdate}>
              <Save className="size-4 mr-2" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-red-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-red-50/50">
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-600/70">
              Irreversible actions related to this project.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm">Delete this project</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Once deleted, all data including tasks, comments, and activity will be permanently removed.
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
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the project
              <strong> {title}</strong> and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
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
