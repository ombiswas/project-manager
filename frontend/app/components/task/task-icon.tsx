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
      return (
        <div className="bg-green-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <CheckSquare className="h-4 w-4 text-green-600" />
        </div>
      );
    case "created_subtask":
      return (
        <div className="bg-emerald-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <CheckSquare className="h-4 w-4 text-emerald-600" />
        </div>
      );
    case "updated_task":
    case "updated_subtask":
      return (
        <div className="bg-blue-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <FileEdit className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "completed_task":
      return (
        <div className="bg-green-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      );
    case "created_project":
      return (
        <div className="bg-blue-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <FolderPlus className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "updated_project":
      return (
        <div className="bg-blue-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <FolderEdit className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "completed_project":
      return (
        <div className="bg-green-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
      );
    case "created_workspace":
      return (
        <div className="bg-blue-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <Building2 className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "added_comment":
      return (
        <div className="bg-blue-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <MessageSquare className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "added_member":
      return (
        <div className="bg-blue-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <UserPlus className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "removed_member":
      return (
        <div className="bg-red-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <UserMinus className="h-4 w-4 text-red-600" />
        </div>
      );
    case "joined_workspace":
      return (
        <div className="bg-blue-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <LogIn className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "added_attachment":
      return (
        <div className="bg-blue-600/10 p-2 rounded-full flex items-center justify-center shrink-0">
          <Upload className="h-4 w-4 text-blue-600" />
        </div>
      );
    default:
      return null;
  }
};
