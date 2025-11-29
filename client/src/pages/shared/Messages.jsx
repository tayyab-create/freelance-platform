import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { PageHeader } from '../../components/shared';
import { getBreadcrumbs } from '../../utils/breadcrumbUtils';
import { useSocket } from '../../context/SocketContext';

// Import new components
import ConversationList from './messages/ConversationList';
import ChatHeader from './messages/ChatHeader';
import MessageList from './messages/MessageList';
import MessageInput from './messages/MessageInput';
import EmptyState from './messages/EmptyState';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
                if (soundEnabled) {
                    playNotificationSound();
                }
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

        // Listen for message updates (edits)
        const handleMessageUpdated = ({ messageId, conversationId, content, edited, editedAt }) => {
            if (conversationId === selectedConversation._id) {
                setMessages(prev => prev.map(msg =>
                    msg._id === messageId
                        ? { ...msg, content, edited, editedAt }
                        : msg
                ));
            }
        };

        // Listen for message deletions
        const handleMessageDeleted = ({ messageId, conversationId }) => {
            if (conversationId === selectedConversation._id) {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stop_typing', handleUserStopTyping);
        socket.on('user_online', handleUserOnline);
        socket.on('user_offline', handleUserOffline);
        socket.on('message_read', handleMessageRead);
        socket.on('message_reaction', handleMessageReaction);
        socket.on('message_updated', handleMessageUpdated);
        socket.on('message_deleted', handleMessageDeleted);

        return () => {
            socket.emit('leave_conversation', selectedConversation._id);
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stop_typing', handleUserStopTyping);
            socket.off('user_online', handleUserOnline);
            socket.off('user_offline', handleUserOffline);
            socket.off('message_read', handleMessageRead);
            socket.off('message_reaction', handleMessageReaction);
            socket.off('message_updated', handleMessageUpdated);
            socket.off('message_deleted', handleMessageDeleted);
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
                document.querySelector('input[placeholder="Search conversations... (Ctrl+K)"]')?.focus();
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

                // Initialize states from backend data
                const pinned = new Set();
                const archived = new Set();
                const muted = new Set();

                data.data.forEach(conv => {
                    if (conv.pinnedBy?.includes(currentUser?.id)) pinned.add(conv._id);
                    if (conv.archivedBy?.includes(currentUser?.id)) archived.add(conv._id);
                    if (conv.mutedBy?.includes(currentUser?.id)) muted.add(conv._id);
                });

                setPinnedConversations(pinned);
                setArchivedConversations(archived);
                setMutedConversations(muted);
            }
        } catch (error) {
            console.error(error);
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
    const togglePin = async (conversationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/${conversationId}/pin`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
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
            }
        } catch (error) {
            toast.error('Failed to update pin status');
        }
    };

    const toggleArchive = async (conversationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/${conversationId}/archive`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
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
            }
        } catch (error) {
            toast.error('Failed to update archive status');
        }
    };

    const toggleMute = async (conversationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/${conversationId}/mute`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
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
            }
        } catch (error) {
            toast.error('Failed to update mute status');
        }
    };

    // ============= HELPER FUNCTIONS =============
    const playNotificationSound = () => {
        const audio = new Audio('data:audio/wav;base64,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');
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

    // ============= RENDER =============
    return (
        <DashboardLayout>
            <div className="mb-6">
                <PageHeader breadcrumbs={getBreadcrumbs(currentUser?.role, 'messages')} />
            </div>

            <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                {/* Conversations Sidebar */}
                <ConversationList
                    conversations={filteredConversations}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={setSelectedConversation}
                    loading={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    showArchived={showArchived}
                    setShowArchived={setShowArchived}
                    pinnedConversations={pinnedConversations}
                    togglePin={togglePin}
                    archivedConversations={archivedConversations}
                    toggleArchive={toggleArchive}
                    mutedConversations={mutedConversations}
                    isUserOnline={isUserOnline}
                    isMobile={isMobile}
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    currentUser={currentUser}
                />

                {/* Messages Area */}
                <div className={`flex-1 flex flex-col bg-gray-50 ${isMobile && showSidebar ? 'hidden' : 'flex'}`}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <ChatHeader
                                selectedConversation={selectedConversation}
                                isMobile={isMobile}
                                setShowSidebar={setShowSidebar}
                                isUserOnline={isUserOnline}
                                typingUsers={typingUsers}
                                showMessageSearch={showMessageSearch}
                                setShowMessageSearch={setShowMessageSearch}
                                messageSearchQuery={messageSearchQuery}
                                setMessageSearchQuery={setMessageSearchQuery}
                                soundEnabled={soundEnabled}
                                setSoundEnabled={setSoundEnabled}
                                showOptionsMenu={showOptionsMenu}
                                setShowOptionsMenu={setShowOptionsMenu}
                                togglePin={togglePin}
                                toggleMute={toggleMute}
                                toggleArchive={toggleArchive}
                                pinnedConversations={pinnedConversations}
                                mutedConversations={mutedConversations}
                                setSelectedConversation={setSelectedConversation}
                            />

                            {/* Messages */}
                            <MessageList
                                messagesContainerRef={messagesContainerRef}
                                messagesEndRef={messagesEndRef}
                                messages={filteredMessages}
                                currentUser={currentUser}
                                handleDragEnter={handleDragEnter}
                                handleDragLeave={handleDragLeave}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                                isDragging={isDragging}
                                handleReplyToMessage={handleReplyToMessage}
                                setSelectedMessage={setSelectedMessage}
                                setShowEmojiPicker={setShowEmojiPicker}
                                handleCopyMessage={handleCopyMessage}
                                setEditingMessage={setEditingMessage}
                                setNewMessage={setNewMessage}
                                messageInputRef={messageInputRef}
                                handleDeleteMessage={handleDeleteMessage}
                                showScrollButton={showScrollButton}
                                scrollToBottom={scrollToBottom}
                                showEmojiPicker={showEmojiPicker}
                                selectedMessage={selectedMessage}
                                handleReaction={handleReaction}
                            />

                            {/* Message Input */}
                            <MessageInput
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                editingMessage={editingMessage}
                                setEditingMessage={setEditingMessage}
                                setNewMessage={setNewMessage}
                                files={files}
                                filePreviews={filePreviews}
                                removeFile={removeFile}
                                handleSendMessage={handleSendMessage}
                                fileInputRef={fileInputRef}
                                handleFileSelect={handleFileSelect}
                                messageInputRef={messageInputRef}
                                newMessage={newMessage}
                                handleTyping={handleTyping}
                                setShowEmojiPicker={setShowEmojiPicker}
                                sendingMessage={sendingMessage}
                            />
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MessagesEnhanced;