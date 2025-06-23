const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  author: String,
  time: { type: Date, default: Date.now },
  message: String,
  avatar: String,
});

const interviewSchema = new mongoose.Schema({
  author: String,
  time: { type: Date, default: Date.now },
  content: String,
  avatar: String,
  link: String,
  replies: [replySchema],
});

module.exports = mongoose.model("Interview", interviewSchema);