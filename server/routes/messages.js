const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  togglePin,
  toggleArchive,
  toggleMute,
  toggleStar
} = require('../controllers/messageController');
const { upload } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);

// Conversation actions
router.patch('/:conversationId/pin', togglePin);
router.patch('/:conversationId/archive', toggleArchive);
router.patch('/:conversationId/mute', toggleMute);

// Message routes
router.get('/:conversationId', getMessages);
router.post('/:conversationId', upload.array('attachments', 5), sendMessage);

// Message actions
router.patch('/:conversationId/message/:messageId', editMessage);
router.delete('/:conversationId/message/:messageId', deleteMessage);
router.post('/:conversationId/message/:messageId/reaction', addReaction);
router.patch('/:conversationId/message/:messageId/star', toggleStar);

module.exports = router;