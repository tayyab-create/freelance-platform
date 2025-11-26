import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiSend, FiArrowLeft, FiUser, FiPaperclip, FiX, FiFile } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { Avatar } from '../../components/shared';

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
  const [files, setFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      toast.error('You can only attach up to 5 files');
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && files.length === 0) return;

    setSending(true);
    try {
      let data;
      if (files.length > 0) {
        const formData = new FormData();
        formData.append('content', newMessage);
        files.forEach(file => {
          formData.append('attachments', file);
        });
        data = formData;
      } else {
        data = { content: newMessage };
      }

      const response = await messageAPI.sendMessage(conversationId, data);

      const message = response.data.data;
      setNewMessage('');
      setFiles([]);

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
      console.error(error);
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
            <Avatar
              src={otherUser?.avatar}
              name={otherUser?.name}
              size="md"
              status={otherUser?.isOnline ? 'online' : 'offline'}
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
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {message.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-black/10 p-2 rounded">
                          <FiFile className="h-4 w-4" />
                          <a
                            href={`http://localhost:5000/${att.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline truncate max-w-[150px]"
                          >
                            {att.filename}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
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
        <div className="card p-4">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm">
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Attach files"
            >
              <FiPaperclip className="h-5 w-5" />
            </button>
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
              disabled={sending || (!newMessage.trim() && files.length === 0)}
              className="btn-primary px-6 py-2.5"
            >
              {sending ? (
                <Spinner size="sm" />
              ) : (
                <FiSend className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;