const express = require("express");
const router = express.Router();
const {
  searchAllPosts,
  reportPost,
  getReportedPost,
  reviewReportedPost,
  savePost,
  quotePost,
} = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/search", searchAllPosts);
router.post("/report", reportPost);
router.get("/admin/reports/:reportId", getReportedPost);
router.put("/admin/reports/:reportId", reviewReportedPost);
router.put("/save", authMiddleware, savePost);
router.post("/quote-post", authMiddleware, quotePost);

module.exports = router;
