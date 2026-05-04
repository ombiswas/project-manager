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
        onError: (error: any) => {
          const errMessage = error.response.data.message;
          console.log(error);
          toast.error(errMessage);
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
        onError: (error: any) => {
          const errMessage = error.response.data.message;
          console.log(error);
          toast.error(errMessage);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Sub Tasks
      </h3>

      <div className="space-y-2">
        {subTasks.length > 0 ? (
          <div className="border rounded-md divide-y overflow-hidden">
            {subTasks.map((subTask) => (
              <div key={subTask._id} className="flex items-center space-x-3 p-3 hover:bg-muted/30 transition-colors">
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
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1",
                    subTask.completed ? "line-through text-muted-foreground" : ""
                  )}
                >
                  {subTask.title}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic p-3 border rounded-md bg-muted/20">No sub tasks added yet</div>
        )}
      </div>

      {canEdit && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add a new sub task..."
            value={newSubTask}
            onChange={(e) => setNewSubTask(e.target.value)}
            className="flex-1"
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newSubTask.length > 0 && !isPending) {
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
