const express = require("express");
const router = express.Router();
const {
  getAllDiscussions,
  createDiscussion,
  addReply,
  getDiscussionById,
  deleteDiscussion,
} = require("../controllers/DiscussionController");

// GET all discussions
router.get("/get-discussions", getAllDiscussions);

// POST a new discussion
router.post("/get-discussions", createDiscussion);

// POST a reply to a discussion
router.post("/:id/reply", addReply);

// DELETE a discussion
router.delete("/:id", deleteDiscussion);

// GET a specific discussion by ID
router.get("/:id", getDiscussionById);

module.exports = router;
