import { Loader } from "@/components/loader";
import { ErrorState } from "@/components/error-state";
import { CreateProjectDialog } from "@/components/project/create-project";
import { InviteMemberDialog } from "@/components/workspace/invite-member";
import { ProjectList } from "@/components/workspace/project-list";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { EditWorkspace } from "@/components/workspace/edit-workspace";
import { useGetWorkspaceQuery } from "@/hooks/use-workspace";
import { getErrorMessage } from "@/lib/fetch-util";
import { useAuth } from "@/provider/auth-context";
import type { WorkspaceProjectsResponse } from "@/types";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

const WorkspaceDetails = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [isCreateProject, setIsCreateProject] = useState(false);
  const [isInviteMember, setIsInviteMember] = useState(false);
  const [isEditWorkspace, setIsEditWorkspace] = useState(false);

  if (!workspaceId) {
    return (
      <div className="py-12">
        <ErrorState
          title="Workspace not found"
          message="No workspace ID was specified in the route."
          onRetry={() => navigate("/workspaces")}
          retryText="Back to Workspaces"
        />
      </div>
    );
  }

  const { data, isLoading, isError, error, refetch } = useGetWorkspaceQuery(workspaceId) as {
    data: WorkspaceProjectsResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };

  const { user } = useAuth();

  if (isLoading) return <Loader label="Loading workspace details..." />;

  if (isError || !data?.workspace) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load workspace"
          message={getErrorMessage(error, "Could not load workspace details.")}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const currentUserRole = data.workspace.members?.find(
    (m) => (m.user?._id || m.user) === user?._id
  )?.role;
  const canCreateProject = ["owner", "admin"].includes(currentUserRole || "");

  return (
    <div className="space-y-8">
      <WorkspaceHeader
        workspace={data.workspace}
        members={data.workspace.members}
        onCreateProject={() => setIsCreateProject(true)}
        onInviteMember={() => setIsInviteMember(true)}
        onEditWorkspace={() => setIsEditWorkspace(true)}
      />

      <ProjectList
        workspaceId={workspaceId}
        projects={data.projects || []}
        canCreateProject={canCreateProject}
        onCreateProject={() => setIsCreateProject(true)}
      />

      <CreateProjectDialog
        isOpen={isCreateProject}
        onOpenChange={setIsCreateProject}
        workspaceId={workspaceId}
        workspaceMembers={data.workspace.members}
      />

      <InviteMemberDialog
        isOpen={isInviteMember}
        onOpenChange={setIsInviteMember}
        workspaceId={workspaceId}
      />

      <EditWorkspace
        isEditingWorkspace={isEditWorkspace}
        setIsEditingWorkspace={setIsEditWorkspace}
        workspace={data.workspace}
      />
    </div>
  );
};

export default WorkspaceDetails;
