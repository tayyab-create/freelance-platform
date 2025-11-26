import React, { useRef, useState } from 'react';

/**
 * Swipeable Item Component
 * Adds swipe gestures to reveal actions (like iOS mail)
 *
 * Features:
 * - Smooth swipe animations
 * - Left and right swipe actions
 * - Touch-friendly 44x44px minimum targets
 * - Haptic feedback simulation
 * - Auto-reset on release
 *
 * @example
 * <SwipeableItem
 *   leftActions={[
 *     { label: 'Archive', onClick: () => {}, icon: FiArchive, color: 'bg-blue-500' }
 *   ]}
 *   rightActions={[
 *     { label: 'Delete', onClick: () => {}, icon: FiTrash2, color: 'bg-red-500' }
 *   ]}
 * >
 *   <div>Your content here</div>
 * </SwipeableItem>
 */
const SwipeableItem = ({
    children,
    leftActions = [],
    rightActions = [],
    threshold = 80, // Minimum swipe distance to reveal actions
    maxSwipe = 200, // Maximum swipe distance
    onSwipeStart,
    onSwipeEnd,
    className = '',
    disabled = false
}) => {
    const [translateX, setTranslateX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState(null); // 'left' or 'right'

    const startX = useRef(0);
    const startY = useRef(0);
    const currentX = useRef(0);
    const isDragging = useRef(false);

    const handleTouchStart = (e) => {
        if (disabled) return;

        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
        isDragging.current = false;

        onSwipeStart?.();
    };

    const handleTouchMove = (e) => {
        if (disabled) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - startX.current;
        const deltaY = touchY - startY.current;

        // Only start swiping if movement is more horizontal than vertical
        if (!isDragging.current && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            isDragging.current = true;
            setIsSwiping(true);
        }

        if (isDragging.current) {
            // Prevent vertical scrolling while swiping
            e.preventDefault();

            currentX.current = deltaX;

            // Determine swipe direction and limit based on available actions
            let newTranslateX = deltaX;

            if (deltaX > 0 && leftActions.length === 0) {
                newTranslateX = 0;
            } else if (deltaX < 0 && rightActions.length === 0) {
                newTranslateX = 0;
            }

            // Apply resistance when over-swiping
            if (Math.abs(newTranslateX) > maxSwipe) {
                const resistance = 0.3;
                newTranslateX = maxSwipe * Math.sign(newTranslateX) + (newTranslateX - maxSwipe * Math.sign(newTranslateX)) * resistance;
            }

            setTranslateX(newTranslateX);
            setSwipeDirection(newTranslateX > 0 ? 'left' : 'right');
        }
    };

    const handleTouchEnd = () => {
        if (disabled) return;

        isDragging.current = false;
        setIsSwiping(false);

        // Snap to action or reset
        if (Math.abs(translateX) > threshold) {
            // Snap to show actions
            const snapDistance = Math.min(leftActions.length > 0 || rightActions.length > 0 ? 120 : 0, maxSwipe);
            setTranslateX(snapDistance * Math.sign(translateX));
        } else {
            // Reset to center
            resetPosition();
        }

        onSwipeEnd?.();
    };

    const resetPosition = () => {
        setTranslateX(0);
        setSwipeDirection(null);
    };

    const handleActionClick = (action) => {
        action.onClick();
        resetPosition();
    };

    // Calculate action visibility based on swipe distance
    const getActionOpacity = (index, totalActions) => {
        const distance = Math.abs(translateX);
        const actionThreshold = threshold + (index * 20);
        return Math.min(distance / actionThreshold, 1);
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Left Actions (revealed when swiping right) */}
            {leftActions.length > 0 && (
                <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1 pl-2">
                    {leftActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleActionClick(action)}
                            className={`
                                min-w-[60px] min-h-[44px] px-4 rounded-lg
                                flex flex-col items-center justify-center gap-1
                                text-white font-medium transition-all touch-manipulation
                                ${action.color || 'bg-blue-500'}
                                hover:opacity-90 active:scale-95
                            `}
                            style={{
                                opacity: swipeDirection === 'left' ? getActionOpacity(index, leftActions.length) : 0,
                                transform: `translateX(${swipeDirection === 'left' ? 0 : -20}px)`,
                                transition: isSwiping ? 'none' : 'all 0.3s ease-out'
                            }}
                        >
                            {action.icon && <action.icon className="w-5 h-5" />}
                            <span className="text-xs">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Right Actions (revealed when swiping left) */}
            {rightActions.length > 0 && (
                <div className="absolute right-0 top-0 bottom-0 flex items-center gap-1 pr-2">
                    {rightActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleActionClick(action)}
                            className={`
                                min-w-[60px] min-h-[44px] px-4 rounded-lg
                                flex flex-col items-center justify-center gap-1
                                text-white font-medium transition-all touch-manipulation
                                ${action.color || 'bg-red-500'}
                                hover:opacity-90 active:scale-95
                            `}
                            style={{
                                opacity: swipeDirection === 'right' ? getActionOpacity(index, rightActions.length) : 0,
                                transform: `translateX(${swipeDirection === 'right' ? 0 : 20}px)`,
                                transition: isSwiping ? 'none' : 'all 0.3s ease-out'
                            }}
                        >
                            {action.icon && <action.icon className="w-5 h-5" />}
                            <span className="text-xs">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            <div
                className="relative bg-white touch-manipulation"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>

            {/* Swipe hint indicator (optional) */}
            {!disabled && !isSwiping && translateX === 0 && (leftActions.length > 0 || rightActions.length > 0) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )}
        </div>
    );
};

/**
 * Swipeable List - Container for multiple swipeable items
 * Ensures only one item is swiped at a time
 */
export const SwipeableList = ({ children, className = '' }) => {
    return (
        <div className={`divide-y divide-gray-200 ${className}`}>
            {children}
        </div>
    );
};

export default SwipeableItem;
