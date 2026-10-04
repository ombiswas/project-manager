import { useUpdateTaskDescriptionMutation } from "@/hooks/use-task";
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { getErrorMessage } from "@/lib/fetch-util";

export const TaskDescription = ({
  description,
  taskId,
  canEdit = true,
}: {
  description: string;
  taskId: string;
  canEdit?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);
  const { mutate, isPending } = useUpdateTaskDescriptionMutation();
  const updateDescription = () => {
    mutate(
      { taskId, description: newDescription },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Description updated successfully");
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to update description"));
        },
      }
    );
  };

  return (
    <div className="flex items-start gap-2 w-full">
      {isEditing ? (
        <Textarea
          className="flex-1 w-full min-h-[100px] rounded-[8px] bg-canvas-card border-hairline focus-visible:border-canvas-mid text-ink"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={isPending}
        />
      ) : (
        <div className="text-sm md:text-base text-pretty flex-1 text-body whitespace-pre-wrap break-words leading-relaxed">
          {description}
        </div>
      )}

      {canEdit && (
        <>
          {isEditing ? (
            <Button
              className="py-0 shrink-0 rounded-full"
              size="sm"
              onClick={updateDescription}
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
