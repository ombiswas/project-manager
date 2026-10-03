import type { TaskStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/fetch-util";

export const TaskStatusSelector = ({
  status,
  taskId,
  canEdit = true,
}: {
  status: TaskStatus;
  taskId: string;
  canEdit?: boolean;
}) => {
  const { mutate, isPending } = useUpdateTaskStatusMutation();

  const handleStatusChange = (value: string) => {
    mutate(
      { taskId, status: value as TaskStatus },
      {
        onSuccess: () => {
          toast.success("Status updated successfully");
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to update status"));
        },
      }
    );
  };
  return (
    <Select value={status || ""} onValueChange={handleStatusChange} disabled={!canEdit}>
      <SelectTrigger className="w-[180px]" disabled={isPending || !canEdit}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="To Do">To Do</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Done">Done</SelectItem>
      </SelectContent>
    </Select>
  );
};
