import { projectSchema } from "@/lib/schema";
import { ProjectStatus, type MemberProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { UseCreateProject } from "@/hooks/use-project";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/fetch-util";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceMembers: MemberProps[];
}

export type CreateProjectFormData = z.infer<typeof projectSchema>;

export const CreateProjectDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
  workspaceMembers,
}: CreateProjectDialogProps) => {
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      status: ProjectStatus.PLANNING,
      startDate: "",
      dueDate: "",
      members: [],
      tags: undefined,
    },
  });
  const { mutate, isPending } = UseCreateProject();

  const onSubmit = (values: CreateProjectFormData) => {
    if (!workspaceId) return;

    mutate(
      {
        projectData: values,
        workspaceId,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          form.reset();
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to create project"));
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-[#141517] border border-[#212327] rounded-[8px] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <p className="caption-mono text-[10px] text-[#7d8187]">
            PROJECT SETUP
          </p>
          <DialogTitle className="text-xl font-normal tracking-[-0.5px] text-white">
            Create Project
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                    Project Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Autonomous Navigation, Core Engine..."
                    />
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
                    Project Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Objectives and scope of this project"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-[#ff7a17]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                    Project Status
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Project Status" />
                      </SelectTrigger>

                      <SelectContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white">
                        {Object.values(ProjectStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-xs text-[#ff7a17]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={
                              "w-full justify-start text-left font-normal " +
                              (!field.value ? "text-[#7d8187]" : "text-white")
                            }
                          >
                            <CalendarIcon className="size-4 mr-2 text-[#7d8187]" />
                            {field.value ? (
                              format(new Date(field.value), "PP")
                            ) : (
                              <span>Pick date</span>
                            )}
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              field.onChange(date?.toISOString() || undefined);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage className="text-xs text-[#ff7a17]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                      Due Date
                    </FormLabel>
                    <FormControl>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={
                              "w-full justify-start text-left font-normal " +
                              (!field.value ? "text-[#7d8187]" : "text-white")
                            }
                          >
                            <CalendarIcon className="size-4 mr-2 text-[#7d8187]" />
                            {field.value ? (
                              format(new Date(field.value), "PP")
                            ) : (
                              <span>Pick date</span>
                            )}
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="bg-[#141517] border border-[#212327] rounded-[8px] text-white p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              field.onChange(date?.toISOString() || undefined);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage className="text-xs text-[#ff7a17]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                    Tags
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="infrastructure, ml, api..."
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-[#ff7a17]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="members"
              render={({ field }) => {
                const selectedMembers = field.value || [];

                return (
                  <FormItem>
                    <FormLabel className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                      Members
                    </FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                          >
                            {selectedMembers.length === 0 ? (
                              <span className="text-[#7d8187]">
                                Select Members
                              </span>
                            ) : selectedMembers.length <= 3 ? (
                              selectedMembers
                                .map((id) => {
                                  const member = workspaceMembers.find(
                                    (wm) => wm.user._id === id
                                  );
                                  return member?.user.name;
                                })
                                .join(", ")
                            ) : (
                              `${selectedMembers.length} members selected`
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-full max-w-60 p-2 overflow-y-auto bg-[#141517] border border-[#212327] rounded-[8px] text-white"
                          align="start"
                        >
                          <div className="flex flex-col gap-1">
                            {workspaceMembers.map((member) => {
                              const isSelected = selectedMembers.includes(
                                member.user._id
                              );

                              return (
                                <div
                                  key={member._id}
                                  className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors"
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([
                                          ...selectedMembers,
                                          member.user._id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          selectedMembers.filter(
                                            (id) => id !== member.user._id
                                          )
                                        );
                                      }
                                    }}
                                    id={`member-${member.user._id}`}
                                  />
                                  <label
                                    htmlFor={`member-${member.user._id}`}
                                    className="flex-1 text-sm cursor-pointer truncate"
                                  >
                                    {member.user.name}
                                  </label>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] scale-90"
                                  >
                                    {member.role}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
