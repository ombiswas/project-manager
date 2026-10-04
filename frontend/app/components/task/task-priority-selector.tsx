import type { TaskPriority } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateTaskPriorityMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/fetch-util";

export const TaskPrioritySelector = ({
  priority,
  taskId,
  canEdit = true,
}: {
  priority: TaskPriority;
  taskId: string;
  canEdit?: boolean;
}) => {
  const { mutate, isPending } = useUpdateTaskPriorityMutation();

  const handleStatusChange = (value: string) => {
    mutate(
      { taskId, priority: value as TaskPriority },
      {
        onSuccess: () => {
          toast.success("Priority updated successfully");
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to update priority"));
        },
      }
    );
  };
  return (
    <Select
      value={priority || ""}
      onValueChange={handleStatusChange}
      disabled={!canEdit}
    >
      <SelectTrigger className="w-[180px]" disabled={isPending || !canEdit}>
        <SelectValue placeholder="Priority" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="Low">Low</SelectItem>
        <SelectItem value="Medium">Medium</SelectItem>
        <SelectItem value="High">High</SelectItem>
      </SelectContent>
    </Select>
  );
};
