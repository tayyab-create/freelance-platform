# Real-Time Edit & Delete Fix Guide

To ensure message edits and deletions update in real-time for all users, we need to emit socket events from the backend and listen for them on the frontend.

## 1. Backend Changes (`server/controllers/messageController.js`)

### A. Update `editMessage` Function
Find the `editMessage` function. After `await message.save();` and before the response, add the socket emission.

**Add this code:**
```javascript
    await message.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(conversationId).emit('message_updated', {
      messageId: message._id,
      conversationId: conversationId,
      content: message.content,
      edited: true,
      editedAt: message.editedAt
    });

    res.status(200).json({
      success: true,
      data: message
    });
```

### B. Update `deleteMessage` Function
Find the `deleteMessage` function. After `await Message.deleteOne...` (and the conversation update logic), add the socket emission.

**Add this code:**
```javascript
    // ... existing deletion logic ...

    // Emit socket event
    const io = req.app.get('io');
    io.to(conversationId).emit('message_deleted', {
      messageId: messageId,
      conversationId: conversationId
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
```

---

## 2. Frontend Changes (`client/src/pages/shared/Messages.jsx`)

### A. Add Event Handlers
Inside the socket `useEffect` (where `handleNewMessage` is), add these two new handler functions:

```javascript
    // Listen for message updates (edits)
    const handleMessageUpdated = ({ messageId, conversationId, content, edited, editedAt }) => {
      if (conversationId === selectedConversation._id) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId 
            ? { ...msg, content, edited, editedAt } 
            : msg
        ));
      }
    };

    // Listen for message deletions
    const handleMessageDeleted = ({ messageId, conversationId }) => {
      if (conversationId === selectedConversation._id) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      }
    };
```

### B. Register Listeners
In the `socket.on` block, add:

```javascript
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);
```

### C. Cleanup Listeners
In the return cleanup function (`socket.off`), add:

```javascript
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
```
