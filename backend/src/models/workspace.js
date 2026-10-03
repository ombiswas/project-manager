import mongoose, { Schema } from "mongoose";
import { WORKSPACE_ROLES } from "../constants/enums.js";

const workspaceModel = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    color: {
      type: String,
      default: "#FF5733",
      maxlength: 30,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: WORKSPACE_ROLES,
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

workspaceModel.index({ owner: 1, createdAt: -1 });
workspaceModel.index({ "members.user": 1, createdAt: -1 });

const Workspace = mongoose.model("Workspace", workspaceModel);

export default Workspace;
