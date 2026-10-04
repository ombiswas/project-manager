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
  const {
    data: rawComments,
    isLoading,
    isError,
  } = useGetCommentsByTaskIdQuery(taskId);

  const comments: Comment[] = Array.isArray(rawComments)
    ? rawComments
    : (rawComments as any)?.comments || [];

  const handleAddComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed || isPending) return;

    addComment(
      { taskId, text: trimmed },
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
      <div className="bg-[#191919] rounded-[8px] border border-[#212327] p-6">
        <Loader />
      </div>
    );

  return (
    <div className="bg-[#191919] rounded-[8px] border border-[#212327] p-4 sm:p-6 shadow-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
          Comments ({comments.length})
        </h3>
      </div>

      <ScrollArea className="h-[280px] mb-4 pr-3">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const commentDate = comment.createdAt
              ? new Date(comment.createdAt)
              : new Date();
            const formattedTime = !isNaN(commentDate.getTime())
              ? formatDistanceToNow(commentDate, { addSuffix: true })
              : "";

            return (
              <div
                key={comment._id}
                className="flex gap-3 py-3 border-b border-[#212327]/60 last:border-0"
              >
                <Avatar className="size-7 rounded-full border border-[#212327] bg-[#1a1c20] shrink-0">
                  <AvatarImage src={comment.author?.profilePicture} />
                  <AvatarFallback className="text-[10px] font-mono bg-[#1a1c20] text-white">
                    {comment.author?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-0.5">
                    <span className="font-normal text-sm text-white truncate">
                      {comment.author?.name || "User"}
                    </span>

                    {formattedTime && (
                      <span className="text-[11px] font-mono text-[#7d8187] shrink-0">
                        {formattedTime}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#dadbdf] leading-relaxed break-words whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })
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
            placeholder="Write a comment... (Ctrl+Enter to post)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.ctrlKey || e.metaKey) &&
                newComment.trim() &&
                !isPending
              ) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            rows={3}
            disabled={isPending}
          />

          <div className="flex justify-end">
            <Button
              disabled={!newComment.trim() || isPending}
              onClick={handleAddComment}
              className="w-full sm:w-auto"
            >
              {isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
