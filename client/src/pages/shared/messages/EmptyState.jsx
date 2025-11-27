import React from 'react';
import { FiUser } from 'react-icons/fi';

const EmptyState = () => {
    return (
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
    );
};

export default EmptyState;
