const express = require('express');
const router = express.Router();
const { sendMessageToClub } = require('../controllers/clubMessageController');

router.post('/send-message', sendMessageToClub);

module.exports = router;
