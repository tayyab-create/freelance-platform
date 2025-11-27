export const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
        return messageDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return messageDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
};

export const getMessageTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const COMMON_EMOJIS = ['😀', '😂', '😊', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '✨', '🎉', '💯'];
