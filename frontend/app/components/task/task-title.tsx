import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/fetch-util";

export const TaskTitle = ({
  title,
  taskId,
  canEdit = true,
}: {
  title: string;
  taskId: string;
  canEdit?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const { mutate, isPending } = useUpdateTaskTitleMutation();
  const updateTitle = () => {
    mutate(
      { taskId, title: newTitle },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated successfully");
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to update title"));
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2 w-full">
      {isEditing ? (
        <Input
          className="text-lg! font-normal tracking-tight flex-1 rounded-full bg-canvas-card border-hairline focus-visible:border-canvas-mid text-ink"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isPending}
        />
      ) : (
        <h2 className="text-xl flex-1 font-normal tracking-tight text-ink break-words overflow-hidden text-ellipsis">
          {title}
        </h2>
      )}

      {canEdit && (
        <>
          {isEditing ? (
            <Button
              className="py-0 shrink-0 rounded-full"
              size="sm"
              onClick={updateTitle}
              disabled={isPending}
            >
              Save
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-full text-mute hover:text-ink hover:bg-canvas-soft"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="size-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};
