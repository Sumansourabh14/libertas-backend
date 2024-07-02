const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    author: {
      type: Object,
    },
    post: {
      title: {
        type: String,
        required: true,
      },
      body: {
        type: String,
      },
      imageUrl: {
        type: String,
      },
      videoUrl: {
        type: String,
      },
    },
    quotedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    // need to create comments schema in order to remove any comment
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    upvotes: {
      type: Array,
      default: [],
    },
    downvotes: {
      type: Array,
      default: [],
    },
    reportedByUsers: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const PostModel = mongoose.model("post", postSchema);
module.exports = PostModel;
