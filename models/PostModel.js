const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    author: {
      // type: mongoose.Schema.Types.ObjectId,
      type: Object,
    },
    post: {
      title: {
        type: String,
        required: true,
      },
      body: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
      },
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
  },
  {
    timestamps: true,
  }
);

const PostModel = mongoose.model("post", postSchema);
module.exports = PostModel;
