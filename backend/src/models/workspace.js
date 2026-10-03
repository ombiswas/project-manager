import mongoose, { Schema } from "mongoose";
import { WORKSPACE_ROLES } from "../constants/enums.js";

const workspaceModel = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, trim: true },
    color: { type: String, default: "#FF5733" },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: WORKSPACE_ROLES,
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

workspaceModel.index({ owner: 1 });
workspaceModel.index({ "members.user": 1 });

const Workspace = mongoose.model("Workspace", workspaceModel);

export default Workspace;
