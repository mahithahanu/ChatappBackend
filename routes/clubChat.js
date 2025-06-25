const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// Get all messages for club
router.get('/:clubId', async (req, res) => {
  try {
    const messages = await Message.find({ clubId: req.params.clubId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;