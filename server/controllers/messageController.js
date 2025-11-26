const { Conversation, Message, User, WorkerProfile, CompanyProfile } = require('../models');

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'email role')
      .populate('lastMessage')
      .populate('job', 'title')
      .sort('-lastMessageAt');

    // Get profile info for each participant
    const conversationsWithProfiles = await Promise.all(
      conversations.map(async (conv) => {
        const convObj = conv.toObject();

        // Get the other participant (not the current user)
        const otherParticipant = convObj.participants.find(
          p => p._id.toString() !== req.user._id.toString()
        );

        if (otherParticipant) {
          if (otherParticipant.role === 'worker') {
            const profile = await WorkerProfile.findOne({ user: otherParticipant._id });
            convObj.otherUser = {
              ...otherParticipant,
              name: profile?.fullName,
              avatar: profile?.profilePicture
            };
          } else if (otherParticipant.role === 'company') {
            const profile = await CompanyProfile.findOne({ user: otherParticipant._id });
            convObj.otherUser = {
              ...otherParticipant,
              name: profile?.companyName,
              avatar: profile?.logo
            };
          }
        }

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          isRead: false
        });
        convObj.unreadCount = unreadCount;

        return convObj;
      })
    );

    res.status(200).json({
      success: true,
      count: conversationsWithProfiles.length,
      data: conversationsWithProfiles
    });
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get or create conversation
// @route   POST /api/messages/conversations
// @access  Private
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId, jobId } = req.body;

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId] },
      job: jobId || { $exists: false }
    })
      .populate('participants', 'email role')
      .populate('job', 'title');

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, otherUserId],
        job: jobId
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'email role')
        .populate('job', 'title');
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Get Or Create Conversation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'email role')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);

    const total = await Message.countDocuments({ conversation: conversationId });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Populate sender profile information
    const messagesWithProfiles = await Promise.all(
      messages.map(async (msg) => {
        const msgObj = msg.toObject();

        if (msgObj.sender) {
          if (msgObj.sender.role === 'worker') {
            const profile = await WorkerProfile.findOne({ user: msgObj.sender._id });
            msgObj.sender = {
              ...msgObj.sender,
              name: profile?.fullName,
              avatar: profile?.profilePicture
            };
          } else if (msgObj.sender.role === 'company') {
            const profile = await CompanyProfile.findOne({ user: msgObj.sender._id });
            msgObj.sender = {
              ...msgObj.sender,
              name: profile?.companyName,
              avatar: profile?.logo
            };
          }
        }

        return msgObj;
      })
    );

    res.status(200).json({
      success: true,
      count: messagesWithProfiles.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: messagesWithProfiles.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:conversationId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const files = req.files;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      attachments
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate message
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'email role');

    // Add sender profile information
    const msgObj = populatedMessage.toObject();
    if (msgObj.sender) {
      if (msgObj.sender.role === 'worker') {
        const profile = await WorkerProfile.findOne({ user: msgObj.sender._id });
        msgObj.sender = {
          ...msgObj.sender,
          name: profile?.fullName,
          avatar: profile?.profilePicture
        };
      } else if (msgObj.sender.role === 'company') {
        const profile = await CompanyProfile.findOne({ user: msgObj.sender._id });
        msgObj.sender = {
          ...msgObj.sender,
          name: profile?.companyName,
          avatar: profile?.logo
        };
      }
    }

    res.status(201).json({
      success: true,
      data: msgObj
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};