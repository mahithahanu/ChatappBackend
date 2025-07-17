const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  message: String,
  avatar: String,
  time: { type: Date, default: Date.now },
});

const discussionSchema = new mongoose.Schema({
  content: String,
  avatar: String,
  author: String,
  time: { type: Date, default: Date.now },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },
  replies: [replySchema]
});

module.exports = mongoose.model("Discussion", discussionSchema);