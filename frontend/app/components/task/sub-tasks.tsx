import type { Subtask } from "@/types";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/fetch-util";

export const SubTasksDetails = ({
  subTasks,
  taskId,
  canEdit = true,
}: {
  subTasks: Subtask[];
  taskId: string;
  canEdit?: boolean;
}) => {
  const [newSubTask, setNewSubTask] = useState("");
  const { mutate: addSubTask, isPending } = useAddSubTaskMutation();
  const { mutate: updateSubTask, isPending: isUpdating } =
    useUpdateSubTaskMutation();

  const handleToggleTask = (subTaskId: string, checked: boolean) => {
    updateSubTask(
      { taskId, subTaskId, completed: checked },
      {
        onSuccess: () => {
          toast.success("Sub task updated successfully");
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to update sub task"));
        },
      }
    );
  };

  const handleAddSubTask = () => {
    addSubTask(
      { taskId, title: newSubTask },
      {
        onSuccess: () => {
          setNewSubTask("");
          toast.success("Sub task added successfully");
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to add sub task"));
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
        Sub Tasks
      </h3>

      <div className="space-y-1.5">
        {subTasks.length > 0 ? (
          <div className="space-y-1.5">
            {subTasks.map((subTask) => (
              <div
                key={subTask._id}
                className="flex items-center space-x-3 p-2.5 rounded-[6px] bg-[#141517] border border-[#212327] hover:border-[#363a3f] transition-colors"
              >
                <Checkbox
                  id={subTask._id}
                  checked={subTask.completed}
                  onCheckedChange={(checked) =>
                    handleToggleTask(subTask._id, !!checked)
                  }
                  disabled={isUpdating || !canEdit}
                  className="size-4"
                />

                <label
                  htmlFor={subTask._id}
                  className={cn(
                    "text-xs font-normal leading-none cursor-pointer flex-1",
                    subTask.completed
                      ? "line-through text-[#7d8187]"
                      : "text-white"
                  )}
                >
                  {subTask.title}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-[#7d8187] p-3 rounded-[6px] border border-[#212327] bg-[#141517]">
            NO SUB TASKS ADDED
          </div>
        )}
      </div>

      {canEdit && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            placeholder="Add sub task..."
            value={newSubTask}
            onChange={(e) => setNewSubTask(e.target.value)}
            className="flex-1"
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newSubTask.length > 0 && !isPending) {
                handleAddSubTask();
              }
            }}
          />

          <Button
            onClick={handleAddSubTask}
            disabled={isPending || newSubTask.length === 0}
            className="shrink-0"
          >
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
};
