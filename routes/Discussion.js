const express = require("express");
const router = express.Router();
const Discussion = require("../models/Discussions");

// Create a new discussion post
router.post("/get-discussions", async (req, res) => {
  const { content, author, avatar, communityId } = req.body;

  if (!content || !communityId) {
    return res.status(400).json({ message: "Content and communityId are required" });
  }

  try {
    const newPost = new Discussion({
      content,
      author,
      avatar,
      communityId,
    });

    const saved = await newPost.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error creating discussion", error });
  }
});

// Get all discussions for a specific community
router.get("/get-discussions", async (req, res) => {
  const { communityId } = req.query;

  if (!communityId) {
    return res.status(400).json({ message: "communityId is required" });
  }

  try {
    const discussions = await Discussion.find({ communityId }).sort({ time: -1 });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching discussions", error });
  }
});

// Post a reply to a discussion
router.post("/:id/reply", async (req, res) => {
  const { message, avatar } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Reply message is required" });
  }

  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    discussion.replies.push({ message, avatar });
    await discussion.save();

    res.status(200).json({ message: "Reply added", discussion });
  } catch (error) {
    res.status(500).json({ message: "Error adding reply", error });
  }
});

// Delete a discussion
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Discussion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Discussion not found" });

    res.status(200).json({ message: "Discussion deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting discussion", error });
  }
});



module.exports = router;