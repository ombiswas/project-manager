import { Loader } from "@/components/loader";
import { CreateProjectDialog } from "@/components/project/create-project";
import { InviteMemberDialog } from "@/components/workspace/invite-member";
import { ProjectList } from "@/components/workspace/project-list";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { EditWorkspace } from "@/components/workspace/edit-workspace";
import { useGetWorkspaceQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import { useState } from "react";
import { useParams } from "react-router";

const WorkspaceDetails = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [isCreateProject, setIsCreateProject] = useState(false);
  const [isInviteMember, setIsInviteMember] = useState(false);
  const [isEditWorkspace, setIsEditWorkspace] = useState(false);

  if (!workspaceId) {
    return <div>No workspace found</div>;
  }

  const { data, isLoading } = useGetWorkspaceQuery(workspaceId) as {
    data: {
      workspace: Workspace;
      projects: Project[];
    };
    isLoading: boolean;
  };

  if (isLoading) return <Loader label="Loading workspace details..." />;

  const { user } = useAuth();
  const currentUserRole = data?.workspace?.members?.find((m: any) => (m.user?._id || m.user) === user?._id)?.role;
  const canCreateProject = ["owner", "admin"].includes(currentUserRole || "");

  return (
    <div className="space-y-8">
      <WorkspaceHeader
        workspace={data.workspace}
        members={data?.workspace?.members as any}
        onCreateProject={() => setIsCreateProject(true)}
        onInviteMember={() => setIsInviteMember(true)}
        onEditWorkspace={() => setIsEditWorkspace(true)}
      />

      <ProjectList
        workspaceId={workspaceId}
        projects={data.projects}
        canCreateProject={canCreateProject}
        onCreateProject={() => setIsCreateProject(true)}
      />

      <CreateProjectDialog
        isOpen={isCreateProject}
        onOpenChange={setIsCreateProject}
        workspaceId={workspaceId}
        workspaceMembers={data.workspace.members as any}
      />

      <InviteMemberDialog
        isOpen={isInviteMember}
        onOpenChange={setIsInviteMember}
        workspaceId={workspaceId}
      />

      {data.workspace && (
        <EditWorkspace
          isEditingWorkspace={isEditWorkspace}
          setIsEditingWorkspace={setIsEditWorkspace}
          workspace={data.workspace}
        />
      )}
    </div>
  );
};

export default WorkspaceDetails;
