import type { Task, User } from "@/types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Plus, Users, X } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { useUpdateTaskAssigneesMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";

export const TaskAssigneesSelector = ({
  task,
  assignees,
  projectMembers,
  canEdit = true,
}: {
  task: Task;
  assignees: User[];
  projectMembers: User[];
  canEdit?: boolean;
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    assignees.map((assignee) => assignee._id)
  );
  const { mutate: updateAssignees, isPending } = useUpdateTaskAssigneesMutation();

  const handleToggle = (userId: string, isChecked: boolean) => {
    if (!canEdit) return;

    let newIds = [...selectedIds];
    if (isChecked) {
      if (!newIds.includes(userId)) {
        newIds.push(userId);
      }
    } else {
      newIds = newIds.filter((id) => id !== userId);
    }

    setSelectedIds(newIds);
    updateAssignees(
      {
        taskId: task._id,
        assignees: newIds,
      },
      {
        onSuccess: () => {
          toast.success("Assignees updated successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update assignees");
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          Assignees
        </h4>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {assignees.length === 0 && !canEdit && (
          <span className="text-xs text-muted-foreground italic">No assignees</span>
        )}
        
        {assignees.filter(a => !!a).map((assignee) => (
          <Badge
            key={assignee._id}
            variant="secondary"
            className="flex items-center gap-1.5 pl-1 py-1 pr-2 rounded-full border-muted/50"
          >
            <Avatar className="size-5">
              <AvatarImage src={assignee.profilePicture} />
              <AvatarFallback className="text-[10px] bg-slate-100">
                {assignee.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{assignee.name || "Unknown"}</span>
            {canEdit && (
              <X 
                className="size-3 cursor-pointer hover:text-red-500 transition-colors ml-0.5" 
                onClick={() => handleToggle(assignee._id, false)}
              />
            )}
          </Badge>
        ))}

        {canEdit && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 rounded-full p-0 border-dashed hover:border-primary hover:text-primary transition-all"
              >
                <Plus className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 shadow-xl border-muted/40" align="start">
              <div className="p-2 border-b bg-muted/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Project Members
                </span>
              </div>
              <div className="p-1 max-h-64 overflow-y-auto">
                {projectMembers.filter(m => !!m).map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors"
                    onClick={() => handleToggle(member._id, !selectedIds.includes(member._id))}
                  >
                    <Checkbox
                      id={`assignee-${member._id}`}
                      checked={selectedIds.includes(member._id)}
                      onCheckedChange={(checked) =>
                        handleToggle(member._id, !!checked)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label
                      htmlFor={`assignee-${member._id}`}
                      className="flex-1 flex items-center gap-2 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Avatar className="size-6 shadow-sm">
                        <AvatarImage src={member.profilePicture} />
                        <AvatarFallback className="text-[10px]">
                          {member.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">{member.name || "Unknown"}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">{member.email}</span>
                      </div>
                    </Label>
                  </div>
                ))}
                {projectMembers.length === 0 && (
                  <p className="text-xs text-center py-4 text-muted-foreground italic">
                    No members found in this project.
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};
