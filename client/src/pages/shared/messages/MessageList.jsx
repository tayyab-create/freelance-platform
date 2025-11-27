import React from 'react';
import {
    FiUpload,
    FiUser,
    FiFile,
    FiDownload,
    FiCornerUpLeft,
    FiSmile,
    FiCopy,
    FiEdit2,
    FiTrash2,
    FiArrowDown,
    FiX
} from 'react-icons/fi';
import { COMMON_EMOJIS, getMessageTime } from './utils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MessageList = ({
    messagesContainerRef,
    messagesEndRef,
    messages,
    currentUser,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    isDragging,
    handleReplyToMessage,
    setSelectedMessage,
    setShowEmojiPicker,
    handleCopyMessage,
    setEditingMessage,
    setNewMessage,
    messageInputRef,
    handleDeleteMessage,
    showScrollButton,
    scrollToBottom,
    showEmojiPicker,
    selectedMessage,
    handleReaction
}) => {
    return (
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

            {messages.map((message, index) => {
                const currentUserId = currentUser?._id || currentUser?.id;
                const senderId = message.sender?._id || message.sender?.id;
                // Fix: Handle both message.sender and message.sender._id formats
                const isOwn = senderId && currentUserId && senderId.toString() === currentUserId.toString();

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
        </div>
    );
};

export default MessageList;
