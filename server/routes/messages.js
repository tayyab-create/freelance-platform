const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage
} = require('../controllers/messageController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/:conversationId', getMessages);
router.post('/:conversationId', upload.array('attachments', 5), sendMessage);

module.exports = router;