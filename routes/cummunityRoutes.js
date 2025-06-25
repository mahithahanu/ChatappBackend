const express = require('express');
const router = express.Router();
const mongoose = require("mongoose"); // ✅ Required for ObjectId validation
const Community = require('../models/Cummunity');

// ✅ Get all communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Join a community
router.post('/join', async (req, res) => {
  const { email, communityId } = req.body;
  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.members.includes(email)) {
      community.members.push(email);
      await community.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join community' });
  }
});

// ✅ Get communities joined by a member
router.get('/joined', async (req, res) => {
  const { email } = req.query;
  try {
    const joinedCommunities = await Community.find({ members: email });
    res.json(joinedCommunities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch joined communities' });
  }
});

// ✅ Get community by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("REQ.PARAMS", req.params);

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid community ID format" });
  }

  try {
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    res.json(community);
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
