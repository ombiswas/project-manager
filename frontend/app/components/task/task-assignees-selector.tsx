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
import { getErrorMessage } from "@/lib/fetch-util";

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
  const { mutate: updateAssignees, isPending } =
    useUpdateTaskAssigneesMutation();

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
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to update assignees"));
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187] flex items-center gap-2">
          <Users className="size-3.5" />
          Assignees
        </h4>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {assignees.length === 0 && !canEdit && (
          <span className="text-xs font-mono text-[#7d8187]">NO ASSIGNEES</span>
        )}

        {assignees
          .filter((a) => !!a)
          .map((assignee) => (
            <span
              key={assignee._id}
              className="inline-flex items-center gap-1.5 pl-1.5 py-1 pr-2.5 rounded-full bg-[#1a1c20] border border-[#212327] text-white"
            >
              <Avatar className="size-5 rounded-full border border-[#212327]">
                <AvatarImage src={assignee.profilePicture} />
                <AvatarFallback className="text-[9px] font-mono bg-[#141517] text-white">
                  {assignee.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-normal text-white">
                {assignee.name || "Unknown"}
              </span>
              {canEdit && (
                <X
                  className="size-3 cursor-pointer text-[#7d8187] hover:text-[#ff7a17] transition-colors ml-0.5"
                  onClick={() => handleToggle(assignee._id, false)}
                />
              )}
            </span>
          ))}

        {canEdit && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
              >
                <Plus className="size-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 p-0 bg-[#141517] border border-[#212327] rounded-[8px] text-white"
              align="start"
            >
              <div className="p-2.5 border-b border-[#212327]">
                <span className="text-[10px] font-mono uppercase tracking-[1.2px] text-[#7d8187] px-1">
                  Project Members
                </span>
              </div>
              <div className="p-1 max-h-60 overflow-y-auto">
                {projectMembers
                  .filter((m) => !!m)
                  .map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 p-2 hover:bg-[#1a1c20] rounded-[6px] cursor-pointer transition-colors"
                      onClick={() =>
                        handleToggle(
                          member._id,
                          !selectedIds.includes(member._id)
                        )
                      }
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
                        <Avatar className="size-6 border border-[#212327]">
                          <AvatarImage src={member.profilePicture} />
                          <AvatarFallback className="text-[9px] font-mono bg-[#1a1c20] text-white">
                            {member.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-normal text-white truncate">
                            {member.name || "Unknown"}
                          </span>
                          <span className="text-[10px] font-mono text-[#7d8187] truncate">
                            {member.email}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                {projectMembers.length === 0 && (
                  <p className="text-xs font-mono text-center py-4 text-[#7d8187]">
                    NO MEMBERS FOUND
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
