const mongoose = require("mongoose");

const reportPostSchema = mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "hate speech",
        "misinformation",
        "inappropriate content",
        "rash driving",
        "impersonation",
        "scam/fraud",
        "threats/violence",
        "self-harm/suicide",
        "bullying",
        "privacy violation",
        "copyright infringement",
        "terrorism/extremism",
        "sexual content",
        "child exploitation",
        "illegal activities",
        "animal cruelty",
        "sensitive media",
        "promotion of drugs",
      ],
      default: "spam",
      required: true,
    },
    comments: {
      type: String,
    },
    status: { type: String, default: "pending" },
  },
  {
    timestamps: true,
  }
);

const ReportPostModel = mongoose.model("report", reportPostSchema);
module.exports = ReportPostModel;
