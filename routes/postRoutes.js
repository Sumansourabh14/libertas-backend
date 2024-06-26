const express = require("express");
const router = express.Router();
const {
  searchAllPosts,
  reportPost,
  getReportedPost,
} = require("../controllers/postController");

router.get("/search", searchAllPosts);
router.post("/report", reportPost);
router.get("/admin/reports/:reportId", getReportedPost);

module.exports = router;
