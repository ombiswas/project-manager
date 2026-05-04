import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";

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
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2 w-full">
      {isEditing ? (
        <Input
          className="text-xl! font-semibold flex-1"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isPending}
        />
      ) : (
        <h2 className="text-xl flex-1 font-semibold break-words overflow-hidden text-ellipsis">{title}</h2>
      )}

      {canEdit && (
        <>
          {isEditing ? (
            <Button
              className="py-0 shrink-0"
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
