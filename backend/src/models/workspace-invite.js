import mongoose from "mongoose";
import { INVITE_ROLES } from "../constants/enums.js";

const workspaceInviteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: INVITE_ROLES,
      default: "member",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

workspaceInviteSchema.index({ user: 1, workspaceId: 1 });
workspaceInviteSchema.index({ email: 1, workspaceId: 1 });
workspaceInviteSchema.index({ token: 1 });
// TTL index for automatic expiration cleanup
workspaceInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const WorkspaceInvite = mongoose.model(
  "WorkspaceInvite",
  workspaceInviteSchema
);

export default WorkspaceInvite;
