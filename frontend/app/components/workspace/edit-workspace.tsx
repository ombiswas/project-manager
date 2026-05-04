import { workspaceSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useUpdateWorkspaceMutation, useDeleteWorkspaceMutation, useTransferOwnershipMutation } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { colorOptions } from "./create-workspace";
import type { Workspace } from "@/types";

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
            description: workspace.description || '',
        }
    });

    useEffect(() => {
        if (workspace) {
            form.reset({
                name: workspace.name,
                color: workspace.color,
                description: workspace.description || '',
            });
        }
    }, [workspace, form]);

    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { mutate, isPending } = useUpdateWorkspaceMutation();
    const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspaceMutation();
    const { mutate: transferOwnership, isPending: isTransferring } = useTransferOwnershipMutation();

    const ownerId = typeof workspace.owner === "string" ? workspace.owner : workspace.owner?._id;
    const isOwner = ownerId === currentUser?._id;

    const handleTransfer = (newOwnerId: string) => {
        if (confirm("Are you sure you want to transfer ownership? You will become an admin.")) {
            transferOwnership({ workspaceId: workspace._id, newOwnerId }, {
                onSuccess: () => {
                    toast.success("Ownership transferred successfully!");
                    setIsEditingWorkspace(false);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Failed to transfer ownership");
                }
            });
        }
    };

    const handleDelete = () => {
        if (confirm("Are you absolutely sure? This will delete the workspace and all projects/tasks. This action cannot be undone.")) {
            deleteWorkspace(workspace._id, {
                onSuccess: () => {
                    toast.success("Workspace deleted successfully!");
                    navigate("/dashboard");
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Failed to delete workspace");
                }
            });
        }
    };

    const onSubmit = (data: WorkspaceForm) => {
        mutate({ workspaceId: workspace._id, workspaceData: data }, {
            onSuccess: () => {
                setIsEditingWorkspace(false);
                toast.success("Workspace updated successfully!");
            },
            onError: (error: any) => {
                const errorMessage = error?.response?.data?.message || "Failed to update workspace";
                toast.error(errorMessage);
                console.log(error);
            },
        });
    };

    return (
        <Dialog open={isEditingWorkspace} onOpenChange={setIsEditingWorkspace} modal={true}>
            <DialogContent className="max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-bold">Workspace Settings</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold">Workspace Name</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter workspace name" 
                                                className="h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="What is this workspace about?"
                                                className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all resize-none"
                                                rows={4} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold">Workspace Theme</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-3 flex-wrap pt-1">
                                                {colorOptions.map((color) => (
                                                    <div
                                                        key={color}
                                                        onClick={() => field.onChange(color)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-all duration-200 border-2 border-transparent",
                                                            field.value === color &&
                                                            "ring-2 ring-offset-2 ring-primary border-white"
                                                        )}
                                                        style={{ backgroundColor: color }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsEditingWorkspace(false)} 
                                disabled={isPending}
                                className="font-medium"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending} className="px-8 font-semibold">
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>

                {isOwner && (
                    <div className="mt-10 pt-8 border-t space-y-8 pb-4">
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="size-4" />
                                Danger Zone
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                High-impact administrative actions. Please proceed with caution.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 rounded-xl border border-red-100 bg-red-50/20 space-y-4">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Transfer Ownership</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Grant owner status to another member. You will be demoted to an Admin.
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {workspace.members
                                        .filter(m => (m.user?._id || m.user) !== currentUser?._id)
                                        .map(member => (
                                            <Button
                                                key={member.user?._id || member.user as any}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-9 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                                onClick={() => handleTransfer(member.user?._id || member.user as any)}
                                                disabled={isTransferring}
                                            >
                                                Transfer to {member.user?.name || "Member"}
                                            </Button>
                                        ))}
                                    {workspace.members.length <= 1 && (
                                        <p className="text-xs italic text-muted-foreground py-2">No other members available for transfer.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 rounded-xl border border-red-200 bg-red-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-red-800">Delete Workspace</h4>
                                    <p className="text-xs text-red-700/70 max-w-xs">
                                        This will permanently remove this workspace and all associated projects, tasks, and data.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="sm:w-auto w-full font-bold shadow-sm"
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
