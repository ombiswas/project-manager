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

  const taskList = Array.isArray(subTasks) ? subTasks : [];

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
    const trimmed = newSubTask.trim();
    if (!trimmed || isPending) return;

    addSubTask(
      { taskId, title: trimmed },
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

  const completedCount = taskList.filter((s) => s.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
          Sub Tasks {taskList.length > 0 && `(${completedCount}/${taskList.length})`}
        </h3>
      </div>

      <div className="space-y-1.5">
        {taskList.length > 0 ? (
          <div className="space-y-1.5">
            {taskList.map((subTask) => (
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
                    "text-xs font-normal leading-relaxed cursor-pointer flex-1 break-words",
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <Input
            placeholder="Add sub task..."
            value={newSubTask}
            onChange={(e) => setNewSubTask(e.target.value)}
            className="flex-1"
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newSubTask.trim().length > 0 && !isPending) {
                e.preventDefault();
                handleAddSubTask();
              }
            }}
          />

          <Button
            onClick={handleAddSubTask}
            disabled={isPending || newSubTask.trim().length === 0}
            className="w-full sm:w-auto shrink-0"
          >
            {isPending ? "Adding..." : "Add Task"}
          </Button>
        </div>
      )}
    </div>
  );
};
