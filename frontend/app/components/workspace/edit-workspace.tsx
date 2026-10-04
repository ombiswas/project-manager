import { workspaceSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useTransferOwnershipMutation,
} from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { colorOptions } from "./create-workspace";
import type { Workspace } from "@/types";
import { getErrorMessage } from "@/lib/fetch-util";

interface EditWorkspaceProps {
  isEditingWorkspace: boolean;
  setIsEditingWorkspace: (isEditing: boolean) => void;
  workspace: Workspace;
}

export type WorkspaceForm = z.infer<typeof workspaceSchema>;

export const EditWorkspace = ({
  isEditingWorkspace,
  setIsEditingWorkspace,
  workspace,
}: EditWorkspaceProps) => {
  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: workspace.name,
      color: workspace.color,
      description: workspace.description || "",
    },
  });

  useEffect(() => {
    if (workspace) {
      form.reset({
        name: workspace.name,
        color: workspace.color,
        description: workspace.description || "",
      });
    }
  }, [workspace, form]);

  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { mutate, isPending } = useUpdateWorkspaceMutation();
  const { mutate: deleteWorkspace, isPending: isDeleting } =
    useDeleteWorkspaceMutation();
  const { mutate: transferOwnership, isPending: isTransferring } =
    useTransferOwnershipMutation();

  const ownerId =
    typeof workspace.owner === "string"
      ? workspace.owner
      : workspace.owner?._id;
  const isOwner = ownerId === currentUser?._id;

  const handleTransfer = (newOwnerId: string) => {
    if (
      confirm(
        "Are you sure you want to transfer ownership? You will become an admin."
      )
    ) {
      transferOwnership(
        { workspaceId: workspace._id, newOwnerId },
        {
          onSuccess: () => {
            toast.success("Ownership transferred successfully!");
            setIsEditingWorkspace(false);
          },
          onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to transfer ownership"));
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you absolutely sure? This will delete the workspace and all projects/tasks. This action cannot be undone."
      )
    ) {
      deleteWorkspace(workspace._id, {
        onSuccess: () => {
          toast.success("Workspace deleted successfully!");
          navigate("/dashboard");
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to delete workspace"));
        },
      });
    }
  };

  const onSubmit = (data: WorkspaceForm) => {
    mutate(
      { workspaceId: workspace._id, workspaceData: data },
      {
        onSuccess: () => {
          setIsEditingWorkspace(false);
          toast.success("Workspace updated successfully!");
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to update workspace"));
        },
      }
    );
  };

  return (
    <Dialog
      open={isEditingWorkspace}
      onOpenChange={setIsEditingWorkspace}
      modal={true}
    >
      <DialogContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <p className="caption-mono text-[10px] text-[#7d8187]">SETTINGS</p>
          <DialogTitle className="text-xl font-normal tracking-[-0.5px] text-white">
            Workspace Settings
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                      Workspace Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter workspace name" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-[#ff7a17]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What is this workspace about?"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-[#ff7a17]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                      Accent Color
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2.5 flex-wrap pt-1">
                        {colorOptions.map((color) => (
                          <div
                            key={color}
                            onClick={() => field.onChange(color)}
                            className={cn(
                              "w-7 h-7 rounded-full cursor-pointer transition-all border border-white/10 hover:scale-105",
                              field.value === color &&
                                "ring-2 ring-white ring-offset-2 ring-offset-[#141517]"
                            )}
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-[#ff7a17]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingWorkspace(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>

        {isOwner && (
          <div className="mt-6 pt-6 border-t border-[#212327] space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-mono uppercase tracking-[1.2px] text-[#ff7a17] flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Danger Zone
              </h3>
              <p className="text-xs text-[#7d8187]">
                High-impact administrative actions. Proceed with caution.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-[8px] border border-[#212327] bg-[#191919] space-y-3">
                <div>
                  <h4 className="text-sm font-normal text-white">
                    Transfer Ownership
                  </h4>
                  <p className="text-xs text-[#7d8187] mt-0.5">
                    Grant owner status to another member. You will become an
                    admin.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {workspace.members
                    .filter((m) => {
                      const mId =
                        typeof m.user === "string" ? m.user : m.user?._id;
                      return mId && mId !== currentUser?._id;
                    })
                    .map((member) => {
                      const mId =
                        typeof member.user === "string"
                          ? member.user
                          : member.user?._id;
                      if (!mId) return null;
                      const memberName =
                        typeof member.user === "object" && member.user?.name
                          ? member.user.name
                          : "Member";
                      return (
                        <Button
                          key={mId}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => handleTransfer(mId)}
                          disabled={isTransferring}
                        >
                          Transfer to {memberName}
                        </Button>
                      );
                    })}
                  {workspace.members.length <= 1 && (
                    <p className="text-xs font-mono text-[#7d8187] py-1">
                      NO OTHER MEMBERS AVAILABLE
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-[8px] border border-[#ff7a17]/30 bg-[#191919] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-normal text-white">
                    Delete Workspace
                  </h4>
                  <p className="text-xs text-[#7d8187] max-w-sm">
                    Permanently delete this workspace and all associated
                    projects and tasks.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="sm:w-auto w-full"
                >
                  {isDeleting ? "Deleting..." : "Delete Workspace"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
