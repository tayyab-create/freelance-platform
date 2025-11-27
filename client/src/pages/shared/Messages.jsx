import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FiSend,
  FiSearch,
  FiUser,
  FiMoreVertical,
  FiX,
  FiBriefcase,
  FiPaperclip,
  FiFile,
  FiArrowDown,
  FiSmile,
  FiImage,
  FiDownload,
  FiCopy,
  FiTrash2,
  FiEdit2,
  FiCornerUpLeft,
  FiCheck,
  FiCheckCircle,
  FiArchive,
  FiStar,
  FiVolume2,
  FiVolumeX,
  FiMapPin,
  FiFilter,
  FiClock,
  FiMenu,
  FiCheckSquare,
  FiSquare,
  FiUpload
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Spinner from '../../components/common/Spinner';
import { useSelector } from 'react-redux';
import { PageHeader } from '../../components/shared';
import { getBreadcrumbs } from '../../utils/breadcrumbUtils';
import { useSocket } from '../../context/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Emoji picker data (common emojis)
const COMMON_EMOJIS = ['😀', '😂', '😊', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '✨', '🎉', '💯'];

const MessagesEnhanced = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const { socket } = useSocket();
  const { id } = useParams();

  // Core state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);

  // File handling
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Real-time features
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);

  // UI state
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});

  // Conversation management
  const [pinnedConversations, setPinnedConversations] = useState(new Set());
  const [archivedConversations, setArchivedConversations] = useState(new Set());
  const [mutedConversations, setMutedConversations] = useState(new Set());
  const [starredMessages, setStarredMessages] = useState(new Set());
  const [showArchived, setShowArchived] = useState(false);

  // Mobile responsiveness
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Notifications
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const soundRef = useRef(null);

  // ============= GLOBAL SOCKET EVENTS =============
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = (data) => {
      // 1. Optimistic update (keep this for immediate feedback)
      const { conversationId, lastMessage } = data;
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conversationId && conv._id.toString() === conversationId.toString()) {
            return {
              ...conv,
              lastMessage: lastMessage,
              lastMessageAt: lastMessage.createdAt,
              unreadCount: conv._id === selectedConversation?._id ? 0 : (conv.unreadCount || 0) + 1
            };
          }
          return conv;
        });
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });

      // 2. Force fetch from server to ensure consistency
      fetchConversations();
    };

    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket, selectedConversation]); // Add fetchConversations to dependency if needed, but it's usually stable

  // ============= GLOBAL SOCKET EVENTS =============
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = (data) => {
      const { conversationId, lastMessage } = data;

      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessage: lastMessage,
              lastMessageAt: lastMessage.createdAt,
              unreadCount: conv._id === selectedConversation?._id ? 0 : (conv.unreadCount || 0) + 1
            };
          }
          return conv;
        });

        // Sort by lastMessageAt desc
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };

    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket, selectedConversation]);


  // ============= SOCKET.IO INTEGRATION =============
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    // Join conversation room
    socket.emit('join_conversation', selectedConversation._id);

    // Listen for new messages
    const handleNewMessage = (message) => {
      const msgConvId = message.conversation?._id || message.conversation;

      if (msgConvId && msgConvId.toString() === selectedConversation._id.toString()) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });

        // Mark as read if we are the recipient and viewing the chat
        if (message.sender._id !== currentUser?.id) {
          socket.emit('message_read', {
            messageId: message._id,
            conversationId: selectedConversation._id,
          });
        }

        // ... sound and notification logic ...
      }

      // Update conversation list
      updateConversationWithNewMessage(message);

      // Force fetch to ensure sidebar is up to date
      fetchConversations();
    };

    // Listen for typing indicators
    const handleUserTyping = ({ userId, conversationId }) => {
      if (conversationId === selectedConversation._id && userId !== currentUser?.id) {
        setTypingUsers(prev => [...new Set([...prev, userId])]);
      }
    };

    const handleUserStopTyping = ({ userId, conversationId }) => {
      if (conversationId === selectedConversation._id) {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }
    };

    // Listen for online status
    const handleUserOnline = ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    // Listen for message read receipts
    const handleMessageRead = ({ messageId, conversationId, userId }) => {
      if (conversationId === selectedConversation._id) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, readBy: [...(msg.readBy || []), userId] } : msg
        ));
      }
    };

    // Listen for message reactions
    const handleMessageReaction = ({ messageId, conversationId, reactions }) => {
      if (conversationId === selectedConversation._id) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, reactions: reactions } : msg
        ));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('message_read', handleMessageRead);
    socket.on('message_reaction', handleMessageReaction);

    return () => {
      socket.emit('leave_conversation', selectedConversation._id);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('message_read', handleMessageRead);
      socket.off('message_reaction', handleMessageReaction);
    };
  }, [socket, selectedConversation, currentUser, soundEnabled, notificationsEnabled]);

  // ============= MOBILE RESPONSIVENESS =============
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-hide sidebar on mobile when conversation is selected
  useEffect(() => {
    if (isMobile && selectedConversation) {
      setShowSidebar(false);
    }
  }, [selectedConversation, isMobile]);

  // ============= KEYBOARD SHORTCUTS =============
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[placeholder="Search conversations..."]')?.focus();
      }

      // Ctrl/Cmd + F: Toggle message search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && selectedConversation) {
        e.preventDefault();
        setShowMessageSearch(prev => !prev);
      }

      // Escape: Clear selections/close modals
      if (e.key === 'Escape') {
        setShowEmojiPicker(false);
        setShowMessageSearch(false);
        setReplyingTo(null);
        setEditingMessage(null);
      }

      // Arrow keys: Navigate conversations
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (document.activeElement === messageInputRef.current) return;

        const currentIndex = conversations.findIndex(c => c._id === selectedConversation?._id);
        if (currentIndex === -1) return;

        const nextIndex = e.key === 'ArrowUp'
          ? Math.max(0, currentIndex - 1)
          : Math.min(conversations.length - 1, currentIndex + 1);

        setSelectedConversation(conversations[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations, selectedConversation]);

  // ============= NOTIFICATION PERMISSIONS =============
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // ============= SCROLL HANDLING =============
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selectedConversation]);

  // ============= CORE FUNCTIONS =============

  // Only sync from URL on initial load or when URL ID changes
  useEffect(() => {
    if (id && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === id);
      if (conversation && (!selectedConversation || selectedConversation._id !== id)) {
        setSelectedConversation(conversation);
      }
    }
  }, [id, conversations]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);

        // Emit read receipts for unread messages
        if (socket) {
          data.data.forEach(message => {
            if (message.sender._id !== currentUser?.id && !message.isRead) {
              socket.emit('message_read', {
                messageId: message._id,
                conversationId: conversationId,
              });
            }
          });
        }
      }
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  // ============= FILE HANDLING WITH DRAG & DROP =============
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (selectedFiles) => {
    if (selectedFiles.length + files.length > 5) {
      toast.error('You can only attach up to 5 files');
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);

    // Create previews for images
    selectedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews(prev => [...prev, { name: file.name, url: e.target.result }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  // ============= TYPING INDICATOR =============
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !selectedConversation) return;

    // Emit typing event
    socket.emit('typing', {
      conversationId: selectedConversation._id,
      userId: currentUser?.id
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', {
        conversationId: selectedConversation._id,
        userId: currentUser?.id
      });
    }, 1000);
  };

  // ============= MESSAGE SENDING =============
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && files.length === 0) || !selectedConversation) return;

    // Handle editing
    if (editingMessage) {
      await handleEditMessage();
      return;
    }

    setSendingMessage(true);
    const messageContent = newMessage;
    const messageFiles = [...files];
    const replyToMessage = replyingTo; // Capture before clearing state

    // Optimistic UI update
    const tempMessage = {
      _id: 'temp-' + Date.now(),
      content: messageContent,
      sender: {
        _id: currentUser?._id || currentUser?.id,
        id: currentUser?.id || currentUser?._id,
        name: currentUser?.name,
        email: currentUser?.email,
        avatar: currentUser?.avatar
      },
      createdAt: new Date().toISOString(),
      status: 'sending',
      replyTo: replyToMessage
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setFiles([]);
    setFilePreviews([]);
    setReplyingTo(null);

    try {
      const token = localStorage.getItem('token');
      let body;
      let headers = { Authorization: `Bearer ${token}` };

      if (messageFiles.length > 0) {
        const formData = new FormData();
        formData.append('content', messageContent);
        if (replyToMessage) {
          formData.append('replyTo', replyToMessage._id);
        }
        messageFiles.forEach(file => {
          formData.append('attachments', file);
        });
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          content: messageContent,
          replyTo: replyToMessage?._id
        });
      }

      const response = await fetch(`${API_URL}/messages/${selectedConversation._id}`, {
        method: 'POST',
        headers,
        body,
      });

      const data = await response.json();
      if (data.success) {
        // Ensure the backend message has the full replyTo object
        const messageWithReply = {
          ...data.data,
          // If backend didn't populate replyTo, use our local copy
          replyTo: data.data.replyTo || replyToMessage
        };

        // Replace temp message with real message
        setMessages(prev => prev.map(msg =>
          msg._id === tempMessage._id ? messageWithReply : msg
        ));

        // Emit via socket
        if (socket) {
          socket.emit('send_message', {
            conversationId: selectedConversation._id,
            message: messageWithReply,
            recipients: selectedConversation.participants.map(p => p._id)
          });
          socket.emit('stop_typing', {
            conversationId: selectedConversation._id,
            userId: currentUser?.id
          });
        }

        messageInputRef.current?.focus();
        scrollToBottom('auto');
      } else {
        // Remove failed message
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // ============= MESSAGE ACTIONS =============
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/messages/${selectedConversation._id}/message/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleEditMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/messages/${selectedConversation._id}/message/${editingMessage._id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages(prev => prev.map(msg =>
          msg._id === editingMessage._id ? { ...msg, content: newMessage, edited: true } : msg
        ));
        setNewMessage('');
        setEditingMessage(null);
        toast.success('Message updated');
      }
    } catch (error) {
      toast.error('Failed to edit message');
    }
  };

  const handleCopyMessage = (message) => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied!');
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/messages/${selectedConversation._id}/message/${messageId}/reaction`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emoji }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update the message with the new reactions from backend
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, reactions: data.data.reactions } : msg
        ));
        toast.success('Reaction updated!');
      }
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  // ============= CONVERSATION ACTIONS =============
  const togglePin = (conversationId) => {
    setPinnedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
        toast.success('Unpinned');
      } else {
        newSet.add(conversationId);
        toast.success('Pinned');
      }
      return newSet;
    });
  };

  const toggleArchive = (conversationId) => {
    setArchivedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
        toast.success('Unarchived');
      } else {
        newSet.add(conversationId);
        toast.success('Archived');
      }
      return newSet;
    });
  };

  const toggleMute = (conversationId) => {
    setMutedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
        toast.success('Unmuted');
      } else {
        newSet.add(conversationId);
        toast.success('Muted');
      }
      return newSet;
    });
  };

  // ============= HELPER FUNCTIONS =============
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVK3n77BdGAg+ltryxHInBSh+zPLaizsIGGS56OWTQA0MUKXi8bllHgU2jdXzzH4vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoPDlOq5O+zYBoGPJPY88p8KwUme8rx3I4+CRZiturqpVITC0mi4PGzZhwGM4vT88uAMQYfccLu56VNDQtWre3vs14bCECa2/PGcSYELIHO8tiJOAcZaLzs56BODwxPpuPxt2IdBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaSQ0PVK3n77BdGQc9ltvyxHInBSh+zPDaizsIGGS56OSTQAwLUKXi8bllHgU2jdXzzH4vBSJ0xe/glEILElyx6OyrWRUIRJvc8sFuIwUshs/z1YU2Bhxqvu3mnEoPDlOq5O+zYRsGPJPY88p8KwUme8rx3I4+CRVht+rqpVMSC0mh4fGzZhwGM4vT88uAMQYfccLu56VNDAtWre3vs14bCECa2/PGcSYELIHO8tiJOAcZaLzs56BODwxPpuPxt2IdBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaSQ0PVK3n77BdGQc9ltvyxHInBSh+zPDaizsIGGS56OSTQAwLUKXi8bllHgU2jdXzzH4vBSJ0xe/glEILElyx6OyrWRUIRJvc8sFuIwUshs/z1YU2Bhxqvu3mnEoPDlOq5O+zYRsGPJPY88p8KwUme8rx3I4+CRVht+rqpVMSC0mh4fGzZhwGM4vT88uAMQYfccLu56VNDAtWre3vs14bCECa2/PGcSYELIHO8tiJOAcZaLzs56BODwxPpuPxt2IdBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaSQ0PVK3n77BdGQc9ltvyxHInBSh+zPDaizsIGGS56OSTQAwLUKXi8bllHgU2jdXzzH4vBSJ0xe/glEILElyx6OyrWRUIRJvc8sFuIwUshs/z1YU2Bhxqvu3mnEoPDlOq5O+zYRsGPJPY88p8KwUme8rx3I4+CRVht+rqpVMSC0mh4fGzZhwGM4vT88uAMQYfccLu56VNDAtWre3vs14bCECa2/PGcSYELIHO8tiJOAcZaLzs56BODwxPpuPxt2IdBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaSQ0PVK3n77BdGQc9ltvyxHInBSh+zPDaizsIGGS56OSTQAwLUKXi8bllHgU2jdXzzH4vBSJ0xe/glEILElyx6OyrWRUIRJvc8sFuIwUshs/z1YU2Bhxqvu3mnEoPDlOq5O+zYRsGPJPY88p8KwUme8rx3I4+CRVht+rqpVMSC0mh4fGzZhwGM4vT88uAMQYfccLu56VNDAtWre3vs14bCECa2/PGcSYELIHO8tiJOAcZaLzs56BODwxPpuPxt2IdBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaSQ0PVK3n77BdGQc9ltvyxHInBSh+zPDaizsIGGS56OSTQAwLUKXi8bllHgU2jdXzzH4vBSJ0xe/glEILElyx6OyrWRUIRJvc8sFuIwUshs/z1YU2Bhxqvu3mnEoPDlOq5O+zYRsGPJPY88p8KwUme8rx3I4+CRVht+rqpVMSC0mh4fGzZhwGM4vT88uAMQYfccLu56VNDAtWre3vs14bCECa2/PGcSYEK4DN8tiIOQcZZ7zs56BODwxPpuPxt2IdBjiP1/PMeS0FI3bH79+RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaSQ0PVK3n77BdGQc9ltvyxHInBSh+zPDaizsIGGS56OSTQAwLT6Xh8rllHgU2jdXzzH4vBSJ0xO/glEILElyx6OyrWRUIRJvc8sFuIwUshs/z1YU2Bhxqvu3mnEoPDlOq5O+zYRsGPJPY88p8KwUme8rx3I4+CRVht+rqpVMSC0mh4fGzZhwGM4vT88uAMQYfccLu56VNDAw=');
    audio.play().catch(() => { });
  };

  const showBrowserNotification = (message) => {
    if (!notificationsEnabled) return;

    new Notification('New Message', {
      body: `${message.sender.name}: ${message.content}`,
      icon: message.sender.avatar || '/default-avatar.png',
      badge: '/favicon.ico'
    });
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => {
      const msgConvId = message.conversation?._id || message.conversation;

      const updated = prev.map(conv => {
        // Use toString() for safe comparison
        if (msgConvId && conv._id.toString() === msgConvId.toString()) {
          return {
            ...conv,
            lastMessage: message,
            lastMessageAt: message.createdAt,
            unreadCount: conv._id === selectedConversation?._id ? 0 : (conv.unreadCount || 0) + 1
          };
        }
        return conv;
      });

      // Sort by lastMessageAt desc
      return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter((conv) => {
      // Filter by archived status
      const isArchived = archivedConversations.has(conv._id);
      if (showArchived && !isArchived) return false; // Show only archived
      if (!showArchived && isArchived) return false; // Hide archived

      // Filter by search query
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        conv.otherUser?.name?.toLowerCase().includes(query) ||
        conv.otherUser?.email?.toLowerCase().includes(query) ||
        conv.job?.title?.toLowerCase().includes(query)
      );
    });

    // Sort: pinned first, then by last message time
    filtered.sort((a, b) => {
      const aPin = pinnedConversations.has(a._id) ? 1 : 0;
      const bPin = pinnedConversations.has(b._id) ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;

      return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
    });

    return filtered;
  }, [conversations, searchQuery, archivedConversations, pinnedConversations, showArchived]);

  const filteredMessages = useMemo(() => {
    if (!messageSearchQuery) return messages;

    const query = messageSearchQuery.toLowerCase();
    return messages.filter(msg => msg.content?.toLowerCase().includes(query));
  }, [messages, messageSearchQuery]);

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getMessageTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============= RENDER =============
  return (
    <DashboardLayout>
      <div className="mb-6">
        <PageHeader breadcrumbs={getBreadcrumbs(currentUser?.role, 'messages')} />
      </div>

      <div className="h-[calc(100vh-200px)] flex rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        {/* Conversations Sidebar */}
        <div
          className={`${isMobile && !showSidebar ? 'hidden' : 'block'
            } w-full md:w-96 border-r border-gray-200 bg-white flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">
                {showArchived ? 'Archived' : 'Messages'}
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`p-2 rounded-lg transition-colors ${showArchived ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  title={showArchived ? 'Show active conversations' : 'Show archived conversations'}
                >
                  <FiArchive className="h-5 w-5" />
                </button>
                {isMobile && selectedConversation && (
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search conversations... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  {showArchived ? (
                    <FiArchive className="h-6 w-6 text-gray-400" />
                  ) : (
                    <FiUser className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {showArchived
                    ? (searchQuery ? 'No archived conversations found' : 'No archived conversations')
                    : (searchQuery ? 'No conversations found' : 'No messages yet')
                  }
                </p>
                {showArchived && archivedConversations.size === 0 && (
                  <button
                    onClick={() => setShowArchived(false)}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Back to messages
                  </button>
                )}
              </div>
            ) : (
              <div>
                {filteredConversations.map((conversation) => {
                  const isPinned = pinnedConversations.has(conversation._id);
                  const isMuted = mutedConversations.has(conversation._id);
                  const otherUserOnline = isUserOnline(conversation.otherUser?._id);

                  return (
                    <div key={conversation._id} className="relative group">
                      <button
                        onClick={() => {
                          setSelectedConversation(conversation);
                          if (isMobile) setShowSidebar(false);
                        }}
                        className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left relative ${selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 relative">
                            {conversation.otherUser?.avatar ? (
                              <img
                                src={conversation.otherUser.avatar}
                                alt={conversation.otherUser.name}
                                className="h-12 w-12 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border border-gray-200">
                                <FiUser className="h-6 w-6 text-blue-600" />
                              </div>
                            )}

                            {/* Online status indicator */}
                            {otherUserOnline && (
                              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}

                            {conversation.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-semibold">
                                  {conversation.unreadCount}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {conversation.otherUser?.name || conversation.otherUser?.email}
                                </h3>
                                {isPinned && <FiMapPin className="h-3 w-3 text-primary-500" />}
                                {isMuted && <FiVolumeX className="h-3 w-3 text-gray-400" />}
                              </div>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {conversation.lastMessageAt && formatTime(conversation.lastMessageAt)}
                              </span>
                            </div>

                            {conversation.job && (
                              <div className="flex items-center gap-1 mb-1">
                                <FiBriefcase className="h-3 w-3 text-gray-400" />
                                <p className="text-xs text-gray-500 truncate">{conversation.job.title}</p>
                              </div>
                            )}

                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 truncate">
                                <span className="font-medium">
                                  {conversation.lastMessage.sender === currentUser?.id ||
                                    conversation.lastMessage.sender === currentUser?._id
                                    ? 'You: '
                                    : ''}
                                </span>
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Quick actions on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(conversation._id);
                          }}
                          className="p-1.5 bg-white rounded-lg hover:bg-gray-100 shadow-sm"
                          title={isPinned ? 'Unpin' : 'Pin'}
                        >
                          <FiMapPin className={`h-4 w-4 ${isPinned ? 'text-primary-500' : 'text-gray-600'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArchive(conversation._id);
                          }}
                          className="p-1.5 bg-white rounded-lg hover:bg-gray-100 shadow-sm"
                          title="Archive"
                        >
                          <FiArchive className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 flex flex-col bg-gray-50 ${isMobile && showSidebar ? 'hidden' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button
                        onClick={() => setShowSidebar(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                      >
                        <FiMenu className="h-5 w-5" />
                      </button>
                    )}

                    <div className="relative">
                      {selectedConversation.otherUser?.avatar ? (
                        <img
                          src={selectedConversation.otherUser.avatar}
                          alt={selectedConversation.otherUser.name}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border border-gray-200">
                          <FiUser className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      {isUserOnline(selectedConversation.otherUser?._id) && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        {selectedConversation.otherUser?.name || selectedConversation.otherUser?.email}
                        {isUserOnline(selectedConversation.otherUser?._id) && (
                          <span className="text-xs text-green-600 font-normal">• Online</span>
                        )}
                      </h2>
                      {selectedConversation.job && (
                        <p className="text-sm text-gray-500">{selectedConversation.job.title}</p>
                      )}
                      {typingUsers.length > 0 && (
                        <p className="text-xs text-primary-600 flex items-center gap-1">
                          <span className="animate-pulse">typing...</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMessageSearch(!showMessageSearch)}
                      className={`p-2 rounded-lg transition-colors ${showMessageSearch ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      title="Search in conversation (Ctrl+F)"
                    >
                      <FiSearch className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                    >
                      {soundEnabled ? (
                        <FiVolume2 className="h-5 w-5 text-gray-600" />
                      ) : (
                        <FiVolumeX className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FiMoreVertical className="h-5 w-5 text-gray-600" />
                      </button>

                      {showOptionsMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              togglePin(selectedConversation._id);
                              setShowOptionsMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiMapPin className="h-4 w-4" />
                            {pinnedConversations.has(selectedConversation._id) ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            onClick={() => {
                              toggleMute(selectedConversation._id);
                              setShowOptionsMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            {mutedConversations.has(selectedConversation._id) ? (
                              <>
                                <FiVolume2 className="h-4 w-4" />
                                Unmute
                              </>
                            ) : (
                              <>
                                <FiVolumeX className="h-4 w-4" />
                                Mute
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              toggleArchive(selectedConversation._id);
                              setShowOptionsMenu(false);
                              setSelectedConversation(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiArchive className="h-4 w-4" />
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Search Bar */}
                {showMessageSearch && (
                  <div className="mt-3 relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search in this conversation..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {isDragging && (
                  <div className="fixed inset-0 bg-primary-500/10 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-dashed border-primary-500">
                      <FiUpload className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-900">Drop files to upload</p>
                      <p className="text-sm text-gray-500 mt-1">Up to 5 files allowed</p>
                    </div>
                  </div>
                )}

                {filteredMessages.map((message, index) => {
                  const currentUserId = currentUser?._id || currentUser?.id;
                  const senderId = message.sender?._id || message.sender?.id;
                  // Fix: Handle both message.sender and message.sender._id formats
                  const isOwn = senderId && currentUserId && senderId.toString() === currentUserId.toString();

                  const showDate =
                    index === 0 ||
                    new Date(message.createdAt).toDateString() !==
                    new Date(filteredMessages[index - 1].createdAt).toDateString();

                  return (
                    <React.Fragment key={message._id}>
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-500 border border-gray-200">
                            {new Date(message.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}

                      <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                        {!isOwn && (
                          <div className="flex-shrink-0">
                            {message.sender?.avatar ? (
                              <img
                                src={message.sender.avatar}
                                alt={message.sender.name}
                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border border-gray-200">
                                <FiUser className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                          </div>
                        )}

                        <div className={`max-w-md flex flex-col relative ${isOwn ? 'items-end' : 'items-start'}`}>
                          {/* Reply preview */}
                          {message.replyTo && (
                            <div className={`mb-1 p-2 rounded-lg text-xs border-l-2 w-full ${isOwn
                              ? 'bg-blue-100 border-blue-400 text-blue-900'
                              : 'bg-gray-100 border-gray-400 text-gray-900'
                              }`}>
                              <p className="font-medium opacity-90">
                                Replying to {message.replyTo.sender?.name || 'User'}
                              </p>
                              <p className="opacity-75 truncate">{message.replyTo.content}</p>
                            </div>
                          )}

                          <span className={`text-xs text-gray-600 font-medium mb-1 ${isOwn ? 'mr-1' : 'ml-1'}`}>
                            {isOwn ? 'You' : message.sender?.name || message.sender?.email}
                          </span>

                          <div
                            className={`rounded-2xl px-4 py-2.5 ${isOwn
                              ? 'bg-blue-500 text-white rounded-tr-sm shadow-sm'
                              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                              }`}
                          >
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mb-2 space-y-2">
                                {message.attachments.map((att, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-2 p-2 rounded ${isOwn ? 'bg-white/20' : 'bg-black/5'
                                      }`}
                                  >
                                    <FiFile className="h-4 w-4" />
                                    <a
                                      href={`${API_URL.replace('/api', '')}/${att.path}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm underline truncate max-w-[150px]"
                                    >
                                      {att.filename}
                                    </a>
                                    <FiDownload className="h-3 w-3 ml-auto" />
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {message.content}
                            </p>

                            {message.edited && (
                              <p className="text-xs mt-1 opacity-70">(edited)</p>
                            )}
                          </div>

                          {/* Message reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {message.reactions.map((reaction, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs shadow-sm"
                                  title={`Reacted by ${reaction.userId}`}
                                >
                                  {reaction.emoji}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-1 px-1">
                            <p className={`text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {getMessageTime(message.createdAt)}
                              {isOwn && message.status === 'sending' && <span className="ml-1">⏳</span>}
                              {isOwn && message.status !== 'sending' && (
                                <span className="ml-1">
                                  {message.readBy?.length > 0 ? '✓✓' : '✓'}
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Message actions (show on hover) */}
                          <div
                            className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
                              } opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 px-2`}
                          >
                            <button
                              onClick={() => handleReplyToMessage(message)}
                              className="p-1.5 bg-white rounded-lg hover:bg-gray-100 shadow-sm border border-gray-200"
                              title="Reply"
                            >
                              <FiCornerUpLeft className="h-3 w-3 text-gray-600" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowEmojiPicker(true);
                              }}
                              className="p-1.5 bg-white rounded-lg hover:bg-gray-100 shadow-sm border border-gray-200"
                              title="React"
                            >
                              <FiSmile className="h-3 w-3 text-gray-600" />
                            </button>

                            <button
                              onClick={() => handleCopyMessage(message)}
                              className="p-1.5 bg-white rounded-lg hover:bg-gray-100 shadow-sm border border-gray-200"
                              title="Copy"
                            >
                              <FiCopy className="h-3 w-3 text-gray-600" />
                            </button>

                            {isOwn && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingMessage(message);
                                    setNewMessage(message.content);
                                    messageInputRef.current?.focus();
                                  }}
                                  className="p-1.5 bg-white rounded-lg hover:bg-gray-100 shadow-sm border border-gray-200"
                                  title="Edit"
                                >
                                  <FiEdit2 className="h-3 w-3 text-gray-600" />
                                </button>

                                <button
                                  onClick={() => handleDeleteMessage(message._id)}
                                  className="p-1.5 bg-white rounded-lg hover:bg-red-50 shadow-sm border border-gray-200"
                                  title="Delete"
                                >
                                  <FiTrash2 className="h-3 w-3 text-red-600" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {isOwn && (
                          <div className="flex-shrink-0">
                            {message.sender?.avatar ? (
                              <img
                                src={message.sender.avatar}
                                alt={message.sender.name || 'You'}
                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs border border-gray-200">
                                {message.sender?.name?.charAt(0).toUpperCase() ||
                                  currentUser?.email?.charAt(0).toUpperCase() ||
                                  'U'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <button
                  onClick={() => scrollToBottom('smooth')}
                  className="absolute bottom-24 right-8 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all z-10"
                >
                  <FiArrowDown className="h-5 w-5 text-gray-600" />
                </button>
              )}

              {/* Emoji Picker Modal */}
              {showEmojiPicker && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">React with emoji</h3>
                      <button
                        onClick={() => {
                          setShowEmojiPicker(false);
                          setSelectedMessage(null);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-lg"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                      {COMMON_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            handleReaction(selectedMessage._id, emoji);
                            setShowEmojiPicker(false);
                            setSelectedMessage(null);
                          }}
                          className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                {/* Reply preview */}
                {replyingTo && (
                  <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700">
                        Replying to {replyingTo.sender?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{replyingTo.content}</p>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Editing indicator */}
                {editingMessage && (
                  <div className="mb-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <FiEdit2 className="h-4 w-4" />
                      Editing message
                    </p>
                    <button
                      onClick={() => {
                        setEditingMessage(null);
                        setNewMessage('');
                      }}
                      className="p-1 hover:bg-blue-100 rounded"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* File previews */}
                {(files.length > 0 || filePreviews.length > 0) && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="relative group bg-gray-100 rounded-lg p-2 flex items-center gap-2"
                      >
                        {file.type.startsWith('image/') && filePreviews[index] ? (
                          <img
                            src={filePreviews[index].url}
                            alt={file.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                        ) : (
                          <FiFile className="h-8 w-8 text-gray-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    title="Attach files"
                  >
                    <FiPaperclip className="h-5 w-5" />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message... (Shift+Enter for new line)"
                      rows="1"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32 text-sm"
                      style={{ minHeight: '48px' }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(true)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiSmile className="h-5 w-5" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && files.length === 0) || sendingMessage}
                    className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  >
                    {sendingMessage ? (
                      <Spinner size="sm" color="white" />
                    ) : editingMessage ? (
                      <FiCheck className="h-5 w-5" />
                    ) : (
                      <FiSend className="h-5 w-5" />
                    )}
                  </button>
                </form>

                {/* Keyboard shortcuts hint */}
                <p className="text-xs text-gray-500 mt-2 text-center">
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> to send •{' '}
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded">Shift+Enter</kbd> for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4">
                  <FiUser className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500 mb-4">
                  Choose a conversation from the list to start messaging
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Ctrl/⌘ + K</kbd> Search conversations</p>
                  <p><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Ctrl/⌘ + F</kbd> Search messages</p>
                  <p><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑/↓</kbd> Navigate conversations</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessagesEnhanced;
