import type { ActionType } from "@/types";
import {
  Building2,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  Eye,
  EyeOff,
  FileEdit,
  FolderEdit,
  FolderPlus,
  LogIn,
  MessageSquare,
  Upload,
  UserMinus,
  UserPlus,
} from "lucide-react";

export const getActivityIcon = (action: ActionType) => {
  switch (action) {
    case "created_task":
    case "created_subtask":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <CheckSquare className="h-3.5 w-3.5 text-accent-breeze" />
        </div>
      );
    case "updated_task":
    case "updated_subtask":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <FileEdit className="h-3.5 w-3.5 text-accent-breeze" />
        </div>
      );
    case "completed_task":
    case "completed_project":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle className="h-3.5 w-3.5 text-ink" />
        </div>
      );
    case "created_project":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <FolderPlus className="h-3.5 w-3.5 text-accent-twilight" />
        </div>
      );
    case "updated_project":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <FolderEdit className="h-3.5 w-3.5 text-accent-twilight" />
        </div>
      );
    case "created_workspace":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <Building2 className="h-3.5 w-3.5 text-ink" />
        </div>
      );
    case "added_comment":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <MessageSquare className="h-3.5 w-3.5 text-accent-breeze" />
        </div>
      );
    case "added_member":
    case "joined_workspace":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <UserPlus className="h-3.5 w-3.5 text-accent-breeze" />
        </div>
      );
    case "removed_member":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <UserMinus className="h-3.5 w-3.5 text-accent-sunset" />
        </div>
      );
    case "added_attachment":
      return (
        <div className="bg-canvas-soft border border-hairline p-1.5 rounded-full flex items-center justify-center shrink-0">
          <Upload className="h-3.5 w-3.5 text-accent-breeze" />
        </div>
      );
    default:
      return null;
  }
};
