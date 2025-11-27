# Real-time Messaging Fixes

There are 2 critical issues causing real-time updates to fail.

## 1. Fix `handleNewMessage` Condition

In `client/src/pages/shared/Messages.jsx`, the condition to check if the message belongs to the current conversation is using the wrong property name (`conversationId` instead of `conversation`).

**Find this code (around line 140):**
```javascript
    // Listen for new messages
    const handleNewMessage = (message) => {
      if (message.conversationId === selectedConversation._id) { // <--- ERROR HERE
        setMessages(prev => [...prev, message]);
```

**Change it to:**
```javascript
    // Listen for new messages
    const handleNewMessage = (message) => {
      // Check both conversation (ID string) and conversation._id (if populated)
      const msgConvId = message.conversation?._id || message.conversation;
      
      if (msgConvId === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
```

## 2. Add Missing Function `updateConversationWithNewMessage`

The function `updateConversationWithNewMessage` is called in line 155 but appears to be missing from the component. You need to add it.

**Add this function before the `useEffect` block (around line 130):**

```javascript
  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => {
      const msgConvId = message.conversation?._id || message.conversation;
      
      const updated = prev.map(conv => {
        if (conv._id === msgConvId) {
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

## Summary of Changes
1. Update `handleNewMessage` to use `message.conversation` instead of `message.conversationId`.
2. Define `updateConversationWithNewMessage` function.

Once these are done, real-time messages will appear instantly!
