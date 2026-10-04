import { workspaceSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useCreateWorkspace } from "@/hooks/use-workspace";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { Workspace } from "@/types";
import { getErrorMessage } from "@/lib/fetch-util";

interface CreateWorkspaceProps {
    isCreatingWorkspace: boolean;
    setIsCreatingWorkspace: (isCreating: boolean) => void;
}

export const colorOptions = [
    '#ff7a17', // Sunset
    '#ffc285', // Sunset soft
    '#7c3aed', // Dusk
    '#c4b5fd', // Twilight
    '#a0c3ec', // Breeze
    '#0d1726', // Midnight
    '#ffffff', // White
    '#7d8187', // Mute
];

export type WorkspaceForm = z.infer<typeof workspaceSchema>;

export const CreateWorkspace = ({
    isCreatingWorkspace,
    setIsCreatingWorkspace,
}: CreateWorkspaceProps) => {
    const form = useForm<WorkspaceForm>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: {
            name: '',
            color: colorOptions[0],
            description: '',

        }
    });
    const navigate = useNavigate();
    const { mutate, isPending } = useCreateWorkspace();

    const onSubmit = (data: WorkspaceForm) => {
        mutate(data, {
            onSuccess: (newWorkspace: Workspace) => {
                setIsCreatingWorkspace(false);
                toast.success("Workspace created successfully!");
                
                // Allow the dialog's close animation to finish before navigating and resetting
                setTimeout(() => {
                    form.reset();
                    navigate(`/workspaces/${newWorkspace._id}`);
                }, 300);
            },
            onError: (error: unknown) => {
                toast.error(getErrorMessage(error, "Failed to create workspace"));
            },
        });
    };

    return (
        <Dialog open={isCreatingWorkspace} onOpenChange={setIsCreatingWorkspace} modal={true}>
            <DialogContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <p className="caption-mono text-[10px] text-[#7d8187]">ORGANIZATION</p>
                    <DialogTitle className="text-xl font-normal tracking-[-0.5px] text-white">Create Workspace</DialogTitle>
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
                                            Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Engineering, Design, Ops..." {...field} />
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
                                                placeholder="Brief overview of this workspace"
                                                rows={3} />
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

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreatingWorkspace(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Creating..." : "Create Workspace"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};