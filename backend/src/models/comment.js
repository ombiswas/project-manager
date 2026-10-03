import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        offset: {
          type: Number,
        },
        length: {
          type: Number,
        },
      },
    ],
    reactions: [
      {
        emoji: {
          type: String,
          maxlength: 20,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    attachments: [
      {
        fileName: { type: String, maxlength: 255 },
        fileUrl: { type: String, maxlength: 2000 },
        fileType: { type: String, maxlength: 50 },
        fileSize: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

commentSchema.index({ task: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
