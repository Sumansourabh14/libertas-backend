const asyncHandler = require("express-async-handler");
const PostModel = require("../models/PostModel");
const UserModel = require("../models/UserModel");
const CommentModel = require("../models/CommentModel");
const ReportPostModel = require("../models/ReportPostModel");
const nodemailer = require("nodemailer");

// @desc    create a post
// @route   POST /api/user/create-post
// @access  Private
const createPost = asyncHandler(async (req, res, next) => {
  const { title, body, imageUrl } = req.body;

  if (!title) {
    res.status(400);
    return next(new Error("Please write title"));
  }

  const newPost = await PostModel.create({
    post: {
      title,
      body,
      imageUrl,
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

  if (!title) {
    res.status(400);
    return next(new Error("Please write a title for your post"));
  }

  const findPost = await PostModel.findById(id);

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

  res.status(200).json({
    success: true,
    message: `You downvoted the post with id: ${id}`,
    updatedPost,
  });
});

// @desc    add a comment
// @route   POST /api/post/comment/:id
// @access  Private
const addComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { body } = req.body;

  if (!body.trim()) {
    res.status(400);
    return next(new Error("Please write the body"));
  }

  const post = await PostModel.findById(id);

  if (!post) {
    res.status(400);
    return next(new Error("Post not found"));
  }

  const newComment = new CommentModel({
    body,
    author: req.user._id,
    postId: id,
  });

  await CommentModel.create(newComment);

  await PostModel.updateOne({ _id: id }, { $push: { comments: newComment } });

  res.status(200).json({
    success: true,
    message: `Comment added successfully for post: ${id}`,
    comment: newComment,
  });
});

// @desc    get comments of a certain post
// @route   GET /api/post/comments/:postId
// @access  Public
const getComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await PostModel.findById(postId);

  if (!post) {
    res.status(400);
    return next(new Error("Post not found"));
  }

  const comments = await CommentModel.find({ postId: postId });

  res.status(200).json({
    success: true,
    data: comments,
  });
});

// @desc    delete a comment
// @route   DELETE /api/post/comment/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { commentId } = req.body;

  if (!commentId) {
    res.status(400);
    return next(new Error("Please provide comment id"));
  }

  const post = await PostModel.findById(postId);

  if (!post) {
    res.status(400);
    return next(new Error("Post not found"));
  }

  const findComment = await CommentModel.findOne({ _id: commentId });

  if (!findComment) {
    res.status(400);
    return next(new Error("Comment not found"));
  }

  await CommentModel.findByIdAndRemove(commentId);

  await PostModel.updateOne(
    { _id: postId },
    { $pull: { comments: commentId } }
  );

  const updatedPost = await PostModel.findById(postId);

  res.status(200).json({
    success: true,
    message: `Comment has been successfully deleted!`,
    updatedPost,
  });
});

// @desc    upvote a comment
// @route   POST /api/post/comment/upvote/:id
// @access  Private
const upvoteComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { commentId } = req.body;

  if (!commentId) {
    res.status(400);
    return next(new Error("Please provide comment id"));
  }

  const post = await PostModel.findById(postId);

  if (!post) {
    res.status(400);
    return next(new Error("Post not found"));
  }

  const findComment = await CommentModel.findOne({ _id: commentId });

  if (!findComment) {
    res.status(400);
    return next(new Error("Comment not found"));
  }

  if (!findComment.upvotes.includes(req.user._id)) {
    await CommentModel.updateOne(
      { _id: id },
      { $push: { upvotes: req.user._id } }
    );
  } else {
    await CommentModel.updateOne(
      { _id: id },
      { $pull: { upvotes: req.user._id } }
    );
    res.status(400);
    return next(
      new Error("Already upvoted the comment, so taking down your upvote")
    );
  }

  // Fetch the updated comment after the upvote
  const updatedComment = await CommentModel.findById(commentId);

  res.status(200).json({
    success: true,
    message: `You have successfully upvoted the comment`,
    commentId,
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
  const posts = await PostModel.find({ author: user });
  // const posts = await PostModel.find({ userId: id });

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
  const { count } = req.query;

  const posts = await PostModel.find();
  const postsToDisplay = posts.reverse().slice(0, count);

  res.status(200).json({
    success: true,
    total: posts.length,
    currentLength: postsToDisplay.length,
    data: postsToDisplay,
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

  res.status(200).json({
    success: true,
    id,
    message: `All the posts have been successfully deleted`,
  });
});

// @desc    Search all the posts
// @route   GET /api/posts/search?query=
// @access  Public
const searchAllPosts = asyncHandler(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    return next(new Error("Please provide a search query."));
  }

  const posts = await PostModel.find({
    $or: [
      { "post.title": { $regex: query, $options: "i" } },
      { "post.body": { $regex: query, $options: "i" } },
    ],
  });
  const postsToDisplay = posts.reverse();

  if (posts.length > 0) {
    res.status(200).json({
      success: true,
      total: posts.length,
      currentLength: postsToDisplay.length,
      data: postsToDisplay,
    });
  } else {
    res.status(200).json({
      success: false,
      total: posts.length,
      message: "No result found",
    });
  }
});

