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
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createPost,
  getPosts,
  deletePost,
  deleteAllPosts,
  getAllPosts,
  getPost,
} = require("../controllers/postController");

router.post("/sign-up", signUpController);

router.get("/users", getUsers);
router.get("/user", authMiddleware, getUserDetails);
router.get("/:id", getUser);

router.put("/user/:id", authMiddleware, updateUser);

router.delete("/user/:id", authMiddleware, deleteUser);

// posts
router.post("/create-post", authMiddleware, createPost);

router.get("/submitted/posts", getAllPosts);
router.get("/posts/:id", authMiddleware, getPosts);
router.get("/post/:id", getPost);

router.delete("/post/:id", authMiddleware, deletePost);
router.delete("/posts/:id", deleteAllPosts);

module.exports = router;
