const express = require("express");
const router = express.Router();
const {
  getAllInterviews,
  createInterview,
  replyToInterview,
  deleteInterview
} = require("../controllers/interviewController");

router.get("/get-interviews", getAllInterviews);
router.post("/get-interviews", createInterview);
router.post("/:id/reply", replyToInterview);
router.delete('/:id', deleteInterview);

module.exports = router;