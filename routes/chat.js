const router = require('express').Router();
const chatController = require('../controllers/oneToOneController');


router.get('/conversations/:userId', chatController.getConversations);
router.post('/messages', chatController.getMessages);         // POST { conversationId }
router.post('/conversation-id', chatController.getOrCreateConversationId);
router.post('/send', chatController.sendMessageOrCreateConversation);
router.post("/delete-chat", chatController.deleteChat);

module.exports = router;