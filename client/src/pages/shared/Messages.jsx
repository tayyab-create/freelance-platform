import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FiSend,
  FiSearch,
  FiUser,
  FiMoreVertical,
  FiX,
  FiBriefcase
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Spinner from '../../components/common/Spinner';
import { useSelector } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Messages = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    if (id && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === id);
      if (conversation) {
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
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConversation._id, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const fetchMessages = async (conversationId, silent = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const newMessages = data.data;
        setMessages(newMessages);

        // Update conversation list if there are new messages
        if (silent && newMessages.length > 0) {
          const lastMessage = newMessages[newMessages.length - 1];
          setSelectedConversation(prev => ({
            ...prev,
            lastMessage: lastMessage,
            lastMessageAt: lastMessage.createdAt
          }));
          fetchConversations();
        }
      }
    } catch (error) {
      if (!silent) {
        toast.error('Failed to load messages');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/${selectedConversation._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
        messageInputRef.current?.focus();

        // Update the selected conversation's last message
        setSelectedConversation(prev => ({
          ...prev,
          lastMessage: data.data,
          lastMessageAt: data.data.createdAt
        }));

        // Update conversation list
        fetchConversations();
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.otherUser?.name?.toLowerCase().includes(query) ||
      conv.otherUser?.email?.toLowerCase().includes(query) ||
      conv.job?.title?.toLowerCase().includes(query)
    );
  });

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

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-96 border-r border-gray-200 bg-white flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search conversations..."
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
                  <FiUser className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </p>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
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
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.otherUser?.name || conversation.otherUser?.email}
                          </h3>
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
                              {conversation.lastMessage.sender === currentUser?.id || conversation.lastMessage.sender === currentUser?._id ? 'You: ' : ''}
                            </span>
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
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
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedConversation.otherUser?.name || selectedConversation.otherUser?.email}
                      </h2>
                      {selectedConversation.job && (
                        <p className="text-sm text-gray-500">{selectedConversation.job.title}</p>
                      )}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiMoreVertical className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                  // Check if message is from current user - compare with both _id and id
                  const currentUserId = currentUser?._id || currentUser?.id;
                  const senderId = message.sender?._id || message.sender?.id;
                  const isOwn = senderId && currentUserId && (senderId.toString() === currentUserId.toString());

                  const showDate =
                    index === 0 ||
                    new Date(message.createdAt).toDateString() !==
                    new Date(messages[index - 1].createdAt).toDateString();

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
                      <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar for received messages - LEFT */}
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

                        <div className="max-w-md flex flex-col">
                          {/* Sender name */}
                          <span className="text-xs text-gray-600 font-medium mb-1 ml-1">
                            {isOwn ? 'You' : (message.sender?.name || message.sender?.email)}
                          </span>

                          <div
                            className={`rounded-2xl px-4 py-2.5 ${isOwn
                                ? 'bg-blue-500 text-white rounded-tr-sm shadow-sm'
                                : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                              }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {message.content}
                            </p>
                          </div>

                          <p
                            className={`text-xs text-gray-500 mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'
                              }`}
                          >
                            {getMessageTime(message.createdAt)}
                            {isOwn && <span className="ml-1">✓</span>}
                          </p>
                        </div>

                        {/* Avatar for sent messages (current user) - RIGHT */}
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
                                {message.sender?.name?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U'}
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

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <div className="flex-1">
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message..."
                      rows="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32 text-sm"
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  >
                    {sendingMessage ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <FiSend className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FiUser className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
