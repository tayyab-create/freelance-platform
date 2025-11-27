import React from 'react';
import {
    FiX,
    FiFile,
    FiPaperclip,
    FiSmile,
    FiSend,
    FiCheck,
    FiEdit2
} from 'react-icons/fi';
import Spinner from '../../../components/common/Spinner';

const MessageInput = ({
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    setNewMessage,
    files,
    filePreviews,
    removeFile,
    handleSendMessage,
    fileInputRef,
    handleFileSelect,
    messageInputRef,
    newMessage,
    handleTyping,
    setShowEmojiPicker,
    sendingMessage
}) => {
    return (
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
    );
};

export default MessageInput;
