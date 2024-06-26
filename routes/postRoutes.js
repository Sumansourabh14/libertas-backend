const express = require("express");
const router = express.Router();
const {
  searchAllPosts,
  reportPost,
  getReportedPost,
  reviewReportedPost,
} = require("../controllers/postController");

router.get("/search", searchAllPosts);
router.post("/report", reportPost);
router.get("/admin/reports/:reportId", getReportedPost);
router.put("/admin/reports/:reportId", reviewReportedPost);

module.exports = router;
