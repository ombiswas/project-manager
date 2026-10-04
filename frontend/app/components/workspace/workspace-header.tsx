import type { User, Workspace } from "@/types";
import { WorkspaceAvatar } from "./workspace-avatar";
import { Button } from "../ui/button";
import { Plus, UserPlus, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/provider/auth-context";

interface WorkspaceHeaderProps {
  workspace: Workspace;
  members: {
    _id: string;
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
    joinedAt: Date;
  }[];
  onCreateProject: () => void;
  onInviteMember: () => void;
  onEditWorkspace: () => void;
}

export const WorkspaceHeader = ({
  workspace,
  members,
  onCreateProject,
  onInviteMember,
  onEditWorkspace,
}: WorkspaceHeaderProps) => {
  const { user } = useAuth();

  const currentUserMember = members.find((m) => m.user._id === user?._id);
  const currentUserRole = currentUserMember?.role;

  const canCreateProject = ["owner", "admin"].includes(currentUserRole || "");
  const canInviteMember = ["owner", "admin"].includes(currentUserRole || "");
  const canEditWorkspace = ["owner", "admin"].includes(currentUserRole || "");

  return (
    <div className="space-y-6 pb-2">
      <div className="space-y-3">
        <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex md:items-center gap-3.5">
            {workspace.color && (
              <WorkspaceAvatar color={workspace.color} name={workspace.name} />
            )}

            <div>
              <p className="caption-mono text-[10px] text-[#7d8187]">
                WORKSPACE
              </p>
              <h1 className="text-2xl font-normal tracking-[-0.6px] text-white">
                {workspace.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {canEditWorkspace && (
              <Button
                variant="outline"
                size="icon"
                onClick={onEditWorkspace}
                title="Workspace Settings"
                className="rounded-full"
              >
                <Settings className="size-4" />
              </Button>
            )}

            {canInviteMember && (
              <Button variant="outline" onClick={onInviteMember}>
                <UserPlus className="size-3.5 mr-2" />
                Invite
              </Button>
            )}

            {canCreateProject && (
              <Button onClick={onCreateProject}>
                <Plus className="size-3.5 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        </div>

        {workspace.description && (
          <p className="text-sm text-[#dadbdf] max-w-3xl">
            {workspace.description}
          </p>
        )}
      </div>

      {members.length > 0 && (
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
            MEMBERS
          </span>

          <div className="flex items-center -space-x-1.5">
            {members.map((member) => (
              <Avatar
                key={member._id}
                className="relative h-7 w-7 rounded-full border border-[#212327] bg-[#1a1c20]"
                title={member.user.name}
              >
                <AvatarImage
                  src={member.user.profilePicture}
                  alt={member.user.name}
                />
                <AvatarFallback className="text-[11px] font-mono text-white bg-[#1a1c20]">
                  {member.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
