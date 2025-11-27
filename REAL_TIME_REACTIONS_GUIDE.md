# Real-Time Reactions Frontend Fix Guide

Here is exactly what was added to `client/src/pages/shared/Messages.jsx` to enable real-time reactions.

## 1. The File
**File Path:** `client/src/pages/shared/Messages.jsx`

## 2. What to Find
Look for the `useEffect` hook that handles socket integration. It starts around line **175** and ends around line **249**.
Inside this `useEffect`, find where other event handlers like `handleMessageRead` are defined.

## 3. What to Add
We added a new function `handleMessageReaction` to update the local state when a reaction comes in.

**Add this function inside the `useEffect` (before the `socket.on` calls):**

```javascript
    // Listen for message reactions
    const handleMessageReaction = ({ messageId, conversationId, reactions }) => {
      if (conversationId === selectedConversation._id) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, reactions: reactions } : msg
        ));
      }
    };
```

## 4. Where to Register the Listener
Find the block of `socket.on` calls (around line 233).

**Add this line:**
```javascript
    socket.on('message_reaction', handleMessageReaction);
```

## 5. Where to Cleanup
Find the return cleanup function (around line 240).

**Add this line:**
```javascript
      socket.off('message_reaction', handleMessageReaction);
```
