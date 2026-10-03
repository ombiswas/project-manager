import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// MongoDB TTL index to automatically purge expired tokens
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationSchema.index({ userId: 1, token: 1 });

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;
