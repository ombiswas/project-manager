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
import { useUpdateWorkspaceMutation } from "@/hooks/use-workspace";
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

    const { mutate, isPending } = useUpdateWorkspaceMutation();

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
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Workspace</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter workspace name" {...field} />
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
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Workspace Description"
                                                rows={3} />
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
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-3 flex-wrap">
                                                {colorOptions.map((color) => (
                                                    <div
                                                        key={color}
                                                        onClick={() => field.onChange(color)}
                                                        className={cn(
                                                            "w-6 h-6 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300",
                                                            field.value === color &&
                                                            "ring-2 ring-offset-2 ring-blue-500"
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

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditingWorkspace(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
