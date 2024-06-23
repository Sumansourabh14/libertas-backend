const express = require("express");
const router = express.Router();
const { searchAllPosts } = require("../controllers/postController");

router.get("/search", searchAllPosts);

module.exports = router;
