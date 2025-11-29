import React from 'react';
import {
    FiSearch,
    FiUser,
    FiArchive,
    FiX,
    FiMapPin,
    FiVolumeX,
    FiBriefcase
} from 'react-icons/fi';
import Spinner from '../../../components/common/Spinner';
import { formatTime } from './utils';

const ConversationList = ({
    conversations,
    selectedConversation,
    setSelectedConversation,
    loading,
    searchQuery,
    setSearchQuery,
    showArchived,
    setShowArchived,
    pinnedConversations,
    togglePin,
    archivedConversations,
    toggleArchive,
    mutedConversations,
    isUserOnline,
    isMobile,
    showSidebar,
    setShowSidebar,
    currentUser
}) => {
    return (
        <div
            className={`${isMobile && !showSidebar ? 'hidden' : 'block'
                } w-full md:w-96 border-r border-slate-100 bg-white flex flex-col`}
        >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-100">
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
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Spinner />
                    </div>
                ) : conversations.length === 0 ? (
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
                        {conversations.map((conversation) => {
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
                                        className={`w-full p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left relative ${selectedConversation?._id === conversation._id ? 'bg-blue-50/50' : ''
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
    );
};

export default ConversationList;
