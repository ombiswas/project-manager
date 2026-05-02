import type { ProjectMemberRole, Task, User } from "@/types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { useUpdateTaskAssigneesMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskAssigneesSelector = ({
  task,
  assignees,
  projectMembers,
}: {
  task: Task;
  assignees: User[];
  projectMembers: { user: User; role: ProjectMemberRole }[];
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    assignees.map((assignee) => assignee._id)
  );
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const { mutate, isPending } = useUpdateTaskAssigneesMutation();

  const handleSelectAll = () => {
    const allIds = projectMembers.map((m) => m.user._id);

    setSelectedIds(allIds);
  };

  const handleUnSelectAll = () => {
    setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    let newSelected: string[] = [];

    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((sid) => sid !== id);
    } else {
      newSelected = [...selectedIds, id];
    }

    setSelectedIds(newSelected);
  };

  const handleSave = () => {
    mutate(
      {
        taskId: task._id,
        assignees: selectedIds,
      },
      {
        onSuccess: () => {
          setDropDownOpen(false);
          toast.success("Assignees updated successfully");
        },
        onError: (error: any) => {
          const errMessage =
            error.response?.data?.message || "Failed to update assignees";
          toast.error(errMessage);
          console.log(error);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedIds.length === 0 ? (
          <span className="text-sm text-muted-foreground italic bg-muted/20 px-3 py-1.5 rounded-md border">No assignees selected</span>
        ) : (
          projectMembers
            .filter((member) => selectedIds.includes(member.user._id))
            .map((m) => (
              <div
                key={m.user._id}
                className="flex items-center bg-secondary/50 border rounded-full px-2.5 py-1 transition-colors hover:bg-secondary"
              >
                <Avatar className="size-5 mr-2">
                  <AvatarImage src={m.user.profilePicture} />
                  <AvatarFallback className="text-[10px]">{m.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-secondary-foreground">
                  {m.user.name}
                </span>
              </div>
            ))
        )}
      </div>

      {/* dropdown */}
      <div className="relative">
        <button
          className="text-sm text-muted-foreground w-full border rounded-md px-3 py-2 text-left bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          onClick={() => setDropDownOpen(!dropDownOpen)}
        >
          {selectedIds.length === 0
            ? "Select assignees..."
            : `${selectedIds.length} assignee${selectedIds.length > 1 ? 's' : ''} selected`}
        </button>

        {dropDownOpen && (
          <div className="absolute z-50 mt-1 w-full bg-popover border text-popover-foreground rounded-md shadow-md max-h-60 flex flex-col overflow-hidden">
            <div className="flex justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
              <button
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                onClick={handleSelectAll}
              >
                Select all
              </button>
              <button
                className="text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors"
                onClick={handleUnSelectAll}
              >
                Unselect all
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-1">
              {projectMembers.map((m) => (
                <label
                  className="flex items-center px-2 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors"
                  key={m.user._id}
                >
                  <Checkbox
                    checked={selectedIds.includes(m.user._id)}
                    onCheckedChange={() => handleSelect(m.user._id)}
                    className="mr-3"
                  />

                  <Avatar className="size-6 mr-3 border shadow-sm">
                    <AvatarImage src={m.user.profilePicture} />
                    <AvatarFallback className="text-[10px]">{m.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <span className="text-sm font-medium">{m.user.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 px-3 py-2 border-t bg-muted/30 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClickCapture={() => setDropDownOpen(false)}
                disabled={isPending}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClickCapture={() => handleSave()}
                className="h-8 text-xs"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
