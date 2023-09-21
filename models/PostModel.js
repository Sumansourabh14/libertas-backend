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
    },
  },
  {
    timestamps: true,
  }
);

const PostModel = mongoose.model("post", postSchema);
module.exports = PostModel;
