import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messageAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiMessageCircle, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { EmptyState, SkeletonLoader, Avatar, PageHeader } from '../../components/shared';
import { useNavigate } from 'react-router-dom';


const Conversations = () => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        // Update conversation list when new message arrives
        fetchConversations();
      });

      return () => {
        socket.off('new_message');
      };
    }
  }, [socket]);

  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data.data);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-600 mt-2">Your conversations</p>
        </div>

        {loading ? (
          <SkeletonLoader type="list" count={8} />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={FiMessageCircle}
            title="No conversations yet"
            description="Start a conversation with a company or worker."
            actionLabel="Browse Jobs"
            onAction={() => navigate('/worker/jobs')}
          />
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation._id}
                to={`/messages/${conversation._id}`}
                className="block"
              >
                <div className="card hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    {conversation.otherUser?.avatar ? (
                      <Avatar
                        src={conversation.otherUser?.avatar}
                        name={conversation.otherUser?.name}
                        size="lg"
                        status={conversation.otherUser?.isOnline ? 'online' : 'offline'}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <FiUser className="h-6 w-6 text-primary-600" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.otherUser?.name || conversation.otherUser?.email}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>

                      {conversation.job && (
                        <p className="text-xs text-gray-500 mb-1">
                          Re: {conversation.job.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Conversations;