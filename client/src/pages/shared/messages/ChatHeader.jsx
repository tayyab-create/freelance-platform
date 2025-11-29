import React from 'react';
import {
    FiMenu,
    FiUser,
    FiSearch,
    FiVolume2,
    FiVolumeX,
    FiMoreVertical,
    FiMapPin,
    FiArchive
} from 'react-icons/fi';

const ChatHeader = ({
    selectedConversation,
    isMobile,
    setShowSidebar,
    isUserOnline,
    typingUsers,
    showMessageSearch,
    setShowMessageSearch,
    messageSearchQuery,
    setMessageSearchQuery,
    soundEnabled,
    setSoundEnabled,
    showOptionsMenu,
    setShowOptionsMenu,
    togglePin,
    toggleMute,
    toggleArchive,
    pinnedConversations,
    mutedConversations,
    setSelectedConversation
}) => {
    return (
        <div className="bg-white border-b border-slate-100 p-4">
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
    );
};

export default ChatHeader;
