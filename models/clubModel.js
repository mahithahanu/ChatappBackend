// const mongoose = require('mongoose');

// const clubSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   events: [String],
//   image: String,
//   registeredUsers: [String], // store userEmails
// });

// module.exports = mongoose.model('Club', clubSchema);


// --- clubModel.js ---
const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  events: { type: [String], default: [] },
  image: String,
  registeredUsers: { type: [String], default: [] },
  registeredUsersData: {
    type: [
      {
        name: String,
        rollNo: String,
        email: String,
        phone: String,
      },
    ],
    default: [],
  },
  landingHeading: String,
  landingDescription: String,
  landingImage: String,
  galleryImages: {
    type: [String],
    default: [],
  }
});

module.exports = mongoose.model('Club', clubSchema);