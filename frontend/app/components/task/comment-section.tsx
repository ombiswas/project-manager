import type { Comment, User } from "@/types";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  useAddCommentMutation,
  useGetCommentsByTaskIdQuery,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader } from "../loader";
import { getErrorMessage } from "@/lib/fetch-util";

export const CommentSection = ({
  taskId,
  members,
  canComment = true,
}: {
  taskId: string;
  members: User[];
  canComment?: boolean;
}) => {
  const [newComment, setNewComment] = useState("");

  const { mutate: addComment, isPending } = useAddCommentMutation();
  const { data: comments = [], isLoading, isError } = useGetCommentsByTaskIdQuery(taskId);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment(
      { taskId, text: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment added successfully");
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, "Failed to add comment"));
        },
      }
    );
  };

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div className="bg-[#191919] rounded-[8px] border border-[#212327] p-6 shadow-none">
      <h3 className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187] mb-4">Comments</h3>

      <ScrollArea className="h-[280px] mb-4 pr-3">
        {comments?.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 py-3 border-b border-[#212327]/60 last:border-0">
              <Avatar className="size-7 rounded-full border border-[#212327] bg-[#1a1c20]">
                <AvatarImage src={comment.author.profilePicture} />
                <AvatarFallback className="text-[10px] font-mono bg-[#1a1c20] text-white">{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-normal text-sm text-white">
                    {comment.author.name}
                  </span>

                  <span className="text-xs font-mono text-[#7d8187]">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <p className="text-xs text-[#dadbdf] leading-relaxed break-words">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs font-mono text-[#7d8187]">NO COMMENTS YET</p>
          </div>
        )}
      </ScrollArea>

      <Separator className="my-4 bg-[#212327]" />

      {canComment && (
        <div className="mt-4 space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end">
            <Button
              disabled={!newComment.trim() || isPending}
              onClick={handleAddComment}
            >
              {isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
