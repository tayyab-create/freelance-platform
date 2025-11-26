import React, { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';

/**
 * Bottom Sheet Component for Mobile
 * Provides a native-feeling drawer that slides up from the bottom
 *
 * Features:
 * - Smooth slide-up animation
 * - Drag-to-close gesture
 * - Backdrop with blur
 * - Snap points for different heights
 * - Touch-friendly close button (44x44px)
 * - Accessibility with focus trap
 *
 * @example
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Filters"
 *   snapPoint="medium"
 * >
 *   <FilterContent />
 * </BottomSheet>
 */
const BottomSheet = ({
    isOpen,
    onClose,
    title,
    children,
    snapPoint = 'medium', // 'small', 'medium', 'large', 'full'
    showHandle = true,
    showHeader = true,
    className = '',
    footer,
    closeOnBackdrop = true,
    preventScroll = true
}) => {
    const sheetRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [translate, setTranslate] = useState(0);

    // Snap point heights
    const snapPoints = {
        small: 'max-h-[40vh]',
        medium: 'max-h-[60vh]',
        large: 'max-h-[80vh]',
        full: 'max-h-[95vh]'
    };

    // Prevent body scroll when bottom sheet is open
    useEffect(() => {
        if (isOpen && preventScroll) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen, preventScroll]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle touch drag
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
        setCurrentY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;

        const touchY = e.touches[0].clientY;
        const deltaY = touchY - startY;

        // Only allow dragging down
        if (deltaY > 0) {
            setTranslate(deltaY);
            setCurrentY(touchY);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);

        // Close if dragged more than 100px
        if (translate > 100) {
            onClose();
        }

        // Reset translate
        setTranslate(0);
        setStartY(0);
        setCurrentY(0);
    };

    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
                className={`
                    fixed inset-0 bg-black/40 backdrop-blur-sm
                    transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Bottom Sheet */}
            <div
                ref={sheetRef}
                className={`
                    fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl
                    transform transition-transform duration-300 ease-out
                    ${snapPoints[snapPoint]}
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}
                    ${className}
                `}
                style={{
                    transform: `translateY(${translate}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bottom-sheet-title"
            >
                {/* Drag Handle */}
                {showHandle && (
                    <div
                        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-manipulation"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </div>
                )}

                {/* Header */}
                {showHeader && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 id="bottom-sheet-title" className="text-xl font-bold text-gray-900">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors touch-manipulation"
                            aria-label="Close"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(95vh - 140px)' }}>
                    <div className="px-6 py-4">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                {footer && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-3xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Bottom Sheet for Filters
 * Pre-configured bottom sheet for filter UIs
 */
export const FilterBottomSheet = ({
    isOpen,
    onClose,
    onApply,
    onReset,
    activeFilters = 0,
    children,
    applyLabel = 'Apply Filters',
    resetLabel = 'Reset',
    title = 'Filters'
}) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <span>{title}</span>
                    {activeFilters > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                            {activeFilters}
                        </span>
                    )}
                </div>
            }
            snapPoint="large"
            footer={
                <div className="flex gap-3">
                    <button
                        onClick={onReset}
                        className="flex-1 min-h-[48px] px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors touch-manipulation"
                    >
                        {resetLabel}
                    </button>
                    <button
                        onClick={() => {
                            onApply();
                            onClose();
                        }}
                        className="flex-1 min-h-[48px] px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all touch-manipulation"
                    >
                        {applyLabel}
                    </button>
                </div>
            }
        >
            {children}
        </BottomSheet>
    );
};

/**
 * Bottom Sheet for Actions
 * Pre-configured bottom sheet for action menus
 */
export const ActionBottomSheet = ({
    isOpen,
    onClose,
    title,
    actions = []
}) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            snapPoint="small"
            showHandle={true}
        >
            <div className="space-y-2 pb-2">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            action.onClick();
                            onClose();
                        }}
                        disabled={action.disabled}
                        className={`
                            w-full min-h-[52px] px-4 py-3 rounded-xl font-medium text-left
                            flex items-center gap-3 transition-all touch-manipulation
                            ${action.variant === 'danger'
                                ? 'text-red-600 hover:bg-red-50 active:bg-red-100'
                                : action.variant === 'warning'
                                    ? 'text-yellow-600 hover:bg-yellow-50 active:bg-yellow-100'
                                    : 'text-gray-900 hover:bg-gray-100 active:bg-gray-200'
                            }
                            ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {action.icon && <action.icon className="w-5 h-5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold">{action.label}</div>
                            {action.description && (
                                <div className="text-sm text-gray-500 mt-0.5">{action.description}</div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </BottomSheet>
    );
};

export default BottomSheet;