// @desc    report a post
// @route   POST /api/posts/report
// @access  Private
const reportPost = asyncHandler(async (req, res, next) => {
  const { postId, reporterId, reason, comments } = req.body;

  if (!postId || !reporterId || !reason) {
    res.status(400);
    return next(new Error("All fields are required"));
  }

  const post = await PostModel.findById(postId);

  if (!post.reportedByUsers.includes(reporterId)) {
    const newReport = await ReportPostModel.create({
      reporterId,
      postId,
      reason,
      comments,
    });

    if (newReport) {
      await PostModel.updateOne(
        { _id: postId },
        { $push: { reportedByUsers: reporterId } }
      );

      // sending email with nodemailer
      const html = `
        <p>Hi,</p>
        <p>Someone has reported a post on Libertas</p>
        <h2>Details of the Report</h2>
        <p>PostId: ${newReport.postId}</p>
        <p>ReporterId: ${newReport.reporterId}</p>
        <p>Reason: ${newReport.reason}</p>
        <p>Comments: ${
          !!newReport.comments ? newReport.comments : "No comments"
        }</p>
      `;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GOOGLE_ACCOUNT_USER,
          pass: process.env.GOOGLE_ACCOUNT_PASS,
        },
      });

      await transporter.sendMail({
        from: '"Libertas" <libertas.discussion@gmail.com>', // sender address
        to: "sumsourabh14@gmail.com", // list of receivers
        subject: "Alert! New Report on Libertas", // Subject line
        html: html, // html body
      });

      res.status(201).json({
        success: true,
        message: "Your report has been succesfully sent to the admin",
        newReport,
      });
    } else {
      res.status(400);
      return next(new Error("Something went wrong while reporting this post"));
    }
  } else {
    res.status(400);
    return next(new Error("You have already reported this post"));
  }
});

// @desc    get a reported post
// @route   GET /api/posts/admin/report/:id
// @access  Private
const getReportedPost = asyncHandler(async (req, res, next) => {
  const { reportId } = req.params;

  if (!reportId) {
    res.status(400);
    return next(new Error("reportId field is required"));
  }

  const report = await ReportPostModel.findById(reportId)
    .populate("postId reporterId")
    .exec();

  if (!report) {
    res.status(404);
    return next(new Error("Report not found"));
  }

  res.status(200).json({
    success: true,
    report,
  });
});

// @desc    review a report and take action
// @route   PUT /api/posts/admin/report/:id
// @access  Private
const reviewReportedPost = asyncHandler(async (req, res, next) => {
  const { reportId } = req.params;
  const { status, action } = req.body;

  if (!reportId || !status || !action) {
    res.status(400);
    return next(new Error("All fields are required"));
  }

  const report = await ReportPostModel.findById(reportId)
    .populate("postId reporterId")
    .exec();

  if (!report) {
    res.status(404);
    return next(new Error("Report not found"));
  }

  // Implement actions based on the status (e.g., remove post, ban user)
  if (status === "approved" && action === "remove post") {
    const removePost = await PostModel.findByIdAndRemove(report.postId._id);

    if (!removePost) {
      res.status(404);
      return next(new Error("Post could not be removed"));
    }

    const updateReport = await ReportPostModel.updateOne(
      { _id: reportId },
      { $set: { status: status } }
    );

    if (updateReport) {
      res.status(201).json({
        success: true,
        message: "This report request is approved and the post is removed",
        status,
        report: updateReport,
      });
    } else {
      res.status(404);
      return next(new Error("Report could not be updated"));
    }
  } else if (status === "rejected") {
    const updateReport = await ReportPostModel.updateOne(
      { _id: reportId },
      { $set: { status: status } }
    );

    if (updateReport) {
      res.status(200).json({
        success: true,
        message: "This report request is rejected",
        status,
        report: updateReport,
      });
    }
  } else {
    res.status(400);
    return next(
      new Error("The status or action did not match with libertas backend")
    );
  }
});

module.exports = {
  getPost,
  createPost,
  updatePost,
  deletePost,
  upvotePost,
  addComment,
  getComments,
  deleteComment,
  upvoteComment,
  downvotePost,
  getPosts,
  getAllPosts,
  deleteAllPosts,
  searchAllPosts,
  reportPost,
  getReportedPost,
  reviewReportedPost,
};
