const express = require('express');
const router = express.Router();
const Community = require('../models/Cummunity');

// Get all communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a community
router.post('/join', async (req, res) => {
  const { email, communityId } = req.body;
  try {
    const community = await Community.findById(communityId);
    if (!community.members.includes(email)) {
      community.members.push(email);
      await community.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join community' });
  }
});

module.exports = router;
