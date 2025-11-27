# Fix Conversation List Updates

The conversation list isn't updating because we are strictly comparing IDs (`===`), but one might be a String and the other an Object. We need to fix this comparison in two places.

## 1. Fix `updateConversationWithNewMessage` (`client/src/pages/shared/Messages.jsx`)

**Find this function (around line 714) and replace it with this robust version:**

```javascript
  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => {
      const msgConvId = message.conversation?._id || message.conversation;

      const updated = prev.map(conv => {
        // Use toString() for safe comparison
        if (msgConvId && conv._id.toString() === msgConvId.toString()) {
          return {
            ...conv,
            lastMessage: message,
            lastMessageAt: message.createdAt,
            unreadCount: conv._id === selectedConversation?._id ? 0 : (conv.unreadCount || 0) + 1
          };
        }
        return conv;
      });

      // Sort by lastMessageAt desc
      return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    });
  };
```

## 2. Fix `handleConversationUpdated` (`client/src/pages/shared/Messages.jsx`)

**Find the `useEffect` you added recently (around line 130) and update the comparison inside `handleConversationUpdated`:**

```javascript
    const handleConversationUpdated = (data) => {
      const { conversationId, lastMessage } = data;

      setConversations(prev => {
        const updated = prev.map(conv => {
          // Use toString() for safe comparison
          if (conversationId && conv._id.toString() === conversationId.toString()) {
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
```

## 🚀 Verification

1. **Send a message**: The conversation in the sidebar should **immediately** jump to the top.
2. **Receive a message**: The conversation should jump to the top and unread count should increase (if not selected).
