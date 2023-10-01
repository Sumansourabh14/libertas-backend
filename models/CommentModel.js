const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      // type: Object,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model("comment", commentSchema);
module.exports = CommentModel;
