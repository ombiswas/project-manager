import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import {
  useAcceptGenerateInviteMutation,
  useAcceptInviteByTokenMutation,
  useGetWorkspaceDetailsQuery,
} from "@/hooks/use-workspace";
import { getErrorMessage } from "@/lib/fetch-util";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";

const WorkspaceInvite = () => {
  const { workspaceId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("tk");
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const invitedInfo = useMemo(() => {
    if (!token) return null;
    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return null;
      const jsonString = atob(
        payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
      );
      return JSON.parse(jsonString) as {
        email?: string;
        user?: string;
        workspaceId?: string;
        role?: string;
      };
    } catch {
      return null;
    }
  }, [token]);

  const {
    data: workspace,
    isLoading,
    isError,
  } = useGetWorkspaceDetailsQuery(workspaceId || "", token) as {
    data: Workspace | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  const isAlreadyMember = useMemo(() => {
    if (!workspace || !currentUser) return false;
    const userIdStr = currentUser._id?.toString();
    const ownerId = (
      (workspace.owner as { _id?: string })?._id || workspace.owner
    )?.toString();
    const isOwner = ownerId === userIdStr;
    const isMem = (workspace.members || []).some((m) => {
      const memberUser = (m as { user?: { _id?: string } | string }).user;
      const memberUserId = (memberUser as { _id?: string })?._id || memberUser;
      return memberUserId?.toString() === userIdStr;
    });
    return isOwner || isMem;
  }, [workspace, currentUser]);

  const isAccountMismatch = Boolean(
    invitedInfo?.email &&
    currentUser?.email &&
    invitedInfo.email.toLowerCase().trim() !==
      currentUser.email.toLowerCase().trim()
  );

  const {
    mutate: acceptInviteByToken,
    isPending: isAcceptInviteByTokenPending,
  } = useAcceptInviteByTokenMutation();

  const {
    mutate: acceptGenerateInvite,
    isPending: isAcceptGenerateInvitePending,
  } = useAcceptGenerateInviteMutation();

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-10 pb-20 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Workspace Not Found</CardTitle>
            <CardDescription>
              No workspace ID was specified in the invite link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/workspaces")} className="w-full">
              Go to Workspaces
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAcceptInvite = () => {
    if (!workspaceId) return;

    if (token) {
      acceptInviteByToken(token, {
        onSuccess: () => {
          toast.success("Invitation accepted");
          navigate(`/workspaces/${workspaceId}`);
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to accept invitation"));
        },
      });
    } else {
      acceptGenerateInvite(workspaceId, {
        onSuccess: () => {
          toast.success("Invitation accepted");
          navigate(`/workspaces/${workspaceId}`);
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, "Failed to accept invitation"));
        },
      });
    }
  };

  const handleDeclineInvite = () => {
    toast.info("Invitation declined");
    navigate("/workspaces");
  };

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center pt-10 pb-20 px-4">
        <Loader label="Validating workspace invitation..." />
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-10 pb-20 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid or Expired Invitation</CardTitle>
            <CardDescription>
              This workspace invitation is invalid, has expired, or does not
              exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/workspaces")} className="w-full">
              Go to Workspaces
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAlreadyMember && workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] py-12 px-4">
        <Card className="max-w-md w-full bg-[#141517] border border-[#212327] rounded-[8px] p-6 shadow-none">
          <CardHeader className="p-0 pb-4">
            <p className="caption-mono text-xs text-[#7d8187] mb-2">
              WORKSPACE ACCESS
            </p>
            <div className="flex items-center gap-3 mb-2">
              <WorkspaceAvatar name={workspace.name} color={workspace.color} />
              <h2 className="text-xl font-normal tracking-tight text-white">
                {workspace.name}
              </h2>
            </div>
            <p className="text-sm text-[#dadbdf]">
              You are already a member of the{" "}
              <span className="text-white font-medium">{workspace.name}</span>{" "}
              workspace.
            </p>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {workspace.description && (
              <p className="text-xs text-[#7d8187] bg-[#1a1c20] p-3 rounded-[8px] border border-[#212327]">
                {workspace.description}
              </p>
            )}
            <Button
              onClick={() => navigate(`/workspaces/${workspace._id}`)}
              className="w-full"
            >
              Go to Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] py-12 px-4">
      <Card className="max-w-md w-full bg-[#141517] border border-[#212327] rounded-[8px] p-6 shadow-none">
        <CardHeader className="p-0 pb-4">
          <p className="caption-mono text-xs text-[#7d8187] mb-2">
            WORKSPACE INVITATION
          </p>
          <div className="flex items-center gap-3 mb-2">
            <WorkspaceAvatar name={workspace.name} color={workspace.color} />
            <h2 className="text-xl font-normal tracking-tight text-white">
              {workspace.name}
            </h2>
          </div>
          <p className="text-sm text-[#dadbdf]">
            You have been invited to join the{" "}
            <span className="text-white font-medium">{workspace.name}</span>{" "}
            workspace.
          </p>
        </CardHeader>
        <CardContent className="p-0 space-y-5">
          {isAccountMismatch && (
            <div className="bg-[#241712] border border-[#ff5733]/30 rounded-[8px] p-3.5 text-xs text-[#ffb099] flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#ff5733] mt-0.5" />
                <span className="leading-relaxed">
                  You are signed in as{" "}
                  <strong className="text-white">{currentUser?.email}</strong>,
                  but this invitation was issued to{" "}
                  <strong className="text-white">{invitedInfo?.email}</strong>.
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit text-xs border-[#ff5733]/40 hover:bg-[#ff5733]/15 text-white"
                onClick={() => {
                  logout();
                  const currentQuery = window.location.search;
                  const redirectPath = encodeURIComponent(
                    `/workspace-invite/${workspace._id}${currentQuery}`
                  );
                  navigate(`/sign-in?redirect=${redirectPath}`);
                }}
              >
                Switch Account
              </Button>
            </div>
          )}

          {workspace.description && (
            <p className="text-xs text-[#7d8187] bg-[#1a1c20] p-3 rounded-[8px] border border-[#212327]">
              {workspace.description}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleAcceptInvite}
              disabled={
                isAcceptInviteByTokenPending || isAcceptGenerateInvitePending
              }
            >
              {isAcceptInviteByTokenPending || isAcceptGenerateInvitePending
                ? "Joining..."
                : "Accept Invitation"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDeclineInvite}
              disabled={
                isAcceptInviteByTokenPending || isAcceptGenerateInvitePending
              }
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceInvite;
