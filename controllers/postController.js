const asyncHandler = require("express-async-handler");
const PostModel = require("../models/PostModel");
const UserModel = require("../models/UserModel");

// @desc    create a post
// @route   POST /api/user/create-post
// @access  Private
const createPost = asyncHandler(async (req, res, next) => {
  const { title, body } = req.body;
  console.log("req.user: ", req.user);

  if (!title || !body.trim()) {
    res.status(400);
    return next(new Error("Please write title and body"));
  }

  const newPost = await PostModel.create({
    post: {
      title,
      body,
    },
    upvotes: [],
    downvotes: [],
    author: req.user,
  });

  res.status(201).json({
    success: true,
    newPost,
  });
});

// @desc    update a post
// @route   PUT /api/user/edit-post/:id
// @access  Private
const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, body } = req.body;

  if (!title || !body.trim()) {
    res.status(400);
    return next(new Error("Please write title and body"));
  }

  const findPost = await PostModel.findById(id);
  console.log("findPost ----------------", findPost);

  if (!findPost) {
    res.status(400);
    return next(new Error("Post not found"));
  }

  if (!findPost.author._id.equals(req.user._id)) {
    res.status(403);
    return next(new Error("You can only edit your post"));
  }

  const updatedPost = await PostModel.updateOne(
    { _id: id },
    { $set: { "post.title": title, "post.body": body } }
  );
  console.log(updatedPost);

  res.status(201).json({
    success: true,
    message: "Your post has been updated",
    newPost: updatedPost,
  });
});

// @desc    upvote a post
// @route   POST /api/post/upvote/:id
// @access  Private
const upvotePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const post = await PostModel.findById(id);

  if (!post) {
    res.status(400);
    return next(new Error("Post not found"));
  }

  if (!post.upvotes.includes(req.user._id)) {
    // add the upvote
    await PostModel.updateOne(
      { _id: id },
      { $push: { upvotes: req.user._id } }
    );
  } else {
    // remove the upvote
    await PostModel.updateOne(
      { _id: id },
      { $pull: { upvotes: req.user._id } }
    );

    res.status(403);
    return next(
      new Error("You have already upvoted the post, so removing your upvote.")
    );
  }

  // Fetch the updated post after the upvote
  const updatedPost = await PostModel.findById(id);
  console.log(updatedPost);

  res.status(200).json({
    success: true,
    message: `You upvoted the post with id: ${id}`,
    updatedPost,
  });
});

// @desc    downvote a post
// @route   POST /api/post/downvote/:id
// @access  Private
const downvotePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const post = await PostModel.findById(id);

  if (!post) {
    res.status(400);
    return next(new Error("Post not found"));
  }

  if (!post.downvotes.includes(req.user._id)) {
    // add the downvote
    await PostModel.updateOne(
      { _id: id },
      { $push: { downvotes: req.user._id } }
    );
  } else {
    console.log("post after downvote", post);
    // remove the downvote
    await PostModel.updateOne(
      { _id: id },
      { $pull: { downvotes: req.user._id } }
    );

    res.status(403);
    return next(
      new Error(
        "You have already downvoted the post, so removing your downvote."
      )
    );
  }

  // Fetch the updated post after the downvote
  const updatedPost = await PostModel.findById(id);
  console.log("updatedPost ---------", updatedPost);

  res.status(200).json({
    success: true,
    message: `You downvoted the post with id: ${id}`,
    updatedPost,
  });
});

// @desc    Get posts
// @route   POST /api/user/posts
// @access  Private
const getPosts = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // check if user is present in the database
  const user = await UserModel.findById(id);
  console.log(user);

  if (!user) {
    res.status(400);
    return next(new Error("User not found"));
  }

  // find all the posts created by the user
  const posts = await PostModel.find({ author: user });
  // const posts = await PostModel.find({ userId: id });

  console.log(posts);

  res.status(200).json({
    success: true,
    total: posts.length,
    posts,
  });
});

// @desc    Get a post
// @route   GET /api/user/post/:id
// @access  Public
const getPost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // check if user is present in the database
  const post = await PostModel.findById(id);

  if (!post) {
    res.status(400);
    return next(new Error("Post not found"));
  }

  res.status(200).json({
    success: true,
    post,
  });
});

// @desc    Get all the posts
// @route   GET /api/user/posts
// @access  Public
const getAllPosts = asyncHandler(async (req, res, next) => {
  const posts = await PostModel.find();

  // console.log("posts", posts);

  res.status(200).json({ success: true, total: posts.length, data: posts });
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

module.exports = {
  getPost,
  createPost,
  updatePost,
  deletePost,
  upvotePost,
  downvotePost,
  getPosts,
  getAllPosts,
  deleteAllPosts,
};
