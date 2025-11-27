# Fix Conversation List Not Updating

The conversation list (sidebar) isn't updating because we are missing the listener for the `conversation_updated` event. This event is sent to you specifically to update your list even if you aren't in that conversation.

## 1. Add the Event Listener (`client/src/pages/shared/Messages.jsx`)

You need to add a new `useEffect` hook to listen for `conversation_updated`. Add this **before** the existing socket `useEffect` (around line 130).

```javascript
  // ============= GLOBAL SOCKET EVENTS =============
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = (data) => {
      const { conversationId, lastMessage } = data;
      
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessage: lastMessage,
              lastMessageAt: lastMessage.createdAt,
              unreadCount: conv._id === selectedConversation?._id ? 0 : (conv.unreadCount || 0) + 1
            };
          }
          return conv;
        });
        
        // Sort by lastMessageAt desc
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };

    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket, selectedConversation]);
```

## 2. Verify `updateConversationWithNewMessage`

Ensure your `updateConversationWithNewMessage` function (which you added earlier) is still there. It is used by `handleNewMessage` for the *active* conversation. The new `useEffect` above handles updates for *all* conversations (including background ones).

## 🚀 Verification

1. **Sidebar Update**: Send a message from another user -> The conversation in the sidebar should jump to the top and show the new message preview.
2. **Unread Count**: If you are NOT in that conversation, the unread count should increase.
