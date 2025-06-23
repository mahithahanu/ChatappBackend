const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  author: String,
  time: Date,
  message: String,
  avatar: String,
});

const discussionSchema = new mongoose.Schema({
  author: String,
  userId: String, // or email (used to check ownership)
  time: Date,
  content: String,
  avatar: String,
  replies: [replySchema],
});

module.exports = mongoose.model("Discussion", discussionSchema);