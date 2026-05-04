import { useUpdateTaskDescriptionMutation } from "@/hooks/use-task";
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

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
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  return (
    <div className="flex items-start gap-2 w-full">
      {isEditing ? (
        <Textarea
          className="flex-1 w-full min-h-[100px]"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={isPending}
        />
      ) : (
        <div className="text-sm md:text-base text-pretty flex-1 text-muted-foreground whitespace-pre-wrap break-words">
          {description}
        </div>
      )}

      {canEdit && (
        <>
          {isEditing ? (
            <Button
              className="py-0 shrink-0"
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
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
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
