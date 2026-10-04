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
import type { Workspace } from "@/types";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";

const WorkspaceInvite = () => {
  const { workspaceId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("tk");
  const navigate = useNavigate();

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

  const { data: workspace, isLoading, isError } = useGetWorkspaceDetailsQuery(
    workspaceId!
  ) as { data: Workspace | undefined; isLoading: boolean; isError: boolean };

  const {
    mutate: acceptInviteByToken,
    isPending: isAcceptInviteByTokenPending,
  } = useAcceptInviteByTokenMutation();

  const {
    mutate: acceptGenerateInvite,
    isPending: isAcceptGenerateInvitePending,
  } = useAcceptGenerateInviteMutation();

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
              This workspace invitation is invalid, has expired, or does not exist.
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] py-12 px-4">
      <Card className="max-w-md w-full bg-[#141517] border border-[#212327] rounded-[8px] p-6 shadow-none">
        <CardHeader className="p-0 pb-4">
          <p className="caption-mono text-xs text-[#7d8187] mb-2">WORKSPACE INVITATION</p>
          <div className="flex items-center gap-3 mb-2">
            <WorkspaceAvatar name={workspace.name} color={workspace.color} />
            <h2 className="text-xl font-normal tracking-tight text-white">{workspace.name}</h2>
          </div>
          <p className="text-sm text-[#dadbdf]">
            You have been invited to join the <span className="text-white font-medium">{workspace.name}</span> workspace.
          </p>
        </CardHeader>
        <CardContent className="p-0 space-y-5">
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
