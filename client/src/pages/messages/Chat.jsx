import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiSend, FiArrowLeft, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversation();
    fetchMessages();

    // Join conversation room
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', conversationId);
      }
    };
  }, [conversationId, socket]);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      // Listen for typing indicator
      socket.on('user_typing', () => {
        setIsTyping(true);
      });

      socket.on('user_stop_typing', () => {
        setIsTyping(false);
      });

      return () => {
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const response = await messageAPI.getConversations();
      const conversations = response.data.data;
      const currentConv = conversations.find(c => c._id === conversationId);

      if (currentConv) {
        setConversation(currentConv);
        setOtherUser(currentConv.otherUser);
      }
    } catch (error) {
      console.error('Failed to load conversation details');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getMessages(conversationId);
      setMessages(response.data.data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await messageAPI.sendMessage(conversationId, {
        content: newMessage
      });

      const message = response.data.data;
      setNewMessage('');

      // Emit to socket - this will broadcast to ALL users including sender
      if (socket) {
        socket.emit('send_message', {
          conversationId,
          message
        });
        socket.emit('stop_typing', { conversationId });
      }

      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket) {
      socket.emit('typing', { conversationId });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId });
      }, 1000);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        {/* Header */}
        <div className="card mb-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/messages')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>

          {/* User Avatar */}
          {otherUser?.avatar ? (
            <img
              src={otherUser.avatar}
              alt={otherUser.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <FiUser className="h-5 w-5 text-primary-600" />
            </div>
          )}

          <div className="flex-1">
            <h2 className="font-semibold">
              {otherUser?.name || 'Chat'}
            </h2>
            {conversation?.job && (
              <p className="text-xs text-gray-500">
                Re: {conversation.job.title}
              </p>
            )}
            {isTyping && <p className="text-xs text-gray-500">typing...</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2">
          {messages.map((message) => {
            const isOwn = message.sender._id === user.id;

            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                    }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'
                      }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="card">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 input-field"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="btn-primary px-6"
            >
              {sending ? (
                <Spinner size="sm" />
              ) : (
                <FiSend className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Chat;