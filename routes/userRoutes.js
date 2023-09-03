// https://rapidapi.com/learn/rest#best-practices-for-rest-api

const express = require("express");
const router = express.Router();
const {
  signUpController,
  getUsers,
  getUserDetails,
  deleteUser,
  updateUser,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createPost,
  getPosts,
  deletePost,
  deleteAllPosts,
} = require("../controllers/postController");

router.post("/sign-up", signUpController);

router.get("/users", getUsers);

router.get("/user", authMiddleware, getUserDetails);

router.put("/user/:id", authMiddleware, updateUser);

router.delete("/user/:id", authMiddleware, deleteUser);

// posts
router.post("/create-post", authMiddleware, createPost);

router.get("/posts/:id", authMiddleware, getPosts);

router.delete("/post/:id", authMiddleware, deletePost);
router.delete("/posts/:id", authMiddleware, deleteAllPosts);

module.exports = router;
