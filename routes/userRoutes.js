// https://rapidapi.com/learn/rest#best-practices-for-rest-api

const express = require("express");
const router = express.Router();
const {
  signUpController,
  getUsers,
  getUserDetails,
  deleteUser,
  updateUser,
  getUser,
  isUsernameAvailableController,
  sendPasswordRecoveryEmail,
  getUserByEmailOrUsername,
  resetPassword,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createPost,
  getPosts,
  deletePost,
  deleteAllPosts,
  getAllPosts,
  getPost,
  upvotePost,
  updatePost,
  downvotePost,
  addComment,
  deleteComment,
  getComments,
} = require("../controllers/postController");

router.post("/sign-up", signUpController);
router.post("/check-username", isUsernameAvailableController);
router.post("/recover-password-email", sendPasswordRecoveryEmail);
router.put("/reset-password", resetPassword);

router.get("/users", getUsers);
router.get("/user", authMiddleware, getUserDetails);
router.get("/:id", getUser);
router.get("/email-or-username/:emailOrUsername", getUserByEmailOrUsername);

router.put("/user/:id", authMiddleware, updateUser);

router.delete("/user/:id", authMiddleware, deleteUser);

// posts
router.get("/post/:id", getPost);
router.post("/create-post", authMiddleware, createPost);
router.put("/edit-post/:id", authMiddleware, updatePost);
router.delete("/post/:id", authMiddleware, deletePost);

router.get("/posts/:id", authMiddleware, getPosts);
router.get("/submitted/posts", getAllPosts);
router.delete("/posts/:id", deleteAllPosts);

// upvote/downvote post
router.post("/post/upvote/:id", authMiddleware, upvotePost);
router.post("/post/downvote/:id", authMiddleware, downvotePost);

// comments
router.get("/post/comments/:postId", getComments);
router.post("/post/comment/:id", authMiddleware, addComment);
router.put("/post/comment/:postId", authMiddleware, deleteComment);

module.exports = router;
