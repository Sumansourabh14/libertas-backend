const express = require("express");
const router = express.Router();
const { searchAllPosts, reportPost } = require("../controllers/postController");

router.get("/search", searchAllPosts);
router.post("/report", reportPost);

module.exports = router;
