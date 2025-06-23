const Discussion = require("../models/Discussions");


//GET /discussion/get-discussions
exports.getAllDiscussions = async (req, res) => {
  try {
    console.log("Fetching discussions...");
    const discussions = await Discussion.find();
    console.log("Found discussions:", discussions);
    res.json(discussions);
  } catch (error) {
    console.error("Error fetching discussions:", error);
    res.status(500).json({ error: "Failed to fetch discussions" });
  }
};


exports.createDiscussion = async (req, res) => {
  try {
    const { author, content, avatar, link } = req.body;
    const newDiscussion = new Discussion({
      author,
      content,
      time: new Date(),
      avatar,
      link,
      replies: [],
    });
    await newDiscussion.save();
    res.status(201).json(newDiscussion);
  } catch (error) {
    res.status(500).json({ error: "Failed to create discussion" });
  }
};

exports.addReply = async (req, res) => {
  const { id } = req.params;
  const { author, message, avatar } = req.body;
  console.log(id);
  console.log("Request body:", req.body);
  try {
    const discussion = await Discussion.findById(id);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });

    discussion.replies.push({ author, message, time: new Date(), avatar });
    await discussion.save();
    res.status(200).json(discussion);
  } catch (error) {
    res.status(500).json({ error: "Failed to add reply" });
  }
};
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    console.log("Requested Discussion ID:", req.params.id);

    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch discussion" });
  }
};
exports.deleteDiscussion = async (req, res) => {
  try {
    await Discussion.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed" });
  }
};