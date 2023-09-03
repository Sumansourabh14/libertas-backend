const asyncHandler = require("express-async-handler");
const PostModel = require("../models/PostModel");
const UserModel = require("../models/UserModel");

// @desc    create a post
// @route   POST /api/user/create-post
// @access  Private
const createPost = asyncHandler(async (req, res, next) => {
  const { title, body } = req.body;
  console.log(req.user);

  if (!title || !body.trim()) {
    res.status(400);
    return next(new Error("Please write title and body"));
  }

  const newPost = await PostModel.create({
    post: {
      title,
      body,
    },
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    post: {
      id: newPost._id,
      userId: req.user._id,
      title,
      body,
    },
  });
});

// @desc    Get posts
// @route   POST /api/user/posts
// @access  Private
const getPosts = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // check if user is present in the database
  const user = await UserModel.findById(id);

  if (!user) {
    res.status(400);
    return next(new Error("User not found"));
  }

  // find all the posts created by the user
  const posts = await PostModel.find({ userId: id });

  console.log(posts);

  res.status(200).json({
    success: true,
    total: posts.length,
    posts,
  });
});

// @desc    Delete a post
// @route   DELETE /api/user/delete-post
// @access  Private
const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // check if the post is present in the database
  const user = await PostModel.findById(id);

  if (!user) {
    res.status(400);
    return next(new Error("Post not found"));
  }

  // find all the posts created by the user
  const deletePost = await PostModel.findByIdAndRemove(id);

  console.log(deletePost);

  res.status(200).json({
    success: true,
    id,
    message: `Post has been successfully deleted`,
  });
});

// @desc    Delete all posts
// @route   DELETE /api/user/posts
// @access  Private
const deleteAllPosts = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // check if the post is present in the database
  const user = await UserModel.findById(id);

  if (!user) {
    res.status(400);
    return next(new Error("User not found"));
  }

  // find all the posts created by the user
  const deletePosts = await PostModel.deleteMany({ userId: id });

  console.log(deletePosts);

  res.status(200).json({
    success: true,
    id,
    message: `All the posts have been successfully deleted`,
  });
});

module.exports = { createPost, getPosts, deletePost, deleteAllPosts };
