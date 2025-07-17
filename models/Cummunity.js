const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
  name: String,
  category: String,
  image: String,
  members: [String] // array of user emails
});

module.exports = mongoose.model('Community', CommunitySchema);
