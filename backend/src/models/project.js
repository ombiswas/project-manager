import mongoose, { Schema } from "mongoose";
import { PROJECT_STATUSES } from "../constants/enums.js";

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: "Planning",
    },
    startDate: { type: Date },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value || !this.startDate) return true;
          return value >= this.startDate;
        },
        message: "Due date cannot be earlier than start date",
      },
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [{ type: String, maxlength: 50 }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ workspace: 1, isArchived: 1, createdAt: -1 });
projectSchema.index({ members: 1, isArchived: 1 });
projectSchema.index({ createdBy: 1, isArchived: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
